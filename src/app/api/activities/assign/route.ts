import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { assignActivitiesWithAI } from '@/lib/ai/activity-assignment'

// Mark as dynamic
export const dynamic = 'force-dynamic'

// Use service role key for server-side operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * Assign activities to a student based on their assessment results
 * Can be called automatically after questionnaire completion
 * or manually by staff
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { studentId, assessmentResultId } = body

    if (!studentId || !assessmentResultId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Get assessment results
    const { data: assessment, error: assessmentError } = await supabase
      .from('assessment_results')
      .select(`
        *,
        students!inner (
          *,
          profiles!inner (*)
        )
      `)
      .eq('id', assessmentResultId)
      .single()

    if (assessmentError || !assessment) {
      return NextResponse.json({ error: 'Assessment not found' }, { status: 404 })
    }

    const student = (assessment as any).students
    const profile = student.profiles

    // Get all available activities
    const { data: activities, error: activitiesError } = await supabase
      .from('activities')
      .select('*')
      .eq('is_published', true)

    if (activitiesError || !activities) {
      return NextResponse.json({ error: 'Failed to fetch activities' }, { status: 500 })
    }

    // Prepare student profile for AI
    const studentProfile = {
      name: `${profile.first_name} ${profile.last_name}`,
      scores: {
        self_direction: assessment.self_direction_score,
        purpose: assessment.purpose_score,
        awareness: assessment.awareness_score,
        resilience: assessment.resilience_score,
        knowledge: assessment.knowledge_score,
        overall: assessment.overall_score,
      },
      bands: {
        self_direction: assessment.self_direction_band,
        purpose: assessment.purpose_band,
        awareness: assessment.awareness_band,
        resilience: assessment.resilience_band,
        knowledge: assessment.knowledge_band,
        overall: assessment.overall_band,
      },
    }

    console.log(`🤖 Using AI to assign activities for ${studentProfile.name}...`)

    // Use AI to assign activities
    const { assignments, reasoning } = await assignActivitiesWithAI(studentProfile, activities)

    console.log(`✅ AI recommended ${assignments.length} activities`)
    console.log(`📝 Reasoning: ${reasoning}`)

    // Save activity assignments
    const assignmentRecords = assignments.map((activity, index) => ({
      activity_id: activity.id,
      student_id: studentId,
      result_id: assessmentResultId,
      assignment_type: 'ai_prescribed',
      prescribed_reason: reasoning,
      cycle_number: assessment.cycle_number || 1,
      is_required: true,
      priority: index + 1,
    }))

    const { data: savedAssignments, error: assignmentError } = await supabase
      .from('activity_assignments')
      .insert(assignmentRecords)
      .select()

    if (assignmentError) {
      console.error('Error saving assignments:', assignmentError)
      return NextResponse.json({ error: 'Failed to save assignments' }, { status: 500 })
    }

    console.log(`✅ ${savedAssignments.length} activities assigned successfully`)

    return NextResponse.json({
      success: true,
      assignments: savedAssignments,
      reasoning,
      activityTitles: assignments.map(a => a.title),
    })

  } catch (error) {
    console.error('Error assigning activities:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

