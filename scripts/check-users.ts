/**
 * Check Auth Users in Supabase
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'
import * as fs from 'fs'

// Load environment variables
const envPath = path.join(process.cwd(), '.env')
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath })
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

console.log('🔍 Checking Supabase connection...')
console.log(`URL: ${SUPABASE_URL}`)
console.log(`Service Key: ${SUPABASE_SERVICE_ROLE_KEY ? '✅ Set' : '❌ Missing'}\n`)

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function checkUsers() {
  console.log('📋 Fetching all users...\n')
  
  const { data, error } = await supabase.auth.admin.listUsers()
  
  if (error) {
    console.error('❌ Error fetching users:', error)
    return
  }
  
  console.log(`Total users in auth.users: ${data.users.length}\n`)
  
  if (data.users.length === 0) {
    console.log('⚠️  No users found!')
  } else {
    data.users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email} (ID: ${user.id})`)
    })
  }
  
  // Also check vespa.academy users specifically
  const vespaUsers = data.users.filter(u => u.email?.includes('vespa.academy'))
  console.log(`\nVESPA Academy users: ${vespaUsers.length}`)
  
  if (vespaUsers.length > 0) {
    console.log('\n✅ VESPA users found! You can now run the seed scripts.')
  } else {
    console.log('\n❌ No VESPA users found. User creation may have failed.')
  }
}

checkUsers()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Fatal error:', err)
    process.exit(1)
  })

