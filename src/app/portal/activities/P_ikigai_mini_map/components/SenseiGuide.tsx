'use client'

import { useState, useEffect } from 'react'

interface SenseiGuideProps {
  message: string
  senseiImage?: string
  variant?: 'top' | 'side'
}

export default function SenseiGuide({ message, senseiImage = '/Untitled (30).png', variant = 'top' }: SenseiGuideProps) {
  const [displayedMessage, setDisplayedMessage] = useState('')
  const [isTyping, setIsTyping] = useState(true)

  useEffect(() => {
    if (!message) return

    setIsTyping(true)
    setDisplayedMessage('')
    
    let index = 0
    const interval = setInterval(() => {
      if (index < message.length) {
        setDisplayedMessage(message.slice(0, index + 1))
        index++
      } else {
        setIsTyping(false)
        clearInterval(interval)
      }
    }, 20) // Fast typing

    return () => clearInterval(interval)
  }, [message])

  if (variant === 'side') {
    return (
      <div className="flex items-start gap-6 mb-6">
        {/* Sensei (small) */}
        <div className="flex-shrink-0">
          <div className="w-24 h-32 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center border-2 border-white/30">
            <div className="text-5xl">🧙‍♂️</div>
          </div>
        </div>

        {/* Message Bubble */}
        <div className="flex-1 bg-white/90 backdrop-blur-sm rounded-2xl p-5 shadow-xl border-2 border-purple-300">
          <p className="text-gray-800 leading-relaxed">
            {displayedMessage}
            {isTyping && <span className="animate-pulse">|</span>}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="mb-6">
      {/* Sensei Image */}
      <div className="flex justify-center mb-4">
        <div className="w-48 h-64 bg-white/10 backdrop-blur-sm rounded-3xl flex items-center justify-center border-4 border-white/30 shadow-2xl">
          <div className="text-center">
            <div className="text-8xl mb-2">🧙‍♂️</div>
            <p className="text-white text-xs">
              Sensei
            </p>
          </div>
        </div>
        {/* When transparent Sensei uploaded: */}
        {/* <Image
          src={senseiImage}
          alt="Sensei"
          width={200}
          height={300}
          className="drop-shadow-2xl"
        /> */}
      </div>

      {/* Speech Bubble */}
      <div className="max-w-3xl mx-auto">
        <div className="relative bg-white/90 backdrop-blur-md rounded-2xl p-6 shadow-xl border-3 border-purple-300">
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-white/90 rotate-45 border-t-3 border-l-3 border-purple-300" />
          
          <p className="text-gray-800 text-lg leading-relaxed text-center">
            {displayedMessage}
            {isTyping && <span className="animate-pulse ml-1">|</span>}
          </p>
        </div>
      </div>
    </div>
  )
}

