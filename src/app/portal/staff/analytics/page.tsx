'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import StatementHeatMap from '@/components/portal/staff/StatementHeatMap'
import ScoreDistributionChart from '@/components/portal/staff/ScoreDistributionChart'
import DimensionComparisonChart from '@/components/portal/staff/DimensionComparisonChart'

interface StatementAnalysis {
  question_number: number
  statement: string
  dimension: string
  avg_score: number
  responses_count: number
  score_distribution: Record<number, number>
}

interface StudentScore {
  student_id: string
  student_name: string
  year_group: number
  tutor_group: string | null
  overall_score: number
  [key: string]: any
}

export default function AnalyticsPage() {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  
  // Data
  const [statementData, setStatementData] = useState<StatementAnalysis[]>([])
  const [studentScores, setStudentScores] = useState<StudentScore[]>([])
  const [dimensionAverages, setDimensionAverages] = useState<any>({})
  
  // Filters
  const [filterYearGroup, setFilterYearGroup] = useState('all')
  const [filterTutorGroup, setFilterTutorGroup] = useState('all')
  const [filterCycle, setFilterCycle] = useState('latest')
  
  // UI
  const [activeTab, setActiveTab] = useState<'overview' | 'statements' | 'students'>('overview')

  useEffect(() => {
    loadData()
  }, [filterYearGroup, filterTutorGroup, filterCycle])

  async function loadData() {
    setLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single() as { data: any; error: any }

      if (profileError || !profileData) {
        console.error('Profile error:', profileError)
        setLoading(false)
        return
      }

      const organizationId = profileData.organization_id as string
      const userRole = profileData.primary_role as string

      setProfile(profileData)

      // Get students based on role  
      let studentQuery = supabase
        .from('students')
        .select('id, year_group, tutor_group, profiles!inner(first_name, last_name, organization_id)')
        .eq('is_active', true)
        .eq('profiles.organization_id', organizationId)

      // Apply role-based filters
      if (userRole === 'head_of_year') {
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('scope')
          .eq('user_id', session.user.id)
          .eq('role', 'head_of_year')
          .eq('is_active', true)
          .single() as { data: any }

        if (roleData?.scope?.year) {
          studentQuery = studentQuery.eq('year_group', roleData.scope.year)
        }
      } else if (userRole === 'tutor') {
        const { data: classData } = await supabase
          .from('staff_class_assignments')
          .select('classes(name)')
          .eq('staff_id', session.user.id)
          .eq('role', 'tutor')
          .eq('is_active', true) as { data: any }

        if (classData && classData.length > 0) {
          const tutorGroups = classData.map((c: any) => c.classes?.name).filter(Boolean)
          if (tutorGroups.length > 0) {
            studentQuery = studentQuery.in('tutor_group', tutorGroups)
          }
        }
      }

      // Apply UI filters
      if (filterYearGroup !== 'all') {
        studentQuery = studentQuery.eq('year_group', parseInt(filterYearGroup))
      }
      if (filterTutorGroup !== 'all') {
        studentQuery = studentQuery.eq('tutor_group', filterTutorGroup)
      }

      const { data: studentsData } = await studentQuery as { data: any }
      if (!studentsData || studentsData.length === 0) {
        setLoading(false)
        return
      }

      const studentIds = studentsData.map((s: any) => s.id)

      // Get assessment results
      let resultsQuery = supabase
        .from('assessment_results')
        .select('*')
        .in('student_id', studentIds)

      if (filterCycle !== 'latest') {
        resultsQuery = resultsQuery.eq('cycle_number', parseInt(filterCycle))
      }

      const { data: resultsData } = await resultsQuery as { data: any }

      // Get questionnaire data for statements
      const { data: questionnaireData, error: questError } = await supabase
        .from('questionnaires')
        .select('questions')
        .eq('is_default', true)
        .single() as { data: any; error: any }

      console.log('📋 Questionnaire:', { hasData: !!questionnaireData, hasQuestions: !!questionnaireData?.questions, error: questError })

      // Ensure questions is always an array
      const questions = Array.isArray(questionnaireData?.questions) ? questionnaireData.questions : []
      console.log('📋 Questions array:', { count: questions.length, isArray: Array.isArray(questions) })

      // Get questionnaire responses for these students
      const { data: responsesForStudents } = await supabase
        .from('questionnaire_responses')
        .select('id, student_id, cycle_number')
        .in('student_id', studentIds) as { data: any }

      const responseIds = responsesForStudents?.map((r: any) => r.id) || []

      // Get individual question answers
      const { data: answersData, error: answersError } = await supabase
        .from('question_answers')
        .select('response_id, question_id, slider_value, dimension')
        .in('response_id', responseIds) as { data: any; error: any }

      console.log('📝 Question Answers:', { count: answersData?.length, error: answersError })

      // Process statement-level data
      const statementMap = new Map<number, {
        total: number
        count: number
        scores: number[]
      }>()

      answersData?.forEach((answer: any) => {
        // Extract question number from question_id (e.g., 'S01' -> 1, 'P02' -> 2)
        const questionNum = parseInt(answer.question_id.substring(1))
        
        if (!statementMap.has(questionNum)) {
          statementMap.set(questionNum, { total: 0, count: 0, scores: [] })
        }
        const data = statementMap.get(questionNum)!
        const score = answer.slider_value / 10 // Convert 0-100 to 0-10
        data.total += score
        data.count += 1
        data.scores.push(score)
      })

      // Only process if we have questions array
      let statementAnalysis: StatementAnalysis[] = []
      
      if (Array.isArray(questions) && questions.length > 0) {
        statementAnalysis = Array.from(statementMap.entries())
          .map(([questionNum, data]) => {
            const question = questions.find((q: any) => q.number === questionNum)
            return {
              question_number: questionNum,
              statement: question?.text || `Question ${questionNum}`,
              dimension: question?.dimension || 'Unknown',
              avg_score: data.count > 0 ? data.total / data.count : 0,
              responses_count: data.count,
              score_distribution: data.scores.reduce((acc, score) => {
                const bucket = Math.floor(score)
                acc[bucket] = (acc[bucket] || 0) + 1
                return acc
              }, {} as Record<number, number>)
            }
          })
          .sort((a, b) => a.avg_score - b.avg_score) // Sort by lowest average first
      }

      setStatementData(statementAnalysis)

      // Process student scores
      const scoresWithNames: StudentScore[] = studentsData.map((s: any) => {
        const result = resultsData?.find((r: any) => r.student_id === s.id)
        return {
          student_id: s.id,
          student_name: `${s.profiles.first_name} ${s.profiles.last_name}`,
          year_group: s.year_group,
          tutor_group: s.tutor_group,
          overall_score: result?.overall_score || 0,
          self_direction_score: result?.self_direction_score || 0,
          purpose_score: result?.purpose_score || 0,
          awareness_score: result?.awareness_score || 0,
          resilience_score: result?.resilience_score || 0,
          knowledge_score: result?.knowledge_score || 0,
        }
      })

      setStudentScores(scoresWithNames)

      // Calculate dimension averages
      const dimensionTotals = {
        self_direction: 0,
        purpose: 0,
        awareness: 0,
        resilience: 0,
        knowledge: 0,
        count: resultsData?.length || 0
      }

      resultsData?.forEach((r: any) => {
        dimensionTotals.self_direction += r.self_direction_score || 0
        dimensionTotals.purpose += r.purpose_score || 0
        dimensionTotals.awareness += r.awareness_score || 0
        dimensionTotals.resilience += r.resilience_score || 0
        dimensionTotals.knowledge += r.knowledge_score || 0
      })

      setDimensionAverages({
        self_direction: dimensionTotals.count > 0 ? dimensionTotals.self_direction / dimensionTotals.count : 0,
        purpose: dimensionTotals.count > 0 ? dimensionTotals.purpose / dimensionTotals.count : 0,
        awareness: dimensionTotals.count > 0 ? dimensionTotals.awareness / dimensionTotals.count : 0,
        resilience: dimensionTotals.count > 0 ? dimensionTotals.resilience / dimensionTotals.count : 0,
        knowledge: dimensionTotals.count > 0 ? dimensionTotals.knowledge / dimensionTotals.count : 0,
      })

    } catch (error) {
      console.error('Error loading analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const yearGroups = Array.from(new Set(studentScores.map(s => s.year_group))).sort()
  const tutorGroups = Array.from(new Set(studentScores.map(s => s.tutor_group).filter(Boolean)))

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📊</div>
        <p className="text-gray-600">Loading analytics...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Deep insights into SPARK assessment data
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Year Group
            </label>
            <select
              value={filterYearGroup}
              onChange={(e) => setFilterYearGroup(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Years</option>
              {yearGroups.map(year => (
                <option key={year} value={year}>Year {year}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tutor Group
            </label>
            <select
              value={filterTutorGroup}
              onChange={(e) => setFilterTutorGroup(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Groups</option>
              {tutorGroups.map(group => (
                <option key={group} value={group as string}>{group}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Assessment Cycle
            </label>
            <select
              value={filterCycle}
              onChange={(e) => setFilterCycle(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              <option value="latest">Latest Results</option>
              <option value="1">Cycle 1</option>
              <option value="2">Cycle 2</option>
              <option value="3">Cycle 3</option>
            </select>
          </div>
        </div>

        <div className="mt-4 text-sm text-gray-500">
          Analyzing data from {studentScores.length} students
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200">
          <div className="flex">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === 'overview'
                  ? 'border-b-2 border-purple-600 text-purple-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              📊 Overview
            </button>
            <button
              onClick={() => setActiveTab('statements')}
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === 'statements'
                  ? 'border-b-2 border-purple-600 text-purple-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              🔍 Statement Analysis
            </button>
            <button
              onClick={() => setActiveTab('students')}
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === 'students'
                  ? 'border-b-2 border-purple-600 text-purple-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              👥 Student Breakdown
            </button>
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Dimension Averages */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  SPARK Dimension Averages
                </h3>
                <DimensionComparisonChart dimensions={dimensionAverages} />
              </div>

              {/* Score Distribution */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Overall Score Distribution
                </h3>
                <ScoreDistributionChart students={studentScores} />
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {[
                  { label: 'Self-Direction', value: dimensionAverages.self_direction, color: 'bg-pink-100 text-pink-700' },
                  { label: 'Purpose', value: dimensionAverages.purpose, color: 'bg-purple-100 text-purple-700' },
                  { label: 'Awareness', value: dimensionAverages.awareness, color: 'bg-cyan-100 text-cyan-700' },
                  { label: 'Resilience', value: dimensionAverages.resilience, color: 'bg-lime-100 text-lime-700' },
                  { label: 'Knowledge', value: dimensionAverages.knowledge, color: 'bg-yellow-100 text-yellow-700' },
                ].map((stat, idx) => (
                  <div key={idx} className={`${stat.color} rounded-lg p-4 text-center`}>
                    <div className="text-3xl font-bold">
                      {stat.value.toFixed(1)}
                    </div>
                    <div className="text-sm font-medium mt-1">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'statements' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Statement-Level Heat Map
                </h3>
                <p className="text-gray-600 mb-6">
                  Red = Low scores (needs attention), Yellow = Medium, Green = High scores
                </p>
                <StatementHeatMap statements={statementData} />
              </div>

              {/* Bottom 5 Statements */}
              <div>
                <h3 className="text-xl font-semibold text-red-700 mb-4">
                  🚨 Lowest 5 Scoring Statements (Needs Attention)
                </h3>
                <div className="space-y-3">
                  {statementData.slice(0, 5).map((stmt) => (
                    <div key={stmt.question_number} className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <span className="text-sm font-semibold text-red-700">
                            Q{stmt.question_number} - {stmt.dimension}
                          </span>
                          <p className="text-gray-800 mt-1">{stmt.statement}</p>
                        </div>
                        <div className="ml-4 text-right">
                          <div className="text-2xl font-bold text-red-700">
                            {stmt.avg_score.toFixed(1)}
                          </div>
                          <div className="text-xs text-gray-600">
                            {stmt.responses_count} responses
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top 5 Statements */}
              <div>
                <h3 className="text-xl font-semibold text-green-700 mb-4">
                  ✅ Highest 5 Scoring Statements (Strengths)
                </h3>
                <div className="space-y-3">
                  {statementData.slice(-5).reverse().map((stmt) => (
                    <div key={stmt.question_number} className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <span className="text-sm font-semibold text-green-700">
                            Q{stmt.question_number} - {stmt.dimension}
                          </span>
                          <p className="text-gray-800 mt-1">{stmt.statement}</p>
                        </div>
                        <div className="ml-4 text-right">
                          <div className="text-2xl font-bold text-green-700">
                            {stmt.avg_score.toFixed(1)}
                          </div>
                          <div className="text-xs text-gray-600">
                            {stmt.responses_count} responses
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'students' && (
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Individual Student Scores
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Student</th>
                      <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Group</th>
                      <th className="px-4 py-2 text-center text-sm font-semibold text-gray-700">Overall</th>
                      <th className="px-4 py-2 text-center text-sm font-semibold text-gray-700">S</th>
                      <th className="px-4 py-2 text-center text-sm font-semibold text-gray-700">P</th>
                      <th className="px-4 py-2 text-center text-sm font-semibold text-gray-700">A</th>
                      <th className="px-4 py-2 text-center text-sm font-semibold text-gray-700">R</th>
                      <th className="px-4 py-2 text-center text-sm font-semibold text-gray-700">K</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {studentScores
                      .sort((a, b) => b.overall_score - a.overall_score)
                      .map((student) => (
                        <tr key={student.student_id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm">{student.student_name}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {student.tutor_group || `Year ${student.year_group}`}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="font-semibold">{student.overall_score.toFixed(1)}</span>
                          </td>
                          <td className="px-4 py-3 text-center text-sm">{student.self_direction_score.toFixed(1)}</td>
                          <td className="px-4 py-3 text-center text-sm">{student.purpose_score.toFixed(1)}</td>
                          <td className="px-4 py-3 text-center text-sm">{student.awareness_score.toFixed(1)}</td>
                          <td className="px-4 py-3 text-center text-sm">{student.resilience_score.toFixed(1)}</td>
                          <td className="px-4 py-3 text-center text-sm">{student.knowledge_score.toFixed(1)}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

