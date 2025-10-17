'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'

interface StudentGoalsModalProps {
  isOpen: boolean
  onClose: () => void
  student: {
    id: string
    first_name: string
    last_name: string
    goal_text: string | null
    goal_target_date: string | null
    cycle_number: number | null
  }
  onUpdate: () => void
}

export default function StudentGoalsModal({
  isOpen,
  onClose,
  student,
  onUpdate
}: StudentGoalsModalProps) {
  const [goals, setGoals] = useState<any[]>([])
  const [newGoalText, setNewGoalText] = useState('')
  const [newGoalDate, setNewGoalDate] = useState('')
  const [newGoalDimension, setNewGoalDimension] = useState('')
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isOpen) {
      loadGoals()
    }
  }, [isOpen, student.id])

  async function loadGoals() {
    setLoading(true)
    const { data } = await supabase
      .from('student_goals')
      .select('*')
      .eq('student_id', student.id)
      .order('created_at', { ascending: false })

    if (data) {
      setGoals(data)
    }
    setLoading(false)
  }

  async function handleAddGoal() {
    if (!newGoalText.trim()) return

    setSaving(true)
    try {
      const { error } = await supabase
        .from('student_goals')
        .insert({
          student_id: student.id,
          goal_text: newGoalText,
          target_date: newGoalDate || null,
          dimension: newGoalDimension || null,
          cycle_number: student.cycle_number,
          status: 'not_started',
        } as any)

      if (!error) {
        setNewGoalText('')
        setNewGoalDate('')
        setNewGoalDimension('')
        await loadGoals()
        onUpdate()
      }
    } catch (error) {
      console.error('Error adding goal:', error)
    } finally {
      setSaving(false)
    }
  }

  async function handleUpdateGoalStatus(goalId: string, newStatus: string) {
    const updateData: any = { 
      status: newStatus,
      ...(newStatus === 'achieved' ? { achieved_at: new Date().toISOString() } : {})
    }
    
    await (supabase as any)
      .from('student_goals')
      .update(updateData)
      .eq('id', goalId)

    await loadGoals()
    onUpdate()
  }

  async function handleDeleteGoal(goalId: string) {
    if (!confirm('Are you sure you want to delete this goal?')) return

    await supabase
      .from('student_goals')
      .delete()
      .eq('id', goalId)

    await loadGoals()
    onUpdate()
  }

  if (!isOpen) return null

  const statusColors: Record<string, string> = {
    'not_started': 'bg-gray-100 text-gray-700',
    'in_progress': 'bg-yellow-100 text-yellow-700',
    'achieved': 'bg-green-100 text-green-700',
    'abandoned': 'bg-red-100 text-red-700',
  }

  const dimensionColors: Record<string, string> = {
    'S': 'bg-pink-100 text-pink-700',
    'P': 'bg-purple-100 text-purple-700',
    'A': 'bg-cyan-100 text-cyan-700',
    'R': 'bg-lime-100 text-lime-700',
    'K': 'bg-yellow-100 text-yellow-700',
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-cyan-600 text-white px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">
              {student.first_name} {student.last_name} - Study Goals
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
          {/* Existing Goals */}
          {loading ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">🔄</div>
              <p className="text-gray-600">Loading goals...</p>
            </div>
          ) : goals.length > 0 ? (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <span className="text-2xl mr-2">🎯</span>
                Current Goals ({goals.length})
              </h3>
              <div className="space-y-3">
                {goals.map((goal) => (
                  <div
                    key={goal.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <p className="text-gray-900 font-medium mb-2">{goal.goal_text}</p>
                        <div className="flex flex-wrap gap-2">
                          {goal.dimension && (
                            <span className={`text-xs px-2 py-1 rounded-full font-semibold ${dimensionColors[goal.dimension] || 'bg-gray-100 text-gray-700'}`}>
                              {goal.dimension === 'S' && 'Self-Direction'}
                              {goal.dimension === 'P' && 'Purpose'}
                              {goal.dimension === 'A' && 'Awareness'}
                              {goal.dimension === 'R' && 'Resilience'}
                              {goal.dimension === 'K' && 'Knowledge'}
                            </span>
                          )}
                          <span className={`text-xs px-2 py-1 rounded-full font-semibold ${statusColors[goal.status]}`}>
                            {goal.status.replace('_', ' ').toUpperCase()}
                          </span>
                          {goal.target_date && (
                            <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700 font-semibold">
                              Due: {new Date(goal.target_date).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteGoal(goal.id)}
                        className="ml-4 text-red-500 hover:text-red-700 p-1"
                        title="Delete goal"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>

                    {/* Status Update */}
                    <div className="flex gap-2 mt-3 pt-3 border-t border-gray-200">
                      <button
                        onClick={() => handleUpdateGoalStatus(goal.id, 'not_started')}
                        disabled={goal.status === 'not_started'}
                        className="text-xs px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Not Started
                      </button>
                      <button
                        onClick={() => handleUpdateGoalStatus(goal.id, 'in_progress')}
                        disabled={goal.status === 'in_progress'}
                        className="text-xs px-3 py-1 rounded bg-yellow-100 hover:bg-yellow-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        In Progress
                      </button>
                      <button
                        onClick={() => handleUpdateGoalStatus(goal.id, 'achieved')}
                        disabled={goal.status === 'achieved'}
                        className="text-xs px-3 py-1 rounded bg-green-100 hover:bg-green-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Achieved
                      </button>
                    </div>

                    {goal.progress_notes && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <p className="text-sm text-gray-600">{goal.progress_notes}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <div className="text-4xl mb-2">📋</div>
              <p className="text-gray-600">No goals set yet</p>
            </div>
          )}

          {/* Add New Goal */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <span className="text-2xl mr-2">➕</span>
              Add New Goal
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Goal Description
                </label>
                <textarea
                  value={newGoalText}
                  onChange={(e) => setNewGoalText(e.target.value)}
                  placeholder="e.g., Complete 3 revision sessions per week..."
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target SPARK Dimension
                  </label>
                  <select
                    value={newGoalDimension}
                    onChange={(e) => setNewGoalDimension(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">None</option>
                    <option value="S">Self-Direction</option>
                    <option value="P">Purpose</option>
                    <option value="A">Awareness</option>
                    <option value="R">Resilience</option>
                    <option value="K">Knowledge</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target Date
                  </label>
                  <input
                    type="date"
                    value={newGoalDate}
                    onChange={(e) => setNewGoalDate(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <button
                onClick={handleAddGoal}
                disabled={!newGoalText.trim() || saving}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Adding Goal...' : 'Add Goal'}
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}

