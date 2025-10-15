import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Mark as dynamic (uses cookies)
export const dynamic = 'force-dynamic'

/**
 * Check if student can access the questionnaire
 * Returns: { canAccess: boolean, reason?: string, cycleInfo?: object }
 */
export async function GET(req: NextRequest) {
  try {
    const supabase = createClient()
    
    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ canAccess: false, reason: 'Not authenticated' }, { status: 401 })
    }

    // Get student record
    const { data: student } = await supabase
      .from('students')
      .select('*, profiles!inner(*)')
      .eq('id', user.id)
      .single()

    if (!student) {
      return NextResponse.json({ canAccess: false, reason: 'Student record not found' }, { status: 404 })
    }

    const organizationId = student.organization_id
    const yearGroup = student.year_group

    // Check for active cycles (org-wide, year-specific, or class-specific)
    const today = new Date().toISOString().split('T')[0]
    
    const { data: activeCycles } = await supabase
      .from('assessment_cycles')
      .select('*')
      .eq('organization_id', organizationId)
      .lte('start_date', today)
      .gte('end_date', today)
      .or(`year_group.is.null,year_group.eq.Year ${yearGroup}`)
      .order('cycle_number', { ascending: false })
      .limit(1)

    if (!activeCycles || activeCycles.length === 0) {
      return NextResponse.json({ 
        canAccess: false, 
        reason: 'No active assessment cycle' 
      })
    }

    const currentCycle = activeCycles[0]

    // Check if student already completed this cycle
    const { data: existingResponse } = await supabase
      .from('questionnaire_responses')
      .select('*')
      .eq('student_id', student.id)
      .eq('cycle_number', currentCycle.cycle_number)
      .eq('status', 'completed')
      .single()

    if (existingResponse) {
      return NextResponse.json({ 
        canAccess: false, 
        reason: `You've already completed Cycle ${currentCycle.cycle_number}. Next cycle opens later.`,
        cycleInfo: currentCycle
      })
    }

    // Student can access!
    return NextResponse.json({ 
      canAccess: true,
      cycleInfo: currentCycle
    })

  } catch (error) {
    console.error('Error checking questionnaire access:', error)
    return NextResponse.json({ canAccess: false, reason: 'Server error' }, { status: 500 })
  }
}

