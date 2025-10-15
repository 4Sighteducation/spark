/**
 * Assign activities to test students based on their scores
 * Run with: npm run db:assign-activities
 */

import * as dotenv from 'dotenv'
import * as path from 'path'
import * as fs from 'fs'

// Load .env
const envPath = path.join(process.cwd(), '.env')
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath })
}

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

// Test student IDs
const testStudentEmails = [
  'stutest1@vespa.academy', // Billy
  'stutest2@vespa.academy', // Sarah
  'stutest3@vespa.academy', // Clare
]

async function assignActivities() {
  console.log('🎯 Assigning activities to test students...\n')

  for (const email of testStudentEmails) {
    console.log(`Processing: ${email}...`)

    try {
      // Get student's latest assessment
      const response = await fetch(`${APP_URL}/api/activities/assign-for-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      if (!response.ok) {
        const error = await response.text()
        console.error(`  ❌ Failed: ${error}`)
        continue
      }

      const data = await response.json()
      console.log(`  ✅ Assigned ${data.activityTitles?.length || 0} activities`)
      console.log(`  📝 ${data.reasoning}`)
      if (data.activityTitles) {
        data.activityTitles.forEach((title: string, i: number) => {
          console.log(`     ${i + 1}. ${title}`)
        })
      }
    } catch (error) {
      console.error(`  ❌ Error:`, error)
    }

    console.log('')
  }

  console.log('✅ Activity assignment complete!')
}

assignActivities()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Fatal error:', err)
    process.exit(1)
  })

