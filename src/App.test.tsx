import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App.tsx'
import { areas } from './data/questions.ts'

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
})
