'use client'

import { useState, useEffect } from 'react'
import SenseiGuide from './SenseiGuide'
import DraggableCanvas from './DraggableCanvas'

interface Connection {
  fromId: string
  toId: string
}

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
  const [connections, setConnections] = useState<Connection[]>([])
  const [connectionInsight, setConnectionInsight] = useState('')

  // When connections change, ask AI for insight
  const handleConnectionsChange = async (newConnections: Connection[]) => {
    setConnections(newConnections)
    
    if (newConnections.length > 0) {
      // Get AI insight about the connection
      const response = await fetch('/api/ai/guide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          character: 'sensei',
          message: `Student connected ${newConnections.length} items in their Ikigai exploration. Provide brief zen wisdom about patterns emerging (1 sentence, 15-20 words).`,
          context: {
            studentInput: `Connections made: ${newConnections.length}`,
          },
        }),
      })
      const data = await response.json()
      setConnectionInsight(data.message)
    }
  }

  const handleAddIdea = (text: string, quadrant: 'love' | 'goodAt') => {
    // This would need to call back to parent page to add idea
    // For now, just refresh the page to pick up new ideas
    alert(`New idea added to ${quadrant === 'love' ? 'Love' : 'Good At'}: "${text}"\n\nRefresh to see it on canvas, or continue to next step!`)
  }

  useEffect(() => {
    async function loadGuidance() {
      const response = await fetch('/api/sensei/guidance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          step: 3,
          context: { currentStep: 3, ideas: allIdeas, conversationHistory: [] },
        }),
      })
      const data = await response.json()
      setGuidance(data.message)
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

        {/* Sensei Guidance - Grey Sensei in meditation (Let It Rest!) */}
        <SenseiGuide 
          message={guidance} 
          senseiImage="/sensei2greet.png"
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

          {/* Interactive Draggable Canvas */}
          <div className="mb-8">
            <p className="text-gray-700 text-center mb-4 font-medium">
              🎨 <strong>Drag your ideas around!</strong> Position them based on how much you love them (left-right) and how skilled you are (top-bottom).
              Connect related items to spot patterns.
            </p>
            
            <DraggableCanvas
              loveIdeas={allIdeas.love}
              goodAtIdeas={allIdeas.goodAt}
              onConnectionsChange={handleConnectionsChange}
              onAddIdea={handleAddIdea}
            />
            
            {/* AI Insight when connections are made */}
            {connectionInsight && (
              <div className="mt-4 bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl p-4 border-2 border-purple-300 animate-fade-in">
                <p className="text-sm font-semibold text-purple-900 mb-1">🧙‍♂️ Sensei observes:</p>
                <p className="text-purple-800 italic">{connectionInsight}</p>
              </div>
            )}
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

