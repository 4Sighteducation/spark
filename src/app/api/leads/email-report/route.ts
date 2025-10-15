import { NextRequest, NextResponse } from 'next/server'
import { generateReportPDF } from '@/lib/pdf/generateReportFinal'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, school, role, reportData } = body

    // Validation
    if (!name || !email || !reportData) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Generate PDF attachment
    const { pdfBase64, fileName } = generateReportPDF(name, reportData)

    // Generate HTML email
    const htmlEmail = generateReportEmail(name, email, school, role, reportData)

    // Send via SendGrid with PDF attachment
    const sendGridResponse = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{
          to: [{ email, name }],
          subject: `Your SPARK Assessment Report - ${name}`,
        }],
        from: {
          email: 'noreply@spark.study',
          name: 'SPARK Assessment',
        },
        content: [{
          type: 'text/html',
          value: htmlEmail,
        }],
        attachments: [{
          content: pdfBase64,
          filename: fileName,
          type: 'application/pdf',
          disposition: 'attachment',
        }],
      }),
    })

    if (!sendGridResponse.ok) {
      const error = await sendGridResponse.text()
      console.error('SendGrid error:', error)
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('Error sending report email:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function generateReportEmail(name: string, email: string, school: string, role: string, reportData: any): string {
  const dimensions = [
    { key: 'self_direction', label: 'Self-Direction', color: '#E91E8C', subtitle: 'Taking initiative and being pro-active' },
    { key: 'purpose', label: 'Purpose', color: '#7C3AED', subtitle: 'Hope, aspirations and your sense of purpose' },
    { key: 'awareness', label: 'Awareness', color: '#06B6D4', subtitle: 'Working with others, empathy and fostering relationships' },
    { key: 'resilience', label: 'Resilience', color: '#84CC16', subtitle: 'Diligence, reliability, never giving up' },
    { key: 'knowledge', label: 'Knowledge', color: '#FBBF24', subtitle: 'Curiosity, attention, role of student' },
  ]

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your SPARK Report</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f3f4f6;">
  
  <!-- Header -->
  <div style="background: linear-gradient(135deg, #E91E8C 0%, #7C3AED 50%, #06B6D4 100%); padding: 40px 20px; text-align: center; color: white;">
    <h1 style="margin: 0 0 10px 0; font-size: 36px; font-weight: bold;">🎉 Your SPARK Report</h1>
    <p style="margin: 0; font-size: 18px; opacity: 0.95;">Congratulations, ${name}!</p>
    <p style="margin: 10px 0 0 0; font-size: 14px; opacity: 0.9;">📎 Printable PDF attached below</p>
  </div>

  <!-- Welcome Box -->
  <div style="max-width: 600px; margin: 20px auto; background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
    <h2 style="margin: 0 0 15px 0; font-size: 24px; color: #111827;">Welcome to Your SPARK Report!</h2>
    <p style="margin: 0; color: #6b7280; line-height: 1.6;">
      This report highlights your strengths and areas to grow across five key themes: Self-Direction, Purpose, 
      Awareness, Resilience, and Knowledge. Your SPARK journey is unique—use this report to reflect on your progress, 
      celebrate successes, and set new goals.
    </p>
  </div>

  <!-- Overall Score -->
  <div style="max-width: 600px; margin: 20px auto; background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); text-align: center;">
    <h3 style="margin: 0 0 15px 0; font-size: 22px; color: #111827;">Your Overall SPARK Score</h3>
    <div style="font-size: 72px; font-weight: bold; color: #E91E8C; margin: 20px 0;">
      ${reportData.scores.overall.score.toFixed(1)}
    </div>
    <div style="font-size: 18px; font-weight: bold; text-transform: uppercase; color: #7C3AED; letter-spacing: 1px;">
      ${reportData.scores.overall.band.replace('_', ' ')}
    </div>
  </div>

  <!-- Dimension Scores -->
  ${dimensions.map(dim => {
    const score = reportData.scores[dim.key]
    return `
    <div style="max-width: 600px; margin: 20px auto; background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); border-left: 8px solid ${dim.color};">
      <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 20px;">
        <div style="flex: 1;">
          <h3 style="margin: 0 0 5px 0; font-size: 28px; font-weight: bold; color: #111827;">${dim.label}</h3>
          <p style="margin: 0; font-size: 14px; color: #6b7280; font-style: italic;">${dim.subtitle}</p>
        </div>
        <div style="text-align: right;">
          <div style="font-size: 48px; font-weight: bold; color: ${dim.color};">
            ${score.score.toFixed(1)}
          </div>
          <div style="font-size: 14px; font-weight: bold; text-transform: uppercase; color: ${dim.color};">
            ${score.band.replace('_', ' ')}
          </div>
        </div>
      </div>
      
      <!-- Progress Bar -->
      <div style="background: #e5e7eb; height: 12px; border-radius: 999px; overflow: hidden; margin-bottom: 20px;">
        <div style="background: ${dim.color}; height: 100%; width: ${(score.score / 10) * 100}%; border-radius: 999px;"></div>
      </div>
      
      <!-- Feedback -->
      <div style="background: #f9fafb; padding: 20px; border-radius: 12px; border: 2px solid ${dim.color}40;">
        <p style="margin: 0 0 15px 0; color: #374151; line-height: 1.6; font-size: 15px;">
          ${reportData.statements[dim.key]?.statement || `Great work in ${dim.label}!`}
        </p>
        
        <div style="background: ${dim.color}20; padding: 15px; border-radius: 8px; margin-top: 15px;">
          <p style="margin: 0 0 8px 0; font-size: 13px; font-weight: bold; color: ${dim.color};">
            💭 Personal Development Question:
          </p>
          <p style="margin: 0; color: #374151; font-size: 14px; font-style: italic;">
            ${reportData.statements[dim.key]?.personal_development_question || `How can you grow your ${dim.label.toLowerCase()}?`}
          </p>
        </div>
      </div>
    </div>
    `
  }).join('')}

  <!-- CTA Footer -->
  <div style="max-width: 600px; margin: 30px auto 20px; background: linear-gradient(135deg, #E91E8C 0%, #7C3AED 50%, #06B6D4 100%); padding: 40px; border-radius: 12px; text-align: center; color: white;">
    <h3 style="margin: 0 0 15px 0; font-size: 28px; font-weight: bold;">Interested in SPARK for Your School?</h3>
    <p style="margin: 0 0 25px 0; font-size: 16px; opacity: 0.95;">
      Join the first 20 schools to get <strong>FREE access for the entire first year!</strong>
    </p>
    <a href="https://www.spark.study" style="display: inline-block; background: white; color: #E91E8C; padding: 15px 40px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 18px;">
      Visit www.spark.study
    </a>
  </div>

  <!-- Footer -->
  <div style="max-width: 600px; margin: 20px auto; padding: 20px; text-align: center; color: #9ca3af; font-size: 12px;">
    <p style="margin: 0 0 5px 0;">
      <strong>SPARK</strong> - Developing Student Mindset
    </p>
    <p style="margin: 0;">
      © 2025 4Sight Education Ltd. All rights reserved.
    </p>
  </div>

</body>
</html>
  `.trim()
}

