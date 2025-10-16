import { NextRequest, NextResponse } from 'next/server'
import { getSenseiGuidance } from '@/lib/ai/sensei'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const { step, context } = await req.json()
    
    const message = await getSenseiGuidance(step, context)
    
    return NextResponse.json({ message })
  } catch (error) {
    console.error('Sensei guidance error:', error)
    return NextResponse.json({ 
      message: "Continue your journey with an open mind and honest heart." 
    })
  }
}

