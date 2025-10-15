import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { assignActivitiesWithAI } from '@/lib/ai/activity-assignment'

// Mark as dynamic
export const dynamic = 'force-dynamic'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * Assign activities for a student by email (helper for scripts)
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email } = body

    // Get student by email
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 })
    }

    // Get latest assessment result
    const { data: assessment } = await supabase
      .from('assessment_results')
      .select('*')
      .eq('student_id', profile.id)
      .order('calculated_at', { ascending: false })
      .limit(1)
      .single()

    if (!assessment) {
      return NextResponse.json({ error: 'No assessment found' }, { status: 404 })
    }

    // Check if already assigned
    const { data: existing } = await supabase
      .from('activity_assignments')
      .select('id')
      .eq('student_id', profile.id)
      .eq('result_id', assessment.id)

    if (existing && existing.length > 0) {
      return NextResponse.json({ 
        message: 'Activities already assigned',
        count: existing.length 
      })
    }

    // Get all activities
    const { data: activities } = await supabase
      .from('activities')
      .select('*')
      .eq('is_published', true)

    if (!activities) {
      return NextResponse.json({ error: 'No activities found' }, { status: 500 })
    }

    // Assign with AI
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

    const { assignments, reasoning } = await assignActivitiesWithAI(studentProfile, activities)

    // Save assignments
    const assignmentRecords = assignments.map((activity, index) => ({
      activity_id: activity.id,
      student_id: profile.id,
      result_id: assessment.id,
      assignment_type: 'ai_prescribed',
      prescribed_reason: reasoning,
      is_required: true,
      priority: index + 1,
    }))

    const { data: saved } = await supabase
      .from('activity_assignments')
      .insert(assignmentRecords)
      .select()

    return NextResponse.json({
      success: true,
      assignments: saved,
      reasoning,
      activityTitles: assignments.map(a => a.title),
    })

  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

