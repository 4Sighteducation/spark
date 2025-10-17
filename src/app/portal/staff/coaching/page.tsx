'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import StudentResponseModal from '@/components/portal/staff/StudentResponseModal'
import StudentGoalsModal from '@/components/portal/staff/StudentGoalsModal'
import { useRouter } from 'next/navigation'

interface StudentData {
  id: string
  first_name: string
  last_name: string
  email: string
  year_group: number
  tutor_group: string | null
  // Assessment scores
  self_direction_score: number | null
  purpose_score: number | null
  awareness_score: number | null
  resilience_score: number | null
  knowledge_score: number | null
  overall_score: number | null
  // Reflections & goals
  reflection_text: string | null
  goal_text: string | null
  goal_target_date: string | null
  // Assessment details
  cycle_number: number | null
  completed_at: string | null
}

export default function CoachingPage() {
  const router = useRouter()
  const [profile, setProfile] = useState<any>(null)
  const [students, setStudents] = useState<StudentData[]>([])
  const [filteredStudents, setFilteredStudents] = useState<StudentData[]>([])
  const [loading, setLoading] = useState(true)
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('')
  const [filterGroup, setFilterGroup] = useState('all')
  const [filterCycle, setFilterCycle] = useState('latest')
  
  // Modals
  const [responseModalOpen, setResponseModalOpen] = useState(false)
  const [goalsModalOpen, setGoalsModalOpen] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<StudentData | null>(null)

  // Get unique groups for filter
  const tutorGroups = Array.from(new Set(students.map(s => s.tutor_group).filter(Boolean)))
  const yearGroups = Array.from(new Set(students.map(s => s.year_group).filter(Boolean)))

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    // Apply filters
    let filtered = [...students]

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(s => 
        `${s.first_name} ${s.last_name}`.toLowerCase().includes(term) ||
        s.email.toLowerCase().includes(term)
      )
    }

    // Group filter
    if (filterGroup !== 'all') {
      filtered = filtered.filter(s => s.tutor_group === filterGroup || `Year ${s.year_group}` === filterGroup)
    }

    setFilteredStudents(filtered)
  }, [searchTerm, filterGroup, students])

  async function loadData() {
    try {
      // Get current user profile
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single() as { data: any }

      if (!profileData) {
        setLoading(false)
        return
      }

      setProfile(profileData)

      // Build query based on role
      let query = supabase
        .from('students')
        .select('id, year_group, tutor_group, profiles!inner(first_name, last_name, email)')
        .eq('is_active', true)
        .eq('profiles.organization_id', profileData.organization_id)

      // Role-based filtering
      if (profileData.primary_role === 'head_of_year') {
        // Get the year from user_roles scope
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('scope')
          .eq('user_id', session.user.id)
          .eq('role', 'head_of_year')
          .eq('is_active', true)
          .single() as { data: any }

        if (roleData?.scope?.year) {
          query = query.eq('year_group', roleData.scope.year)
        }
      } else if (profileData.primary_role === 'tutor') {
        // Get tutor group from staff_class_assignments
        const { data: classData } = await supabase
          .from('staff_class_assignments')
          .select('classes(name)')
          .eq('staff_id', session.user.id)
          .eq('role', 'tutor')
          .eq('is_active', true) as { data: any }

        if (classData && classData.length > 0) {
          const tutorGroups = classData.map((c: any) => c.classes?.name).filter(Boolean)
          if (tutorGroups.length > 0) {
            query = query.in('tutor_group', tutorGroups)
          }
        }
      }
      // org_admin and super_admin see all students in org

      const { data: studentsData, error } = await query as { data: any; error: any }

      if (error) {
        console.error('Error loading students:', error)
        return
      }

      // Now get assessment results for each student
      const studentIds = studentsData?.map((s: any) => s.id) || []
      
      console.log('👥 Students loaded:', { count: studentsData?.length, studentIds })
      
      if (studentIds.length === 0) {
        setStudents([])
        setFilteredStudents([])
        setLoading(false)
        return
      }

      // DIAGNOSTIC: Try simplest possible query first
      const { data: testAllResults, error: testError } = await supabase
        .from('assessment_results')
        .select('*') as { data: any; error: any }
      
      console.log('🧪 TEST: Can we read assessment_results at all?')
      console.log('  - Count:', testAllResults?.length)
      console.log('  - Error:', testError?.message)
      
      // Get latest assessment results for each student
      // NOTE: Use calculated_at not created_at!
      const { data: resultsData, error: resultsError } = await supabase
        .from('assessment_results')
        .select('student_id, self_direction_score, purpose_score, awareness_score, resilience_score, knowledge_score, overall_score, calculated_at')
        .in('student_id', studentIds) as { data: any; error: any }

      console.log('📊 Assessment Results Query Response:')
      console.log('  - Count:', resultsData?.length)
      console.log('  - Error:', resultsError)
      console.log('  - Full Data:', resultsData)
      console.log('  - Student IDs queried:', studentIds)
      
      if (resultsError) {
        console.error('❌ Assessment Results Error Details:')
        console.error('  Code:', resultsError.code)
        console.error('  Message:', resultsError.message)
        console.error('  Details:', resultsError.details)
        console.error('  Hint:', resultsError.hint)
        console.error('  Full Error:', JSON.stringify(resultsError, null, 2))
      }
      
      if (!resultsData || resultsData.length === 0) {
        console.warn('⚠️ No results data returned! This is the problem.')
      }

      // Get reflections
      const { data: reflectionsData, error: reflectionsError } = await supabase
        .from('student_reflections')
        .select('student_id, reflection_text, created_at')
        .in('student_id', studentIds)
        .order('created_at', { ascending: false }) as { data: any; error: any }

      console.log('💭 Reflections:', { count: reflectionsData?.length, error: reflectionsError })

      // Get goals
      const { data: goalsData, error: goalsError } = await supabase
        .from('student_goals')
        .select('student_id, goal_text, target_date, created_at')
        .in('student_id', studentIds)
        .order('created_at', { ascending: false }) as { data: any; error: any }

      console.log('🎯 Goals:', { count: goalsData?.length, error: goalsError })

      // Combine data
      const studentsWithData: StudentData[] = studentsData.map((s: any) => {
        const latestResult = resultsData?.find((r: any) => r.student_id === s.id)
        const latestReflection = reflectionsData?.find((r: any) => r.student_id === s.id)
        const latestGoal = goalsData?.find((g: any) => g.student_id === s.id)

        console.log(`  Student ${s.profiles.first_name} (${s.id}):`)
        console.log('    Has Result?', !!latestResult)
        if (latestResult) {
          console.log('    Scores:', {
            overall: latestResult.overall_score,
            S: latestResult.self_direction_score,
            P: latestResult.purpose_score,
            A: latestResult.awareness_score,
            R: latestResult.resilience_score,
            K: latestResult.knowledge_score
          })
        } else {
          console.log('    ❌ NO RESULT FOUND FOR THIS STUDENT')
        }

        return {
          id: s.id,
          first_name: s.profiles.first_name,
          last_name: s.profiles.last_name,
          email: s.profiles.email,
          year_group: s.year_group,
          tutor_group: s.tutor_group,
          self_direction_score: latestResult?.self_direction_score || null,
          purpose_score: latestResult?.purpose_score || null,
          awareness_score: latestResult?.awareness_score || null,
          resilience_score: latestResult?.resilience_score || null,
          knowledge_score: latestResult?.knowledge_score || null,
          overall_score: latestResult?.overall_score || null,
          reflection_text: latestReflection?.reflection_text || null,
          goal_text: latestGoal?.goal_text || null,
          goal_target_date: latestGoal?.target_date || null,
          cycle_number: null, // cycle_number not in assessment_results
          completed_at: latestResult?.calculated_at || null,
        }
      })

      console.log('✅ Final student data:', studentsWithData)

      setStudents(studentsWithData)
      setFilteredStudents(studentsWithData)
    } catch (error) {
      console.error('Error in loadData:', error)
    } finally {
      setLoading(false)
    }
  }

  // Get score color (VESPA-style)
  function getScoreColor(score: number | null): string {
    if (score === null) return 'bg-gray-100 text-gray-400'
    if (score >= 7) return 'bg-green-100 text-green-700'
    if (score >= 5) return 'bg-yellow-100 text-yellow-700'
    if (score >= 3) return 'bg-orange-100 text-orange-700'
    return 'bg-red-100 text-red-700'
  }

  function formatScore(score: number | null): string {
    return score !== null ? score.toFixed(1) : '-'
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🔄</div>
        <p className="text-gray-600">Loading students...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Student Coaching</h1>
        <p className="text-gray-600 mt-2">
          View student SPARK scores, reflections, and goals
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search by name
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Group Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by group
            </label>
            <select
              value={filterGroup}
              onChange={(e) => setFilterGroup(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Students</option>
              {yearGroups.map(year => (
                <option key={year} value={`Year ${year}`}>Year {year}</option>
              ))}
              {tutorGroups.map(group => (
                <option key={group} value={group as string}>{group}</option>
              ))}
            </select>
          </div>

          {/* Cycle Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Assessment Cycle
            </label>
            <select
              value={filterCycle}
              onChange={(e) => setFilterCycle(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="latest">Latest Results</option>
              <option value="1">Cycle 1</option>
              <option value="2">Cycle 2</option>
              <option value="3">Cycle 3</option>
            </select>
          </div>
        </div>

        <div className="mt-4 text-sm text-gray-500">
          Showing {filteredStudents.length} of {students.length} students
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-cyan-500 text-white">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold">STUDENT NAME</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">GROUP</th>
                <th className="px-6 py-3 text-center text-sm font-semibold">REPORT</th>
                <th className="px-6 py-3 text-center text-sm font-semibold">S</th>
                <th className="px-6 py-3 text-center text-sm font-semibold">P</th>
                <th className="px-6 py-3 text-center text-sm font-semibold">A</th>
                <th className="px-6 py-3 text-center text-sm font-semibold">R</th>
                <th className="px-6 py-3 text-center text-sm font-semibold">K</th>
                <th className="px-6 py-3 text-center text-sm font-semibold">O</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">REPORT RESPONSE</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">ACTION PLAN</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={11} className="px-6 py-12 text-center text-gray-500">
                    No students found
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50">
                    {/* Name */}
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">
                        {student.first_name} {student.last_name}
                      </div>
                      <div className="text-sm text-gray-500">{student.email}</div>
                    </td>

                    {/* Group */}
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {student.tutor_group || `Year ${student.year_group}`}
                    </td>

                    {/* Report Button */}
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => router.push(`/portal/staff/coaching/${student.id}`)}
                        className="bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-semibold px-4 py-2 rounded-lg uppercase tracking-wide"
                      >
                        REPORT
                      </button>
                    </td>

                    {/* SPARK Scores (S, P, A, R, K) */}
                    <td className="px-6 py-4 text-center">
                      <div className={`inline-block px-3 py-1 rounded font-semibold text-sm ${getScoreColor(student.self_direction_score)}`}>
                        {formatScore(student.self_direction_score)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className={`inline-block px-3 py-1 rounded font-semibold text-sm ${getScoreColor(student.purpose_score)}`}>
                        {formatScore(student.purpose_score)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className={`inline-block px-3 py-1 rounded font-semibold text-sm ${getScoreColor(student.awareness_score)}`}>
                        {formatScore(student.awareness_score)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className={`inline-block px-3 py-1 rounded font-semibold text-sm ${getScoreColor(student.resilience_score)}`}>
                        {formatScore(student.resilience_score)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className={`inline-block px-3 py-1 rounded font-semibold text-sm ${getScoreColor(student.knowledge_score)}`}>
                        {formatScore(student.knowledge_score)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className={`inline-block px-3 py-1 rounded font-semibold text-sm ${getScoreColor(student.overall_score)}`}>
                        {formatScore(student.overall_score)}
                      </div>
                    </td>

                    {/* Report Response */}
                    <td className="px-6 py-4">
                      {student.reflection_text ? (
                        <button
                          onClick={() => {
                            setSelectedStudent(student)
                            setResponseModalOpen(true)
                          }}
                          className="text-sm text-cyan-600 hover:text-cyan-800 underline max-w-xs truncate block"
                        >
                          {student.reflection_text.substring(0, 50)}...
                        </button>
                      ) : (
                        <span className="text-sm text-gray-400">No response</span>
                      )}
                    </td>

                    {/* Action Plan */}
                    <td className="px-6 py-4">
                      {student.goal_text ? (
                        <button
                          onClick={() => {
                            setSelectedStudent(student)
                            setGoalsModalOpen(true)
                          }}
                          className="text-sm text-cyan-600 hover:text-cyan-800 underline max-w-xs truncate block"
                        >
                          {student.goal_text.substring(0, 50)}...
                        </button>
                      ) : (
                        <span className="text-sm text-gray-400">No action plan</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Action Bar */}
      <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-purple-900">Next Steps</h3>
            <p className="text-sm text-purple-700 mt-1">
              Click on student responses or goals to view details and add coaching comments
            </p>
          </div>
          <button
            onClick={() => router.push('/portal/staff/analytics')}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold"
          >
            View Analytics →
          </button>
        </div>
      </div>

      {/* Modals */}
      {selectedStudent && (
        <>
          <StudentResponseModal
            isOpen={responseModalOpen}
            onClose={() => {
              setResponseModalOpen(false)
              setSelectedStudent(null)
            }}
            student={selectedStudent}
            onUpdate={loadData}
          />
          <StudentGoalsModal
            isOpen={goalsModalOpen}
            onClose={() => {
              setGoalsModalOpen(false)
              setSelectedStudent(null)
            }}
            student={selectedStudent}
            onUpdate={loadData}
          />
        </>
      )}
    </div>
  )
}

