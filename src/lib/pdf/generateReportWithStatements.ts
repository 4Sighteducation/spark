import { jsPDF } from 'jspdf'
import statementsData from '@/data/statements.json'

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
      color: [6, 155, 170],
      jsonKey: 'SelfDirection'
    },
    { 
      key: 'purpose', 
      label: 'PURPOSE', 
      subtitle: 'Hope, aspirations and your sense of purpose',
      color: [255, 150, 180],
      jsonKey: 'Purpose'
    },
    { 
      key: 'awareness', 
      label: 'AWARENESS', 
      subtitle: 'Working with others, empathy and fostering relationships',
      color: [200, 50, 150],
      jsonKey: 'Awareness'
    },
    { 
      key: 'resilience', 
      label: 'RESILIENCE', 
      subtitle: 'Grit, Perseverance and Reliability',
      color: [150, 180, 50],
      jsonKey: 'Resilience'
    },
    { 
      key: 'knowledge', 
      label: 'KNOWLEDGE', 
      subtitle: 'Curiosity, Attention and How You Value Education',
      color: [100, 200, 150],
      jsonKey: 'Knowledge'
    },
  ]

  // Helper to get statement for score
  const getStatementForDimension = (dimKey: string, score: number) => {
    const data = (statementsData as any).SPARK[dimKey]
    if (!data) return null
    
    const breakpoint = data.breakpoints.find((bp: any) => {
      const [min, max] = bp.range.split('-').map(Number)
      return score >= min && score <= max
    })
    
    return breakpoint || null
  }

  // Page header
  const addHeader = () => {
    // SPARK Logo box
    doc.setFillColor(0, 0, 0)
    doc.rect(margin, y, 40, 20, 'F')
    
    doc.setTextColor(233, 30, 140)
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text('SPARK', margin + 20, y + 10, { align: 'center' })
    doc.setFontSize(6)
    doc.text('DEVELOPING STUDENT MINDSET', margin + 20, y + 15, { align: 'center' })
    
    // Student table
    const tableX = margin + 45
    const cellHeight = 10
    const colWidths = [35, 20, 20, 40]
    
    doc.setFillColor(0, 0, 0)
    let xPos = tableX
    ;['Name', 'Cycle', 'Group', 'Date'].forEach((header, i) => {
      doc.rect(xPos, y, colWidths[i], cellHeight, 'F')
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(9)
      doc.setFont('helvetica', 'bold')
      doc.text(header, xPos + colWidths[i] / 2, y + 7, { align: 'center' })
      xPos += colWidths[i]
    })
    
    xPos = tableX
    const today = new Date().toLocaleDateString('en-GB')
    const values = [name, '1', '8A', today]
    
    doc.setDrawColor(233, 30, 140)
    doc.setLineWidth(0.5)
    values.forEach((value, i) => {
      doc.setFillColor(255, 255, 255)
      doc.rect(xPos, y + cellHeight, colWidths[i], cellHeight, 'FD')
      doc.setTextColor(0, 0, 0)
      doc.setFontSize(9)
      doc.text(value, xPos + colWidths[i] / 2, y + cellHeight + 7, { align: 'center' })
      xPos += colWidths[i]
    })
    
    y += 25
  }

  addHeader()

  // Welcome box
  doc.setDrawColor(233, 30, 140)
  doc.setLineWidth(1)
  doc.setFillColor(255, 245, 250)
  doc.roundedRect(margin, y, pageWidth - 2 * margin, 22, 2, 2, 'FD')
  
  doc.setTextColor(0, 0, 0)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text('Welcome to Your SPARK Report!', pageWidth / 2, y + 6, { align: 'center' })
  
  doc.setFontSize(7)
  doc.setFont('helvetica', 'normal')
  const welcomeText = doc.splitTextToSize(
    'This report highlights your strengths and areas to grow across five key themes: Self-Direction, Purpose, Awareness, Resilience, and Knowledge. These qualities help you succeed in school, build strong relationships, and develop a positive, curious mindset. Your SPARK journey is unique—use this report to reflect on your progress, celebrate successes, and set new goals. Remember, learning is a lifelong adventure, and you are in control of your growth!',
    pageWidth - 2 * margin - 6
  )
  doc.text(welcomeText, pageWidth / 2, y + 11, { align: 'center', maxWidth: pageWidth - 2 * margin - 6 })
  
  y += 26

  // Score cards at top
  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(80, 80, 80)
  doc.text('Your SPARK Scores:', margin, y - 2)
  
  const cardWidth = (pageWidth - 2 * margin - 4) / 5 // 5 cards with small gaps
  const cardHeight = 20
  
  dimensions.forEach((dim, idx) => {
    const score = reportData.scores[dim.key]
    const cardX = margin + (idx * cardWidth)
    
    doc.setFillColor(dim.color[0], dim.color[1], dim.color[2])
    doc.setDrawColor(0, 0, 0)
    doc.setLineWidth(0.2)
    doc.rect(cardX, y, cardWidth, cardHeight, 'FD')
    
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(7)
    doc.setFont('helvetica', 'bold')
    const labelLines = doc.splitTextToSize(dim.label, cardWidth - 2)
    doc.text(labelLines, cardX + cardWidth / 2, y + 5, { align: 'center' })
    
    doc.setFontSize(16)
    doc.text(Math.round(score.score).toString(), cardX + cardWidth / 2, y + 14, { align: 'center' })
    
    doc.setFontSize(5)
    doc.text(score.band.replace('_', ' ').toUpperCase(), cardX + cardWidth / 2, y + 18, { align: 'center' })
  })
  
  y += cardHeight + 6

  // Each dimension section - FULL WIDTH
  dimensions.forEach((dim) => {
    const score = reportData.scores[dim.key]
    const wholeScore = Math.round(score.score)
    
    if (y > 200) {
      doc.addPage()
      y = margin
      addHeader()
    }

    // 1-10 Score visualization
    const boxSize = 8
    const boxGap = 0.5
    const scoreLineX = margin
    
    for (let i = 1; i <= 10; i++) {
      if (i === wholeScore) {
        doc.setFillColor(dim.color[0], dim.color[1], dim.color[2])
      } else {
        doc.setFillColor(220, 220, 220)
      }
      doc.setDrawColor(180, 180, 180)
      doc.setLineWidth(0.3)
      doc.rect(scoreLineX + ((i - 1) * (boxSize + boxGap)), y, boxSize, boxSize, 'FD')
      
      doc.setTextColor(i === wholeScore ? 255 : 100, i === wholeScore ? 255 : 100, i === wholeScore ? 255 : 100)
      doc.setFontSize(6)
      doc.setFont('helvetica', 'bold')
      doc.text(i.toString(), scoreLineX + ((i - 1) * (boxSize + boxGap)) + boxSize / 2, y + 5.5, { align: 'center' })
    }
    
    y += boxSize + 3

    // Get actual statement from JSON
    const statementObj = getStatementForDimension(dim.jsonKey, score.score)
    const statement = statementObj?.statement || `You show strong ${dim.label} skills.`
    const developmentQ = statementObj?.personal_development_question || ''
    
    // ROW 1: Statement/Comment (full width)
    const commentHeight = 32
    doc.setDrawColor(233, 30, 140)
    doc.setLineWidth(1)
    doc.setFillColor(dim.color[0] + 30, dim.color[1] + 30, dim.color[2] + 30, 15)
    doc.roundedRect(margin, y, pageWidth - 2 * margin, commentHeight, 2, 2, 'FD')
    
    doc.setTextColor(0, 0, 0)
    doc.setFontSize(7)
    doc.setFont('helvetica', 'normal')
    const statementLines = doc.splitTextToSize(statement, pageWidth - 2 * margin - 6)
    doc.text(statementLines, margin + 3, y + 4)
    
    y += commentHeight + 1
    
    // ROW 2: Personal Development Question
    if (developmentQ) {
      const questionHeight = 14
      doc.setFillColor(dim.color[0] + 20, dim.color[1] + 20, dim.color[2] + 20, 25)
      doc.roundedRect(margin, y, pageWidth - 2 * margin, questionHeight, 2, 2, 'FD')
      
      doc.setFontSize(6)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(dim.color[0], dim.color[1], dim.color[2])
      doc.text('Personal Development Question:', margin + 3, y + 4)
      
      doc.setFont('helvetica', 'italic')
      doc.setTextColor(0, 0, 0)
      const qLines = doc.splitTextToSize(developmentQ, pageWidth - 2 * margin - 6)
      doc.text(qLines, margin + 3, y + 8)
      
      y += questionHeight + 1
    }
    
    // ROW 3: Suggested Activities
    const activitiesHeight = 10
    doc.setFillColor(dim.color[0] + 10, dim.color[1] + 10, dim.color[2] + 10, 35)
    doc.roundedRect(margin, y, pageWidth - 2 * margin, activitiesHeight, 2, 2, 'FD')
    
    doc.setFontSize(6)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(dim.color[0], dim.color[1], dim.color[2])
    doc.text('Suggested Activities:', margin + 3, y + 4)
    
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(0, 0, 0)
    doc.text(getSuggestedActivities(dim.key), margin + 3, y + 8)
    
    y += activitiesHeight + 4
  })

  // Footer
  doc.setFontSize(7)
  doc.setTextColor(150, 150, 150)
  doc.text('© 2025 4Sight Education Ltd · www.spark.study · Ages 11-14 · Key Stage 3', 
           pageWidth / 2, pageHeight - 8, { align: 'center' })

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
  return activities[dimension] || 'Custom activities based on your profile'
}

