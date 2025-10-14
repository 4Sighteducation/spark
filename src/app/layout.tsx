import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'SPARK - Developing Student Mindset',
  description:
    'A psychometric assessment platform for Key Stage 3 students measuring Self-direction, Purpose, Awareness, Resilience, and Knowledge.',
  keywords: [
    'SPARK',
    'student assessment',
    'psychometric',
    'mindset',
    'education',
    'Key Stage 3',
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  )
}

