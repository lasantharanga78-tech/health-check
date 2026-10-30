import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { areas } from '../data/questions.ts'
import type { AssessmentResult } from '../lib/scoring.ts'
import { Results } from './Results.tsx'

const areaNames = ['Scope', 'Schedule', 'Team', 'Quality', 'Stakeholders'] as const

const result: AssessmentResult = {
  areas: [
    { area: 'Scope', tenths: 35, text: '3.5', rag: 'Amber' },
    { area: 'Schedule', tenths: 28, text: '2.8', rag: 'Red' },
    { area: 'Team', tenths: 40, text: '4.0', rag: 'Green' },
    { area: 'Quality', tenths: 28, text: '2.8', rag: 'Red' },
    { area: 'Stakeholders', tenths: 50, text: '5.0', rag: 'Green' },
  ],
  overallTenths: 36,
  overallText: '3.6',
  overallRag: 'Amber',
  focusFirst: 'Schedule',
}

function renderResults() {
  render(<Results result={result} />)
  return screen.getByRole('region', { name: 'Results' })
}

function appearsBefore(earlier: Element, later: Element) {
  return (
    (earlier.compareDocumentPosition(later) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0
  )
}

describe('Results', () => {
  it('DHC-3 AC2: overall, table, chart, focus first, then suggested actions', () => {
    const region = renderResults()
    const overall = within(region).getByText('Overall').closest('p')
    const table = within(region).getByRole('table')
    const chart = within(region).getByRole('img', { name: 'Area scores' })
    const focus = within(region).getByText('Focus first: Schedule')
    const actions = within(region).getByRole('region', { name: 'Suggested actions' })

    expect(overall).not.toBeNull()
    expect(appearsBefore(overall!, table)).toBe(true)
    expect(appearsBefore(table, chart)).toBe(true)
    expect(appearsBefore(chart, focus)).toBe(true)
    expect(appearsBefore(focus, actions)).toBe(true)
    expect(overall).toHaveTextContent('Overall 3.6 Amber')
    expect(result.overallText).toMatch(/^\d\.\d$/)
    expect(within(region).queryByLabelText('Engagement name')).not.toBeInTheDocument()
    expect(within(region).queryByLabelText('Client')).not.toBeInTheDocument()
    expect(within(region).queryByLabelText('Assessment date')).not.toBeInTheDocument()

    const actionHeadings = within(actions)
      .getAllByRole('heading', { level: 3 })
      .map((heading) => heading.textContent)
    expect(actionHeadings).toEqual([...areaNames])

    for (const area of result.areas) {
      const block = within(actions).getByRole('heading', { level: 3, name: area.area }).parentElement
      expect(block).not.toBeNull()
      const questions = areas.find((item) => item.name === area.area)
      expect(questions).toBeDefined()
      if (area.rag === 'Green') {
        expect(block).toHaveTextContent('No action needed')
        expect(within(block!).queryByRole('listitem')).not.toBeInTheDocument()
      } else {
        expect(
          within(block!)
            .getAllByRole('listitem')
            .map((item) => item.textContent),
        ).toEqual([...questions!.actions])
      }
    }
  })

  it('DHC-3 AC3: the area table lists score and RAG for the five areas in order', () => {
    const region = renderResults()
    const table = within(region).getByRole('table')

    expect(
      within(table)
        .getAllByRole('columnheader')
        .map((header) => header.textContent),
    ).toEqual(['Area', 'Score', 'RAG'])

    const rows = within(table).getAllByRole('row').slice(1)
    expect(rows).toHaveLength(5)
    rows.forEach((row, index) => {
      const area = result.areas[index]!
      expect(within(row).getByRole('rowheader')).toHaveTextContent(area.area)
      const cells = within(row).getAllByRole('cell')
      expect(cells[0]).toHaveTextContent(area.text)
      expect(area.text).toMatch(/^\d\.\d$/)
      expect(cells[1]).toHaveTextContent(area.rag)
    })
    expect(rows.map((row) => within(row).getByRole('rowheader').textContent)).toEqual([
      ...areaNames,
    ])
  })

  it('DHC-3 AC5: the chart is named Area scores and shows the five area names', () => {
    const region = renderResults()
    const chart = within(region).getByRole('img', { name: 'Area scores' })

    for (const name of areaNames) {
      expect(within(chart).getByText(name)).toBeInTheDocument()
    }
  })

  it('DHC-3 AC7: focus first names the weakest area', () => {
    const region = renderResults()
    expect(within(region).getByText('Focus first: Schedule')).toBeInTheDocument()
  })

  it('DHC-5 AC1: Red and Amber areas show their two actions in area order', () => {
    const needsAction: AssessmentResult = {
      areas: [
        { area: 'Scope', tenths: 35, text: '3.5', rag: 'Amber' },
        { area: 'Schedule', tenths: 20, text: '2.0', rag: 'Red' },
        { area: 'Team', tenths: 30, text: '3.0', rag: 'Amber' },
        { area: 'Quality', tenths: 28, text: '2.8', rag: 'Red' },
        { area: 'Stakeholders', tenths: 38, text: '3.8', rag: 'Amber' },
      ],
      overallTenths: 30,
      overallText: '3.0',
      overallRag: 'Amber',
      focusFirst: 'Schedule',
    }
    render(<Results result={needsAction} />)

    const actions = screen.getByRole('region', { name: 'Suggested actions' })
    const headings = within(actions).getAllByRole('heading', { level: 3 })
    expect(headings.map((heading) => heading.textContent)).toEqual([...areaNames])

    for (const area of needsAction.areas) {
      const block = headings.find((heading) => heading.textContent === area.area)?.parentElement
      expect(block).not.toBeNull()
      const questions = areas.find((item) => item.name === area.area)
      expect(
        within(block!)
          .getAllByRole('listitem')
          .map((item) => item.textContent),
      ).toEqual([...questions!.actions])
      expect(within(block!).queryByText('No action needed')).not.toBeInTheDocument()
    }
  })

  it('DHC-5 AC2: Green areas show No action needed and hide their two actions', () => {
    const mixed: AssessmentResult = {
      areas: [
        { area: 'Scope', tenths: 35, text: '3.5', rag: 'Amber' },
        { area: 'Schedule', tenths: 28, text: '2.8', rag: 'Red' },
        { area: 'Team', tenths: 40, text: '4.0', rag: 'Green' },
        { area: 'Quality', tenths: 45, text: '4.5', rag: 'Green' },
        { area: 'Stakeholders', tenths: 50, text: '5.0', rag: 'Green' },
      ],
      overallTenths: 40,
      overallText: '4.0',
      overallRag: 'Amber',
      focusFirst: 'Schedule',
    }
    render(<Results result={mixed} />)

    const actions = screen.getByRole('region', { name: 'Suggested actions' })

    for (const area of mixed.areas) {
      const block = within(actions)
        .getByRole('heading', { level: 3, name: area.area })
        .parentElement
      expect(block).not.toBeNull()
      const questions = areas.find((item) => item.name === area.area)
      expect(questions).toBeDefined()
      if (area.rag === 'Green') {
        expect(within(block!).getByText('No action needed')).toBeInTheDocument()
        expect(within(block!).queryByRole('listitem')).not.toBeInTheDocument()
        for (const action of questions!.actions) {
          expect(within(block!).queryByText(action)).not.toBeInTheDocument()
        }
      } else {
        expect(
          within(block!)
            .getAllByRole('listitem')
            .map((item) => item.textContent),
        ).toEqual([...questions!.actions])
        expect(within(block!).queryByText('No action needed')).not.toBeInTheDocument()
      }
    }
  })
})
