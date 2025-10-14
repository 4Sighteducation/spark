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
    // SPARK Logo box - black background
    doc.setFillColor(0, 0, 0)
    doc.rect(margin, y, 40, 20, 'F')
    
    // SPARK text in pink
    doc.setTextColor(233, 30, 140)
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text('SPARK', margin + 20, y + 10, { align: 'center' })
    doc.setFontSize(6)
    doc.text('DEVELOPING STUDENT MINDSET', margin + 20, y + 15, { align: 'center' })
    
    // Student details table
    const tableX = margin + 45
    const tableY = y
    const cellHeight = 10
    const colWidths = [35, 20, 20, 40]
    
    // Header row - black background
    doc.setFillColor(0, 0, 0)
    let xPos = tableX
    const headers = ['Name', 'Cycle', 'Group', 'Date']
    headers.forEach((header, i) => {
      doc.rect(xPos, tableY, colWidths[i], cellHeight, 'F')
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(9)
      doc.setFont('helvetica', 'bold')
      doc.text(header, xPos + colWidths[i] / 2, tableY + 7, { align: 'center' })
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
      doc.setFontSize(9)
      doc.setFont('helvetica', 'normal')
      doc.text(value, xPos + colWidths[i] / 2, tableY + cellHeight + 7, { align: 'center' })
      xPos += colWidths[i]
    })
    
    y += 25
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

  // Add score cards section (5 cards across top of page after welcome)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(100, 100, 100)
  doc.text('Your SPARK Scores:', margin, y)
  y += 6

  const cardWidth = 37
  const cardHeight = 25
  const cardGap = 1.5
  
  dimensions.forEach((dim, idx) => {
    const score = reportData.scores[dim.key]
    const cardX = margin + (idx * (cardWidth + cardGap))
    
    // Score card background
    doc.setFillColor(dim.color[0], dim.color[1], dim.color[2])
    doc.setDrawColor(233, 30, 140)
    doc.setLineWidth(0.5)
    doc.roundedRect(cardX, y, cardWidth, cardHeight, 2, 2, 'FD')
    
    // Dimension name
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'bold')
    doc.text(dim.label, cardX + cardWidth / 2, y + 6, { align: 'center' })
    
    // Score
    doc.setFontSize(18)
    doc.text(score.score.toFixed(1), cardX + cardWidth / 2, y + 16, { align: 'center' })
    
    // Band
    doc.setFontSize(6)
    doc.setFont('helvetica', 'normal')
    doc.text(score.band.replace('_', ' ').toUpperCase(), cardX + cardWidth / 2, y + 21, { align: 'center' })
  })
  
  y += cardHeight + 8

  // Dimensions - Each as full-width section
  dimensions.forEach((dim, index) => {
    const score = reportData.scores[dim.key]
    
    // Check if we need a new page
    if (y > 210) {
      doc.addPage()
      y = margin
      addHeader()
    }

    // Two-column layout: Icon box (40mm) + Content box (rest)
    const iconBoxWidth = 40
    const contentX = margin + iconBoxWidth + 2
    const contentWidth = pageWidth - contentX - margin
    
    // LEFT: Colored box with icon and dimension name
    doc.setFillColor(dim.color[0], dim.color[1], dim.color[2])
    doc.roundedRect(margin, y, iconBoxWidth, 75, 2, 2, 'F')
    
    // Dimension label in white
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(13)
    doc.setFont('helvetica', 'bold')
    const labelLines = doc.splitTextToSize(dim.label, 35)
    doc.text(labelLines, margin + iconBoxWidth / 2, y + 35, { align: 'center' })
    
    doc.setFontSize(7)
    doc.setFont('helvetica', 'italic')
    const subtitleLines = doc.splitTextToSize(dim.subtitle, 35)
    doc.text(subtitleLines, margin + iconBoxWidth / 2, y + 50, { align: 'center', maxWidth: 35 })
    
    // RIGHT: Three stacked rows (Comment, Question, Activities)
    let contentY = y
    
    // ROW 1: Feedback Statement
    const commentHeight = 30
    doc.setDrawColor(233, 30, 140)
    doc.setLineWidth(1)
    doc.setFillColor(dim.bgColor[0], dim.bgColor[1], dim.bgColor[2])
    doc.roundedRect(contentX, contentY, contentWidth, commentHeight, 2, 2, 'FD')
    
    doc.setTextColor(0, 0, 0)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    const statement = reportData.statements[dim.key]?.statement || `You show strong ${dim.label} skills.`
    const statementLines = doc.splitTextToSize(statement, contentWidth - 6)
    doc.text(statementLines, contentX + 3, contentY + 5)
    
    contentY += commentHeight + 1
    
    // ROW 2: Personal Development Question
    const questionHeight = 18
    doc.setFillColor(dim.bgColor[0] - 10, dim.bgColor[1] - 10, dim.bgColor[2] - 10)
    doc.roundedRect(contentX, contentY, contentWidth, questionHeight, 2, 2, 'FD')
    
    doc.setFontSize(7)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(dim.color[0], dim.color[1], dim.color[2])
    doc.text('Personal Development Question:', contentX + 3, contentY + 5)
    
    doc.setFont('helvetica', 'italic')
    doc.setTextColor(0, 0, 0)
    doc.setFontSize(7)
    const question = reportData.statements[dim.key]?.personal_development_question || 
                     `How can you grow your ${dim.label.toLowerCase()}?`
    const questionLines = doc.splitTextToSize(question, contentWidth - 6)
    doc.text(questionLines, contentX + 3, contentY + 10)
    
    contentY += questionHeight + 1
    
    // ROW 3: Suggested Activities
    const activitiesHeight = 12
    doc.setFillColor(dim.bgColor[0] - 20, dim.bgColor[1] - 20, dim.bgColor[2] - 20)
    doc.roundedRect(contentX, contentY, contentWidth, activitiesHeight, 2, 2, 'FD')
    
    doc.setFontSize(7)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(dim.color[0], dim.color[1], dim.color[2])
    doc.text('Suggested Activities:', contentX + 3, contentY + 5)
    
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(0, 0, 0)
    doc.text(getSuggestedActivities(dim.key), contentX + 3, contentY + 9)
    
    y += 77 // Total height + gap
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

