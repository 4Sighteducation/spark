'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

interface IkigaiWelcomeProps {
  studentName: string
  welcomeMessage: string
  onStart: () => void
}

export default function IkigaiWelcome({ studentName, welcomeMessage, onStart }: IkigaiWelcomeProps) {
  const [showMessage, setShowMessage] = useState(false)
  const [typedMessage, setTypedMessage] = useState('')
  const [showButton, setShowButton] = useState(false)

  useEffect(() => {
    // Show Sensei first
    setTimeout(() => setShowMessage(true), 500)
    
    // Type out message
    if (showMessage && welcomeMessage) {
      let index = 0
      const interval = setInterval(() => {
        if (index < welcomeMessage.length) {
          setTypedMessage(welcomeMessage.slice(0, index + 1))
          index++
        } else {
          clearInterval(interval)
          setTimeout(() => setShowButton(true), 500)
        }
      }, 30) // Typing speed

      return () => clearInterval(interval)
    }
  }, [showMessage, welcomeMessage])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8">
      {/* Title */}
      <div className="text-center mb-8 animate-fade-in">
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-4 drop-shadow-2xl" style={{
          textShadow: '0 0 30px rgba(0,0,0,0.9), 0 0 60px rgba(139,0,139,0.6)'
        }}>
          🎌 IKIGAI QUEST
        </h1>
        <p className="text-2xl md:text-3xl text-white/90 drop-shadow-lg font-medium">
          Discover Your Reason for Being
        </p>
      </div>

      {/* Sensei Character - Red Robe, Arms Wide (Welcoming!) */}
      <div className={`mb-8 transition-all duration-1000 ${showMessage ? 'scale-100 opacity-100' : 'scale-75 opacity-0'}`}>
        <Image
          src="/Sensaiopenarms.png"
          alt="Sensei welcomes you"
          width={280}
          height={420}
          className="drop-shadow-2xl"
        />
      </div>

      {/* Speech Bubble */}
      {showMessage && (
        <div className="max-w-3xl w-full animate-scale-in">
          <div className="relative bg-white/95 backdrop-blur-md rounded-3xl p-8 md:p-10 shadow-2xl border-4 border-purple-400">
            {/* Speech bubble pointer */}
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 bg-white/95 rotate-45 border-t-4 border-l-4 border-purple-400" />
            
            <div className="text-center">
              <p className="text-sm text-purple-600 font-bold uppercase tracking-wider mb-3">
                Sensei Says:
              </p>
              <p className="text-2xl md:text-3xl text-gray-800 leading-relaxed font-medium min-h-[100px]">
                {typedMessage}
                <span className="animate-pulse">|</span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Start Button */}
      {showButton && (
        <button
          onClick={onStart}
          className="mt-12 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 text-white font-bold py-6 px-12 rounded-2xl text-2xl hover:scale-105 active:scale-95 transition-all shadow-2xl animate-pulse-gentle border-4 border-white/50"
        >
          ✨ Begin Your Quest ✨
        </button>
      )}

      {/* Hint */}
      {showButton && (
        <p className="mt-6 text-white/70 text-center text-sm animate-fade-in">
          <span className="inline-block px-4 py-2 bg-black/30 backdrop-blur-sm rounded-full">
            ⏱️ Estimated time: 20 minutes • 📊 Earn up to 300 points
          </span>
        </p>
      )}

      {/* Falling Cherry Blossoms */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-fall"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${10 + Math.random() * 5}s`,
              opacity: 0.8,
            }}
          >
            <div className="text-4xl">🌸</div>
          </div>
        ))}
      </div>

      {/* Animation Styles */}
      <style jsx>{`
        @keyframes fall {
          0% {
            transform: translateY(-100px) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 0.8;
          }
          90% {
            opacity: 0.8;
          }
          100% {
            transform: translateY(120vh) rotate(360deg);
            opacity: 0;
          }
        }

        .animate-fall {
          animation: fall linear infinite;
        }
      `}</style>
    </div>
  )
}

