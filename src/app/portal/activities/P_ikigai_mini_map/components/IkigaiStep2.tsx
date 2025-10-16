'use client'

import { useState, useEffect } from 'react'
import { getSenseiGuidance, getSenseiSuggestions } from '@/lib/ai/sensei'
import SenseiGuide from './SenseiGuide'
import IdeaInput from './IdeaInput'

interface IkigaiStep2Props {
  ideas: string[]
  previousIdeas: string[]
  addIdea: (idea: string) => void
  removeIdea: (index: number) => void
  onNext: () => void
  onBack: () => void
  points: number
}

export default function IkigaiStep2({ ideas, previousIdeas, addIdea, removeIdea, onNext, onBack, points }: IkigaiStep2Props) {
  const [guidance, setGuidance] = useState('')
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([])
  const [loadingSuggestions, setLoadingSuggestions] = useState(false)

  useEffect(() => {
    async function loadGuidance() {
      const message = await getSenseiGuidance(2, {
        currentStep: 2,
        ideas: { love: previousIdeas, goodAt: ideas, paidFor: [], worldNeeds: [] },
        conversationHistory: [],
      })
      setGuidance(message)
    }
    loadGuidance()
  }, [])

  const handleGetSuggestions = async () => {
    setLoadingSuggestions(true)
    const suggestions = await getSenseiSuggestions('goodAt', ideas)
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
            <span className="font-bold">Step 2 of 6</span>
            <span className="bg-purple-600/80 px-4 py-1 rounded-full backdrop-blur-sm">
              💎 {points} points
            </span>
          </div>
          <div className="h-3 bg-white/20 rounded-full backdrop-blur-sm overflow-hidden">
            <div className="h-full bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full transition-all duration-500" style={{ width: '33.33%' }} />
          </div>
        </div>

        {/* Sensei Guidance - Red Sensei contemplative */}
        <SenseiGuide 
          message={guidance} 
          senseiImage="/Senseihandsdown.png"
        />

        {/* Main Content Card */}
        <div className="bg-white/95 backdrop-blur-lg rounded-3xl p-8 md:p-10 shadow-2xl border-4 border-purple-400 mt-6">
          {/* Title */}
          <div className="text-center mb-8">
            <div className="inline-block bg-gradient-to-r from-purple-500 to-purple-600 text-white px-8 py-3 rounded-full mb-4">
              <h2 className="text-3xl md:text-4xl font-bold">🌟 What You're GOOD AT</h2>
            </div>
            <p className="text-gray-700 text-lg mt-4">
              What are your strengths? What comes naturally to you?<br/>
              Remember: "good at" means capable, not perfect!
            </p>
          </div>

          {/* Show previous ideas for reference */}
          {previousIdeas.length > 0 && (
            <div className="mb-6 p-4 bg-pink-50 rounded-xl border-2 border-pink-200">
              <p className="text-sm font-semibold text-pink-800 mb-2">
                💡 Things you love: {previousIdeas.slice(0, 3).join(', ')}
                {previousIdeas.length > 3 && `... and ${previousIdeas.length - 3} more`}
              </p>
              <p className="text-xs text-pink-700">
                Can you see any skills that connect to these?
              </p>
            </div>
          )}

          {/* Idea Input */}
          <IdeaInput
            ideas={ideas}
            addIdea={addIdea}
            removeIdea={removeIdea}
            placeholder="e.g., Good listener, organized, creative problem-solver..."
            color="#7f3ae7"
          />

          {/* AI Suggestions */}
          <div className="mt-6">
            <button
              onClick={handleGetSuggestions}
              disabled={loadingSuggestions}
              className="w-full md:w-auto bg-purple-100 hover:bg-purple-200 text-purple-800 font-semibold py-3 px-6 rounded-xl transition-all disabled:opacity-50 border-2 border-purple-300"
            >
              {loadingSuggestions ? '🤖 Sensei is thinking...' : '💡 Ask Sensei for Ideas'}
            </button>

            {aiSuggestions.length > 0 && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                {aiSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => addIdea(suggestion)}
                    className="bg-purple-50 hover:bg-purple-100 border-2 border-purple-300 rounded-xl p-4 text-left transition-all hover:scale-105"
                  >
                    <span className="text-purple-600 font-medium">+ {suggestion}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Progress Hint */}
          <div className="mt-8 text-center">
            {ideas.length < 3 && (
              <p className="text-purple-600 font-semibold">
                {ideas.length === 0 ? 'Add at least 3 skills to continue...' : `Add ${3 - ideas.length} more!`}
              </p>
            )}
            {canProceed && (
              <p className="text-green-600 font-bold text-lg animate-pulse">
                ✅ Ready to reflect!
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
            className="flex-1 px-8 py-4 bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-white font-bold rounded-xl transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-xl"
          >
            Next: Let It Rest →
          </button>
        </div>
      </div>
    </div>
  )
}

