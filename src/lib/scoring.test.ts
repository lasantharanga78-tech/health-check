import { describe, expect, it } from 'vitest'
import { areaTenths, focusFirst, formatTenths, overallRag, overallTenths, ragForTenths } from './scoring.ts'

describe('scoring', () => {
  it('DHC-2 AC1: an area answered 5, 4, 4, 4 scores 4.3', () => {
    expect(formatTenths(areaTenths([5, 4, 4, 4]))).toBe('4.3')
  })

  it('DHC-8 AC1: scores 4.0, 3.9, 3.5 and 3.4 give Green, Amber, Amber, Red', () => {
    expect(ragForTenths(40)).toBe('Green')
    expect(ragForTenths(39)).toBe('Amber')
    expect(ragForTenths(35)).toBe('Amber')
    expect(ragForTenths(34)).toBe('Red')
  })

  it('DHC-2 AC3: area scores 4.3, 4.3, 4.3, 4.3 and 4.0 score 4.2 overall', () => {
    expect(formatTenths(overallTenths([43, 43, 43, 43, 40]))).toBe('4.2')
  })

  it('DHC-2 AC4: one Red area with an overall score of 4.3 gives Amber overall, not Green', () => {
    expect(overallRag(43, ['Green', 'Green', 'Green', 'Green', 'Red'])).toBe('Amber')
  })

  it('DHC-2 AC5: a tie for the lowest area picks the area listed first', () => {
    expect(
      focusFirst([
        { area: 'Scope', tenths: 35 },
        { area: 'Schedule', tenths: 28 },
        { area: 'Team', tenths: 40 },
        { area: 'Quality', tenths: 28 },
        { area: 'Stakeholders', tenths: 50 },
      ]),
    ).toBe('Schedule')
  })
})
