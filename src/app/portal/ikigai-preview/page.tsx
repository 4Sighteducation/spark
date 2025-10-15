'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

export default function IkigaiPreview() {
  const [senseiIndex, setSenseiIndex] = useState(0)
  const [message, setMessage] = useState("Welcome to your Ikigai Quest, young one...")

  const senseiPoses = [
    { img: '/Untitled (30).png', msg: "Welcome to your Ikigai Quest, young one..." },
    { img: '/Untitled (33).png', msg: "Today we discover what brings you joy and purpose." },
    { img: '/Untitled (32).png', msg: "Let us explore the four circles of your being." },
    { img: '/Untitled (31).png', msg: "What you love... what you're good at..." },
    { img: '/Untitled (34).png', msg: "What the world needs... what you can be paid for..." },
    { img: '/Untitled (35).png', msg: "Together, we will find your reason for being!" },
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setSenseiIndex((prev) => {
        const next = (prev + 1) % senseiPoses.length
        setMessage(senseiPoses[next].msg)
        return next
      })
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div 
      className="min-h-screen relative overflow-hidden"
      style={{
        backgroundImage: 'url(/japanese-pagoda-and-fuji-mount.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Dark overlay for text readability */}
      <div className="absolute inset-0 bg-black/20" />

      {/* Falling cherry blossoms */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-fall"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${8 + Math.random() * 4}s`,
              opacity: 0.7,
            }}
          >
            <Image
              src="/cherry-blossom.png"
              alt="Cherry blossom"
              width={40}
              height={40}
              className="drop-shadow-lg"
            />
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-8">
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-6xl font-bold text-white mb-4 drop-shadow-2xl" style={{
            textShadow: '0 0 20px rgba(0,0,0,0.8), 0 0 40px rgba(139,0,139,0.5)'
          }}>
            🎌 IKIGAI QUEST
          </h1>
          <p className="text-2xl text-white/90 drop-shadow-lg">
            Discover Your Reason for Being
          </p>
        </div>

        {/* Sensei Character */}
        <div className="mb-8 transform transition-all duration-1000 hover:scale-105">
          <Image
            src={senseiPoses[senseiIndex].img}
            alt="Sensei"
            width={300}
            height={450}
            className="drop-shadow-2xl animate-fade-in"
            key={senseiIndex}
          />
        </div>

        {/* Speech Bubble */}
        <div className="relative max-w-2xl bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border-4 border-purple-300">
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-white/95 rotate-45 border-l-4 border-t-4 border-purple-300" />
          
          <p className="text-2xl text-gray-800 text-center leading-relaxed font-medium">
            {message}
          </p>
        </div>

        {/* Preview Info */}
        <div className="mt-12 text-center">
          <div className="bg-black/60 backdrop-blur-md rounded-xl p-6 max-w-lg">
            <p className="text-white text-lg mb-4">
              ✨ <strong>Sneak Preview</strong> - Ikigai Quest Activity
            </p>
            <p className="text-white/80 text-sm mb-4">
              Watch Sensei change poses every 3 seconds!
            </p>
            <p className="text-purple-300 text-sm">
              🌸 Cherry blossoms falling gently
            </p>
            <p className="text-cyan-300 text-sm">
              🏯 Beautiful Japanese garden background
            </p>
            <p className="text-pink-300 text-sm">
              🧙‍♂️ 6 different Sensei poses with AI guidance
            </p>
            
            <div className="mt-6 pt-6 border-t border-white/20">
              <p className="text-yellow-300 font-bold text-lg mb-2">
                Coming Next Session!
              </p>
              <p className="text-white/70 text-sm">
                Full 6-step journey • AI personalized guidance • Interactive diagram • Points & badges
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes fall {
          0% {
            transform: translateY(-100px) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 0.7;
          }
          90% {
            opacity: 0.7;
          }
          100% {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fall {
          animation: fall linear infinite;
        }

        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }
      `}</style>
    </div>
  )
}

