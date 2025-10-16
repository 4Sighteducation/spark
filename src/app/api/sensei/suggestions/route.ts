import { NextRequest, NextResponse } from 'next/server'
import { getSenseiSuggestions } from '@/lib/ai/sensei'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const { quadrant, currentIdeas, studentAge } = await req.json()
    
    const suggestions = await getSenseiSuggestions(quadrant, currentIdeas, studentAge)
    
    return NextResponse.json({ suggestions })
  } catch (error) {
    console.error('Sensei suggestions error:', error)
    return NextResponse.json({ suggestions: [] })
  }
}

