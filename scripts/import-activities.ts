/**
 * Import SPARK Activities to Database
 * Imports all 40 activities from spark_activities_40.json
 * Run with: npm run db:import-activities
 */

import { createClient } from '@supabase/supabase-js'
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

// Load activities JSON
const activitiesData = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), 'spark_activities_40.json'), 'utf-8')
)

async function importActivities() {
  console.log('📚 Importing SPARK Activities to database...\n')

  let imported = 0
  let skipped = 0

  // Process each dimension
  for (const [dimensionKey, dimensionData] of Object.entries(activitiesData.themes)) {
    const dimension = dimensionKey as 'S' | 'P' | 'A' | 'R' | 'K'
    const data = dimensionData as any

    console.log(`\n${data.name} (${dimension}): ${data.activities.length} activities`)

    for (const activity of data.activities) {
      // Map suggested_band to array of bands
      const suggestedBands = activity.suggested_band.toLowerCase().split('/').map((b: string) => {
        if (b.includes('low')) return 'low'
        if (b.includes('average')) return 'average'
        if (b.includes('high') && !b.includes('very')) return 'high'
        if (b.includes('very')) return 'very_high'
        return 'average'
      })

      // Determine difficulty level based on suggested band
      const difficultyLevel = activity.suggested_band.includes('Very High') ? 'advanced' :
                               activity.suggested_band.includes('Average') ? 'intermediate' : 'beginner'

      // Determine interactive type based on activity
      const interactiveType = activity.id.includes('ikigai') ? 'ikigai' :
                               activity.id.includes('quiz') || activity.id.includes('scavenger') ? 'quiz' :
                               activity.id.includes('canvas') || activity.id.includes('map') ? 'canvas' :
                               'guided'

      // Check if already exists
      const { data: existing } = await supabase
        .from('activities')
        .select('id')
        .eq('activity_code', activity.id)
        .single()

      if (existing) {
        console.log(`  ⏭️  ${activity.title} (already exists)`)
        skipped++
        continue
      }

      // Insert activity
      const { error } = await supabase
        .from('activities')
        .insert({
          activity_code: activity.id,
          title: activity.title,
          dimension,
          suggested_bands: suggestedBands,
          description: activity.description,
          instructions: {
            steps: activity.steps,
            materials: activity.materials,
            teacher_notes: activity.teacher_notes,
            evidence: activity.evidence,
            differentiation: activity.differentiation,
          },
          time_minutes: activity.time_minutes,
          difficulty_level: difficultyLevel,
          tags: [activity.suggested_band, activity.source],
          source: activity.source,
          activity_type: 'interactive',
          interactive_type: interactiveType,
          interactive_config: {
            // Activity-specific config (will be populated later)
          },
          is_published: true,
        })

      if (error) {
        console.error(`  ❌ Error importing ${activity.title}:`, error.message)
      } else {
        console.log(`  ✅ ${activity.title}`)
        imported++
      }
    }
  }

  console.log(`\n📊 Summary:`)
  console.log(`  ✅ Imported: ${imported}`)
  console.log(`  ⏭️  Skipped: ${skipped}`)
  console.log(`  📚 Total Activities: ${imported + skipped}`)
  console.log(`\n✅ Activities import complete!`)
}

importActivities()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Fatal error:', err)
    process.exit(1)
  })

