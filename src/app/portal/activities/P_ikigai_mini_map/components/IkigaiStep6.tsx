'use client'

import { useState, useEffect } from 'react'
import SenseiGuide from './SenseiGuide'
import Image from 'next/image'

interface IkigaiStep6Props {
  allIdeas: any
  onComplete: () => void
  onBack: () => void
  points: number
}

export default function IkigaiStep6({ allIdeas, onComplete, onBack, points }: IkigaiStep6Props) {
  const [guidance, setGuidance] = useState('')
  const [evaluation, setEvaluation] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadFinal() {
      // Get guidance
      const guidanceResponse = await fetch('/api/sensei/guidance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ step: 6, context: { currentStep: 6, ideas: allIdeas, conversationHistory: [] } }),
      })
      const guidanceData = await guidanceResponse.json()
      setGuidance(guidanceData.message)

      // Get AI evaluation
      const evalResponse = await fetch('/api/sensei/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ideas: allIdeas }),
      })
      const evalData = await evalResponse.json()
      setEvaluation(evalData)
      setLoading(false)
    }
    loadFinal()
  }, [])

  // Identify overlaps
  const overlaps = {
    passion: allIdeas.love.filter((idea: string) => 
      allIdeas.goodAt.some((skill: string) => 
        skill.toLowerCase().includes(idea.toLowerCase().split(' ')[0]) ||
        idea.toLowerCase().includes(skill.toLowerCase().split(' ')[0])
      )
    ),
    mission: allIdeas.love.filter((idea: string) =>
      allIdeas.worldNeeds.some((need: string) =>
        need.toLowerCase().includes(idea.toLowerCase().split(' ')[0]) ||
        idea.toLowerCase().includes(need.toLowerCase().split(' ')[0])
      )
    ),
    profession: allIdeas.goodAt.filter((skill: string) =>
      allIdeas.paidFor.some((job: string) =>
        job.toLowerCase().includes(skill.toLowerCase().split(' ')[0]) ||
        skill.toLowerCase().includes(job.toLowerCase().split(' ')[0])
      )
    ),
    vocation: allIdeas.paidFor.filter((job: string) =>
      allIdeas.worldNeeds.some((need: string) =>
        need.toLowerCase().includes(job.toLowerCase().split(' ')[0]) ||
        job.toLowerCase().includes(need.toLowerCase().split(' ')[0])
      )
    ),
  }

  const finalPoints = points + (evaluation?.bonusPoints || 0) + 50 // Completion bonus

  return (
    <div className="min-h-screen p-4 md:p-8 pb-24">
      <div className="max-w-6xl mx-auto">
        {/* Progress */}
        <div className="mb-6">
          <div className="flex justify-between text-white text-sm mb-2">
            <span className="font-bold">Step 6 of 6 - FINAL!</span>
            <span className="bg-gradient-to-r from-yellow-500 to-green-500 px-4 py-1 rounded-full backdrop-blur-sm font-bold">
              💎 {finalPoints} points
            </span>
          </div>
          <div className="h-3 bg-white/20 rounded-full backdrop-blur-sm overflow-hidden">
            <div className="h-full bg-gradient-to-r from-pink-500 via-purple-500 via-cyan-500 via-lime-500 to-yellow-500 rounded-full animate-pulse" style={{ width: '100%' }} />
          </div>
        </div>

        {/* Sensei Final Guidance - Red Sensei returns for celebration! */}
        <SenseiGuide 
          message={guidance} 
          senseiImage="/Sensaiopenarms.png"
        />

        {/* Main Content */}
        <div className="bg-white/95 backdrop-blur-lg rounded-3xl p-8 md:p-12 shadow-2xl border-4 border-yellow-400 mt-6">
          {/* Title */}
          <div className="text-center mb-10">
            <div className="inline-block bg-gradient-to-r from-pink-500 via-purple-500 via-cyan-500 to-yellow-500 text-white px-10 py-4 rounded-full mb-6 animate-pulse-gentle">
              <h2 className="text-4xl md:text-5xl font-bold">🎌 YOUR IKIGAI</h2>
            </div>
            <p className="text-gray-700 text-2xl font-medium">
              Your Reason for Being
            </p>
          </div>

          {/* Ikigai Diagram Reference */}
          <div className="mb-10 text-center">
            <div className="inline-block bg-gradient-to-br from-pink-100 via-purple-100 to-cyan-100 rounded-3xl p-6 border-4 border-purple-300">
              <Image
                src="/Untitled (25).png"
                alt="Ikigai Diagram"
                width={600}
                height={500}
                className="mx-auto rounded-2xl shadow-lg"
              />
              <p className="mt-4 text-gray-600 text-sm">
                Where all four circles meet - that's your Ikigai!
              </p>
            </div>
          </div>

          {/* Show All Four Quadrants */}
          <div className="grid md:grid-cols-2 gap-6 mb-10">
            {/* What you LOVE */}
            <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-2xl p-6 border-4 border-pink-400 shadow-lg">
              <h3 className="font-bold text-pink-800 text-xl mb-4 flex items-center gap-2">
                <span className="text-3xl">💖</span>
                What You LOVE
              </h3>
              <ul className="space-y-2 text-gray-700">
                {allIdeas.love.map((idea: string, i: number) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-pink-500 font-bold">•</span>
                    <span>{idea}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* What you're GOOD AT */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 border-4 border-purple-400 shadow-lg">
              <h3 className="font-bold text-purple-800 text-xl mb-4 flex items-center gap-2">
                <span className="text-3xl">🌟</span>
                What You're GOOD AT
              </h3>
              <ul className="space-y-2 text-gray-700">
                {allIdeas.goodAt.map((idea: string, i: number) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-purple-500 font-bold">•</span>
                    <span>{idea}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* What you can be PAID FOR */}
            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-2xl p-6 border-4 border-yellow-400 shadow-lg">
              <h3 className="font-bold text-yellow-800 text-xl mb-4 flex items-center gap-2">
                <span className="text-3xl">💰</span>
                What You Can Be PAID FOR
              </h3>
              <ul className="space-y-2 text-gray-700">
                {allIdeas.paidFor.map((idea: string, i: number) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-yellow-600 font-bold">•</span>
                    <span>{idea}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* What the WORLD NEEDS */}
            <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-2xl p-6 border-4 border-cyan-400 shadow-lg">
              <h3 className="font-bold text-cyan-800 text-xl mb-4 flex items-center gap-2">
                <span className="text-3xl">🌍</span>
                What The WORLD NEEDS
              </h3>
              <ul className="space-y-2 text-gray-700">
                {allIdeas.worldNeeds.map((idea: string, i: number) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-cyan-600 font-bold">•</span>
                    <span>{idea}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* AI Feedback */}
          {evaluation && (
            <div className="bg-gradient-to-r from-purple-100 via-pink-100 to-yellow-100 rounded-2xl p-6 border-3 border-purple-400 mb-8">
              <div className="flex items-start gap-4">
                <div className="text-5xl">🧙‍♂️</div>
                <div className="flex-1">
                  <p className="font-bold text-purple-900 text-lg mb-2">Sensei's Evaluation:</p>
                  <p className="text-gray-800 text-lg leading-relaxed">
                    {evaluation.feedback}
                  </p>
                  {evaluation.bonusPoints > 0 && (
                    <p className="mt-3 text-yellow-700 font-bold">
                      🌟 Bonus: +{evaluation.bonusPoints} points for depth and originality!
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Call to Action */}
          <div className="text-center">
            <p className="text-2xl text-gray-800 mb-4 font-medium">
              You've completed all 6 steps of your Ikigai Quest!
            </p>
            <p className="text-gray-600 mb-8">
              Total ideas collected: <strong>{allIdeas.love.length + allIdeas.goodAt.length + allIdeas.paidFor.length + allIdeas.worldNeeds.length}</strong>
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
            onClick={onComplete}
            className="flex-1 px-8 py-4 bg-gradient-to-r from-pink-500 via-purple-500 via-cyan-500 to-yellow-500 hover:opacity-90 text-white font-bold rounded-xl transition-all shadow-2xl text-xl animate-pulse"
          >
            ✨ Complete Quest & Earn {finalPoints} Points! ✨
          </button>
        </div>
      </div>
    </div>
  )
}

