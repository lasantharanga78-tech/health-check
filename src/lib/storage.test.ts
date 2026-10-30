import { describe, expect, it } from 'vitest'
import {
  clearAssessment,
  loadAssessment,
  parseAssessment,
  saveAssessment,
  type AssessmentStorage,
} from './storage.ts'
import type { Assessment, Score } from './types.ts'

const key = 'dhc-assessment'

function memoryStorage(initial: Record<string, string> = {}): AssessmentStorage {
  const data = new Map(Object.entries(initial))
  return {
    getItem(itemKey) {
      return data.get(itemKey) ?? null
    },
    setItem(itemKey, value) {
      data.set(itemKey, value)
    },
    removeItem(itemKey) {
      data.delete(itemKey)
    },
  }
}

function scores(first: Score | null = null): Array<Score | null> {
  return Array.from({ length: 20 }, (_, index) => (index === 0 ? first : null))
}

function assessment(overrides: Partial<Assessment> = {}): Assessment {
  return {
    engagementName: '  Alpha  ',
    client: '  Northwind  ',
    assessmentDate: '2024-02-29',
    scores: scores(3),
    ...overrides,
  }
}

describe('storage', () => {
  it('DHC-4 AC2: save writes the assessment JSON, with null for unanswered scores', () => {
    const storage = memoryStorage()
    const current = assessment()

    saveAssessment(storage, current)

    const raw = storage.getItem(key)
    expect(raw).not.toBeNull()
    expect(JSON.parse(raw!)).toEqual({
      engagementName: '  Alpha  ',
      client: '  Northwind  ',
      assessmentDate: '2024-02-29',
      scores: scores(3),
    })
    expect(loadAssessment(storage)).toEqual(current)
  })

  it('DHC-4 AC3: broken JSON is rejected and does not throw', () => {
    const storage = memoryStorage({ [key]: '{' })

    expect(() => loadAssessment(storage)).not.toThrow()
    expect(loadAssessment(storage)).toBeNull()
    expect(parseAssessment('{')).toBeNull()
    expect(storage.getItem(key)).toBe('{')
  })

  it('DHC-4 AC3: missing, unreadable, or rejected storage is not applied', () => {
    expect(loadAssessment(memoryStorage())).toBeNull()

    const throwing = {
      getItem() {
        throw new Error('storage blocked')
      },
      setItem() {},
      removeItem() {},
    }
    expect(() => loadAssessment(throwing)).not.toThrow()
    expect(loadAssessment(throwing)).toBeNull()

    const valid = {
      engagementName: 'Kept',
      client: 'Client',
      assessmentDate: '2026-10-30',
      scores: scores(4),
      extra: 'ignored',
    }
    expect(parseAssessment(JSON.stringify(valid))).toEqual({
      engagementName: 'Kept',
      client: 'Client',
      assessmentDate: '2026-10-30',
      scores: scores(4),
    })

    const rejected = [
      '{',
      'not json',
      'null',
      '[]',
      '"text"',
      '4',
      JSON.stringify({ ...valid, engagementName: 1 }),
      JSON.stringify({ ...valid, client: null }),
      JSON.stringify({ ...valid, assessmentDate: '2026-02-31' }),
      JSON.stringify({ ...valid, assessmentDate: '2026-2-01' }),
      JSON.stringify({ ...valid, assessmentDate: '2023-02-29' }),
      JSON.stringify({ ...valid, scores: scores(4).slice(0, 19) }),
      JSON.stringify({ ...valid, scores: [...scores(4), null] }),
      JSON.stringify({ ...valid, scores: scores(0 as Score) }),
      JSON.stringify({ ...valid, scores: scores(6 as Score) }),
      JSON.stringify({ ...valid, scores: Array.from({ length: 20 }, () => '4') }),
      JSON.stringify({ ...valid, scores: Array.from({ length: 20 }, () => 1.5) }),
    ]

    for (const raw of rejected) {
      expect(parseAssessment(raw)).toBeNull()
      const storage = memoryStorage({ [key]: raw })
      expect(loadAssessment(storage)).toBeNull()
      expect(storage.getItem(key)).toBe(raw)
    }

    const full = memoryStorage()
    full.setItem = () => {
      throw new Error('storage full')
    }
    expect(() => saveAssessment(full, assessment())).not.toThrow()

    const blocked = memoryStorage({ [key]: 'kept' })
    blocked.removeItem = () => {
      throw new Error('storage blocked')
    }
    expect(() => clearAssessment(blocked)).not.toThrow()
    expect(blocked.getItem(key)).toBe('kept')
  })
})
