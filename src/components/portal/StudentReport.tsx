'use client'

import { useState } from 'react'
import Image from 'next/image'
import statementsData from '@/data/statements.json'

interface StudentReportProps {
  assessment: any
  student: any
  canEdit?: boolean
}

export default function StudentReport({ assessment, student, canEdit = true }: StudentReportProps) {
  const [editing, setEditing] = useState(false)
  const [reflection, setReflection] = useState('')
  const [goals, setGoals] = useState<Array<{ goal: string; targetDate: string }>>([])
  const [newGoal, setNewGoal] = useState('')
  const [newGoalDate, setNewGoalDate] = useState('')

  const dimensions = [
    { 
      key: 'self_direction', 
      label: 'Self-Direction',
      subtitle: 'Initiative & Pro-activity',
      color: '#E91E8C',
      icon: '🎯',
    },
    { 
      key: 'purpose', 
      label: 'Purpose',
      subtitle: 'Hope, Vision & Aspiration',
      color: '#7C3AED',
      icon: '🌟',
    },
    { 
      key: 'awareness', 
      label: 'Awareness',
      subtitle: 'Empathy & Relationships',
      color: '#06B6D4',
      icon: '🤝',
    },
    { 
      key: 'resilience', 
      label: 'Resilience',
      subtitle: 'Grit & Perseverance',
      color: '#84CC16',
      icon: '💪',
    },
    { 
      key: 'knowledge', 
      label: 'Knowledge',
      subtitle: 'Curiosity & Learning',
      color: '#FBBF24',
      icon: '📚',
    },
  ]

  const getStatement = (dimKey: string, score: number) => {
    const data = (statementsData as any).SPARK[dimKey.split('_').map((word: string) => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join('')]
    
    if (!data) return null
    
    const breakpoint = data.breakpoints.find((bp: any) => {
      const [min, max] = bp.range.split('-').map(Number)
      return score >= min && score <= max
    })
    
    return breakpoint
  }

  const getBandColor = (band: string) => {
    const colors: Record<string, string> = {
      low: 'text-red-600 bg-red-50',
      average: 'text-yellow-600 bg-yellow-50',
      high: 'text-blue-600 bg-blue-50',
      very_high: 'text-green-600 bg-green-50',
    }
    return colors[band] || 'text-gray-600 bg-gray-50'
  }

  const handleAddGoal = () => {
    if (newGoal.trim() && newGoalDate) {
      setGoals([...goals, { goal: newGoal, targetDate: newGoalDate }])
      setNewGoal('')
      setNewGoalDate('')
    }
  }

  const handleRemoveGoal = (index: number) => {
    setGoals(goals.filter((_, i) => i !== index))
  }

  const handleSaveReflection = async () => {
    // TODO: Save to database
    console.log('Saving reflection:', reflection, goals)
    setEditing(false)
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 mb-6 border border-gray-200">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          <Image
            src="/spark-logo.png"
            alt="SPARK"
            width={100}
            height={100}
            className="w-20 h-20 md:w-24 md:h-24"
          />
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              Your SPARK Report
            </h1>
            <p className="text-gray-600">
              {student.first_name} {student.last_name} • Year {student.year_group} • Cycle {assessment.cycle_number || 1}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Completed: {new Date(assessment.calculated_at).toLocaleDateString('en-GB')}
            </p>
          </div>
        </div>
      </div>

      {/* Overall Score */}
      <div className="bg-gradient-to-r from-purple-600 to-cyan-600 rounded-2xl shadow-xl p-6 md:p-8 mb-6 text-white">
        <div className="text-center">
          <p className="text-sm uppercase tracking-wider mb-2 opacity-90">Overall SPARK Score</p>
          <div className="text-6xl md:text-7xl font-bold mb-2">
            {assessment.overall_score?.toFixed(1)}
          </div>
          <p className="text-xl md:text-2xl font-semibold capitalize">
            {assessment.overall_band?.replace('_', ' ')}
          </p>
        </div>
      </div>

      {/* Dimension Scores */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {dimensions.map((dim) => {
          const score = assessment[`${dim.key}_score`]
          const band = assessment[`${dim.key}_band`]
          
          return (
            <div
              key={dim.key}
              className="bg-white rounded-xl shadow-lg p-6 border-l-4 hover:shadow-xl transition-shadow"
              style={{ borderLeftColor: dim.color }}
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">{dim.icon}</span>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">{dim.label}</h3>
                  <p className="text-xs text-gray-500">{dim.subtitle}</p>
                </div>
              </div>
              <div className="flex items-baseline gap-3">
                <div className="text-4xl font-bold" style={{ color: dim.color }}>
                  {score?.toFixed(1)}
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${getBandColor(band)}`}>
                  {band?.replace('_', ' ')}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Personalized Statements */}
      {dimensions.map((dim) => {
        const score = assessment[`${dim.key}_score`]
        const statement = getStatement(dim.key, score)
        
        if (!statement) return null

        return (
          <div key={dim.key} className="bg-white rounded-2xl shadow-xl p-6 md:p-8 mb-6 border border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-4xl">{dim.icon}</span>
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-900">{dim.label}</h2>
                <p className="text-sm text-gray-600">{dim.subtitle}</p>
              </div>
            </div>
            
            <div className="mb-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="text-3xl font-bold" style={{ color: dim.color }}>
                  {score?.toFixed(1)}
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-bold uppercase ${getBandColor(statement.label.toLowerCase())}`}>
                  {statement.label}
                </span>
              </div>
            </div>

            <div className="prose prose-sm max-w-none">
              <p className="text-gray-700 leading-relaxed">
                {statement.statement}
              </p>
            </div>

            <div className="mt-4 p-4 bg-purple-50 rounded-lg border-l-4 border-purple-500">
              <p className="text-sm font-semibold text-purple-900 mb-1">💭 Reflection Question:</p>
              <p className="text-sm text-purple-800 italic">
                {statement.personal_development_question}
              </p>
            </div>
          </div>
        )
      })}

      {/* Student Reflections Section - Editable */}
      {canEdit && (
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 mb-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900">✏️ Your Reflections</h2>
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="px-4 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 font-semibold rounded-lg transition-colors text-sm"
              >
                {reflection ? 'Edit' : 'Add Reflections'}
              </button>
            )}
          </div>

          {editing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Thoughts on This Report
                </label>
                <textarea
                  value={reflection}
                  onChange={(e) => setReflection(e.target.value)}
                  rows={5}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  placeholder="What surprised you? What are you proud of? What would you like to work on?"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleSaveReflection}
                  className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : reflection ? (
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-700 whitespace-pre-wrap">{reflection}</p>
            </div>
          ) : (
            <p className="text-gray-500 italic">No reflections added yet.</p>
          )}
        </div>
      )}

      {/* Goals Section - Editable */}
      {canEdit && (
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 mb-6 border border-gray-200">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">🎯 My Goals</h2>

          {/* Existing Goals */}
          {goals.length > 0 && (
            <div className="space-y-3 mb-4">
              {goals.map((goal, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-cyan-50 rounded-lg border border-cyan-200">
                  <input type="checkbox" className="w-5 h-5 text-cyan-600 rounded" />
                  <div className="flex-1">
                    <p className="text-gray-900 font-medium">{goal.goal}</p>
                    <p className="text-xs text-gray-500">Target: {new Date(goal.targetDate).toLocaleDateString('en-GB')}</p>
                  </div>
                  <button
                    onClick={() => handleRemoveGoal(index)}
                    className="text-red-500 hover:text-red-700 p-2"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add New Goal */}
          <div className="space-y-3">
            <div>
              <input
                type="text"
                value={newGoal}
                onChange={(e) => setNewGoal(e.target.value)}
                placeholder="Add a new goal..."
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-3">
              <input
                type="date"
                value={newGoalDate}
                onChange={(e) => setNewGoalDate(e.target.value)}
                className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
              <button
                onClick={handleAddGoal}
                disabled={!newGoal.trim() || !newGoalDate}
                className="px-6 py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
              >
                Add Goal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

