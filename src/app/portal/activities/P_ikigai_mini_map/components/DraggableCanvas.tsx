'use client'

import { useState, useRef, useEffect } from 'react'

interface Note {
  id: string
  text: string
  x: number
  y: number
  color: string
  quadrant: 'love' | 'goodAt'
}

interface Connection {
  fromId: string
  toId: string
}

interface DraggableCanvasProps {
  loveIdeas: string[]
  goodAtIdeas: string[]
  onConnectionsChange: (connections: Connection[]) => void
  onAddIdea: (idea: string, quadrant: 'love' | 'goodAt') => void
}

interface AddNoteModalProps {
  onAdd: (text: string, quadrant: 'love' | 'goodAt') => void
  onClose: () => void
}

function AddNoteModal({ onAdd, onClose }: AddNoteModalProps) {
  const [text, setText] = useState('')
  const [quadrant, setQuadrant] = useState<'love' | 'goodAt'>('love')

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-xl font-bold mb-4">➕ Add New Idea</h3>
        
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type your idea..."
          className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-purple-500 mb-4"
          autoFocus
        />

        <div className="mb-4">
          <p className="text-sm font-medium text-gray-700 mb-2">This is something I:</p>
          <div className="flex gap-3">
            <button
              onClick={() => setQuadrant('love')}
              className={`flex-1 py-3 rounded-lg font-semibold border-2 ${
                quadrant === 'love'
                  ? 'bg-pink-500 text-white border-pink-500'
                  : 'bg-pink-50 text-pink-700 border-pink-300'
              }`}
            >
              💖 LOVE
            </button>
            <button
              onClick={() => setQuadrant('goodAt')}
              className={`flex-1 py-3 rounded-lg font-semibold border-2 ${
                quadrant === 'goodAt'
                  ? 'bg-purple-500 text-white border-purple-500'
                  : 'bg-purple-50 text-purple-700 border-purple-300'
              }`}
            >
              🌟 GOOD AT
            </button>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-gray-200 hover:bg-gray-300 rounded-lg font-semibold"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (text.trim()) {
                onAdd(text.trim(), quadrant)
                onClose()
              }
            }}
            disabled={!text.trim()}
            className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold disabled:opacity-50"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  )
}

