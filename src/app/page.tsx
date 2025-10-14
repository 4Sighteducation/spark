import Image from 'next/image'
import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white p-4">
      <div className="max-w-4xl mx-auto text-center space-y-8">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="relative w-64 h-64">
            <Image
              src="/spark-logo.png"
              alt="SPARK Logo"
              width={256}
              height={256}
              priority
              className="animate-pulse-gentle"
            />
          </div>
        </div>

        {/* Heading */}
        <h1 className="text-5xl md:text-7xl font-bold mb-4">
          <span className="text-gradient-spark">SPARK</span>
        </h1>
        
        <h2 className="text-2xl md:text-3xl font-light text-gray-300 mb-6">
          Developing Student Mindset
        </h2>

        {/* SPARK Acronym */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 my-12">
          {[
            { letter: 'S', name: 'Self-direction', color: 'bg-spark-pink-500' },
            { letter: 'P', name: 'Purpose', color: 'bg-spark-purple-500' },
            { letter: 'A', name: 'Awareness', color: 'bg-spark-cyan-500' },
            { letter: 'R', name: 'Resilience', color: 'bg-spark-lime-500' },
            { letter: 'K', name: 'Knowledge', color: 'bg-spark-yellow-500' },
          ].map((item) => (
            <div
              key={item.letter}
              className="flex flex-col items-center p-4 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10 hover:scale-105 transition-transform"
            >
              <div className={`w-16 h-16 ${item.color} rounded-full flex items-center justify-center text-2xl font-bold mb-2`}>
                {item.letter}
              </div>
              <span className="text-sm text-gray-300">{item.name}</span>
            </div>
          ))}
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-12">
          <Link
            href="/login"
            className="px-8 py-4 bg-spark-pink text-white rounded-lg font-semibold hover:bg-spark-pink-600 transition-colors shadow-spark"
          >
            Student Login
          </Link>
          
          <Link
            href="/staff/login"
            className="px-8 py-4 bg-white/10 text-white rounded-lg font-semibold hover:bg-white/20 transition-colors border border-white/20"
          >
            Staff Login
          </Link>
        </div>

        {/* Footer */}
        <p className="text-gray-400 text-sm mt-16">
          Ages 11-14 · Key Stage 3 · Powered by 4Sight Education
        </p>
      </div>
    </main>
  )
}

