'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import ActivityCard from '@/components/portal/ActivityCard'
import Link from 'next/link'

export default function ActivitiesPage() {
  const [loading, setLoading] = useState(true)
  const [student, setStudent] = useState<any>(null)
  const [assignments, setAssignments] = useState<any[]>([])

  useEffect(() => {
    async function loadData() {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        window.location.href = '/portal/login'
        return
      }

      // Get student
      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .select('*')
        .eq('id', session.user.id)
        .single()
      
      if (studentError || !studentData) {
        console.error('Student not found:', studentError)
        setLoading(false)
        return
      }
      
      setStudent(studentData)

      // Fetch assigned activities
      const { data: assignmentsData } = await supabase
        .from('activity_assignments')
        .select(`
          *,
          activities (*),
          activity_completions (*)
        `)
        .eq('student_id', studentData.id)
        .order('priority', { ascending: true })
      
      setAssignments(assignmentsData || [])

      setLoading(false)
    }

    loadData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔄</div>
          <p className="text-gray-600 text-xl">Loading your activities...</p>
        </div>
      </div>
    )
  }

  // No activities assigned yet
  if (!assignments || assignments.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-cyan-50 p-4 flex items-center justify-center pb-24">
        <div className="max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 text-center">
            <div className="text-6xl mb-4">🎮</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-3">
              No Activities Yet
            </h1>
            <p className="text-gray-600 mb-6">
              Complete the SPARK Questionnaire to receive your personalized activity program!
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

  // Group assignments by completion status
  const completedActivities = assignments.filter((a: any) => 
    a.activity_completions?.[0]?.approval_status === 'approved'
  )
  const inProgressActivities = assignments.filter((a: any) => 
    a.activity_completions?.[0] && a.activity_completions[0].approval_status !== 'approved'
  )
  const notStartedActivities = assignments.filter((a: any) => 
    !a.activity_completions?.[0]
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-cyan-50 p-4 pb-24">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/portal/dashboard"
            className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-800 font-medium mb-4 px-4 py-2 rounded-lg hover:bg-white transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </Link>

          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            🎮 Your SPARK Activities
          </h1>
          <p className="text-gray-600">
            6 personalized activities designed just for you based on your questionnaire results
          </p>
        </div>

        {/* Progress Summary */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-md p-4 text-center border border-gray-200">
            <div className="text-3xl font-bold text-green-600">{completedActivities.length}</div>
            <div className="text-xs text-gray-600 mt-1">Completed</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4 text-center border border-gray-200">
            <div className="text-3xl font-bold text-blue-600">{inProgressActivities.length}</div>
            <div className="text-xs text-gray-600 mt-1">In Progress</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4 text-center border border-gray-200">
            <div className="text-3xl font-bold text-gray-600">{notStartedActivities.length}</div>
            <div className="text-xs text-gray-600 mt-1">To Start</div>
          </div>
        </div>

        {/* AI Reasoning */}
        {assignments[0]?.prescribed_reason && (
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-5 mb-6">
            <div className="flex items-start gap-3">
              <span className="text-2xl">🤖</span>
              <div>
                <h3 className="font-bold text-purple-900 mb-1">Why These Activities?</h3>
                <p className="text-sm text-purple-800">
                  {assignments[0].prescribed_reason}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Activities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {assignments.map((assignment: any) => (
            <ActivityCard
              key={assignment.id}
              activity={assignment.activities}
              assignment={assignment}
              completion={assignment.activity_completions?.[0]}
              onStart={() => {
                window.location.href = `/portal/activities/${assignment.activities.activity_code}`
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

