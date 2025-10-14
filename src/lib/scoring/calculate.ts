/**
 * SPARK Scoring Utilities
 * 
 * Handles conversion from slider values (0-100) to scores (0-10)
 * and calculation of dimension scores and bands
 */

export type SparkDimension = 'S' | 'P' | 'A' | 'R' | 'K'
export type ScoreBand = 'low' | 'average' | 'high' | 'very_high'

export interface QuestionAnswer {
  question_id: string
  dimension: SparkDimension
  slider_value: number // 0-100
}

export interface DimensionScore {
  dimension: SparkDimension
  score: number // 0-10
  band: ScoreBand
  question_count: number
}

export interface AssessmentScores {
  self_direction: DimensionScore
  purpose: DimensionScore
  awareness: DimensionScore
  resilience: DimensionScore
  knowledge: DimensionScore
  overall: DimensionScore
}

/**
 * Convert slider value (0-100) to score (0-10)
 */
export function sliderToScore(sliderValue: number): number {
  if (sliderValue < 0 || sliderValue > 100) {
    throw new Error('Slider value must be between 0 and 100')
  }
  return Number((sliderValue / 10).toFixed(1))
}

/**
 * Assign band based on score
 * 0-3: Low
 * 3-5: Average
 * 5-8: High
 * 8-10: Very High
 */
export function assignBand(score: number): ScoreBand {
  if (score < 3) return 'low'
  if (score < 5) return 'average'
  if (score < 8) return 'high'
  return 'very_high'
}

/**
 * Calculate dimension score from question answers
 */
export function calculateDimensionScore(
  dimension: SparkDimension,
  answers: QuestionAnswer[]
): DimensionScore {
  const dimensionAnswers = answers.filter((a) => a.dimension === dimension)

  if (dimensionAnswers.length === 0) {
    throw new Error(`No answers found for dimension ${dimension}`)
  }

  // Convert slider values to scores and calculate average
  const scores = dimensionAnswers.map((a) => sliderToScore(a.slider_value))
  const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length
  const roundedScore = Number(averageScore.toFixed(1))

  return {
    dimension,
    score: roundedScore,
    band: assignBand(roundedScore),
    question_count: dimensionAnswers.length,
  }
}

/**
 * Calculate all dimension scores from questionnaire answers
 */
export function calculateAssessmentScores(answers: QuestionAnswer[]): AssessmentScores {
  const dimensions: SparkDimension[] = ['S', 'P', 'A', 'R', 'K']

  const dimensionScores = dimensions.map((dim) => calculateDimensionScore(dim, answers))

  // Calculate overall score (average of all dimensions)
  const overallScore =
    dimensionScores.reduce((sum, ds) => sum + ds.score, 0) / dimensionScores.length
  const roundedOverallScore = Number(overallScore.toFixed(1))

  return {
    self_direction: dimensionScores[0],
    purpose: dimensionScores[1],
    awareness: dimensionScores[2],
    resilience: dimensionScores[3],
    knowledge: dimensionScores[4],
    overall: {
      dimension: 'S', // Placeholder (overall doesn't have a dimension)
      score: roundedOverallScore,
      band: assignBand(roundedOverallScore),
      question_count: answers.length,
    },
  }
}

/**
 * Get personalized statement for a dimension and score
 */
export function getStatementForScore(
  dimension: SparkDimension | 'Overall',
  score: number,
  statementsData: any
): {
  statement: string
  personal_development_question: string
  label: string
} {
  const dimensionName =
    dimension === 'S'
      ? 'SelfDirection'
      : dimension === 'P'
        ? 'Purpose'
        : dimension === 'A'
          ? 'Awareness'
          : dimension === 'R'
            ? 'Resilience'
            : dimension === 'K'
              ? 'Knowledge'
              : 'Overall'

  const dimensionData = statementsData.SPARK[dimensionName]

  if (!dimensionData) {
    throw new Error(`No statements found for dimension ${dimension}`)
  }

  // Find the matching breakpoint
  const breakpoint = dimensionData.breakpoints.find((bp: any) => {
    const [min, max] = bp.range.split('-').map(Number)
    return score >= min && score <= max
  })

  if (!breakpoint) {
    throw new Error(`No breakpoint found for score ${score} in dimension ${dimension}`)
  }

  return {
    statement: breakpoint.statement,
    personal_development_question: breakpoint.personal_development_question,
    label: breakpoint.label,
  }
}

/**
 * Generate full report data for an assessment
 */
export function generateReportData(
  scores: AssessmentScores,
  statementsData: any
): {
  scores: AssessmentScores
  statements: Record<string, any>
} {
  const dimensions: Array<{ key: string; dim: SparkDimension | 'Overall' }> = [
    { key: 'self_direction', dim: 'S' },
    { key: 'purpose', dim: 'P' },
    { key: 'awareness', dim: 'A' },
    { key: 'resilience', dim: 'R' },
    { key: 'knowledge', dim: 'K' },
    { key: 'overall', dim: 'Overall' },
  ]

  const statements: Record<string, any> = {}

  dimensions.forEach(({ key, dim }) => {
    const score = (scores as any)[key].score
    statements[key] = getStatementForScore(dim, score, statementsData)
  })

  return {
    scores,
    statements,
  }
}

