/**
 * Calculate and save assessment results for existing questionnaire responses
 * Run with: npx tsx scripts/calculate-test-scores.ts
 */

import { createClient } from '@supabase/supabase-js'
import { calculateAssessmentScores } from '../src/lib/scoring/calculate'
import * as dotenv from 'dotenv'
import * as path from 'path'
import * as fs from 'fs'

// Load .env
const envPath = path.join(process.cwd(), '.env')
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath })
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

async function calculateScores() {
  console.log('🔢 Calculating assessment results for test students...\n')

  // Get all completed responses
  const { data: responses, error } = await supabase
    .from('questionnaire_responses')
    .select(`
      *,
      question_answers (*),
      students!inner (
        *,
        profiles!inner (*)
      )
    `)
    .eq('status', 'completed')

  if (error) {
    console.error('Error fetching responses:', error)
    return
  }

  if (!responses || responses.length === 0) {
    console.log('No responses found without results')
    return
  }

  console.log(`Found ${responses.length} total responses\n`)

  let processed = 0
  let skipped = 0

  for (const response of responses) {
    const student = (response as any).students
    const profile = student.profiles
    const answers = (response as any).question_answers

    console.log(`Processing: ${profile.first_name} ${profile.last_name}...`)

    // Check if results already exist
    const { data: existing } = await supabase
      .from('assessment_results')
      .select('id')
      .eq('response_id', response.id)
      .single()

    if (existing) {
      console.log(`  ⏭️  Results already exist (skipping)`)
      skipped++
      continue
    }

    // Calculate scores
    const scores = calculateAssessmentScores(answers)

    console.log(`  Scores: S=${scores.self_direction.score.toFixed(1)} P=${scores.purpose.score.toFixed(1)} A=${scores.awareness.score.toFixed(1)} R=${scores.resilience.score.toFixed(1)} K=${scores.knowledge.score.toFixed(1)} Overall=${scores.overall.score.toFixed(1)}`)

    // Save to assessment_results
    const { error: saveError } = await supabase
      .from('assessment_results')
      .insert({
        response_id: response.id,
        student_id: response.student_id,
        organization_id: response.organization_id,
        self_direction_score: scores.self_direction.score,
        purpose_score: scores.purpose.score,
        awareness_score: scores.awareness.score,
        resilience_score: scores.resilience.score,
        knowledge_score: scores.knowledge.score,
        overall_score: scores.overall.score,
        self_direction_band: scores.self_direction.band,
        purpose_band: scores.purpose.band,
        awareness_band: scores.awareness.band,
        resilience_band: scores.resilience.band,
        knowledge_band: scores.knowledge.band,
        overall_band: scores.overall.band,
        report_data: {
          scores,
          completed_at: response.completed_at,
        },
      })

    if (saveError) {
      console.error(`  ❌ Error saving results:`, saveError)
    } else {
      console.log(`  ✅ Results saved successfully`)
      processed++
    }
  }

  console.log(`\n📊 Summary:`)
  console.log(`  ✅ Processed: ${processed}`)
  console.log(`  ⏭️  Skipped: ${skipped}`)
  console.log(`\n✅ All scores calculated and saved!`)
}

calculateScores()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Fatal error:', err)
    process.exit(1)
  })

