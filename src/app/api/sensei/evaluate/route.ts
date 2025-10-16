import { NextRequest, NextResponse } from 'next/server'
import { evaluateIkigai } from '@/lib/ai/sensei'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const { ideas } = await req.json()
    
    const evaluation = await evaluateIkigai(ideas)
    
    return NextResponse.json(evaluation)
  } catch (error) {
    console.error('Sensei evaluation error:', error)
    const totalIdeas = Object.values(ideas).flat().length
    return NextResponse.json({
      score: Math.min(100, totalIdeas * 10),
      feedback: "You've taken important steps in discovering your purpose!",
      bonusPoints: 20,
    })
  }
}

