import { fireEvent, render, screen, within } from '@testing-library/react'
import { useState } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { AssessmentForm } from './AssessmentForm.tsx'
import { todayIsoDate } from '../lib/storage.ts'
import type { Assessment, Score } from '../lib/types.ts'

const areaStatements = {
  Scope: [
    'The engagement’s goals and success measures are written down and agreed with the client.',
    'The backlog for the next four to six weeks is prioritised and ready to work on.',
    'Changes to scope go through an agreed change process.',
    'The team can explain how this week’s work links to the client’s goals.',
  ],
  Schedule: [
    'There is a realistic, up-to-date plan with milestones the client has seen.',
    'The last three sprints delivered at least 80% of what was planned.',
    'Dependencies on other teams or vendors are tracked with owners and dates.',
    'Delays are raised early, not discovered at milestone dates.',
  ],
  Team: [
    'The team has the skills it needs, or a plan to close the gaps.',
    'Roles and decision rights are clear: everyone knows who decides what.',
    'The workload is sustainable; nobody is routinely working late or at weekends.',
    'Key knowledge is shared; losing one person would not stop delivery.',
  ],
  Quality: [
    'There is a shared Definition of Done that includes testing.',
    'Automated tests run on every change.',
    'Defects found by the client are tracked and trending down.',
    'Code is reviewed by someone else before it is merged.',
  ],
  Stakeholders: [
    'The client sponsor is engaged and available for decisions.',
    'Status reporting is regular, honest and trusted by the client.',
    'Risks and issues are reviewed with the client at least every two weeks.',
    'The client would describe the working relationship as positive.',
  ],
} as const

const areaNames = ['Scope', 'Schedule', 'Team', 'Quality', 'Stakeholders'] as const

const scaleLabels = [
  '1 Strongly disagree',
  '2 Disagree',
  '3 Partly',
  '4 Agree',
  '5 Strongly agree',
] as const

function emptyAssessment(): Assessment {
  return {
    engagementName: '',
    client: '',
    assessmentDate: todayIsoDate(new Date()),
    scores: Array.from({ length: 20 }, () => null),
  }
}

function Harness() {
  const [assessment, setAssessment] = useState<Assessment>(emptyAssessment)

  function setScore(index: number, score: Score) {
    setAssessment((current) => {
      const scores = current.scores.slice()
      scores[index] = score
      return { ...current, scores }
    })
  }

  return (
    <AssessmentForm
      assessment={assessment}
      onName={(engagementName) =>
        setAssessment((current) => ({ ...current, engagementName }))
      }
      onClient={(client) => setAssessment((current) => ({ ...current, client }))}
      onDate={(assessmentDate) =>
        setAssessment((current) => ({
          ...current,
          assessmentDate:
            assessmentDate === '' ? todayIsoDate(new Date()) : assessmentDate,
        }))
      }
      onScore={setScore}
    />
  )
}

function statementGroup(text: string) {
  return screen.getByRole('group', { name: text })
}

afterEach(() => {
  vi.useRealTimers()
})

describe('AssessmentForm', () => {
  it('DHC-1 AC2: engagement fields start empty except today’s local date, and clearing the date restores today', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 9, 30, 15, 0, 0))
    render(<Harness />)

    expect(screen.getByLabelText('Engagement name')).toHaveValue('')
    expect(screen.getByLabelText('Client')).toHaveValue('')
    const date = screen.getByLabelText('Assessment date')
    expect(date).toHaveValue('2026-10-30')

    fireEvent.change(date, { target: { value: '2020-01-15' } })
    expect(date).toHaveValue('2020-01-15')

    fireEvent.change(date, { target: { value: '2031-12-01' } })
    expect(date).toHaveValue('2031-12-01')

    fireEvent.change(date, { target: { value: '' } })
    expect(date).toHaveValue('2026-10-30')
  })

  it('DHC-1 AC3: five area headings show their four statements in order', () => {
    render(<Harness />)

    const headings = screen.getAllByRole('heading', { level: 2 })
    expect(headings.map((heading) => heading.textContent)).toEqual([...areaNames])

    for (const name of areaNames) {
      const section = screen.getByRole('heading', { level: 2, name }).closest('section')
      expect(section).not.toBeNull()
      const groups = within(section!).getAllByRole('group')
      expect(groups).toHaveLength(4)
      areaStatements[name].forEach((statement, index) => {
        expect(groups[index]).toHaveAccessibleName(statement)
      })
    }
  })

  it('DHC-1 AC4: the scale is shown once, in order, and not under each statement', () => {
    render(<Harness />)

    const lists = screen.getAllByRole('list')
    expect(lists).toHaveLength(1)
    const items = within(lists[0]!).getAllByRole('listitem')
    expect(items.map((item) => item.textContent)).toEqual([...scaleLabels])

    for (const label of scaleLabels) {
      expect(screen.getAllByText(label)).toHaveLength(1)
    }
  })

  it('DHC-1 AC5: each statement has choices 1 to 5, only one can be selected, and none start selected', () => {
    render(<Harness />)

    const groups = screen.getAllByRole('group')
    expect(groups).toHaveLength(20)

    for (const group of groups) {
      const choices = ['1', '2', '3', '4', '5'].map((name) =>
        within(group).getByRole('radio', { name }),
      )
      for (const choice of choices) {
        expect(choice).not.toBeChecked()
      }

      fireEvent.click(choices[0]!)
      expect(choices[0]).toBeChecked()
      fireEvent.click(choices[1]!)
      expect(choices[1]).toBeChecked()
      expect(choices[0]).not.toBeChecked()
      for (const choice of choices.slice(2)) {
        expect(choice).not.toBeChecked()
      }
    }
  })

  it('DHC-1 AC6: a score stays selected, can change to any other number, and does not clear or affect other statements', () => {
    render(<Harness />)

    const scope = statementGroup(areaStatements.Scope[0])
    const schedule = statementGroup(areaStatements.Schedule[0])
    const scopeChoice = (name: string) => within(scope).getByRole('radio', { name })
    const scheduleChoice = (name: string) =>
      within(schedule).getByRole('radio', { name })

    fireEvent.click(scheduleChoice('2'))

    for (const name of ['1', '2', '3', '4', '5']) {
      fireEvent.click(scopeChoice(name))
      expect(scopeChoice(name)).toBeChecked()
      for (const other of ['1', '2', '3', '4', '5']) {
        if (other !== name) {
          expect(scopeChoice(other)).not.toBeChecked()
        }
      }
      expect(scheduleChoice('2')).toBeChecked()
    }

    fireEvent.click(scopeChoice('5'))
    expect(scopeChoice('5')).toBeChecked()
    expect(scheduleChoice('2')).toBeChecked()
    for (const name of ['1', '2', '3', '4']) {
      expect(scopeChoice(name)).not.toBeChecked()
    }
  })
})
