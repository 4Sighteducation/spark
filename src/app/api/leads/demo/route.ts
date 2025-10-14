import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Use service role key for server-side operations
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, school, role, source, demo_completed, demo_answers, demo_scores } = body

    // Basic validation
    if (!name || !email) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 })
    }

    // Get request metadata
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip')
    const userAgent = request.headers.get('user-agent')
    const referrer = request.headers.get('referer')

    // Insert lead into database
    const { data, error } = await supabase
      .from('leads')
      .insert({
        name,
        email,
        school,
        role,
        source: source || 'demo',
        demo_completed: demo_completed || false,
        demo_answers: demo_answers || null,
        demo_scores: demo_scores || null,
        demo_completed_at: demo_completed ? new Date().toISOString() : null,
        ip_address: ip,
        user_agent: userAgent,
        referrer: referrer,
        status: 'new',
      })
      .select()
      .single()

    if (error) {
      // Check if it's a duplicate email
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'Email already registered', message: 'You have already signed up!' },
          { status: 409 }
        )
      }

      console.error('Supabase error:', error)
      return NextResponse.json({ error: 'Failed to save lead' }, { status: 500 })
    }

    // TODO: Send welcome email via SendGrid (optional)
    // TODO: Trigger Slack notification for sales team (optional)

    return NextResponse.json({ success: true, data }, { status: 201 })
  } catch (error) {
    console.error('Error processing lead:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

