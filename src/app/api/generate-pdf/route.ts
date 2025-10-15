import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, reportData, school } = body

    // Validation
    if (!name || !reportData) {
      return NextResponse.json({ error: 'Missing required data' }, { status: 400 })
    }

    // Dynamic import - only load at runtime, not build time
    const puppeteer = (await import('puppeteer-core')).default
    const chromium = (await import('@sparticuz/chromium')).default

    // Encode report data for URL
    const encodedData = encodeURIComponent(JSON.stringify({
      name,
      scores: reportData,
      school,
    }))

    // Build the print URL
    const printUrl = `${process.env.NEXT_PUBLIC_APP_URL}/print-report?data=${encodedData}`

    // Launch Puppeteer with Chromium
    const browser = await puppeteer.launch({
      args: [...chromium.args, '--no-sandbox', '--disable-setuid-sandbox'],
      executablePath: await chromium.executablePath(),
      headless: true,
    })

    const page = await browser.newPage()

    // Navigate to the print page
    await page.goto(printUrl, {
      waitUntil: 'networkidle0',
      timeout: 30000,
    })

    // Wait for images to load
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Generate PDF
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '0mm',
        right: '0mm',
        bottom: '0mm',
        left: '0mm',
      },
    })

    await browser.close()

    // Convert Buffer to base64
    const pdfBase64 = Buffer.from(pdf).toString('base64')
    const fileName = `SPARK_Report_${name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`

    return NextResponse.json(
      { 
        pdfBase64,
        fileName,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('PDF generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate PDF', details: String(error) },
      { status: 500 }
    )
  }
}

// Increase timeout for PDF generation
export const maxDuration = 30

