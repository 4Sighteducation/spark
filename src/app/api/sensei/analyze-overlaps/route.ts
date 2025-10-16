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

Analyze and identify SPECIFIC CONCRETE examples for each overlap category using THEIR ACTUAL IDEAS:

PASSION (Love + Good At): Combine items from "Love" and "Good At" lists
Example: If they love "football" and are good at "coaching", passion = "Coaching football to younger players"

MISSION (Love + World Needs): Combine "Love" and "World Needs"
Example: If they love "music" and world needs "mental health support", mission = "Using music therapy to help people feel better"

PROFESSION (Good At + Paid For): Combine "Good At" and "Paid For"  
Example: If good at "writing" and paid for "content creator", profession = "Professional content writer or blogger"

VOCATION (Paid For + World Needs): Combine "Paid For" and "World Needs"
Example: If paid for "teacher" and world needs "education", vocation = "Teacher helping disadvantaged students"

IKIGAI CENTER: Where ALL FOUR genuinely overlap - be VERY SPECIFIC
Example: "PE teacher who uses football coaching to build confidence in struggling Year 7 students"

CRITICAL:
- Use THEIR ACTUAL WORDS from the lists
- Be SPECIFIC, not generic
- Create real-world examples they can visualize
- 2-3 items per category max
- If no clear overlap exists, say ["Keep exploring - your path will emerge"]

Return ONLY JSON (no markdown, no explanation):
{
  "passion": ["specific example using their words"],
  "mission": ["specific example using their words"],
  "profession": ["specific example using their words"],
  "vocation": ["specific example using their words"],
  "ikigai_center": ["ultra-specific synthesis of all 4"]
}`

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

