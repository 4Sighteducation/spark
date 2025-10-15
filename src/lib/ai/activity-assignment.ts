import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

interface StudentProfile {
  name: string
  scores: {
    self_direction: number
    purpose: number
    awareness: number
    resilience: number
    knowledge: number
    overall: number
  }
  bands: {
    self_direction: string
    purpose: string
    awareness: string
    resilience: string
    knowledge: string
    overall: string
  }
}

interface Activity {
  id: string
  activity_code: string
  title: string
  dimension: 'S' | 'P' | 'A' | 'R' | 'K'
  description: string
  time_minutes: number
  difficulty_level: string
  suggested_bands: string[]
}

/**
 * Use Claude AI to intelligently assign 6 activities to a student
 * based on their SPARK scores and available activities
 */
export async function assignActivitiesWithAI(
  student: StudentProfile,
  availableActivities: Activity[]
): Promise<{
  assignments: Activity[]
  reasoning: string
}> {
  // Organize activities by dimension
  const activityMap = {
    S: availableActivities.filter(a => a.dimension === 'S'),
    P: availableActivities.filter(a => a.dimension === 'P'),
    A: availableActivities.filter(a => a.dimension === 'A'),
    R: availableActivities.filter(a => a.dimension === 'R'),
    K: availableActivities.filter(a => a.dimension === 'K'),
  }

  const prompt = `You are an educational psychologist specializing in student development. You're analyzing a student's SPARK assessment results to recommend 6 personalized activities.

**Student Profile:**
- Name: ${student.name}
- Overall Score: ${student.scores.overall.toFixed(1)} (${student.bands.overall})

**Dimension Scores:**
- Self-Direction (S): ${student.scores.self_direction.toFixed(1)} (${student.bands.self_direction})
- Purpose (P): ${student.scores.purpose.toFixed(1)} (${student.bands.purpose})
- Awareness (A): ${student.scores.awareness.toFixed(1)} (${student.bands.awareness})
- Resilience (R): ${student.scores.resilience.toFixed(1)} (${student.bands.resilience})
- Knowledge (K): ${student.scores.knowledge.toFixed(1)} (${student.bands.knowledge})

**Available Activities (${availableActivities.length} total):**

${Object.entries(activityMap).map(([dim, activities]) => `
${dim} (${activities.length} activities):
${activities.map(a => `  - ${a.activity_code}: "${a.title}" (${a.time_minutes}min, ${a.difficulty_level}, for: ${a.suggested_bands.join('/')})`).join('\n')}
`).join('\n')}

**Assignment Rules:**
1. Assign exactly 6 activities total
2. One activity from EACH dimension (S, P, A, R, K) = 5 activities
3. One additional activity from the dimension of greatest need (lowest 2 scores)
4. Match activity difficulty to student's band (low students get beginner activities, etc.)
5. Prioritize activities designed for their score bands
6. Consider time balance (mix short and longer activities)

**Output Format (JSON only, no explanation):**
{
  "assignments": [
    {
      "activity_code": "S_two_minute_takeoff",
      "dimension": "S",
      "priority": 1
    },
    ... (exactly 6 activities)
  ],
  "reasoning": "Brief 2-sentence explanation of why these activities match this student's profile"
}

Respond with ONLY the JSON object, no markdown formatting.`

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    })

    const responseText = message.content[0].type === 'text' ? message.content[0].text : '{}'
    
    // Parse JSON response
    const result = JSON.parse(responseText.trim())
    
    // Map activity codes back to full activity objects
    const assignedActivities = result.assignments.map((assignment: any) => {
      const activity = availableActivities.find(a => a.activity_code === assignment.activity_code)
      return activity!
    }).filter(Boolean)

    return {
      assignments: assignedActivities,
      reasoning: result.reasoning,
    }

  } catch (error) {
    console.error('Error with Claude AI assignment:', error)
    
    // Fallback: Simple rule-based assignment
    return fallbackAssignment(student, activityMap)
  }
}

/**
 * Fallback rule-based assignment if AI fails
 */
function fallbackAssignment(
  student: StudentProfile,
  activityMap: Record<string, Activity[]>
): { assignments: Activity[]; reasoning: string } {
  const assignments: Activity[] = []

  // Get one activity from each dimension
  const dimensions: Array<'S' | 'P' | 'A' | 'R' | 'K'> = ['S', 'P', 'A', 'R', 'K']
  
  for (const dim of dimensions) {
    const score = student.scores[
      dim === 'S' ? 'self_direction' :
      dim === 'P' ? 'purpose' :
      dim === 'A' ? 'awareness' :
      dim === 'R' ? 'resilience' : 'knowledge'
    ]
    
    const band = student.bands[
      dim === 'S' ? 'self_direction' :
      dim === 'P' ? 'purpose' :
      dim === 'A' ? 'awareness' :
      dim === 'R' ? 'resilience' : 'knowledge'
    ]

    // Find suitable activity for this dimension and band
    const suitableActivities = activityMap[dim].filter(a => 
      a.suggested_bands.includes(band.toLowerCase())
    )

    if (suitableActivities.length > 0) {
      assignments.push(suitableActivities[0])
    } else {
      // Just pick first activity from dimension
      assignments.push(activityMap[dim][0])
    }
  }

  // Find lowest dimension for 6th activity
  const dimensionScores = [
    { dim: 'S', score: student.scores.self_direction },
    { dim: 'P', score: student.scores.purpose },
    { dim: 'A', score: student.scores.awareness },
    { dim: 'R', score: student.scores.resilience },
    { dim: 'K', score: student.scores.knowledge },
  ].sort((a, b) => a.score - b.score)

  const lowestDim = dimensionScores[0].dim as 'S' | 'P' | 'A' | 'R' | 'K'
  
  // Add second activity from lowest dimension (different from first)
  const secondActivity = activityMap[lowestDim][1] || activityMap[lowestDim][0]
  assignments.push(secondActivity)

  return {
    assignments: assignments.slice(0, 6),
    reasoning: `Activities selected to support growth across all dimensions, with extra focus on ${lowestDim === 'S' ? 'Self-Direction' : lowestDim === 'P' ? 'Purpose' : lowestDim === 'A' ? 'Awareness' : lowestDim === 'R' ? 'Resilience' : 'Knowledge'}.`
  }
}

