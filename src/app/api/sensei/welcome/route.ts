import { NextRequest, NextResponse } from 'next/server'
import { getSenseiWelcome } from '@/lib/ai/sensei'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const { studentName } = await req.json()
    
    const message = await getSenseiWelcome(studentName)
    
    return NextResponse.json({ message })
  } catch (error) {
    console.error('Sensei welcome error:', error)
    return NextResponse.json({ 
      message: "Welcome, young one. Today we begin a special journey to discover your Ikigai - your reason for being." 
    })
  }
}

