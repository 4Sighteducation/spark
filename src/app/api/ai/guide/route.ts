import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

export const dynamic = 'force-dynamic'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

// Character personalities
const CHARACTERS = {
  sensei: {
    name: "a wise Sensei",
    personality: "wise, calm, philosophical, uses Japanese wisdom",
    style: "Brief guidance (2-3 sentences), encouraging, age-appropriate for 11-14 year olds"
  },
  coach: {
    name: "an energetic Coach", 
    personality: "motivational, action-focused, direct, enthusiastic",
    style: "Short, punchy guidance, use sports/action metaphors, keep students moving"
  },
  scientist: {
    name: "a curious Scientist",
    personality: "analytical, evidence-based, inquisitive, methodical",
    style: "Ask probing questions, encourage inquiry, use scientific thinking"
  },
  friend: {
    name: "a supportive Friend",
    personality: "warm, relatable, casual but respectful, peer-like",
    style: "Conversational, encouraging, like talking to a slightly older student"
  },
  mentor: {
    name: "an experienced Mentor",
    personality: "professional, knowledgeable, career-focused, practical",
    style: "Real-world advice, industry insights, future-oriented thinking"
  }
}

/**
 * Universal AI Guide endpoint
 * Supports multiple characters and activity types
 */
export async function POST(req: NextRequest) {
  try {
    const { 
      character = 'sensei',
      message,
      context = {},
      studentAge = 13 
    } = await req.json()

    const characterConfig = CHARACTERS[character as keyof typeof CHARACTERS] || CHARACTERS.sensei

    // Build system prompt with BASE RULES
    const systemPrompt = `You are ${characterConfig.name} helping a ${studentAge}-year-old student.

PERSONALITY: ${characterConfig.personality}
STYLE: ${characterConfig.style}

STRICT RULES (ALWAYS FOLLOW):
1. Age-appropriate language for ${studentAge} year olds
2. NO profanity, NO inappropriate content
3. Encouraging and supportive tone
4. Brief responses (2-3 sentences maximum)
5. Educational focus
6. UK English spelling
7. Inclusive and respectful of all backgrounds

${context.activitySpecificRules || ''}
`

    const userPrompt = `${context.instruction || message}

${context.studentInput ? `Student's current thinking: ${context.studentInput}` : ''}

Respond as ${characterConfig.name} would, following the style and rules above.`

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 200,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    })

    const aiMessage = response.content[0].type === 'text' ? response.content[0].text : ''

    return NextResponse.json({ 
      message: aiMessage,
      character,
      usage: response.usage 
    })

  } catch (error) {
    console.error('AI Guide error:', error)
    return NextResponse.json({ 
      message: "Continue with an open mind and honest heart.",
      error: true 
    })
  }
}

