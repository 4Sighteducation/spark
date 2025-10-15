import { jsPDF } from 'jspdf'
import statementsData from '@/data/statements.json'
import { iconBase64 } from './iconBase64'

export function generateReportPDF(
  name: string,
  reportData: any
): { pdfBase64: string; fileName: string } {
  const doc = new jsPDF('p', 'mm', 'a4')
  const pageWidth = 210
  const pageHeight = 297
  const margin = 10
  let y = margin

  // Theme definitions - MATCHING YOUR SAMPLE COLORS
  const themes = [
    { 
      key: 'self_direction',
      label: 'SELF-DIRECTION',
      subtitle: 'Taking initiative and being pro-active',
      mainColor: [6, 155, 170], // Teal
      lightBg: [230, 248, 252],
      jsonKey: 'SelfDirection'
    },
    { 
      key: 'purpose',
      label: 'PURPOSE',
      subtitle: 'Hope, aspirations and your sense of purpose',
      mainColor: [255, 140, 180], // Pink
      lightBg: [255, 240, 248],
      jsonKey: 'Purpose'
    },
    { 
      key: 'awareness',
      label: 'AWARENESS',
      subtitle: 'Working with others, empathy and fostering relationships',
      mainColor: [200, 50, 150], // Magenta
      lightBg: [252, 235, 248],
      jsonKey: 'Awareness'
    },
    { 
      key: 'resilience',
      label: 'RESILIENCE',
      subtitle: 'Grit, Perseverance and Reliability',
      mainColor: [150, 180, 50], // Lime
      lightBg: [245, 250, 230],
      jsonKey: 'Resilience'
    },
    { 
      key: 'knowledge',
      label: 'KNOWLEDGE',
      subtitle: 'Curiosity, Attention and How You Value Education',
      mainColor: [100, 200, 150], // Teal/green
      lightBg: [238, 252, 245],
      jsonKey: 'Knowledge'
    },
  ]

  // Get statement for dimension
  const getStatementData = (jsonKey: string, score: number) => {
    const dimData = (statementsData as any).SPARK[jsonKey]
    if (!dimData) return { statement: 'Great progress!', personal_development_question: '' }
    
    const breakpoint = dimData.breakpoints.find((bp: any) => {
      const [min, max] = bp.range.split('-').map(Number)
      return score >= min && score <= max
    })
    
    return breakpoint || { statement: 'Great progress!', personal_development_question: '' }
  }

  // ===== HEADER =====
  // SPARK Logo - using base64 image
  try {
    const logoKey = 'spark-logo' as keyof typeof iconBase64
    doc.addImage(iconBase64[logoKey], 'PNG', margin, y, 45, 22)
  } catch (error) {
    // Fallback if image fails
    doc.setFillColor(0, 0, 0)
    doc.rect(margin, y, 45, 22, 'F')
    doc.setTextColor(233, 30, 140)
    doc.setFontSize(22)
    doc.setFont('helvetica', 'bold')
    doc.text('SPARK', margin + 22.5, y + 12, { align: 'center' })
    doc.setFontSize(6.5)
    doc.text('DEVELOPING STUDENT MINDSET', margin + 22.5, y + 17, { align: 'center' })
  }
  
  // Student info table
  const tableX = margin + 50
  const today = new Date().toLocaleDateString('en-GB')
  
  // Table header row (black background)
  doc.setFillColor(0, 0, 0)
  const cols = [
    { label: 'Name', value: name, width: 42 },
    { label: 'Cycle', value: '1', width: 18 },
    { label: 'Group', value: '8A', width: 20 },
    { label: 'Date', value: today, width: 43 }
  ]
  
  let xPos = tableX
  cols.forEach(col => {
    doc.rect(xPos, y, col.width, 11, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text(col.label, xPos + col.width / 2, y + 7.5, { align: 'center' })
    xPos += col.width
  })
  
  // Table data row (white with PINK BORDER)
  doc.setDrawColor(233, 30, 140)
  doc.setLineWidth(1.5)
  xPos = tableX
  cols.forEach(col => {
    doc.setFillColor(255, 255, 255)
    doc.rect(xPos, y + 11, col.width, 11, 'FD')
    doc.setTextColor(0, 0, 0)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(col.value, xPos + col.width / 2, y + 18.5, { align: 'center' })
    xPos += col.width
  })
  
  y += 28

  // ===== WELCOME BOX =====
  doc.setDrawColor(233, 30, 140)
  doc.setLineWidth(2)
  doc.setFillColor(255, 245, 252)
  doc.roundedRect(margin, y, pageWidth - 2 * margin, 26, 3, 3, 'FD')
  
  doc.setTextColor(0, 0, 0)
  doc.setFontSize(13)
  doc.setFont('helvetica', 'bold')
  doc.text('Welcome to Your SPARK Report!', pageWidth / 2, y + 8, { align: 'center' })
  
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  const welcome = 'This report highlights your strengths and areas to grow across five key themes: Self-Direction, Purpose, Awareness, Resilience, and Knowledge. These qualities help you succeed in school, build strong relationships, and develop a positive, curious mindset. Your SPARK journey is unique—use this report to reflect on your progress, celebrate successes, and set new goals. Remember, learning is a lifelong adventure, and you are in control of your growth!'
  const welcomeLines = doc.splitTextToSize(welcome, pageWidth - 2 * margin - 10)
  doc.text(welcomeLines, margin + 5, y + 14)
  
  y += 30

  // ===== SCORE CARDS - BOLD AND DISTINCT =====
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(60, 60, 60)
  doc.text('Your SPARK Scores:', margin, y)
  y += 6

  const cardWidth = (pageWidth - 2 * margin - 8) / 5
  const cardHeight = 26
  
  themes.forEach((theme, idx) => {
    const score = reportData.scores[theme.key]
    const cardX = margin + (idx * (cardWidth + 2))
    
    // BOLD colored card
    doc.setFillColor(...theme.mainColor)
    doc.setDrawColor(0, 0, 0)
    doc.setLineWidth(0.8)
    doc.roundedRect(cardX, y, cardWidth, cardHeight, 3, 3, 'FD')
    
    // Add dimension icon at top of card
    const iconKey = theme.key.replace('_', '-') as keyof typeof iconBase64
    try {
      if (iconBase64[iconKey]) {
        doc.addImage(iconBase64[iconKey], 'PNG', cardX + cardWidth/2 - 4, y + 2, 8, 8)
      }
    } catch (error) {
      // Icon failed - continue without it
    }
    
    // Dimension name in white
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(6.5)
    doc.setFont('helvetica', 'bold')
    doc.text(theme.label, cardX + cardWidth / 2, y + 12, { align: 'center' })
    
    // SCORE - Large and prominent
    doc.setFontSize(22)
    doc.setFont('helvetica', 'bold')
    doc.text(Math.round(score.score).toString(), cardX + cardWidth / 2, y + 17, { align: 'center' })
    
    // Band
    doc.setFontSize(6)
    doc.setFont('helvetica', 'normal')
    doc.text(score.band.replace('_', ' ').toUpperCase(), cardX + cardWidth / 2, y + 22, { align: 'center' })
  })
  
  y += cardHeight + 10

  // ===== EACH DIMENSION SECTION - BOLD AND DISTINCT =====
  themes.forEach((theme) => {
    const score = reportData.scores[theme.key]
    const wholeScore = Math.round(score.score)
    const statementData = getStatementData(theme.jsonKey, score.score)
    
    if (y > 200) {
      doc.addPage()
      y = margin + 10
    }

    // 1-10 SCORE LINE - Styled with theme colors, FULL WIDTH
    const boxSize = 11
    const boxGap = 1
    const totalBoxWidth = (boxSize + boxGap) * 10 - boxGap
    const lineStartX = (pageWidth - totalBoxWidth) / 2
    
    for (let i = 1; i <= 10; i++) {
      const boxX = lineStartX + ((i - 1) * (boxSize + boxGap))
      
      if (i === wholeScore) {
        // Highlighted box in theme color
        doc.setFillColor(...theme.mainColor)
        doc.setDrawColor(...theme.mainColor)
        doc.setLineWidth(2)
      } else {
        // Gray box
        doc.setFillColor(235, 235, 235)
        doc.setDrawColor(200, 200, 200)
        doc.setLineWidth(0.5)
      }
      
      doc.roundedRect(boxX, y, boxSize, boxSize, 2, 2, 'FD')
      
      // Number
      doc.setTextColor(i === wholeScore ? 255 : 100, i === wholeScore ? 255 : 100, i === wholeScore ? 255 : 100)
      doc.setFontSize(8)
      doc.setFont('helvetica', 'bold')
      doc.text(i.toString(), boxX + boxSize / 2, y + 7.5, { align: 'center' })
    }
    
    y += boxSize + 6

    // DIMENSION HEADER BAR - BOLD with theme color and icon
    doc.setFillColor(...theme.mainColor)
    doc.roundedRect(margin, y, pageWidth - 2 * margin, 12, 2, 2, 'F')
    
    // Add dimension icon to header
    const iconKey = theme.key.replace('_', '-') as keyof typeof iconBase64
    try {
      if (iconBase64[iconKey]) {
        doc.addImage(iconBase64[iconKey], 'PNG', margin + 3, y + 2, 8, 8)
      }
    } catch (error) {
      // Icon failed - continue
    }
    
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text(theme.label, margin + 15, y + 8)
    
    doc.setFontSize(7)
    doc.setFont('helvetica', 'italic')
    doc.text(theme.subtitle, pageWidth - margin - 5, y + 8, { align: 'right' })
    
    y += 14

    // ROW 1: FEEDBACK STATEMENT - with generous padding
    const row1Height = 42
    doc.setDrawColor(233, 30, 140)
    doc.setLineWidth(2)
    doc.setFillColor(...theme.lightBg)
    doc.roundedRect(margin, y, pageWidth - 2 * margin, row1Height, 3, 3, 'FD')
    
    // Statement text - BLACK, readable
    doc.setTextColor(30, 30, 30)
    doc.setFontSize(8.5)
    doc.setFont('helvetica', 'normal')
    const statement = statementData.statement
    const stmtLines = doc.splitTextToSize(statement, pageWidth - 2 * margin - 10)
    doc.text(stmtLines, margin + 5, y + 6)
    
    y += row1Height + 3

    // ROW 2: PERSONAL DEVELOPMENT QUESTION - slightly darker background
    const row2Height = 20
    doc.setDrawColor(233, 30, 140)
    doc.setLineWidth(2)
    doc.setFillColor(
      Math.max(0, theme.lightBg[0] - 15),
      Math.max(0, theme.lightBg[1] - 15),
      Math.max(0, theme.lightBg[2] - 15)
    )
    doc.roundedRect(margin, y, pageWidth - 2 * margin, row2Height, 3, 3, 'FD')
    
    doc.setTextColor(...theme.mainColor)
    doc.setFontSize(7.5)
    doc.setFont('helvetica', 'bold')
    doc.text('Personal Development Question:', margin + 5, y + 6)
    
    doc.setTextColor(30, 30, 30)
    doc.setFont('helvetica', 'italic')
    doc.setFontSize(8)
    const pdq = statementData.personal_development_question
    if (pdq) {
      const pdqLines = doc.splitTextToSize(pdq, pageWidth - 2 * margin - 10)
      doc.text(pdqLines, margin + 5, y + 11)
    }
    
    y += row2Height + 3

    // ROW 3: SUGGESTED ACTIVITIES - even darker background
    const row3Height = 14
    doc.setDrawColor(233, 30, 140)
    doc.setLineWidth(2)
    doc.setFillColor(
      Math.max(0, theme.lightBg[0] - 25),
      Math.max(0, theme.lightBg[1] - 25),
      Math.max(0, theme.lightBg[2] - 25)
    )
    doc.roundedRect(margin, y, pageWidth - 2 * margin, row3Height, 3, 3, 'FD')
    
    doc.setTextColor(...theme.mainColor)
    doc.setFontSize(7.5)
    doc.setFont('helvetica', 'bold')
    doc.text('Suggested Activities:', margin + 5, y + 6)
    
    doc.setTextColor(30, 30, 30)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    const activities = getSuggestedActivities(theme.key)
    doc.text(activities, margin + 5, y + 11)
    
    y += row3Height + 8
  })

  // Footer
  doc.setFontSize(8)
  doc.setTextColor(130, 130, 130)
  doc.text('© 2025 4Sight Education Ltd · www.spark.study · Ages 11-14', pageWidth / 2, pageHeight - 8, { align: 'center' })

  const pdfBase64 = doc.output('datauristring').split(',')[1]
  const fileName = `SPARK_Report_${name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`

  return { pdfBase64, fileName }
}

function getSuggestedActivities(dimension: string): string {
  const activities: Record<string, string> = {
    self_direction: 'Two-Minute Takeoff, First Domino, Risk Tokens',
    purpose: 'Purpose Circles, Future-Me Interview, Values to Verbs',
    awareness: 'Listening Ladders, Empathy Walk, Team Reliability Pact',
    resilience: 'Recovery Reframes, Pomodoro Ladder, Plan B Playbook',
    knowledge: 'Curiosity Tickets, Feynman Flip, Extension Quest',
  }
  return activities[dimension] || ''
}

