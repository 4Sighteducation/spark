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
  const margin = 12
  let y = margin

  // Theme definitions with proper colors
  const themes = [
    { 
      key: 'self_direction',
      label: 'SELF-DIRECTION',
      subtitle: 'Taking initiative and being pro-active',
      color: { r: 6, g: 155, b: 170 }, // Teal/cyan
      lightBg: { r: 220, g: 245, b: 248 },
      jsonKey: 'SelfDirection'
    },
    { 
      key: 'purpose',
      label: 'PURPOSE',
      subtitle: 'Hope, aspirations and your sense of purpose',
      color: { r: 255, g: 140, b: 170 }, // Pink
      lightBg: { r: 255, g: 235, b: 243 },
      jsonKey: 'Purpose'
    },
    { 
      key: 'awareness',
      label: 'AWARENESS',
      subtitle: 'Working with others, empathy and fostering relationships',
      color: { r: 200, g: 50, b: 150 }, // Magenta
      lightBg: { r: 250, g: 230, b: 245 },
      jsonKey: 'Awareness'
    },
    { 
      key: 'resilience',
      label: 'RESILIENCE',
      subtitle: 'Grit, Perseverance and Reliability',
      color: { r: 150, g: 180, b: 50 }, // Olive/lime
      lightBg: { r: 242, g: 248, b: 220 },
      jsonKey: 'Resilience'
    },
    { 
      key: 'knowledge',
      label: 'KNOWLEDGE',
      subtitle: 'Curiosity, Attention and How You Value Education',
      color: { r: 100, g: 200, b: 150 }, // Teal/green
      lightBg: { r: 230, g: 248, b: 240 },
      jsonKey: 'Knowledge'
    },
  ]

  // Helper to get statement for dimension and score
  const getStatementData = (jsonKey: string, score: number) => {
    const dimData = (statementsData as any).SPARK[jsonKey]
    if (!dimData) return { statement: '', personal_development_question: '' }
    
    const breakpoint = dimData.breakpoints.find((bp: any) => {
      const [min, max] = bp.range.split('-').map(Number)
      return score >= min && score <= max
    })
    
    return breakpoint || { statement: '', personal_development_question: '' }
  }

  // ===== PAGE HEADER =====
  // SPARK Logo - Using base64!
  doc.addImage(iconBase64['spark-logo'], 'PNG', margin, y, 40, 20)
  
  // Student info table
  const tableX = margin + 50
  const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
  
  // Table headers (black background)
  doc.setFillColor(0, 0, 0)
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  
  const cols = [
    { label: 'Name', value: name, width: 42 },
    { label: 'Cycle', value: '1', width: 18 },
    { label: 'Group', value: '8A', width: 20 },
    { label: 'Date', value: today, width: 43 }
  ]
  
  let xPos = tableX
  cols.forEach(col => {
    doc.rect(xPos, y, col.width, 11, 'F')
    doc.text(col.label, xPos + col.width / 2, y + 7, { align: 'center' })
    xPos += col.width
  })
  
  // Table values (white background, pink border)
  doc.setDrawColor(233, 30, 140)
  doc.setLineWidth(0.8)
  xPos = tableX
  cols.forEach(col => {
    doc.setFillColor(255, 255, 255)
    doc.rect(xPos, y + 11, col.width, 11, 'FD')
    doc.setTextColor(0, 0, 0)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.text(col.value, xPos + col.width / 2, y + 18, { align: 'center' })
    xPos += col.width
  })
  
  y += 28

  // ===== WELCOME BOX =====
  doc.setDrawColor(233, 30, 140)
  doc.setLineWidth(1.5)
  doc.setFillColor(255, 245, 250)
  doc.roundedRect(margin, y, pageWidth - 2 * margin, 24, 3, 3, 'FD')
  
  doc.setTextColor(0, 0, 0)
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('Welcome to Your SPARK Report!', pageWidth / 2, y + 7, { align: 'center' })
  
  doc.setFontSize(7.5)
  doc.setFont('helvetica', 'normal')
  const welcome = 'This report highlights your strengths and areas to grow across five key themes: Self-Direction, Purpose, Awareness, Resilience, and Knowledge. These qualities help you succeed in school, build strong relationships, and develop a positive, curious mindset. Your SPARK journey is unique—use this report to reflect on your progress, celebrate successes, and set new goals. Remember, learning is a lifelong adventure, and you are in control of your growth!'
  const welcomeLines = doc.splitTextToSize(welcome, pageWidth - 2 * margin - 8)
  doc.text(welcomeLines, margin + 4, y + 13)
  
  y += 28

  // ===== SCORE CARDS ROW =====
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(80, 80, 80)
  doc.text('Your SPARK Scores:', margin, y)
  y += 5

  const cardWidth = (pageWidth - 2 * margin - 4) / 5
  const cardHeight = 22
  
  themes.forEach((theme, idx) => {
    const score = reportData.scores[theme.key]
    const cardX = margin + (idx * (cardWidth + 1))
    
    // Card background
    doc.setFillColor(theme.color.r, theme.color.g, theme.color.b)
    doc.setDrawColor(theme.color.r, theme.color.g, theme.color.b)
    doc.setLineWidth(0.5)
    doc.roundedRect(cardX, y, cardWidth, cardHeight, 2, 2, 'FD')
    
    // Dimension icon (if available)
    const iconKey = theme.key.replace('_', '-')
    if (iconBase64[iconKey]) {
      try {
        doc.addImage(iconBase64[iconKey], 'PNG', cardX + 2, y + 2, 8, 8)
      } catch (e) {
        // Icon failed to load, continue without it
      }
    }
    
    // Dimension name
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(6.5)
    doc.setFont('helvetica', 'bold')
    doc.text(theme.label, cardX + cardWidth / 2, y + 6, { align: 'center' })
    
    // Score
    doc.setFontSize(18)
    doc.setFont('helvetica', 'bold')
    doc.text(Math.round(score.score).toString(), cardX + cardWidth / 2, y + 15, { align: 'center' })
    
    // Band
    doc.setFontSize(5.5)
    doc.setFont('helvetica', 'normal')
    doc.text(score.band.replace('_', ' ').toUpperCase(), cardX + cardWidth / 2, y + 19, { align: 'center' })
  })
  
  y += cardHeight + 8

  // ===== EACH DIMENSION SECTION =====
  themes.forEach((theme) => {
    const score = reportData.scores[theme.key]
    const wholeScore = Math.round(score.score)
    const statementData = getStatementData(theme.jsonKey, score.score)
    
    // Check for new page
    if (y > 205) {
      doc.addPage()
      y = margin
    }

    // 1-10 Score visualization
    const boxSize = 9
    const boxGap = 0.8
    const totalWidth = (boxSize + boxGap) * 10 - boxGap
    const startX = (pageWidth - totalWidth) / 2
    
    for (let i = 1; i <= 10; i++) {
      const boxX = startX + ((i - 1) * (boxSize + boxGap))
      
      if (i === wholeScore) {
        doc.setFillColor(theme.color.r, theme.color.g, theme.color.b)
        doc.setDrawColor(theme.color.r, theme.color.g, theme.color.b)
      } else {
        doc.setFillColor(230, 230, 230)
        doc.setDrawColor(200, 200, 200)
      }
      
      doc.setLineWidth(0.5)
      doc.roundedRect(boxX, y, boxSize, boxSize, 1, 1, 'FD')
      
      doc.setTextColor(i === wholeScore ? 255 : 120, i === wholeScore ? 255 : 120, i === wholeScore ? 255 : 120)
      doc.setFontSize(7)
      doc.setFont('helvetica', 'bold')
      doc.text(i.toString(), boxX + boxSize / 2, y + 6.5, { align: 'center' })
    }
    
    y += boxSize + 5

    // ROW 1: Main Feedback Statement (VISIBLE TEXT!)
    const row1Height = 38
    doc.setDrawColor(233, 30, 140)
    doc.setLineWidth(1.5)
    doc.setFillColor(theme.lightBg.r, theme.lightBg.g, theme.lightBg.b)
    doc.roundedRect(margin, y, pageWidth - 2 * margin, row1Height, 2, 2, 'FD')
    
    // Add theme label with icon
    doc.setFillColor(theme.color.r, theme.color.g, theme.color.b)
    doc.roundedRect(margin + 3, y + 3, 55, 8, 1, 1, 'F')
    
    // Add dimension icon
    const iconKey = theme.key.replace('_', '-')
    if (iconBase64[iconKey]) {
      try {
        doc.addImage(iconBase64[iconKey], 'PNG', margin + 5, y + 4, 6, 6)
      } catch (e) {
        // Icon failed, continue
      }
    }
    
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'bold')
    doc.text(theme.label, margin + 33, y + 8, { align: 'center' })
    
    // Statement text - PROPERLY DISPLAYED
    doc.setTextColor(20, 20, 20)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    const statement = statementData.statement || `Great work in ${theme.label}!`
    const stmtLines = doc.splitTextToSize(statement, pageWidth - 2 * margin - 8)
    doc.text(stmtLines, margin + 4, y + 15)
    
    y += row1Height + 2

    // ROW 2: Personal Development Question
    const row2Height = 18
    doc.setDrawColor(233, 30, 140)
    doc.setLineWidth(1)
    doc.setFillColor(
      Math.max(0, theme.lightBg.r - 10),
      Math.max(0, theme.lightBg.g - 10),
      Math.max(0, theme.lightBg.b - 10)
    )
    doc.roundedRect(margin, y, pageWidth - 2 * margin, row2Height, 2, 2, 'FD')
    
    doc.setTextColor(theme.color.r, theme.color.g, theme.color.b)
    doc.setFontSize(7)
    doc.setFont('helvetica', 'bold')
    doc.text('Personal Development Question:', margin + 4, y + 5)
    
    doc.setTextColor(20, 20, 20)
    doc.setFont('helvetica', 'italic')
    const pdq = statementData.personal_development_question || ''
    if (pdq) {
      const pdqLines = doc.splitTextToSize(pdq, pageWidth - 2 * margin - 8)
      doc.text(pdqLines, margin + 4, y + 10)
    }
    
    y += row2Height + 2

    // ROW 3: Suggested Activities
    const row3Height = 12
    doc.setDrawColor(233, 30, 140)
    doc.setLineWidth(1)
    doc.setFillColor(
      Math.max(0, theme.lightBg.r - 20),
      Math.max(0, theme.lightBg.g - 20),
      Math.max(0, theme.lightBg.b - 20)
    )
    doc.roundedRect(margin, y, pageWidth - 2 * margin, row3Height, 2, 2, 'FD')
    
    doc.setTextColor(theme.color.r - 40, theme.color.g - 40, theme.color.b - 40)
    doc.setFontSize(7)
    doc.setFont('helvetica', 'bold')
    doc.text('Suggested Activities:', margin + 4, y + 5)
    
    doc.setTextColor(20, 20, 20)
    doc.setFont('helvetica', 'normal')
    const activities = getSuggestedActivities(theme.key)
    doc.text(activities, margin + 4, y + 9)
    
    y += row3Height + 5
  })

  // Footer
  if (y > pageHeight - 20) {
    doc.addPage()
    y = pageHeight - 15
  } else {
    y = pageHeight - 15
  }
  
  doc.setFontSize(8)
  doc.setTextColor(140, 140, 140)
  doc.setFont('helvetica', 'normal')
  doc.text('© 2025 4Sight Education Ltd', pageWidth / 2, y, { align: 'center' })
  doc.text('www.spark.study · Ages 11-14 · Key Stage 3', pageWidth / 2, y + 5, { align: 'center' })

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

