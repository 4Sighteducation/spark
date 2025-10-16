'use client'

import { useState, useEffect } from 'react'
import SenseiGuide from './SenseiGuide'
import IdeaInput from './IdeaInput'

interface IkigaiStep4Props {
  ideas: string[]
  previousIdeas: { love: string[]; goodAt: string[] }
  addIdea: (idea: string) => void
  removeIdea: (index: number) => void
  onNext: () => void
  onBack: () => void
  points: number
}

export default function IkigaiStep4({ ideas, previousIdeas, addIdea, removeIdea, onNext, onBack, points }: IkigaiStep4Props) {
  const [guidance, setGuidance] = useState('')
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([])
  const [loadingSuggestions, setLoadingSuggestions] = useState(false)

  useEffect(() => {
    async function loadGuidance() {
      const response = await fetch('/api/sensei/guidance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ step: 4, context: { currentStep: 4, ideas: { love: previousIdeas.love, goodAt: previousIdeas.goodAt, paidFor: ideas, worldNeeds: [] }, conversationHistory: [] } }),
      })
      const data = await response.json()
      setGuidance(data.message)
    }
    loadGuidance()
  }, [])

  const handleGetSuggestions = async () => {
    if (ideas.length === 0) {
      const confirmed = confirm("Sensei says: Think of one or two ways you might earn a living first. Then I can suggest related paths.")
      if (!confirmed) return
    }

    setLoadingSuggestions(true)
    const response = await fetch('/api/sensei/suggestions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quadrant: 'paidFor', currentIdeas: ideas, studentAge: 13 }),
    })
    const data = await response.json()
    setAiSuggestions(data.suggestions || [])
    setLoadingSuggestions(false)
  }

  const canProceed = ideas.length >= 3

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Progress */}
        <div className="mb-6">
          <div className="flex justify-between text-white text-sm mb-2">
            <span className="font-bold">Step 4 of 6</span>
            <span className="bg-purple-600/80 px-4 py-1 rounded-full backdrop-blur-sm">
              💎 {points} points
            </span>
          </div>
          <div className="h-3 bg-white/20 rounded-full backdrop-blur-sm overflow-hidden">
            <div className="h-full bg-gradient-to-r from-lime-500 to-yellow-500 rounded-full transition-all duration-500" style={{ width: '66.67%' }} />
          </div>
        </div>

        {/* Sensei Guidance - Grey Sensei with open arms (guiding wisdom) */}
        <SenseiGuide 
          message={guidance} 
          senseiImage="/sensai2openarms.png"
        />

        {/* Main Content Card */}
        <div className="bg-white/95 backdrop-blur-lg rounded-3xl p-8 md:p-10 shadow-2xl border-4 border-yellow-400 mt-6">
          {/* Title */}
          <div className="text-center mb-8">
            <div className="inline-block bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-8 py-3 rounded-full mb-4">
              <h2 className="text-3xl md:text-4xl font-bold">💰 What You Can Be PAID FOR</h2>
            </div>
            <p className="text-gray-700 text-lg mt-4">
              How might your passions and skills translate into earning a living?<br/>
              Think about careers, jobs, or ways to earn money.
            </p>
          </div>

          {/* Idea Input */}
          <IdeaInput
            ideas={ideas}
            addIdea={addIdea}
            removeIdea={removeIdea}
            placeholder="e.g., Teaching, content creator, sports coach, graphic designer..."
            color="#fdbe21"
          />

          {/* AI Suggestions */}
          <div className="mt-6">
            <button
              onClick={handleGetSuggestions}
              disabled={loadingSuggestions}
              className="w-full md:w-auto bg-yellow-100 hover:bg-yellow-200 text-yellow-900 font-semibold py-3 px-6 rounded-xl transition-all disabled:opacity-50 border-2 border-yellow-400"
            >
              {loadingSuggestions ? '🤖 Sensei is thinking...' : '💡 Ask Sensei for Ideas'}
            </button>

            {aiSuggestions.length > 0 && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                {aiSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => addIdea(suggestion)}
                    className="bg-yellow-50 hover:bg-yellow-100 border-2 border-yellow-300 rounded-xl p-4 text-left transition-all hover:scale-105"
                  >
                    <span className="text-yellow-700 font-medium">+ {suggestion}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Insight */}
          <div className="mt-8 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl p-5 border-2 border-yellow-300">
            <p className="text-yellow-900 text-center text-sm">
              💡 <strong>Remember:</strong> Money matters, but so do freedom, creativity, and doing work you enjoy. Think about balance!
            </p>
          </div>

          {/* Progress Hint */}
          <div className="mt-6 text-center">
            {ideas.length < 3 && (
              <p className="text-yellow-700 font-semibold">
                Add {3 - ideas.length} more {ideas.length === 0 ? 'ideas' : ideas.length === 1 ? 'idea' : 'more ideas'} to continue
              </p>
            )}
            {canProceed && (
              <p className="text-green-600 font-bold text-lg animate-pulse">
                ✅ Ready for the next quadrant!
              </p>
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex gap-4 mt-6">
          <button
            onClick={onBack}
            className="px-8 py-4 bg-white/80 hover:bg-white text-gray-700 font-bold rounded-xl transition-all backdrop-blur-sm"
          >
            ← Back
          </button>
          <button
            onClick={onNext}
            disabled={!canProceed}
            className="flex-1 px-8 py-4 bg-gradient-to-r from-yellow-500 to-green-500 hover:from-yellow-600 hover:to-green-600 text-white font-bold rounded-xl transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-xl"
          >
            Next: What the World Needs →
          </button>
        </div>
      </div>
    </div>
  )
}

