import { jsPDF } from 'jspdf'

export function generateReportPDF(
  name: string,
  reportData: any
): { pdfBase64: string; fileName: string } {
  const doc = new jsPDF('p', 'mm', 'a4')
  const pageWidth = 210
  const pageHeight = 297
  const margin = 10
  let y = margin

  const dimensions = [
    { 
      key: 'self_direction', 
      label: 'SELF-DIRECTION', 
      subtitle: 'Taking initiative and being pro-active',
      color: [6, 155, 170], // Blue from sample report
      bgColor: [220, 240, 245]
    },
    { 
      key: 'purpose', 
      label: 'PURPOSE', 
      subtitle: 'Hope, aspirations and your sense of purpose',
      color: [255, 150, 180], // Pink from sample report
      bgColor: [255, 235, 240]
    },
    { 
      key: 'awareness', 
      label: 'AWARENESS', 
      subtitle: 'Working with others, empathy and fostering relationships',
      color: [200, 50, 150], // Magenta from sample report
      bgColor: [250, 230, 245]
    },
    { 
      key: 'resilience', 
      label: 'RESILIENCE', 
      subtitle: 'Grit, Perseverance and Reliability',
      color: [150, 180, 50], // Olive/lime from sample report
      bgColor: [240, 250, 220]
    },
    { 
      key: 'knowledge', 
      label: 'KNOWLEDGE', 
      subtitle: 'Curiosity, Attention and How You Value Education',
      color: [100, 200, 150], // Teal from sample report  
      bgColor: [230, 250, 240]
    },
  ]

  // Helper function to add page header
  const addHeader = () => {
    // Black background for logo area
    doc.setFillColor(0, 0, 0)
    doc.rect(margin, y, 50, 25, 'F')
    
    // SPARK text on black background
    doc.setTextColor(233, 30, 140) // Pink
    doc.setFontSize(18)
    doc.setFont('helvetica', 'bold')
    doc.text('SPARK', margin + 25, y + 12, { align: 'center' })
    doc.setFontSize(7)
    doc.text('DEVELOPING STUDENT MINDSET', margin + 25, y + 18, { align: 'center' })
    
    // Student details table
    const tableX = margin + 55
    const tableY = y
    const cellHeight = 8
    const colWidths = [30, 35, 25, 35]
    
    // Header row - black background
    doc.setFillColor(0, 0, 0)
    let xPos = tableX
    const headers = ['Name', 'Cycle', 'Group', 'Date']
    headers.forEach((header, i) => {
      doc.rect(xPos, tableY, colWidths[i], cellHeight, 'F')
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(8)
      doc.setFont('helvetica', 'bold')
      doc.text(header, xPos + colWidths[i] / 2, tableY + 5.5, { align: 'center' })
      xPos += colWidths[i]
    })
    
    // Data row - white background with pink border
    xPos = tableX
    const today = new Date().toLocaleDateString('en-GB')
    const values = [name, '1', '8A', today]
    
    doc.setDrawColor(233, 30, 140)
    doc.setLineWidth(0.5)
    
    values.forEach((value, i) => {
      doc.setFillColor(255, 255, 255)
      doc.rect(xPos, tableY + cellHeight, colWidths[i], cellHeight, 'FD')
      doc.setTextColor(0, 0, 0)
      doc.setFontSize(8)
      doc.setFont('helvetica', 'normal')
      doc.text(value, xPos + colWidths[i] / 2, tableY + cellHeight + 5.5, { align: 'center' })
      xPos += colWidths[i]
    })
    
    y += 30
  }

  // Add first page header
  addHeader()

  // Welcome box with pink border
  doc.setDrawColor(233, 30, 140)
  doc.setLineWidth(1)
  doc.setFillColor(255, 245, 250)
  doc.roundedRect(margin, y, pageWidth - 2 * margin, 22, 2, 2, 'FD')
  
  doc.setTextColor(0, 0, 0)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('Welcome to Your SPARK Report!', pageWidth / 2, y + 6, { align: 'center' })
  
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  const welcomeText = doc.splitTextToSize(
    'This report highlights your strengths and areas to grow across five key themes: Self-Direction, Purpose, Awareness, Resilience, and Knowledge. These qualities help you succeed in school, build strong relationships, and develop a positive, curious mindset. Your SPARK journey is unique—use this report to reflect on your progress, celebrate successes, and set new goals. Remember, learning is a lifelong adventure, and you are in control of your growth!',
    pageWidth - 2 * margin - 6
  )
  doc.text(welcomeText, pageWidth / 2, y + 11, { align: 'center', maxWidth: pageWidth - 2 * margin - 6 })
  
  y += 26

  // Dimensions - matching sample report layout
  dimensions.forEach((dim, index) => {
    const score = reportData.scores[dim.key]
    
    // Check if we need a new page
    if (y > 220) {
      doc.addPage()
      y = margin
      addHeader()
    }

    // Dimension section with two-column layout
    const sectionHeight = 70 // Approximate, will adjust
    
    // Left column - Colored box with dimension name (50mm wide)
    doc.setFillColor(dim.color[0], dim.color[1], dim.color[2])
    doc.roundedRect(margin, y, 50, sectionHeight, 2, 2, 'F')
    
    // Dimension label in white
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    const labelLines = doc.splitTextToSize(dim.label, 45)
    doc.text(labelLines, margin + 25, y + 25, { align: 'center' })
    
    doc.setFontSize(8)
    doc.setFont('helvetica', 'italic')
    const subtitleLines = doc.splitTextToSize(dim.subtitle, 45)
    doc.text(subtitleLines, margin + 25, y + 35, { align: 'center' })
    
    // Right column - Pink bordered box with feedback (140mm wide)
    const rightX = margin + 52
    const rightWidth = pageWidth - rightX - margin
    
    doc.setDrawColor(233, 30, 140)
    doc.setLineWidth(1)
    doc.setFillColor(dim.bgColor[0], dim.bgColor[1], dim.bgColor[2])
    doc.roundedRect(rightX, y, rightWidth, sectionHeight, 2, 2, 'FD')
    
    // Feedback text
    doc.setTextColor(0, 0, 0)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    
    const statement = reportData.statements[dim.key]?.statement || 
                      `You show strong ${dim.label.toLowerCase()} skills.`
    const statementLines = doc.splitTextToSize(statement, rightWidth - 6)
    doc.text(statementLines, rightX + 3, y + 5)
    
    const textHeight = statementLines.length * 3.5
    let questionY = y + 5 + textHeight + 3
    
    // Personal Development Question
    if (reportData.statements[dim.key]?.personal_development_question) {
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(dim.color[0], dim.color[1], dim.color[2])
      doc.setFontSize(7)
      doc.text('Personal Development Question:', rightX + 3, questionY)
      questionY += 4
      
      doc.setFont('helvetica', 'italic')
      doc.setTextColor(0, 0, 0)
      const questionLines = doc.splitTextToSize(
        reportData.statements[dim.key].personal_development_question,
        rightWidth - 6
      )
      doc.text(questionLines, rightX + 3, questionY)
      questionY += questionLines.length * 3.5 + 2
    }
    
    // Suggested Activities
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(dim.color[0], dim.color[1], dim.color[2])
    doc.setFontSize(7)
    doc.text('Suggested Activities:', rightX + 3, questionY)
    questionY += 4
    
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(0, 0, 0)
    doc.setFontSize(7)
    // Sample activities based on dimension
    const activities = getSuggestedActivities(dim.key)
    doc.text(activities, rightX + 3, questionY)
    
    y += sectionHeight + 3
  })

  // Footer
  doc.setFontSize(8)
  doc.setTextColor(150, 150, 150)
  doc.setFont('helvetica', 'normal')
  doc.text('© 2025 4Sight Education Ltd · www.spark.study · Ages 11-14 · Key Stage 3', 
           pageWidth / 2, pageHeight - 10, { align: 'center' })

  // Generate base64
  const pdfBase64 = doc.output('datauristring').split(',')[1]
  const fileName = `SPARK_Report_${name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`

  return {
    pdfBase64,
    fileName,
  }
}

// Helper to get suggested activities per dimension
function getSuggestedActivities(dimension: string): string {
  const activities: Record<string, string> = {
    self_direction: 'Two-Minute Takeoff, First Domino, Risk Tokens',
    purpose: 'Purpose Circles, Future-Me Interview, Values to Verbs',
    awareness: 'Listening Ladders, Empathy Walk, Team Reliability Pact',
    resilience: 'Recovery Reframes, Pomodoro Ladder, Plan B Playbook',
    knowledge: 'Curiosity Tickets, Feynman Flip, Extension Quest',
  }
  return activities[dimension] || 'Custom activities based on your profile'
}

