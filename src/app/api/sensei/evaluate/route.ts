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
    return NextResponse.json({
      score: 75,
      feedback: "You've taken important steps in discovering your purpose!",
      bonusPoints: 20,
    })
  }
}