export default function DraggableCanvas({ loveIdeas, goodAtIdeas, onConnectionsChange, onAddIdea }: DraggableCanvasProps) {
  const [notes, setNotes] = useState<Note[]>([])
  const [connections, setConnections] = useState<Connection[]>([])
  const [draggingNote, setDraggingNote] = useState<string | null>(null)
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null)
  const [hoveredNote, setHoveredNote] = useState<string | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const canvasRef = useRef<HTMLDivElement>(null)

  // Initialize notes from ideas
  useEffect(() => {
    const initialNotes: Note[] = []
    
    // Love ideas (left side, distributed vertically)
    loveIdeas.forEach((idea, i) => {
      initialNotes.push({
        id: `love-${i}`,
        text: idea,
        x: 50 + Math.random() * 150,
        y: 50 + i * 80,
        color: '#fce7f3',
        quadrant: 'love',
      })
    })
    
    // Good At ideas (right side, distributed vertically)
    goodAtIdeas.forEach((idea, i) => {
      initialNotes.push({
        id: `good-${i}`,
        text: idea,
        x: 550 + Math.random() * 150,
        y: 50 + i * 80,
        color: '#f3e8ff',
        quadrant: 'goodAt',
      })
    })
    
    setNotes(initialNotes)
  }, [loveIdeas, goodAtIdeas])

  const handleMouseDown = (e: React.MouseEvent, noteId: string) => {
    setDraggingNote(noteId)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (draggingNote && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      setNotes(notes.map(note =>
        note.id === draggingNote ? { ...note, x, y } : note
      ))
    }
  }

  const handleMouseUp = () => {
    setDraggingNote(null)
  }

  const handleConnect = (noteId: string) => {
    if (!connectingFrom) {
      setConnectingFrom(noteId)
    } else if (connectingFrom !== noteId) {
      const newConnection = { fromId: connectingFrom, toId: noteId }
      setConnections([...connections, newConnection])
      onConnectionsChange([...connections, newConnection])
      setConnectingFrom(null)
    }
  }

  const removeConnection = (index: number) => {
    const newConnections = connections.filter((_, i) => i !== index)
    setConnections(newConnections)
    onConnectionsChange(newConnections)
  }

  return (
    <>
      {/* Add Note Modal */}
      {showAddModal && (
        <AddNoteModal
          onAdd={(text, quadrant) => {
            onAddIdea(text, quadrant)
            setShowAddModal(false)
          }}
          onClose={() => setShowAddModal(false)}
        />
      )}

      <div className="relative">
        <div
          ref={canvasRef}
          className="relative bg-gradient-to-br from-pink-50 via-purple-50 to-cyan-50 rounded-2xl border-4 border-purple-300 overflow-hidden"
          style={{ width: '100%', height: '600px' }}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
        {/* Axis Labels */}
        <div className="absolute top-4 left-4 text-sm font-bold text-pink-700 bg-white/80 px-3 py-1 rounded-full">
          ← LOVE LESS
        </div>
        <div className="absolute top-4 right-4 text-sm font-bold text-pink-700 bg-white/80 px-3 py-1 rounded-full">
          LOVE MORE →
        </div>
        <div className="absolute top-1/2 -left-6 -translate-y-1/2 -rotate-90 text-sm font-bold text-purple-700 bg-white/80 px-3 py-1 rounded-full">
          ← LESS SKILLED
        </div>
        <div className="absolute bottom-4 -left-6 -translate-y-1/2 -rotate-90 text-sm font-bold text-purple-700 bg-white/80 px-3 py-1 rounded-full">
          MORE SKILLED →
        </div>

        {/* Connection Lines */}
        <svg className="absolute inset-0 pointer-events-none" style={{ width: '100%', height: '100%' }}>
          {connections.map((conn, i) => {
            const fromNote = notes.find(n => n.id === conn.fromId)
            const toNote = notes.find(n => n.id === conn.toId)
            if (!fromNote || !toNote) return null

            return (
              <g key={i}>
                <line
                  x1={fromNote.x + 60}
                  y1={fromNote.y + 30}
                  x2={toNote.x + 60}
                  y2={toNote.y + 30}
                  stroke="#9333ea"
                  strokeWidth="3"
                  strokeDasharray="5,5"
                />
                <circle
                  cx={(fromNote.x + toNote.x) / 2 + 60}
                  cy={(fromNote.y + toNote.y) / 2 + 30}
                  r="8"
                  fill="#ef4444"
                  className="cursor-pointer"
                  style={{ pointerEvents: 'all' }}
                  onClick={() => removeConnection(i)}
                />
              </g>
            )
          })}
        </svg>

        {/* Draggable Notes */}
        {notes.map(note => (
          <div
            key={note.id}
            className="absolute cursor-move rounded-xl p-3 shadow-lg border-2 select-none hover:shadow-2xl hover:z-50 transition-all group"
            style={{
              left: note.x,
              top: note.y,
              width: '120px',
              backgroundColor: note.color,
              borderColor: note.quadrant === 'love' ? '#ec4899' : '#a855f7',
            }}
            onMouseDown={(e) => handleMouseDown(e, note.id)}
            onMouseEnter={() => setHoveredNote(note.id)}
            onMouseLeave={() => setHoveredNote(null)}
          >
            <div className="text-sm font-medium text-gray-800 mb-2 line-clamp-2">
              {note.text}
            </div>
            
            {/* Hover Tooltip - Full Text */}
            {hoveredNote === note.id && note.text.length > 30 && (
              <div className="absolute -top-16 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-3 py-2 rounded-lg shadow-xl whitespace-normal w-48 z-50">
                {note.text}
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-gray-900" />
              </div>
            )}

            <button
              onClick={(e) => {
                e.stopPropagation()
                handleConnect(note.id)
              }}
              className={`text-xs px-2 py-1 rounded-full ${
                connectingFrom === note.id
                  ? 'bg-purple-600 text-white'
                  : 'bg-white/50 hover:bg-white text-purple-700'
              }`}
            >
              {connectingFrom === note.id ? '🔗 Click another' : '🔗 Connect'}
            </button>
          </div>
        ))}

        {/* Add Note Button (Floating) */}
        <button
          onClick={() => setShowAddModal(true)}
          className="absolute bottom-6 right-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-full font-bold shadow-2xl hover:scale-105 transition-transform z-40"
        >
          ➕ Add New Idea
        </button>

        {/* Instructions */}
        {connectingFrom && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-purple-600 text-white px-6 py-3 rounded-full font-bold shadow-2xl animate-pulse">
            Click another note to connect!
          </div>
        )}
      </div>

      {/* Info */}
      <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
        <div className="bg-pink-50 rounded-lg p-3 border-2 border-pink-300">
          <p className="font-bold text-pink-800">💡 Drag notes to position</p>
          <p className="text-gray-700 text-xs">Horizontal = how much you love it</p>
          <p className="text-gray-700 text-xs">Vertical = how skilled you are</p>
        </div>
        <div className="bg-purple-50 rounded-lg p-3 border-2 border-purple-300">
          <p className="font-bold text-purple-800">🔗 Connect related items</p>
          <p className="text-gray-700 text-xs">Click "Connect" on two notes to link them</p>
          <p className="text-gray-700 text-xs">Click red dot to remove connection</p>
        </div>
      </div>
    </>
  )
}

