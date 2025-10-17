'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'

interface StudentReport {
  id: string
  first_name: string
  last_name: string
  email: string
  year_group: number
  tutor_group: string | null
  // Assessment
  cycle_number: number | null
  self_direction_score: number | null
  purpose_score: number | null
  awareness_score: number | null
  resilience_score: number | null
  knowledge_score: number | null
  overall_score: number | null
  // AI statements
  self_direction_statement: string | null
  purpose_statement: string | null
  awareness_statement: string | null
  resilience_statement: string | null
  knowledge_statement: string | null
  // Reflections & goals
  reflection_text: string | null
  goals: any[]
  // Staff notes
  staff_notes: any[]
}

export default function IndividualCoachingPage() {
  const params = useParams()
  const router = useRouter()
  const studentId = params.studentId as string

  const [student, setStudent] = useState<StudentReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [newComment, setNewComment] = useState('')
  const [commentVisible, setCommentVisible] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadStudentData()
  }, [studentId])

  async function loadStudentData() {
    try {
      // Get student profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', studentId)
        .single() as { data: any }

      if (!profileData) {
        alert('Student not found')
        router.push('/portal/staff/coaching')
        return
      }

      // Get student details
      const { data: studentData } = await supabase
        .from('students')
        .select('*')
        .eq('id', studentId)
        .single() as { data: any }

      // Get latest assessment result (use array, then get first)
      const { data: resultDataArray } = await supabase
        .from('assessment_results')
        .select('*')
        .eq('student_id', studentId)
        .order('created_at', { ascending: false })
        .limit(1) as { data: any }

      const resultData = resultDataArray && resultDataArray.length > 0 ? resultDataArray[0] : null

      // Get reflections (use array, then get first)
      const { data: reflectionDataArray } = await supabase
        .from('student_reflections')
        .select('*')
        .eq('student_id', studentId)
        .order('created_at', { ascending: false })
        .limit(1) as { data: any }

      const reflectionData = reflectionDataArray && reflectionDataArray.length > 0 ? reflectionDataArray[0] : null

      // Get goals
      const { data: goalsData } = await supabase
        .from('student_goals')
        .select('*')
        .eq('student_id', studentId)
        .order('created_at', { ascending: false }) as { data: any }

      // Get staff notes
      const { data: notesData } = await supabase
        .from('staff_notes')
        .select(`
          *,
          author:profiles!staff_notes_author_id_fkey(first_name, last_name)
        `)
        .eq('student_id', studentId)
        .order('created_at', { ascending: false }) as { data: any }

      setStudent({
        id: studentId,
        first_name: profileData.first_name,
        last_name: profileData.last_name,
        email: profileData.email,
        year_group: studentData?.year_group || 0,
        tutor_group: studentData?.tutor_group || null,
        cycle_number: null, // cycle_number not in assessment_results table
        self_direction_score: resultData?.self_direction_score || null,
        purpose_score: resultData?.purpose_score || null,
        awareness_score: resultData?.awareness_score || null,
        resilience_score: resultData?.resilience_score || null,
        knowledge_score: resultData?.knowledge_score || null,
        overall_score: resultData?.overall_score || null,
        self_direction_statement: resultData?.self_direction_statement || null,
        purpose_statement: resultData?.purpose_statement || null,
        awareness_statement: resultData?.awareness_statement || null,
        resilience_statement: resultData?.resilience_statement || null,
        knowledge_statement: resultData?.knowledge_statement || null,
        reflection_text: reflectionData?.reflection_text || null,
        goals: goalsData || [],
        staff_notes: notesData || [],
      })
    } catch (error) {
      console.error('Error loading student:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSaveComment() {
    if (!newComment.trim()) return

    setSaving(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      await supabase
        .from('staff_notes')
        .insert({
          student_id: studentId,
          author_id: session.user.id,
          note_text: newComment,
          visibility: commentVisible ? 'student_visible' : 'staff_only',
          note_type: 'coaching',
        } as any)

      setNewComment('')
      setCommentVisible(false)
      await loadStudentData()
    } catch (error) {
      console.error('Error saving comment:', error)
    } finally {
      setSaving(false)
    }
  }

  function getScoreColor(score: number | null): string {
    if (score === null) return 'bg-gray-100 text-gray-600'
    if (score >= 7) return 'bg-green-500 text-white'
    if (score >= 5) return 'bg-yellow-400 text-gray-900'
    if (score >= 3) return 'bg-orange-400 text-white'
    return 'bg-red-500 text-white'
  }

  function getDimensionColor(dimension: string): string {
    const colors: Record<string, string> = {
      'self_direction': 'border-l-4 border-pink-500',
      'purpose': 'border-l-4 border-purple-500',
      'awareness': 'border-l-4 border-cyan-500',
      'resilience': 'border-l-4 border-lime-500',
      'knowledge': 'border-l-4 border-yellow-500',
    }
    return colors[dimension] || 'border-l-4 border-gray-500'
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🔄</div>
        <p className="text-gray-600">Loading student report...</p>
      </div>
    )
  }

  if (!student) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">❌</div>
        <p className="text-gray-600">Student not found</p>
        <button
          onClick={() => router.push('/portal/staff/coaching')}
          className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          Back to Coaching
        </button>
      </div>
    )
  }

  const dimensions = [
    { key: 'self_direction', label: 'Self-Direction', score: student.self_direction_score, statement: student.self_direction_statement, color: 'border-pink-500' },
    { key: 'purpose', label: 'Purpose', score: student.purpose_score, statement: student.purpose_statement, color: 'border-purple-500' },
    { key: 'awareness', label: 'Awareness', score: student.awareness_score, statement: student.awareness_statement, color: 'border-cyan-500' },
    { key: 'resilience', label: 'Resilience', score: student.resilience_score, statement: student.resilience_statement, color: 'border-lime-500' },
    { key: 'knowledge', label: 'Knowledge', score: student.knowledge_score, statement: student.knowledge_statement, color: 'border-yellow-500' },
  ]

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={() => router.push('/portal/staff/coaching')}
        className="flex items-center text-gray-600 hover:text-gray-900"
      >
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to Coaching
      </button>

      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-cyan-600 text-white rounded-xl p-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">
              {student.first_name} {student.last_name}
            </h1>
            <p className="text-purple-100 mt-2">
              {student.tutor_group || `Year ${student.year_group}`} • {student.email}
            </p>
            {student.cycle_number && (
              <p className="text-sm text-purple-100 mt-1">
                Assessment Cycle {student.cycle_number}
              </p>
            )}
          </div>
          <div className="text-right">
            <div className="text-5xl font-bold">{student.overall_score?.toFixed(1) || '-'}</div>
            <div className="text-sm text-purple-100">Overall Score</div>
          </div>
        </div>
      </div>

      {/* SPARK Dimension Scores */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">SPARK Profile</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {dimensions.map((dim) => (
            <div key={dim.key} className="text-center">
              <div className={`text-4xl font-bold mb-2 ${dim.score ? (dim.score >= 7 ? 'text-green-600' : dim.score >= 5 ? 'text-yellow-600' : 'text-orange-600') : 'text-gray-400'}`}>
                {dim.score?.toFixed(1) || '-'}
              </div>
              <div className={`text-sm font-semibold border-t-4 ${dim.color} pt-2`}>
                {dim.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI-Generated Statements */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">AI-Generated Insights</h2>
        <div className="space-y-4">
          {dimensions.map((dim) => dim.statement && (
            <div key={dim.key} className={`border-l-4 ${dim.color} bg-gray-50 p-4 rounded-r-lg`}>
              <div className="font-semibold text-gray-900 mb-2">{dim.label}</div>
              <p className="text-gray-700 text-sm leading-relaxed">{dim.statement}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Student Response */}
      {student.reflection_text && (
        <div className="bg-cyan-50 border border-cyan-200 rounded-xl p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
            <span className="text-3xl mr-3">💭</span>
            Student Response
          </h2>
          <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
            {student.reflection_text}
          </p>
        </div>
      )}

      {/* Student Goals */}
      {student.goals.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
            <span className="text-3xl mr-3">🎯</span>
            Student Goals
          </h2>
          <div className="space-y-3">
            {student.goals.map((goal) => (
              <div key={goal.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <p className="text-gray-800 flex-1">{goal.goal_text}</p>
                  <span className={`ml-4 text-xs px-2 py-1 rounded-full font-semibold ${
                    goal.status === 'achieved' ? 'bg-green-100 text-green-700' :
                    goal.status === 'in_progress' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {goal.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
                {goal.target_date && (
                  <div className="text-xs text-gray-500 mt-2">
                    Target: {new Date(goal.target_date).toLocaleDateString()}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Staff Coaching Comments */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
          <span className="text-3xl mr-3">✍️</span>
          Coaching Record
        </h2>

        {/* Previous Comments */}
        {student.staff_notes.length > 0 && (
          <div className="space-y-3 mb-6">
            {student.staff_notes.map((note) => (
              <div
                key={note.id}
                className={`rounded-lg p-4 border ${
                  note.visibility === 'student_visible'
                    ? 'bg-green-50 border-green-200'
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="text-sm font-medium text-gray-900">
                    {note.author?.first_name} {note.author?.last_name}
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(note.created_at).toLocaleDateString()}
                  </div>
                </div>
                <p className="text-gray-800 text-sm whitespace-pre-wrap">{note.note_text}</p>
                {note.visibility === 'student_visible' && (
                  <div className="mt-2 text-xs text-green-700 font-medium">
                    ✓ Visible to Student
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Add New Comment */}
        <div className="border-t pt-6">
          <h3 className="font-semibold text-gray-900 mb-3">Add Coaching Comment</h3>
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add notes from your coaching conversation with the student..."
            rows={6}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
          />
          
          <div className="mt-4 flex items-center justify-between">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={commentVisible}
                onChange={(e) => setCommentVisible(e.target.checked)}
                className="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
              />
              <span className="text-sm font-medium text-gray-700">
                Make visible to student
              </span>
            </label>

            <button
              onClick={handleSaveComment}
              disabled={!newComment.trim() || saving}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {saving ? 'Saving...' : 'Save Comment'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

