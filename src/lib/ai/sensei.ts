import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

/**
 * AI Sensei - Wise guide for Ikigai Quest
 * Provides personalized guidance, suggestions, and reflections
 */

export interface SenseiMessage {
  role: 'sensei' | 'student'
  content: string
  timestamp: Date
}

export interface IkigaiContext {
  studentName?: string
  currentStep: number
  ideas: {
    love: string[]
    goodAt: string[]
    paidFor: string[]
    worldNeeds: string[]
  }
  conversationHistory: SenseiMessage[]
}

/**
 * Get Sensei's welcome message
 */
export async function getSenseiWelcome(studentName?: string): Promise<string> {
  const prompt = `You are a wise but down-to-earth Sensei guiding a UK secondary school student ${studentName ? `named ${studentName}` : ''} (age 11-14) through the Ikigai Quest.

Ikigai (i-kee-gai) is a Japanese concept meaning "reason for being."

Give a brief, straightforward welcome (2 sentences max) that:
- Explains the 4 circles (love, good at, world needs, paid for) 
- Is friendly but NOT schmaltzy or over-the-top
- Uses British tone (direct, bit of dry wit, no American motivational speaker vibes)
- Respects that UK teens are more cynical/direct than American teens

Examples of good tone:
"Right then, ${studentName || 'young one'}. We're going to work out your Ikigai—basically, what makes life worth getting out of bed for."
"Ikigai: sounds mysterious, but it's just four questions about what you love, what you're decent at, what helps others, and what might pay the bills one day."

Be brief, British, a bit witty. No schmaltzy stuff. No emojis.`

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 150,
      messages: [{ role: 'user', content: prompt }],
    })

    return message.content[0].type === 'text' ? message.content[0].text : ''
  } catch (error) {
    console.error('Sensei error:', error)
    return `Right then${studentName ? ', ' + studentName : ''}. Let's work out your Ikigai—basically, what makes life worth getting out of bed for. Four simple questions: what you love, what you're good at, what the world needs, and what might pay the bills.`
  }
}

/**
 * Get Sensei's guidance for current step
 */
export async function getSenseiGuidance(
  step: number,
  context: IkigaiContext
): Promise<string> {
  const stepPrompts = {
    1: `Step 1: "What You LOVE". UK student, age 11-14. Guide them to list specific things (not vague). Be direct and friendly, bit of wit. 1-2 sentences max. British tone - no American schmaltzy stuff.`,
    2: `Step 2: "What You're GOOD AT". They listed: ${context.ideas.love.join(', ')}. Help spot skills. Remind them 'good enough' counts. British direct tone, 1-2 sentences, bit witty.`,
    3: `Reflection moment. They have ${context.ideas.love.length + context.ideas.goodAt.length} ideas so far. Tell them to look for patterns, not rush. British wit welcome. 1-2 sentences.`,
    4: `"What You Can Be PAID FOR". Practical career chat. Remind them freedom/creativity > just cash. British direct, 1-2 sentences, slight wit okay.`,
    5: `"What The WORLD NEEDS". How can their stuff help others? Keep it real for UK 11-14 year olds - not overly noble. 1-2 sentences, British tone.`,
    6: `Final step! All 4 done. Point out where circles overlap = their Ikigai. Celebrate but keep it real. British, 1-2 sentences, can be slightly cheeky.`,
  }

  const prompt = `You are a down-to-earth Sensei guiding a UK Year 8 student (age 11-14).

${stepPrompts[step as keyof typeof stepPrompts]}

CRITICAL TONE RULES:
- British, not American (no "awesome", "amazing person", "special journey")
- Direct and practical, not schmaltzy
- Bit of dry wit welcome
- Respect that UK teens are more cynical/direct
- 1-2 sentences MAX
- NO emojis
- NO over-the-top praise

Good: "Right, let's see what actually matters to you. Be specific—'football' is vague, 'scoring goals as a striker' is useful."
Bad: "You're amazing! This special journey will help you discover the incredible person inside!"

Respond as a wise but real teacher would.`

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 150,
      messages: [{ role: 'user', content: prompt }],
    })

    return message.content[0].type === 'text' ? message.content[0].text : ''
  } catch (error) {
    console.error('Sensei guidance error:', error)
    return getDefaultGuidance(step)
  }
}

