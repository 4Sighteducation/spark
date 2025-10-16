'use client'

import { useState } from 'react'

interface IdeaInputProps {
  ideas: string[]
  addIdea: (idea: string) => void
  removeIdea: (index: number) => void
  placeholder?: string
  color?: string
}

export default function IdeaInput({ ideas, addIdea, removeIdea, placeholder, color = '#e91e8c' }: IdeaInputProps) {
  const [newIdea, setNewIdea] = useState('')

  const handleAdd = () => {
    if (newIdea.trim()) {
      addIdea(newIdea.trim())
      setNewIdea('')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAdd()
    }
  }

  return (
    <div>
      {/* Input Row */}
      <div className="flex gap-3 mb-6">
        <input
          type="text"
          value={newIdea}
          onChange={(e) => setNewIdea(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder || "Type an idea and press Enter..."}
          className="flex-1 px-6 py-4 rounded-xl border-3 border-gray-300 focus:border-purple-500 focus:ring-4 focus:ring-purple-200 text-lg transition-all"
          style={{
            borderColor: newIdea ? color : undefined,
          }}
        />
        <button
          onClick={handleAdd}
          disabled={!newIdea.trim()}
          className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
        >
          + Add
        </button>
      </div>

      {/* Ideas List */}
      {ideas.length > 0 && (
        <div className="space-y-3">
          <p className="text-gray-700 font-semibold flex items-center gap-2">
            <span className="text-2xl">✨</span>
            Your Ideas ({ideas.length}):
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {ideas.map((idea, index) => (
              <div
                key={index}
                className="group relative bg-gradient-to-r from-pink-50 to-purple-50 border-3 rounded-xl p-4 transition-all hover:scale-102 hover:shadow-lg"
                style={{ borderColor: color }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl flex-shrink-0">
                    {index + 1}.
                  </span>
                  <p className="flex-1 text-gray-900 font-medium">
                    {idea}
                  </p>
                  <button
                    onClick={() => removeIdea(index)}
                    className="flex-shrink-0 w-8 h-8 bg-red-100 hover:bg-red-200 text-red-600 rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                  >
                    ✕
                  </button>
                </div>
                
                {/* Points indicator */}
                <div className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full shadow-md">
                  +5
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {ideas.length === 0 && (
        <div className="text-center py-12 border-3 border-dashed border-gray-300 rounded-2xl bg-gray-50/50">
          <div className="text-6xl mb-4">📝</div>
          <p className="text-gray-500 text-lg">
            Start by adding your first idea above!
          </p>
        </div>
      )}
    </div>
  )
}

