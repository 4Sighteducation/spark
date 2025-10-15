import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { calculateAssessmentScores } from '@/lib/scoring/calculate'

// Mark as dynamic (uses cookies)
export const dynamic = 'force-dynamic'

/**
 * Submit questionnaire responses
 * Saves answers, calculates scores, creates assessment results
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = createClient()
    
    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Get request body
    const body = await req.json()
    const { answers, cycleId, cycleNumber } = body

    if (!answers || !cycleId || !cycleNumber) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Get student record
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('*')
      .eq('id', user.id)
      .single()

    if (studentError || !student) {
      return NextResponse.json({ error: 'Student record not found' }, { status: 404 })
    }

    // Get questionnaire
    const { data: questionnaire } = await supabase
      .from('questionnaires')
      .select('id')
      .eq('is_default', true)
      .eq('status', 'active')
      .single()

    if (!questionnaire) {
      return NextResponse.json({ error: 'No active questionnaire found' }, { status: 404 })
    }

    // Create questionnaire response
    const { data: response, error: responseError } = await supabase
      .from('questionnaire_responses')
      .insert({
        student_id: student.id,
        questionnaire_id: questionnaire.id,
        organization_id: student.organization_id,
        cycle_id: cycleId,
        cycle_number: cycleNumber,
        status: 'completed',
        started_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (responseError) {
      console.error('Error creating response:', responseError)
      return NextResponse.json({ error: 'Failed to save questionnaire response' }, { status: 500 })
    }

    // Save individual question answers
    const questionAnswers = Object.entries(answers).map(([questionId, sliderValue]) => {
      // Extract dimension from question ID (S01 → S, P02 → P, etc.)
      const dimension = questionId.charAt(0) as 'S' | 'P' | 'A' | 'R' | 'K'
      
      return {
        response_id: response.id,
        question_id: questionId,
        dimension,
        slider_value: sliderValue as number,
      }
    })

    const { error: answersError } = await supabase
      .from('question_answers')
      .insert(questionAnswers)

    if (answersError) {
      console.error('Error saving answers:', answersError)
      return NextResponse.json({ error: 'Failed to save answers' }, { status: 500 })
    }

    // Calculate scores
    const scores = calculateAssessmentScores(questionAnswers)

    // Save assessment results
    const { data: assessmentResult, error: resultError } = await supabase
      .from('assessment_results')
      .insert({
        response_id: response.id,
        student_id: student.id,
        organization_id: student.organization_id,
        self_direction_score: scores.self_direction.score,
        purpose_score: scores.purpose.score,
        awareness_score: scores.awareness.score,
        resilience_score: scores.resilience.score,
        knowledge_score: scores.knowledge.score,
        overall_score: scores.overall.score,
        self_direction_band: scores.self_direction.band,
        purpose_band: scores.purpose.band,
        awareness_band: scores.awareness.band,
        resilience_band: scores.resilience.band,
        knowledge_band: scores.knowledge.band,
        overall_band: scores.overall.band,
        report_data: {
          scores,
          cycle_number: cycleNumber,
          completed_at: new Date().toISOString(),
        },
      })
      .select()
      .single()

    if (resultError) {
      console.error('Error saving results:', resultError)
      return NextResponse.json({ error: 'Failed to save assessment results' }, { status: 500 })
    }

    // Automatically assign activities using AI
    try {
      const assignResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/activities/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: student.id,
          assessmentResultId: assessmentResult.id,
        }),
      })

      if (assignResponse.ok) {
        const assignData = await assignResponse.json()
        console.log(`✅ ${assignData.activityTitles?.length || 0} activities auto-assigned`)
      } else {
        console.error('Failed to auto-assign activities')
      }
    } catch (assignError) {
      console.error('Error auto-assigning activities:', assignError)
      // Don't fail the submission if activity assignment fails
    }

    // Return success with scores
    return NextResponse.json({
      success: true,
      responseId: response.id,
      resultId: assessmentResult.id,
      scores,
    })

  } catch (error) {
    console.error('Error submitting questionnaire:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

