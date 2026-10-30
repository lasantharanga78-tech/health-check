import type { Assessment, Score } from './types.ts'

const storageKey = 'dhc-assessment'
const validScores: readonly Score[] = [1, 2, 3, 4, 5]

export type AssessmentStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>

export function todayIsoDate(now: Date): string {
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function isRealIsoDate(value: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) return false

  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const date = new Date(year, month - 1, day)
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day
}

export function emptyAssessment(today: string): Assessment {
  return {
    engagementName: '',
    client: '',
    assessmentDate: today,
    scores: Array.from({ length: 20 }, () => null),
  }
}

export function isEngagementNameFilled(name: string): boolean {
  return Array.from(name).some((character) => character !== ' ')
}

export function canShowResults(assessment: Assessment): boolean {
  return (
    isEngagementNameFilled(assessment.engagementName) &&
    assessment.scores.length === 20 &&
    assessment.scores.every((score) => score !== null && validScores.includes(score))
  )
}

function isScore(value: unknown): value is Score {
  return validScores.some((score) => score === value)
}

export function parseAssessment(raw: string): Assessment | null {
  try {
    const value: unknown = JSON.parse(raw)
    if (typeof value !== 'object' || value === null || Array.isArray(value)) return null

    const record = value as Record<string, unknown>
    const { engagementName, client, assessmentDate, scores } = record
    if (typeof engagementName !== 'string' || typeof client !== 'string') return null
    if (typeof assessmentDate !== 'string' || !isRealIsoDate(assessmentDate)) return null
    if (!Array.isArray(scores) || scores.length !== 20) return null

    const parsedScores: Array<Score | null> = []
    for (const score of scores) {
      if (score === null) {
        parsedScores.push(null)
        continue
      }
      if (!isScore(score)) return null
      parsedScores.push(score)
    }

    return { engagementName, client, assessmentDate, scores: parsedScores }
  } catch {
    return null
  }
}

export function loadAssessment(storage: AssessmentStorage): Assessment | null {
  try {
    const raw = storage.getItem(storageKey)
    if (raw === null) return null
    return parseAssessment(raw)
  } catch {
    return null
  }
}

export function saveAssessment(storage: AssessmentStorage, assessment: Assessment): void {
  try {
    storage.setItem(
      storageKey,
      JSON.stringify({
        engagementName: assessment.engagementName,
        client: assessment.client,
        assessmentDate: assessment.assessmentDate,
        scores: assessment.scores,
      }),
    )
  } catch {
    // A failed save leaves the on-screen answers in place.
  }
}

export function clearAssessment(storage: AssessmentStorage): void {
  try {
    storage.removeItem(storageKey)
  } catch {
    // A failed clear must not crash the page.
  }
}
