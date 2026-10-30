import type { AreaName, Score } from './types.ts'

export type Rag = 'Red' | 'Amber' | 'Green'

export type AreaScore = {
  area: AreaName
  tenths: number
  text: string
  rag: Rag
}

export type AssessmentResult = {
  areas: [AreaScore, AreaScore, AreaScore, AreaScore, AreaScore]
  overallTenths: number
  overallText: string
  overallRag: Rag
  focusFirst: AreaName
}

const areaOrder = ['Scope', 'Schedule', 'Team', 'Quality', 'Stakeholders'] as const

function roundHalfUp(numerator: number, denominator: number): number {
  return Math.floor((2 * numerator + denominator) / (2 * denominator))
}

export function areaTenths(answers: readonly [Score, Score, Score, Score]): number {
  const sum = answers[0] + answers[1] + answers[2] + answers[3]
  return roundHalfUp(sum * 10, 4)
}

export function formatTenths(tenths: number): string {
  const whole = Math.trunc(tenths / 10)
  const fraction = Math.abs(tenths % 10)
  return `${whole}.${fraction}`
}

export function ragForTenths(tenths: number): Rag {
  if (tenths >= 40) {
    return 'Green'
  }
  if (tenths >= 35) {
    return 'Amber'
  }
  return 'Red'
}

export function overallTenths(
  areaTenths: readonly [number, number, number, number, number],
): number {
  const sum = areaTenths[0] + areaTenths[1] + areaTenths[2] + areaTenths[3] + areaTenths[4]
  return roundHalfUp(sum, 5)
}

export function overallRag(overallTenths: number, areaRags: readonly Rag[]): Rag {
  const band = ragForTenths(overallTenths)
  if (band === 'Green' && areaRags.includes('Red')) {
    return 'Amber'
  }
  return band
}

export function focusFirst(areas: readonly { area: AreaName; tenths: number }[]): AreaName {
  let chosen = areas[0]
  for (const candidate of areas) {
    const candidateIsLower = candidate.tenths < chosen.tenths
    const candidateTiesAndIsEarlier =
      candidate.tenths === chosen.tenths &&
      areaOrder.indexOf(candidate.area) < areaOrder.indexOf(chosen.area)
    if (candidateIsLower || candidateTiesAndIsEarlier) {
      chosen = candidate
    }
  }
  return chosen.area
}

export function scoreAssessment(scores: readonly Score[]): AssessmentResult {
  const areas = [0, 1, 2, 3, 4].map((index) => {
    const start = index * 4
    const answers: [Score, Score, Score, Score] = [
      scores[start],
      scores[start + 1],
      scores[start + 2],
      scores[start + 3],
    ]
    const tenths = areaTenths(answers)
    const area: AreaScore = {
      area: areaOrder[index],
      tenths,
      text: formatTenths(tenths),
      rag: ragForTenths(tenths),
    }
    return area
  }) as [AreaScore, AreaScore, AreaScore, AreaScore, AreaScore]

  const tenths = [
    areas[0].tenths,
    areas[1].tenths,
    areas[2].tenths,
    areas[3].tenths,
    areas[4].tenths,
  ] as const
  const roundedOverall = overallTenths(tenths)

  return {
    areas,
    overallTenths: roundedOverall,
    overallText: formatTenths(roundedOverall),
    overallRag: overallRag(
      roundedOverall,
      areas.map((area) => area.rag),
    ),
    focusFirst: focusFirst(areas),
  }
}
