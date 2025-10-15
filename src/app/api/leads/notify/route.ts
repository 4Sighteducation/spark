import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, school, role, scores } = body

    // Determine if this is a staff member or student based on role
    const isStaff = ['Headteacher', 'Deputy Head', 'Head of Year', 'Teacher', 'SENCO', 'Other Education Professional', 'Other'].includes(role)

    // Email to send to you (Tony)
    const notificationEmail = isStaff 
      ? generateStaffLeadEmail(name, email, school, role, scores)
      : generateStudentCompletionEmail()

    // Send notification via SendGrid
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{
          to: [{ email: 'tony@4sighteducation.com', name: 'Tony Dennis' }],
          subject: isStaff 
            ? `🎯 SPARK Lead: ${name} from ${school}` 
            : '🎓 SPARK Demo Completed by Student',
        }],
        from: {
          email: 'noreply@spark.study',
          name: 'SPARK Notifications',
        },
        content: [{
          type: 'text/html',
          value: notificationEmail,
        }],
      }),
    })

    if (!response.ok) {
      console.error('SendGrid notification failed:', await response.text())
      // Don't fail the request if notification fails
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('Error sending notification:', error)
    // Don't fail - notifications are optional
    return NextResponse.json({ success: true }, { status: 200 })
  }
}

function generateStaffLeadEmail(name: string, email: string, school: string, role: string, scores: any): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
</head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #E91E8C 0%, #7C3AED 100%); padding: 30px; border-radius: 12px; color: white; margin-bottom: 20px;">
    <h1 style="margin: 0 0 10px 0; font-size: 28px;">🎯 New SPARK Lead!</h1>
    <p style="margin: 0; font-size: 16px;">A school professional has completed the demo</p>
  </div>

  <div style="background: #f9fafb; padding: 25px; border-radius: 12px; margin-bottom: 20px;">
    <h2 style="margin: 0 0 15px 0; color: #111827; font-size: 20px;">Contact Details:</h2>
    <table style="width: 100%; border-collapse: collapse;">
      <tr>
        <td style="padding: 8px 0; color: #6b7280; font-weight: bold;">Name:</td>
        <td style="padding: 8px 0; color: #111827;">${name}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: #6b7280; font-weight: bold;">Email:</td>
        <td style="padding: 8px 0; color: #111827;"><a href="mailto:${email}" style="color: #E91E8C;">${email}</a></td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: #6b7280; font-weight: bold;">School:</td>
        <td style="padding: 8px 0; color: #111827;">${school}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: #6b7280; font-weight: bold;">Role:</td>
        <td style="padding: 8px 0; color: #111827;">${role}</td>
      </tr>
    </table>
  </div>

  <div style="background: white; padding: 20px; border: 2px solid #e5e7eb; border-radius: 12px;">
    <h3 style="margin: 0 0 15px 0; color: #111827;">SPARK Scores:</h3>
    <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px; text-align: center;">
      <div>
        <div style="color: #6b7280; font-size: 12px; margin-bottom: 5px;">Self-Direction</div>
        <div style="font-size: 24px; font-weight: bold; color: #069BAA;">${scores?.self_direction?.score.toFixed(1) || 'N/A'}</div>
      </div>
      <div>
        <div style="color: #6b7280; font-size: 12px; margin-bottom: 5px;">Purpose</div>
        <div style="font-size: 24px; font-weight: bold; color: #FF8CB4;">${scores?.purpose?.score.toFixed(1) || 'N/A'}</div>
      </div>
      <div>
        <div style="color: #6b7280; font-size: 12px; margin-bottom: 5px;">Awareness</div>
        <div style="font-size: 24px; font-weight: bold; color: #C83296;">${scores?.awareness?.score.toFixed(1) || 'N/A'}</div>
      </div>
      <div>
        <div style="color: #6b7280; font-size: 12px; margin-bottom: 5px;">Resilience</div>
        <div style="font-size: 24px; font-weight: bold; color: #96B432;">${scores?.resilience?.score.toFixed(1) || 'N/A'}</div>
      </div>
      <div>
        <div style="color: #6b7280; font-size: 12px; margin-bottom: 5px;">Knowledge</div>
        <div style="font-size: 24px; font-weight: bold; color: #64C896;">${scores?.knowledge?.score.toFixed(1) || 'N/A'}</div>
      </div>
    </div>
  </div>

  <div style="margin-top: 20px; padding: 20px; background: #fef3c7; border-radius: 12px; border-left: 4px solid #f59e0b;">
    <p style="margin: 0; color: #92400e;">
      <strong>⚡ Action Required:</strong> Follow up with this lead within 24 hours for best conversion!
    </p>
  </div>

  <div style="margin-top: 20px; text-align: center; color: #9ca3af; font-size: 12px;">
    <p>SPARK Marketing Notification · www.spark.study</p>
  </div>
</body>
</html>
  `
}

function generateStudentCompletionEmail(): string {
  return `
A student has completed the SPARK questionnaire demo on www.spark.study.

This is just a test completion - no lead details captured.

---
SPARK Notifications
www.spark.study
  `
}

