'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'

interface StudentResponseModalProps {
  isOpen: boolean
  onClose: () => void
  student: {
    id: string
    first_name: string
    last_name: string
    reflection_text: string | null
    cycle_number: number | null
  }
  onUpdate: () => void
}

export default function StudentResponseModal({
  isOpen,
  onClose,
  student,
  onUpdate
}: StudentResponseModalProps) {
  const [staffComment, setStaffComment] = useState('')
  const [visibleToStudent, setVisibleToStudent] = useState(false)
  const [saving, setSaving] = useState(false)
  const [existingComments, setExistingComments] = useState<any[]>([])

  useEffect(() => {
    if (isOpen) {
      loadStaffComments()
    }
  }, [isOpen, student.id])

  async function loadStaffComments() {
    const { data } = await supabase
      .from('staff_notes')
      .select(`
        *,
        author:profiles!staff_notes_author_id_fkey(first_name, last_name)
      `)
      .eq('student_id', student.id)
      .order('created_at', { ascending: false })

    if (data) {
      setExistingComments(data)
    }
  }

  async function handleSaveComment() {
    if (!staffComment.trim()) return

    setSaving(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const { error } = await supabase
        .from('staff_notes')
        .insert({
          student_id: student.id,
          author_id: session.user.id,
          note_text: staffComment,
          visibility: visibleToStudent ? 'student_visible' : 'staff_only',
          note_type: 'coaching',
        })

      if (!error) {
        setStaffComment('')
        setVisibleToStudent(false)
        await loadStaffComments()
        onUpdate()
      }
    } catch (error) {
      console.error('Error saving comment:', error)
    } finally {
      setSaving(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-cyan-600 text-white px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">
              {student.first_name} {student.last_name} - Report Response
            </h2>
            {student.cycle_number && (
              <p className="text-sm opacity-90 mt-1">Cycle {student.cycle_number}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Student Response */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              <span className="text-2xl mr-2">💭</span>
              Student Response
            </h3>
            <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-4">
              {student.reflection_text ? (
                <p className="text-gray-800 whitespace-pre-wrap">{student.reflection_text}</p>
              ) : (
                <p className="text-gray-500 italic">No response provided yet</p>
              )}
            </div>
          </div>

          {/* Staff Comments */}
          {existingComments.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <span className="text-2xl mr-2">📝</span>
                Previous Coaching Comments
              </h3>
              <div className="space-y-3">
                {existingComments.map((comment) => (
                  <div
                    key={comment.id}
                    className={`rounded-lg p-4 border ${
                      comment.visibility === 'student_visible'
                        ? 'bg-green-50 border-green-200'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="text-sm font-medium text-gray-900">
                        {comment.author?.first_name} {comment.author?.last_name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(comment.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <p className="text-gray-800 text-sm whitespace-pre-wrap">
                      {comment.note_text}
                    </p>
                    {comment.visibility === 'student_visible' && (
                      <div className="mt-2 text-xs text-green-700 font-medium">
                        ✓ Visible to Student
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add New Comment */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              <span className="text-2xl mr-2">✍️</span>
              Add Coaching Comment
            </h3>
            <textarea
              value={staffComment}
              onChange={(e) => setStaffComment(e.target.value)}
              placeholder="Add your coaching notes, feedback, or observations..."
              rows={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            />
            
            <div className="mt-3 flex items-center">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={visibleToStudent}
                  onChange={(e) => setVisibleToStudent(e.target.checked)}
                  className="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Make this comment visible to student
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
          >
            Close
          </button>
          <button
            onClick={handleSaveComment}
            disabled={!staffComment.trim() || saving}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {saving ? 'Saving...' : 'Save Comment'}
          </button>
        </div>
      </div>
    </div>
  )
}

