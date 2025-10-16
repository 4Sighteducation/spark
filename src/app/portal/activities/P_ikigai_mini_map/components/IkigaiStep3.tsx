'use client'

import { useState, useEffect } from 'react'
import { getSenseiGuidance } from '@/lib/ai/sensei'
import SenseiGuide from './SenseiGuide'

interface IkigaiStep3Props {
  allIdeas: any
  reflection: string
  setReflection: (text: string) => void
  onNext: () => void
  onBack: () => void
  points: number
}

export default function IkigaiStep3({ allIdeas, reflection, setReflection, onNext, onBack, points }: IkigaiStep3Props) {
  const [guidance, setGuidance] = useState('')

  useEffect(() => {
    async function loadGuidance() {
      const message = await getSenseiGuidance(3, {
        currentStep: 3,
        ideas: allIdeas,
        conversationHistory: [],
      })
      setGuidance(message)
    }
    loadGuidance()
  }, [])

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Progress */}
        <div className="mb-6">
          <div className="flex justify-between text-white text-sm mb-2">
            <span className="font-bold">Step 3 of 6</span>
            <span className="bg-purple-600/80 px-4 py-1 rounded-full backdrop-blur-sm">
              💎 {points} points
            </span>
          </div>
          <div className="h-3 bg-white/20 rounded-full backdrop-blur-sm overflow-hidden">
            <div className="h-full bg-gradient-to-r from-cyan-500 to-lime-500 rounded-full transition-all duration-500" style={{ width: '50%' }} />
          </div>
        </div>

        {/* Sensei Guidance */}
        <SenseiGuide 
          message={guidance} 
          senseiImage="/Untitled (31).png"
        />

        {/* Main Content Card */}
        <div className="bg-white/95 backdrop-blur-lg rounded-3xl p-8 md:p-10 shadow-2xl border-4 border-purple-400 mt-6">
          {/* Title */}
          <div className="text-center mb-8">
            <div className="inline-block bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-8 py-3 rounded-full mb-4">
              <h2 className="text-3xl md:text-4xl font-bold">🧘 Let It REST</h2>
            </div>
            <p className="text-gray-700 text-lg mt-4">
              Take a moment to look at what you've discovered.<br/>
              What patterns do you notice?
            </p>
          </div>

          {/* Show collected ideas */}
          <div className="grid md:grid-cols-2 gap-4 mb-8">
            {/* What you Love */}
            <div className="bg-pink-50 rounded-2xl p-5 border-3 border-pink-300">
              <h3 className="font-bold text-pink-800 mb-3 flex items-center gap-2">
                <span className="text-2xl">💖</span>
                What You LOVE ({allIdeas.love.length})
              </h3>
              <ul className="space-y-2 text-sm text-gray-700">
                {allIdeas.love.map((idea: string, i: number) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-pink-500">•</span>
                    <span>{idea}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* What you're Good At */}
            <div className="bg-purple-50 rounded-2xl p-5 border-3 border-purple-300">
              <h3 className="font-bold text-purple-800 mb-3 flex items-center gap-2">
                <span className="text-2xl">🌟</span>
                What You're GOOD AT ({allIdeas.goodAt.length})
              </h3>
              <ul className="space-y-2 text-sm text-gray-700">
                {allIdeas.goodAt.map((idea: string, i: number) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-purple-500">•</span>
                    <span>{idea}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Reflection Area */}
          <div>
            <label className="block text-gray-800 font-semibold mb-3 text-lg">
              💭 Your Reflections (Optional):
            </label>
            <textarea
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              placeholder="What surprises you? Do you see any connections between what you love and what you're good at?"
              rows={5}
              className="w-full px-6 py-4 rounded-xl border-3 border-gray-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-200 text-lg resize-none transition-all"
            />
          </div>

          {/* Encouragement */}
          <div className="mt-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-5 border-2 border-indigo-200">
            <p className="text-indigo-800 text-center">
              🌸 <strong>Wisdom:</strong> Sometimes our greatest insights come when we give our minds time to process. The overlaps you notice now will guide the rest of your journey.
            </p>
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
            className="flex-1 px-8 py-4 bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-white font-bold rounded-xl transition-all shadow-lg text-xl"
          >
            Next: What You Can Be Paid For →
          </button>
        </div>
      </div>
    </div>
  )
}

