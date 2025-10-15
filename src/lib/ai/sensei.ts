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
  const prompt = `You are a wise, kind Sensei guiding a ${studentName ? `student named ${studentName}` : 'young student'} (age 11-14) through the Ikigai Quest.

Ikigai (i-kee-gai) is a Japanese concept meaning "reason for being" - finding joy and purpose in life.

Give a warm, encouraging welcome (2-3 sentences) that:
- Explains we'll explore what they love, what they're good at, what the world needs, and what they can be paid for
- Makes them feel safe and excited
- Uses simple, age-appropriate language

Be warm, wise, and brief. No emojis.`

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 150,
      messages: [{ role: 'user', content: prompt }],
    })

    return message.content[0].type === 'text' ? message.content[0].text : ''
  } catch (error) {
    console.error('Sensei error:', error)
    return "Welcome, young one. Today we begin a special journey to discover your Ikigai - your reason for being. Together, we will explore what brings you joy, where your strengths lie, and how you might contribute to the world."
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
    1: `The student is on Step 1: "What You LOVE". They need to list things that make them happiest and most excited. Guide them to think deeply and be specific. Give 2-3 sentences of encouragement.`,
    2: `The student is on Step 2: "What You're GOOD AT". They have listed what they love: ${context.ideas.love.join(', ')}. Now help them think about their strengths and skills. Be encouraging about 'good enough' vs 'the best'. Give 2-3 sentences.`,
    3: `The student is completing their internal reflection. They've listed what they love (${context.ideas.love.length} items) and what they're good at (${context.ideas.goodAt.length} items). Encourage them to let these ideas rest and look for connections. Give 2-3 sentences of wisdom about patience and synthesis.`,
    4: `Step 4: "What You Can Be PAID FOR". Help them think practically about careers and earning, but also remind them that freedom, creativity, and autonomy might matter more than money. Give 2-3 sentences.`,
    5: `Step 5: "What The WORLD NEEDS". They've shared their passions (${context.ideas.love.join(', ')}). Help them think about how their interests could serve others and contribute to society. Be inspiring but realistic for a 11-14 year old. Give 2-3 sentences.`,
    6: `Final step! They've completed all 4 quadrants. Help them see the patterns and overlaps emerging. Where do their passions, skills, earning potential, and service to the world intersect? Give 2-3 sentences of celebration and guidance.`,
  }

  const prompt = `You are a wise Sensei guiding a young student through Ikigai Quest.

${stepPrompts[step as keyof typeof stepPrompts]}

Respond in the voice of a wise, kind teacher. Be brief (2-3 sentences), encouraging, and age-appropriate for 11-14 year olds. No emojis.`

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

// Fallback guidance
function getDefaultGuidance(step: number): string {
  const defaults = {
    1: "Begin by thinking about what truly makes you happy. What activities make time fly? What do you look forward to? Be honest with yourself - there are no wrong answers here.",
    2: "Now consider your strengths. What do others ask for your help with? What comes naturally to you? Remember, 'good at' doesn't mean perfect - it means capable.",
    3: "Take a moment to reflect on what you've discovered. Look for patterns and connections. Sometimes our greatest insights come when we give our minds time to rest and process.",
    4: "Think practically now. How might your passions and skills translate into earning a living? Money is important, but so are creativity, freedom, and doing work you enjoy.",
    5: "Consider how your unique combination of interests and abilities might serve others. What problems could you help solve? What needs could you meet in your community or the wider world?",
    6: "Look at everything you've discovered. Where do all four circles overlap? That space - where your passion, talent, purpose, and livelihood meet - that is your Ikigai.",
  }
  return defaults[step as keyof typeof defaults] || "Continue your journey with an open mind and honest heart."
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