/**
 * Get AI suggestions for student's current quadrant
 */
export async function getSenseiSuggestions(
  quadrant: 'love' | 'goodAt' | 'paidFor' | 'worldNeeds',
  currentIdeas: string[],
  studentAge: number = 13
): Promise<string[]> {
  const quadrantPrompts = {
    love: `things that bring joy, excitement, and happiness`,
    goodAt: `skills, talents, and abilities they have (even if not 'the best')`,
    paidFor: `potential careers, jobs, or ways to earn money`,
    worldNeeds: `ways to contribute to society, help others, or serve the world`,
  }

  const prompt = `You are helping a ${studentAge}-year-old student brainstorm ${quadrantPrompts[quadrant]}.

They've already thought of: ${currentIdeas.join(', ') || 'nothing yet'}.

Suggest 4 MORE diverse, age-appropriate ideas they might not have considered. Be specific and realistic for a young teenager.

Format: Return ONLY a JSON array of strings, like: ["idea 1", "idea 2", "idea 3", "idea 4"]

No explanation, just the JSON array.`

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 200,
      messages: [{ role: 'user', content: prompt }],
    })

    const response = message.content[0].type === 'text' ? message.content[0].text : '[]'
    const suggestions = JSON.parse(response.trim())
    return suggestions.slice(0, 4)
  } catch (error) {
    console.error('Sensei suggestions error:', error)
    return getDefaultSuggestions(quadrant)
  }
}

/**
 * Evaluate originality and depth of student's ideas
 */
export async function evaluateIkigai(ideas: IkigaiContext['ideas']): Promise<{
  score: number  // 0-100
  feedback: string
  bonusPoints: number
}> {
  const totalIdeas = Object.values(ideas).flat().length

  const prompt = `You are evaluating a student's Ikigai Quest completion.

Their ideas:
- What they LOVE: ${ideas.love.join(', ')}
- What they're GOOD AT: ${ideas.goodAt.join(', ')}
- What they can be PAID FOR: ${ideas.paidFor.join(', ')}
- What the WORLD NEEDS: ${ideas.worldNeeds.join(', ')}

Rate their effort on:
1. Depth (did they think deeply?)
2. Variety (diverse ideas?)
3. Thoughtfulness (meaningful connections?)

Return JSON only:
{
  "score": 0-100,
  "feedback": "One encouraging sentence about their Ikigai journey",
  "bonusPoints": 0-50 (extra points for exceptional depth/originality)
}`

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 200,
      messages: [{ role: 'user', content: prompt }],
    })

    const response = message.content[0].type === 'text' ? message.content[0].text : '{}'
    return JSON.parse(response.trim())
  } catch (error) {
    console.error('Evaluation error:', error)
    return {
      score: Math.min(100, totalIdeas * 10),
      feedback: "You've taken important steps in discovering your purpose!",
      bonusPoints: Math.min(30, Math.floor(totalIdeas / 3) * 5),
    }
  }
}

// Fallback guidance - British tone
function getDefaultGuidance(step: number): string {
  const defaults = {
    1: "Right then. What actually makes you happy? Be specific - 'football' is vague, 'scoring goals' is better.",
    2: "Now then - what are you decent at? 'Good enough' counts. What do people ask you for help with?",
    3: "Pause here. Look for patterns between what you love and what you're good at. Connections often appear when you stop rushing.",
    4: "Career time. How might you earn from this? Remember: freedom and creativity matter as much as cash.",
    5: "World needs - how could your interests actually help people? Keep it real, not preachy.",
    6: "Look where all four overlap. That's your Ikigai - where passion, skill, service and earning meet. Not bad.",
  }
  return defaults[step as keyof typeof defaults] || "Keep going. You're doing fine."
}

// Fallback suggestions
function getDefaultSuggestions(quadrant: string): string[] {
  const defaults = {
    love: ["Reading and storytelling", "Playing music or singing", "Helping friends solve problems", "Creating art or designs"],
    goodAt: ["Listening to others", "Organizing and planning", "Explaining things clearly", "Staying calm under pressure"],
    paidFor: ["Teaching or tutoring", "Content creation", "Tech support", "Creative services"],
    worldNeeds: ["Environmental protection", "Supporting mental health", "Reducing inequality", "Building community connections"],
  }
  return defaults[quadrant as keyof typeof defaults] || []
}

