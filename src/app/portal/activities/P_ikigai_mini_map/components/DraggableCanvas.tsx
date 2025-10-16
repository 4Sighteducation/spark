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
  onAddNote: (text: string, quadrant: 'love' | 'goodAt') => void
}

export default function DraggableCanvas({ loveIdeas, goodAtIdeas, onConnectionsChange, onAddNote }: DraggableCanvasProps) {
  const [notes, setNotes] = useState<Note[]>([])
  const [connections, setConnections] = useState<Connection[]>([])
  const [draggingNote, setDraggingNote] = useState<string | null>(null)
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null)
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
            className="absolute cursor-move rounded-xl p-3 shadow-lg border-2 select-none hover:shadow-xl transition-shadow"
            style={{
              left: note.x,
              top: note.y,
              width: '120px',
              backgroundColor: note.color,
              borderColor: note.quadrant === 'love' ? '#ec4899' : '#a855f7',
            }}
            onMouseDown={(e) => handleMouseDown(e, note.id)}
          >
            <div className="text-sm font-medium text-gray-800 mb-2 line-clamp-2">
              {note.text}
            </div>
            <button
              onClick={() => handleConnect(note.id)}
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
    </div>
  )
}

