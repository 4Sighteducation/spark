#!/usr/bin/env node
/**
 * Import SPARK Questionnaire into Supabase
 * Run: npm run db:import-questionnaire
 */

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')
const dotenv = require('dotenv')

// Load environment variables
dotenv.config()

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing environment variables!')
  console.error('   Ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env')
  process.exit(1)
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

async function importQuestionnaire() {
  try {
    console.log('📋 Loading SPARK_questionnaire.json...')
    
    // Read the questionnaire JSON file
    const questionnaireData = JSON.parse(
      fs.readFileSync(
        path.join(__dirname, '..', 'SPARK_questionnaire.json'),
        'utf8'
      )
    )
    
    console.log('✅ Questionnaire loaded:', {
      version: questionnaireData.version,
      themes: questionnaireData.themes.length,
      totalQuestions: questionnaireData.themes.reduce((sum, t) => sum + t.items.length, 0)
    })

    // Delete existing questionnaire
    console.log('🗑️  Deleting old questionnaire...')
    await supabase
      .from('questionnaires')
      .delete()
      .eq('version', questionnaireData.version)

    // Insert new questionnaire with explicit ID
    console.log('💾 Inserting new questionnaire...')
    const { data, error } = await supabase
      .from('questionnaires')
      .upsert({
        id: '00000000-0000-0000-0000-000000000000', // Use the existing ID
        version: questionnaireData.version,
        title: 'SPARK Assessment V2',
        description: questionnaireData.notes,
        questions: questionnaireData, // This is the full JSON object
        status: 'active',
        is_default: true,
      }, {
        onConflict: 'id'
      })
      .select()

    if (error) {
      console.error('❌ Error inserting questionnaire:', error)
      process.exit(1)
    }

    console.log('✅ Questionnaire imported successfully!')
    if (data && data.length > 0) {
      console.log('   ID:', data[0].id)
      console.log('   Version:', data[0].version)
      console.log('   Themes:', data[0].questions.themes?.length || 0)
      console.log('   Total Questions:', data[0].questions.themes?.reduce((sum, t) => sum + t.items.length, 0) || 0)
    }
    
    process.exit(0)
    
  } catch (error) {
    console.error('❌ Failed to import questionnaire:', error)
    process.exit(1)
  }
}

importQuestionnaire()

