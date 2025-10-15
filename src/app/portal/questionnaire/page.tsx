'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import PortalQuestionnaire from '@/components/portal/PortalQuestionnaire'
import Link from 'next/link'

export default function QuestionnairePage() {
  const [loading, setLoading] = useState(true)
  const [student, setStudent] = useState<any>(null)
  const [currentCycle, setCurrentCycle] = useState<any>(null)
  const [existingResponse, setExistingResponse] = useState<any>(null)
  const [noCycle, setNoCycle] = useState(false)

  useEffect(() => {
    async function checkAccess() {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        window.location.href = '/portal/login'
        return
      }

      // Get student
      const { data: studentData } = await supabase
        .from('students')
        .select('*')
        .eq('id', session.user.id)
        .single()
      
      setStudent(studentData)

      if (!studentData) {
        setLoading(false)
        return
      }

      // Check for active cycle
      const today = new Date().toISOString().split('T')[0]
      
      const { data: activeCycles } = await supabase
        .from('assessment_cycles')
        .select('*')
        .eq('organization_id', studentData.organization_id)
        .lte('start_date', today)
        .gte('end_date', today)
        .is('year_group', null)
        .order('cycle_number', { ascending: false })
        .limit(1)

      if (!activeCycles || activeCycles.length === 0) {
        setNoCycle(true)
        setLoading(false)
        return
      }

      const cycle = activeCycles[0]
      setCurrentCycle(cycle)

      // Check if already completed
      const { data: response } = await supabase
        .from('questionnaire_responses')
        .select('*')
        .eq('student_id', studentData.id)
        .eq('cycle_number', cycle.cycle_number)
        .eq('status', 'completed')
        .maybeSingle()

      setExistingResponse(response)
      setLoading(false)
    }

    checkAccess()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔄</div>
          <p className="text-gray-600 text-xl">Checking questionnaire access...</p>
        </div>
      </div>
    )
  }

  // No active cycle
  if (noCycle) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-cyan-50 p-4 flex items-center justify-center">
        <div className="max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 text-center">
            <div className="text-6xl mb-4">📅</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-3">
              No Active Assessment Cycle
            </h1>
            <p className="text-gray-600 mb-6">
              The SPARK questionnaire is not currently open. Check back later or contact your teacher.
            </p>
            <Link
              href="/portal/dashboard"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold rounded-lg transition-colors"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Already completed
  if (existingResponse) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-cyan-50 p-4 flex items-center justify-center">
        <div className="max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 text-center">
            <div className="text-6xl mb-4">✅</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-3">
              Already Completed!
            </h1>
            <p className="text-gray-600 mb-6">
              You've already completed {currentCycle?.cycle_name}. You can view your results in the Reports section.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/portal/reports"
                className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-cyan-700 transition-all"
              >
                View My Report
              </Link>
              <Link
                href="/portal/dashboard"
                className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold rounded-lg transition-colors"
              >
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Can access questionnaire
  if (student && currentCycle) {
    return <PortalQuestionnaire student={student} cycleInfo={currentCycle} />
  }

  return null
}
