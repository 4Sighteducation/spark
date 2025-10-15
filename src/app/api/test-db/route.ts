import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Simple test endpoint to check Supabase connection
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )

    // Try to insert a test lead
    const { data, error } = await supabase
      .from('leads')
      .insert({
        name: 'Test User',
        email: `test-${Date.now()}@example.com`,
        school: 'Test School',
        role: 'Test',
        source: 'test',
        demo_completed: false,
        status: 'new',
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({
        success: false,
        error: {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
        },
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Database connection works!',
      data,
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || String(error),
    }, { status: 500 })
  }
}

