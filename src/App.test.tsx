import { fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App.tsx'
import { areas } from './data/questions.ts'
import { todayIsoDate } from './lib/storage.ts'

const prompt = 'Enter the engagement name and answer all 20 statements to see results.'

function answerAll(score: string) {
  for (const group of screen.getAllByRole('group')) {
    fireEvent.click(within(group).getByRole('radio', { name: score }))
  }
}

function setAreaScore(areaName: string, score: string) {
  const area = areas.find((item) => item.name === areaName)
  if (!area) {
    throw new Error(`Missing area ${areaName}`)
  }
  for (const statement of area.statements) {
    const group = screen.getByRole('group', { name: statement })
    fireEvent.click(within(group).getByRole('radio', { name: score }))
  }
}

function setName(value: string) {
  fireEvent.change(screen.getByLabelText('Engagement name'), { target: { value } })
}

function expectPrompt() {
  expect(screen.getByText(prompt)).toBeInTheDocument()
  expect(screen.queryByRole('region', { name: 'Results' })).not.toBeInTheDocument()
}

function expectResults() {
  expect(screen.queryByText(prompt)).not.toBeInTheDocument()
  expect(screen.getByRole('region', { name: 'Results' })).toBeInTheDocument()
}

describe('App', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('DHC-1 AC1: the page has one main heading, Delivery Health Check', () => {
    render(<App />)

    const headings = screen.getAllByRole('heading', { level: 1 })
    expect(headings).toHaveLength(1)
    expect(headings[0]).toHaveTextContent(/^Delivery Health Check$/)
  })

  it('DHC-3 AC1: results appear only when the name is filled and all 20 statements are answered', () => {
    render(<App />)

    expectPrompt()
    expect(screen.getByLabelText('Client')).toHaveValue('')

    setName('A')
    expectPrompt()

    answerAll('4')
    setName('')
    expectPrompt()

    for (const name of [' ', '   ']) {
      setName(name)
      expectPrompt()
    }

    for (const name of ['A', ' A ', '\t', '\u00A0', '😀']) {
      setName(name)
      expectResults()
      expect(screen.getByLabelText('Client')).toHaveValue('')
    }

    setName('')
    expectPrompt()
    setName('A')
    expectResults()
    setName('   ')
    expectPrompt()
  })

  it('DHC-3 AC8: changing a score updates the overall result, the table, and focus first', () => {
    render(<App />)
    setName('A')
    answerAll('5')

    const results = screen.getByRole('region', { name: 'Results' })
    expect(within(results).getByText('Overall').closest('p')).toHaveTextContent('Overall 5.0 Green')
    expect(within(results).getByText('Focus first: Scope')).toBeInTheDocument()

    setAreaScore('Schedule', '1')

    const updated = screen.getByRole('region', { name: 'Results' })
    expect(within(updated).getByText('Overall').closest('p')).toHaveTextContent('Overall 4.2 Amber')
    const schedule = within(updated).getByRole('rowheader', { name: 'Schedule' }).closest('tr')
    expect(schedule).not.toBeNull()
    const cells = within(schedule!).getAllByRole('cell')
    expect(cells[0]).toHaveTextContent('1.0')
    expect(cells[1]).toHaveTextContent('Red')
    const scope = within(updated).getByRole('rowheader', { name: 'Scope' }).closest('tr')
    expect(within(scope!).getAllByRole('cell')[0]).toHaveTextContent('5.0')
    expect(within(updated).getByText('Focus first: Schedule')).toBeInTheDocument()
  })

  it('DHC-3 AC9: editing the client, date, or a filled name keeps the results', () => {
    render(<App />)
    setName('A')
    answerAll('5')
    expectResults()

    fireEvent.change(screen.getByLabelText('Client'), { target: { value: 'Northwind' } })
    fireEvent.change(screen.getByLabelText('Assessment date'), { target: { value: '2024-06-01' } })
    setName('Beta')

    expectResults()
    expect(screen.getByLabelText('Client')).toHaveValue('Northwind')
    expect(screen.getByLabelText('Assessment date')).toHaveValue('2024-06-01')
    expect(screen.getByLabelText('Engagement name')).toHaveValue('Beta')
    expect(screen.getByText('Overall').closest('p')).toHaveTextContent('Overall 5.0 Green')

    setName('   ')
    expectPrompt()
  })

  it('DHC-5 AC3: changing a score updates that area’s suggested actions', () => {
    render(<App />)
    setName('A')
    answerAll('5')

    const qualityActions = areas.find((area) => area.name === 'Quality')!.actions
    const qualityBlock = () => {
      const actions = screen.getByRole('region', { name: 'Suggested actions' })
      const block = within(actions).getByRole('heading', { level: 3, name: 'Quality' }).parentElement
      expect(block).not.toBeNull()
      return block!
    }
    const scopeBlock = () => {
      const actions = screen.getByRole('region', { name: 'Suggested actions' })
      const block = within(actions).getByRole('heading', { level: 3, name: 'Scope' }).parentElement
      expect(block).not.toBeNull()
      return block!
    }

    expect(qualityBlock()).toHaveTextContent('No action needed')
    expect(within(qualityBlock()).queryByRole('listitem')).not.toBeInTheDocument()

    setAreaScore('Quality', '3')
    expect(within(qualityBlock()).getAllByRole('listitem').map((item) => item.textContent)).toEqual([
      ...qualityActions,
    ])
    expect(within(qualityBlock()).queryByText('No action needed')).not.toBeInTheDocument()
    expect(scopeBlock()).toHaveTextContent('No action needed')

    setAreaScore('Quality', '1')
    expect(within(qualityBlock()).getAllByRole('listitem').map((item) => item.textContent)).toEqual([
      ...qualityActions,
    ])

    setAreaScore('Quality', '5')
    expect(qualityBlock()).toHaveTextContent('No action needed')
    expect(within(qualityBlock()).queryByRole('listitem')).not.toBeInTheDocument()
    for (const action of qualityActions) {
      expect(within(qualityBlock()).queryByText(action)).not.toBeInTheDocument()
    }
  })

  it('DHC-4 AC1: the page shows a Start new assessment button', () => {
    render(<App />)

    expect(screen.getByRole('button', { name: 'Start new assessment' })).toBeInTheDocument()
  })

  it('DHC-4 AC2: a change is saved and restored after reload, including unanswered scores', () => {
    const view = render(<App />)
    setName('  Alpha  ')
    fireEvent.change(screen.getByLabelText('Client'), { target: { value: '  Northwind  ' } })
    fireEvent.change(screen.getByLabelText('Assessment date'), { target: { value: '2024-02-29' } })

    const firstGroup = screen.getAllByRole('group')[0]
    expect(firstGroup).toBeDefined()
    fireEvent.click(within(firstGroup!).getByRole('radio', { name: '3' }))

    const saved = localStorage.getItem('dhc-assessment')
    expect(saved).not.toBeNull()
    const parsed = JSON.parse(saved!) as {
      engagementName: string
      client: string
      assessmentDate: string
      scores: Array<number | null>
    }
    expect(parsed.engagementName).toBe('  Alpha  ')
    expect(parsed.client).toBe('  Northwind  ')
    expect(parsed.assessmentDate).toBe('2024-02-29')
    expect(parsed.scores).toHaveLength(20)
    expect(parsed.scores[0]).toBe(3)
    expect(parsed.scores.slice(1).every((score) => score === null)).toBe(true)

    expectPrompt()
    view.unmount()
    render(<App />)

    expect(screen.getByLabelText('Engagement name')).toHaveValue('  Alpha  ')
    expect(screen.getByLabelText('Client')).toHaveValue('  Northwind  ')
    expect(screen.getByLabelText('Assessment date')).toHaveValue('2024-02-29')
    const restored = screen.getAllByRole('group')[0]
    expect(restored).toBeDefined()
    expect(within(restored!).getByRole('radio', { name: '3' })).toBeChecked()
    for (const group of screen.getAllByRole('group').slice(1)) {
      for (const radio of within(group).getAllByRole('radio')) {
        expect(radio).not.toBeChecked()
      }
    }
    expectPrompt()
  })

  it('DHC-4 AC3: broken saved JSON opens an empty form', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 9, 30, 9, 0, 0))
    localStorage.setItem('dhc-assessment', '{')

    render(<App />)

    expect(screen.getByLabelText('Engagement name')).toHaveValue('')
    expect(screen.getByLabelText('Client')).toHaveValue('')
    expect(screen.getByLabelText('Assessment date')).toHaveValue('2026-10-30')
    for (const radio of screen.getAllByRole('radio')) {
      expect(radio).not.toBeChecked()
    }
    expectPrompt()
    expect(localStorage.getItem('dhc-assessment')).toBe('{')
  })

  it('DHC-4 AC4: cancelling Start new assessment leaves the form and the saved value unchanged', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false)
    render(<App />)
    setName('  Alpha  ')
    fireEvent.change(screen.getByLabelText('Client'), { target: { value: 'Northwind' } })
    fireEvent.change(screen.getByLabelText('Assessment date'), { target: { value: '2024-06-01' } })
    fireEvent.click(within(screen.getAllByRole('group')[0]!).getByRole('radio', { name: '2' }))
    const saved = localStorage.getItem('dhc-assessment')

    fireEvent.click(screen.getByRole('button', { name: 'Start new assessment' }))

    expect(window.confirm).toHaveBeenCalledWith(
      'Start a new assessment? This clears the current answers.',
    )
    expect(screen.getByLabelText('Engagement name')).toHaveValue('  Alpha  ')
    expect(screen.getByLabelText('Client')).toHaveValue('Northwind')
    expect(screen.getByLabelText('Assessment date')).toHaveValue('2024-06-01')
    expect(within(screen.getAllByRole('group')[0]!).getByRole('radio', { name: '2' })).toBeChecked()
    expect(localStorage.getItem('dhc-assessment')).toBe(saved)
  })

  it('DHC-4 AC5: confirming Start new assessment clears the form and removes the saved value', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 0, 10, 9, 0, 0))
    const view = render(<App />)
    expect(screen.getByLabelText('Assessment date')).toHaveValue('2026-01-10')

    setName('Alpha')
    fireEvent.change(screen.getByLabelText('Client'), { target: { value: 'Northwind' } })
    fireEvent.change(screen.getByLabelText('Assessment date'), { target: { value: '2024-06-01' } })
    answerAll('5')
    expectResults()

    vi.setSystemTime(new Date(2026, 9, 30, 15, 0, 0))
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    fireEvent.click(screen.getByRole('button', { name: 'Start new assessment' }))

    expect(window.confirm).toHaveBeenCalledWith(
      'Start a new assessment? This clears the current answers.',
    )
    expect(screen.getByLabelText('Engagement name')).toHaveValue('')
    expect(screen.getByLabelText('Client')).toHaveValue('')
    expect(screen.getByLabelText('Assessment date')).toHaveValue('2026-10-30')
    for (const radio of screen.getAllByRole('radio')) {
      expect(radio).not.toBeChecked()
    }
    expectPrompt()
    expect(localStorage.getItem('dhc-assessment')).toBeNull()

    view.unmount()
    render(<App />)
    expect(screen.getByLabelText('Engagement name')).toHaveValue('')
    expect(screen.getByLabelText('Client')).toHaveValue('')
    expect(screen.getByLabelText('Assessment date')).toHaveValue(todayIsoDate(new Date()))
    expect(localStorage.getItem('dhc-assessment')).toBeNull()
    expectPrompt()

    setName('Next')
    const saved = JSON.parse(localStorage.getItem('dhc-assessment')!) as { engagementName: string }
    expect(saved.engagementName).toBe('Next')
  })

  it('DHC-6 AC1: Print / Save as PDF is present only while results are shown', () => {
    render(<App />)

    expect(screen.queryByRole('button', { name: 'Print / Save as PDF' })).not.toBeInTheDocument()

    setName('A')
    expect(screen.queryByRole('button', { name: 'Print / Save as PDF' })).not.toBeInTheDocument()

    answerAll('4')
    expect(screen.getByRole('button', { name: 'Print / Save as PDF' })).toBeInTheDocument()

    setName('')
    expect(screen.queryByRole('button', { name: 'Print / Save as PDF' })).not.toBeInTheDocument()

    setName('A')
    expect(screen.getByRole('button', { name: 'Print / Save as PDF' })).toBeInTheDocument()

    setName('   ')
    expect(screen.queryByRole('button', { name: 'Print / Save as PDF' })).not.toBeInTheDocument()
  })

  it('DHC-6 AC2: Print / Save as PDF calls window.print', () => {
    const print = vi.spyOn(window, 'print').mockImplementation(() => {})
    render(<App />)
    setName('A')
    answerAll('5')

    fireEvent.click(screen.getByRole('button', { name: 'Print / Save as PDF' }))

    expect(print).toHaveBeenCalledTimes(1)
  })
})
