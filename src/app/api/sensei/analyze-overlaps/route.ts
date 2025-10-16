import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

export const dynamic = 'force-dynamic'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

/**
 * Analyze student's Ikigai ideas and suggest overlap categories
 * Returns: Passion, Mission, Profession, Vocation, and Ikigai Center
 */
export async function POST(req: NextRequest) {
  try {
    const { ideas, connections } = await req.json()

    const prompt = `You are a wise Sensei analyzing a student's Ikigai Quest results.

STUDENT'S IDEAS:
Love: ${ideas.love.join(', ')}
Good At: ${ideas.goodAt.join(', ')}
Paid For: ${ideas.paidFor.join(', ')}
World Needs: ${ideas.worldNeeds.join(', ')}

${connections && connections.length > 0 ? `Connections they made: ${connections.length} links between related items` : ''}

Analyze and identify specific examples for each overlap category:

PASSION (Love + Good At): What they love AND are skilled at
MISSION (Love + World Needs): What they love AND serves others
PROFESSION (Good At + Paid For): What they're skilled at AND can earn from
VOCATION (Paid For + World Needs): What earns money AND serves the world
IKIGAI CENTER: Where ALL FOUR meet (the ultimate purpose)

Return ONLY a JSON object (no explanation):
{
  "passion": ["specific example 1", "example 2"],
  "mission": ["specific example 1", "example 2"],
  "profession": ["specific example 1", "example 2"],
  "vocation": ["specific example 1", "example 2"],
  "ikigai_center": ["the main overlap where all 4 meet"]
}

Be specific. Use their actual ideas. If overlap is weak, say ["Not yet clear - needs more exploration"]`

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 400,
      messages: [{ role: 'user', content: prompt }],
    })

    const response = message.content[0].type === 'text' ? message.content[0].text : '{}'
    const overlaps = JSON.parse(response.trim())

    return NextResponse.json({ overlaps })

  } catch (error) {
    console.error('Overlap analysis error:', error)
    return NextResponse.json({
      overlaps: {
        passion: ["Explore connections between your loves and skills"],
        mission: ["Consider how your passions could serve others"],
        profession: ["Think about careers using your strengths"],
        vocation: ["Find work that both earns and serves"],
        ikigai_center: ["Your unique purpose awaits discovery"],
      },
    })
  }
}

