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
  const prompt = `You are a wise Japanese Sensei welcoming a student ${studentName ? `named ${studentName}` : ''} (age 11-14) to Ikigai Quest.

Ikigai (i-kee-gai): Japanese for "reason for being."

Give a brief, zen-like welcome (2-3 short sentences, ~30 words total) that:
- Explains the 4 circles briefly: love, good at, world needs, earning
- Uses wisdom and calm, not gushy enthusiasm
- Perhaps includes a brief Japanese saying or zen wisdom
- Warm but concise
- NO American motivational speaker tone
- NO schmaltzy praise

GOOD Zen Examples:
"Welcome, ${studentName || 'young one'}. Ikigai: where four paths meet—love, skill, service, livelihood. The journey of a thousand miles begins with a single honest step."
"Ikigai means 'reason for being.' We seek where your joy, your talent, the world's needs, and your living all connect. Shall we begin?"

BAD (too much):
"Welcome to this amazing special journey where you'll discover the incredible person you are!"

Be wise. Be brief. Be warm. Like a real Japanese teacher.`

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 150,
      messages: [{ role: 'user', content: prompt }],
    })

    return message.content[0].type === 'text' ? message.content[0].text : ''
  } catch (error) {
    console.error('Sensei error:', error)
    return `Welcome${studentName ? ', ' + studentName : ', young one'}. Ikigai—'reason for being.' We explore where four paths meet: what you love, what you do well, what serves others, and what sustains you. Shall we begin?`
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
    1: `Step 1: "What You LOVE". Guide them to list specific joys. Zen: be clear, be brief. Perhaps a Japanese saying about honesty or first steps.`,
    2: `Step 2: "What You're GOOD AT". They love: ${context.ideas.love.join(', ')}. Help identify skills. Zen wisdom: "good enough" is perfect. Perhaps mention bamboo or flowing water.`,
    3: `Reflection: ${context.ideas.love.length + context.ideas.goodAt.length} ideas gathered. Guide to pause, observe patterns. Zen: clarity comes when mind settles. Perhaps mention stillness or water.`,
    4: `Step 4: "What You Can Be PAID FOR". Livelihood and freedom both matter. Zen: balance, not just money. Brief wisdom about sustaining life with purpose.`,
    5: `Step 5: "What The WORLD NEEDS". How can they serve? Zen: even small light matters. Perhaps proverb about candles, ripples, or small acts.`,
    6: `Final step! All 4 quadrants complete. Point to where circles meet - this is Ikigai. Perhaps share brief Japanese proverb about purpose or completing a journey.`,
  }

  const prompt = `You are a wise Japanese Sensei guiding a young student (age 11-14) through Ikigai Quest.

${stepPrompts[step as keyof typeof stepPrompts]}

ZEN PRINCIPLE: Say more with fewer words.

YOUR VOICE:
- Wise, calm, respectful Japanese teacher
- Brief (1-2 short sentences, 15-30 words total)
- Occasionally use Japanese proverbs or wisdom
- Warm but NOT schmaltzy or gushy
- Direct and clear, not flowery
- NO American motivational speaker vibes
- NO over-the-top praise
- NO emojis

GOOD Examples (zen brevity):
"What brings you joy? Be specific - the clearest path begins with an honest step."
"The river shapes the stone through patience, not force. What skills have you quietly cultivated?"
"Where four circles meet, purpose lives. Look for the overlaps."

BAD Examples (too much):
"You're an amazing person on a special journey to discover the incredible you inside! Let's explore..."

Speak like a real Japanese teacher: wise, brief, kind.`

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

// Fallback guidance - Zen Sensei wisdom
function getDefaultGuidance(step: number): string {
  const defaults = {
    1: "What brings you true joy? Be specific. A thousand-mile journey begins with one clear step.",
    2: "What skills have you cultivated? Remember: the bamboo bends but does not break. 'Good enough' is enough.",
    3: "Pause. Let your mind settle like water. Patterns emerge when we stop chasing them.",
    4: "How might you sustain yourself? The cherry blossom is beautiful partly because it blooms but briefly. Balance earning with joy.",
    5: "How might your gifts serve others? Even a small candle can light darkness.",
    6: "Where all four circles meet—this is your Ikigai. Your reason for being. You have found it.",
  }
  return defaults[step as keyof typeof defaults] || "Continue with patience and honesty."
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

