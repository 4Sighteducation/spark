import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import charactersConfig from './SPARK Characters.json'

export const dynamic = 'force-dynamic'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

// Load character configurations from your detailed JSON
const CHARACTERS: Record<string, any> = {}

// Meta guide (Sensei)
CHARACTERS.sensei = {
  name: charactersConfig.metaGuide.displayName,
  personality: `${charactersConfig.metaGuide.archetype}, ${charactersConfig.metaGuide.tone}`,
  baseRules: charactersConfig.metaGuide.baseRules.join('. '),
  signatureLines: charactersConfig.metaGuide.signatureLines,
  style: "Brief guidance, ask 1-2 questions before advice, offer one action + one reflection"
}

// Theme-specific guides
charactersConfig.guides.forEach((guide: any) => {
  CHARACTERS[guide.character] = {
    name: guide.displayName,
    theme: guide.theme,
    personality: `${guide.archetype}, ${guide.tone}`,
    baseRules: guide.baseRules.join('. '),
    signatureLines: guide.signatureLines,
    signatureMoves: guide.signatureMoves,
    humor: guide.humor,
    style: `${guide.tone} tone, uses ${guide.archetype} metaphors`
  }
})

// Global safety guards
const GLOBAL_GUARDS = charactersConfig.globalGuards.join('\n')

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

    // Build system prompt with YOUR DETAILED CHARACTER CONFIG
    const systemPrompt = `You are ${characterConfig.name} helping a ${studentAge}-year-old student.

PERSONALITY: ${characterConfig.personality}
STYLE: ${characterConfig.style}

YOUR CORE RULES:
${characterConfig.baseRules}

${characterConfig.signatureLines ? `YOUR SIGNATURE PHRASES (use these naturally):
${characterConfig.signatureLines.map((line: string) => `- "${line}"`).join('\n')}` : ''}

${characterConfig.humor ? `HUMOR GUIDELINES:
- Cheeky mode: ${characterConfig.humor.cheeky_mode ? 'Yes' : 'No'}
- Style: ${characterConfig.humor.style}
- Guardrails: ${characterConfig.humor.guardrails.join('. ')}
${characterConfig.humor.examples ? `- Examples: ${characterConfig.humor.examples.join(' | ')}` : ''}` : ''}

GLOBAL SAFETY GUARDS (ALWAYS FOLLOW):
${GLOBAL_GUARDS}

ADDITIONAL RULES:
- Age-appropriate for ${studentAge} year olds
- UK English spelling
- Brief responses (under 120 words)
- Give one action + one reflection
- Offer choices when possible

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

