import { jsPDF } from 'jspdf'

export function generateReportPDF(
  name: string,
  reportData: any
): { pdfBase64: string; fileName: string } {
  const doc = new jsPDF('p', 'mm', 'a4')
  const pageWidth = 210
  const pageHeight = 297
  let y = 20

  const dimensions = [
    { key: 'self_direction', label: 'Self-Direction', color: [233, 30, 140], subtitle: 'Taking initiative and being pro-active' },
    { key: 'purpose', label: 'Purpose', color: [124, 58, 237], subtitle: 'Hope, aspirations and your sense of purpose' },
    { key: 'awareness', label: 'Awareness', color: [6, 182, 212], subtitle: 'Working with others, empathy and fostering relationships' },
    { key: 'resilience', label: 'Resilience', color: [132, 204, 22], subtitle: 'Diligence, reliability, never giving up' },
    { key: 'knowledge', label: 'Knowledge', color: [251, 191, 36], subtitle: 'Curiosity, attention, role of student' },
  ]

  // Header with gradient effect
  doc.setFillColor(233, 30, 140)
  doc.rect(0, 0, pageWidth, 50, 'F')
  
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(32)
  doc.setFont('helvetica', 'bold')
  doc.text('SPARK', pageWidth / 2, 25, { align: 'center' })
  
  doc.setFontSize(14)
  doc.setFont('helvetica', 'normal')
  doc.text('Developing Student Mindset', pageWidth / 2, 35, { align: 'center' })

  y = 60

  // Student name
  doc.setTextColor(0, 0, 0)
  doc.setFontSize(24)
  doc.setFont('helvetica', 'bold')
  doc.text(`${name}'s SPARK Report`, pageWidth / 2, y, { align: 'center' })
  y += 15

  // Welcome message
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(100, 100, 100)
  const welcomeText = doc.splitTextToSize(
    'This report highlights your strengths and areas to grow across five key themes. Your SPARK journey is unique—use this to reflect on progress and set new goals.',
    170
  )
  doc.text(welcomeText, pageWidth / 2, y, { align: 'center' })
  y += welcomeText.length * 5 + 10

  // Overall Score Box
  doc.setFillColor(245, 245, 245)
  doc.roundedRect(20, y, 170, 40, 3, 3, 'F')
  
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(50, 50, 50)
  doc.text('Overall SPARK Score', pageWidth / 2, y + 10, { align: 'center' })
  
  doc.setFontSize(36)
  doc.setTextColor(233, 30, 140)
  doc.text(reportData.scores.overall.score.toFixed(1), pageWidth / 2, y + 28, { align: 'center' })
  
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(124, 58, 237)
  doc.text(reportData.scores.overall.band.replace('_', ' ').toUpperCase(), pageWidth / 2, y + 36, { align: 'center' })
  
  y += 50

  // Dimensions
  dimensions.forEach((dim, index) => {
    const score = reportData.scores[dim.key]
    
    // Check if we need a new page
    if (y > 240) {
      doc.addPage()
      y = 20
    }

    // Dimension header
    doc.setFillColor(dim.color[0], dim.color[1], dim.color[2])
    doc.rect(20, y, 170, 12, 'F')
    
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text(dim.label, 25, y + 8)
    
    doc.setFontSize(18)
    doc.text(score.score.toFixed(1), 185, y + 8, { align: 'right' })
    
    y += 15

    // Subtitle
    doc.setTextColor(100, 100, 100)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'italic')
    doc.text(dim.subtitle, 25, y)
    y += 6

    // Progress bar
    doc.setFillColor(230, 230, 230)
    doc.roundedRect(25, y, 160, 6, 2, 2, 'F')
    
    doc.setFillColor(dim.color[0], dim.color[1], dim.color[2])
    const barWidth = (score.score / 10) * 160
    doc.roundedRect(25, y, barWidth, 6, 2, 2, 'F')
    y += 10

    // Band label
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(dim.color[0], dim.color[1], dim.color[2])
    doc.text(score.band.replace('_', ' ').toUpperCase(), 25, y)
    y += 6

    // Feedback statement
    doc.setFillColor(250, 250, 250)
    doc.roundedRect(20, y, 170, 2, 2, 2, 'F') // Spacer
    y += 4
    
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(60, 60, 60)
    
    const statement = reportData.statements[dim.key]?.statement || `Great work in ${dim.label}!`
    const statementLines = doc.splitTextToSize(statement, 165)
    
    // Check if statement fits on page
    if (y + (statementLines.length * 4) > 280) {
      doc.addPage()
      y = 20
    }
    
    doc.text(statementLines, 25, y)
    y += statementLines.length * 4 + 5

    // Development question
    if (reportData.statements[dim.key]?.personal_development_question) {
      doc.setFillColor(dim.color[0], dim.color[1], dim.color[2], 20)
      const boxHeight = 18
      doc.roundedRect(25, y, 160, boxHeight, 2, 2, 'F')
      
      doc.setFontSize(8)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(dim.color[0], dim.color[1], dim.color[2])
      doc.text('💭 Personal Development Question:', 30, y + 5)
      
      doc.setFont('helvetica', 'italic')
      doc.setTextColor(60, 60, 60)
      const questionLines = doc.splitTextToSize(
        reportData.statements[dim.key].personal_development_question,
        150
      )
      doc.text(questionLines, 30, y + 10)
      y += boxHeight + 5
    }

    y += 8 // Space between dimensions
  })

  // Footer on last page
  if (y > 250) {
    doc.addPage()
    y = 240
  } else {
    y = 270
  }

  doc.setFillColor(245, 245, 245)
  doc.rect(0, y, pageWidth, 30, 'F')
  
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(100, 100, 100)
  doc.text('www.spark.study', pageWidth / 2, y + 10, { align: 'center' })
  
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.text('© 2025 4Sight Education Ltd. All rights reserved.', pageWidth / 2, y + 16, { align: 'center' })
  doc.text('Ages 11-14 · Key Stage 3 · Powered by 4Sight Education', pageWidth / 2, y + 21, { align: 'center' })

  // Generate base64
  const pdfBase64 = doc.output('datauristring').split(',')[1]
  const fileName = `SPARK_Report_${name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`

  return {
    pdfBase64,
    fileName,
  }
}

