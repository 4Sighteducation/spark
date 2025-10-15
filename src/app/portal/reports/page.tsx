'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import StudentReport from '@/components/portal/StudentReport'
import Link from 'next/link'

export default function ReportsPage() {
  const [loading, setLoading] = useState(true)
  const [student, setStudent] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [assessments, setAssessments] = useState<any[]>([])

  useEffect(() => {
    async function loadData() {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        window.location.href = '/portal/login'
        return
      }

      // Get profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single()
      
      setProfile(profileData)

      // Get student
      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .select('*')
        .eq('id', session.user.id)
        .maybeSingle()
      
      if (studentError || !studentData) {
        console.error('Student not found:', studentError)
        setLoading(false)
        return
      }

      setStudent(studentData)

      // Fetch assessment results (studentData guaranteed to exist here)
      const { data: assessmentsData } = await supabase
        .from('assessment_results')
        .select('*')
        .eq('student_id', (studentData as any).id)
        .order('calculated_at', { ascending: false })
      
      setAssessments(assessmentsData || [])

      setLoading(false)
    }

    loadData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔄</div>
          <p className="text-gray-600 text-xl">Loading your reports...</p>
        </div>
      </div>
    )
  }

  // No assessments yet
  if (!assessments || assessments.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-cyan-50 p-4 flex items-center justify-center">
        <div className="max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 text-center">
            <div className="text-6xl mb-4">📊</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-3">
              No Reports Yet
            </h1>
            <p className="text-gray-600 mb-6">
              Complete the SPARK Questionnaire to generate your first report!
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/portal/questionnaire"
                className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-cyan-700 transition-all touch-manipulation"
              >
                Start Questionnaire
              </Link>
              <Link
                href="/portal/dashboard"
                className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold rounded-lg transition-colors touch-manipulation"
              >
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Show most recent assessment
  const latestAssessment = assessments[0]

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-cyan-50 p-4 pb-24">
      {/* Back Button */}
      <div className="max-w-4xl mx-auto mb-4">
        <Link
          href="/portal/dashboard"
          className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-800 font-medium px-4 py-2 rounded-lg hover:bg-white transition-all"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Dashboard
        </Link>
      </div>

      {/* Report Component */}
      <StudentReport 
        assessment={{
          ...latestAssessment,
          cycle_number: 1,
          first_name: profile?.first_name,
          last_name: profile?.last_name,
        }}
        student={{
          ...student,
          first_name: profile?.first_name,
          last_name: profile?.last_name,
        }}
        canEdit={true}
      />

      {/* Cycle Selector - if multiple reports */}
      {assessments.length > 1 && (
        <div className="max-w-4xl mx-auto mt-6">
          <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-200">
            <p className="text-sm font-medium text-gray-700 mb-3">View Previous Reports:</p>
            <div className="flex gap-2 overflow-x-auto">
              {assessments.map((assessment, index) => (
                <button
                  key={assessment.id}
                  className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap ${
                    index === 0
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Cycle {index + 1}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

