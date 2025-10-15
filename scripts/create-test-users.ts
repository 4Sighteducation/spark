/**
 * Create Test Users for SPARK Academy
 * 
 * This script creates 6 auth users in Supabase:
 * - 3 staff (admin, head of year, tutor)
 * - 3 students (high/medium/low scorers)
 * 
 * Run with: npm run db:seed-users
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'
import * as fs from 'fs'

// Load environment variables from .env.local or .env
const envLocalPath = path.join(process.cwd(), '.env.local')
const envPath = path.join(process.cwd(), '.env')

if (fs.existsSync(envLocalPath)) {
  dotenv.config({ path: envLocalPath })
  console.log('📁 Loaded .env.local')
} else if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath })
  console.log('📁 Loaded .env')
} else {
  console.log('⚠️  No .env file found, using system environment variables')
}

// Load environment variables
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing environment variables!')
  console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set')
  process.exit(1)
}

// Create Supabase client with service role (can create users)
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Test users to create
const testUsers = [
  // Staff
  {
    email: 'admintest1@vespa.academy',
    password: 'TestPass123!',
    firstName: 'Clare',
    lastName: 'Beeton',
    role: 'org_admin'
  },
  {
    email: 'hoytest1@vespa.academy',
    password: 'TestPass123!',
    firstName: 'Craig',
    lastName: 'Branston',
    role: 'head_of_year'
  },
  {
    email: 'tuttest1@vespa.academy',
    password: 'TestPass123!',
    firstName: 'Catherine',
    lastName: 'Crinkle',
    role: 'teacher'
  },
  // Students
  {
    email: 'stutest1@vespa.academy',
    password: 'TestPass123!',
    firstName: 'Billy',
    lastName: 'Nomad',
    role: 'student',
    dateOfBirth: '2012-03-15'
  },
  {
    email: 'stutest2@vespa.academy',
    password: 'TestPass123!',
    firstName: 'Sarah',
    lastName: 'Hinchcliffe',
    role: 'student',
    dateOfBirth: '2012-07-22'
  },
  {
    email: 'stutest3@vespa.academy',
    password: 'TestPass123!',
    firstName: 'Clare',
    lastName: 'Handsoff',
    role: 'student',
    dateOfBirth: '2012-11-08'
  }
]

async function createTestUsers() {
  console.log('🚀 Creating SPARK Academy test users...\n')
  
  let successCount = 0
  let errorCount = 0
  
  for (const user of testUsers) {
    try {
      console.log(`Creating: ${user.firstName} ${user.lastName} (${user.email})...`)
      
      const { data, error } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true, // Auto-confirm email
        user_metadata: {
          first_name: user.firstName,
          last_name: user.lastName,
          role: user.role,
          date_of_birth: user.dateOfBirth
        }
      })
      
      if (error) {
        if (error.message.includes('already registered')) {
          console.log(`  ⚠️  Already exists (skipping)`)
        } else {
          console.error(`  ❌ Error: ${error.message}`)
          errorCount++
        }
      } else {
        console.log(`  ✅ Created successfully (ID: ${data.user?.id})`)
        successCount++
      }
    } catch (err) {
      console.error(`  ❌ Error: ${err}`)
      errorCount++
    }
  }
  
  console.log(`\n📊 Summary:`)
  console.log(`  ✅ Created: ${successCount}`)
  console.log(`  ⚠️  Skipped: ${testUsers.length - successCount - errorCount}`)
  console.log(`  ❌ Errors: ${errorCount}`)
  
  console.log(`\n🎯 Next Steps:`)
  console.log(`  1. Run: supabase-seed-spark-academy.sql`)
  console.log(`  2. Run: supabase-seed-test-responses.sql`)
  console.log(`  3. Verify with the diagnostic query\n`)
}

createTestUsers()
  .then(() => {
    console.log('✅ Done!')
    process.exit(0)
  })
  .catch((err) => {
    console.error('❌ Fatal error:', err)
    process.exit(1)
  })

