import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    // Create Supabase client INSIDE the handler, not at module level
    // This prevents build-time database connection attempts
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

    const body = await request.json()
    const { name, email, school, role } = body

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
        source: 'waitlist',
        demo_completed: false,
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
          { error: 'Email already registered', message: 'You are already on our waitlist!' },
          { status: 409 }
        )
      }

      console.error('Supabase error:', error)
      return NextResponse.json({ error: 'Failed to save to waitlist' }, { status: 500 })
    }

    // TODO: Send welcome email via SendGrid
    // TODO: Add to mailing list
    // TODO: Trigger Slack notification

    return NextResponse.json({ success: true, data }, { status: 201 })
  } catch (error) {
    console.error('Error processing waitlist signup:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

