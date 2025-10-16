'use client'

import { useState, useEffect } from 'react'
import { getSenseiGuidance, getSenseiSuggestions } from '@/lib/ai/sensei'
import SenseiGuide from './SenseiGuide'
import IdeaInput from './IdeaInput'

interface IkigaiStep5Props {
  ideas: string[]
  allPreviousIdeas: any
  addIdea: (idea: string) => void
  removeIdea: (index: number) => void
  onNext: () => void
  onBack: () => void
  points: number
}

export default function IkigaiStep5({ ideas, allPreviousIdeas, addIdea, removeIdea, onNext, onBack, points }: IkigaiStep5Props) {
  const [guidance, setGuidance] = useState('')
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([])
  const [loadingSuggestions, setLoadingSuggestions] = useState(false)

  useEffect(() => {
    async function loadGuidance() {
      const message = await getSenseiGuidance(5, {
        currentStep: 5,
        ideas: { ...allPreviousIdeas, worldNeeds: ideas },
        conversationHistory: [],
      })
      setGuidance(message)
    }
    loadGuidance()
  }, [])

  const handleGetSuggestions = async () => {
    setLoadingSuggestions(true)
    const suggestions = await getSenseiSuggestions('worldNeeds', ideas)
    setAiSuggestions(suggestions)
    setLoadingSuggestions(false)
  }

  const canProceed = ideas.length >= 3

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Progress */}
        <div className="mb-6">
          <div className="flex justify-between text-white text-sm mb-2">
            <span className="font-bold">Step 5 of 6</span>
            <span className="bg-purple-600/80 px-4 py-1 rounded-full backdrop-blur-sm">
              💎 {points} points
            </span>
          </div>
          <div className="h-3 bg-white/20 rounded-full backdrop-blur-sm overflow-hidden">
            <div className="h-full bg-gradient-to-r from-green-500 to-cyan-500 rounded-full transition-all duration-500" style={{ width: '83.33%' }} />
          </div>
        </div>

        {/* Sensei Guidance - Grey Sensei contemplative (deep wisdom) */}
        <SenseiGuide 
          message={guidance} 
          senseiImage="/sensai2handsdown.png"
        />

        {/* Main Content Card */}
        <div className="bg-white/95 backdrop-blur-lg rounded-3xl p-8 md:p-10 shadow-2xl border-4 border-cyan-400 mt-6">
          {/* Title */}
          <div className="text-center mb-8">
            <div className="inline-block bg-gradient-to-r from-cyan-500 to-green-600 text-white px-8 py-3 rounded-full mb-4">
              <h2 className="text-3xl md:text-4xl font-bold">🌍 What The WORLD NEEDS</h2>
            </div>
            <p className="text-gray-700 text-lg mt-4">
              How can your unique interests and abilities serve others?<br/>
              What problems could you help solve?
            </p>
          </div>

          {/* Idea Input */}
          <IdeaInput
            ideas={ideas}
            addIdea={addIdea}
            removeIdea={removeIdea}
            placeholder="e.g., Supporting mental health, protecting environment, reducing inequality..."
            color="#00b6d7"
          />

          {/* AI Suggestions */}
          <div className="mt-6">
            <button
              onClick={handleGetSuggestions}
              disabled={loadingSuggestions}
              className="w-full md:w-auto bg-cyan-100 hover:bg-cyan-200 text-cyan-900 font-semibold py-3 px-6 rounded-xl transition-all disabled:opacity-50 border-2 border-cyan-400"
            >
              {loadingSuggestions ? '🤖 Sensei is thinking...' : '💡 Ask Sensei for Ideas'}
            </button>

            {aiSuggestions.length > 0 && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                {aiSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => addIdea(suggestion)}
                    className="bg-cyan-50 hover:bg-cyan-100 border-2 border-cyan-300 rounded-xl p-4 text-left transition-all hover:scale-105"
                  >
                    <span className="text-cyan-700 font-medium">+ {suggestion}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Insight */}
          <div className="mt-8 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl p-5 border-2 border-cyan-300">
            <p className="text-cyan-900 text-center text-sm">
              🌟 <strong>Think big, but start small:</strong> Even small contributions matter. Your unique perspective and experiences are valuable!
            </p>
          </div>

          {/* Progress Hint */}
          <div className="mt-6 text-center">
            {ideas.length < 3 && (
              <p className="text-cyan-700 font-semibold">
                Add {3 - ideas.length} more way{ideas.length === 2 ? '' : 's'} you could serve
              </p>
            )}
            {canProceed && (
              <p className="text-green-600 font-bold text-lg animate-pulse">
                ✅ Almost there! One more step!
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
            className="flex-1 px-8 py-4 bg-gradient-to-r from-cyan-500 to-lime-500 hover:from-cyan-600 hover:to-lime-600 text-white font-bold rounded-xl transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-xl"
          >
            Next: Discover Your Ikigai! →
          </button>
        </div>
      </div>
    </div>
  )
}

