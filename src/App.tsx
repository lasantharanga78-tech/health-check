import { useState } from 'react'
import { AssessmentForm } from './components/AssessmentForm.tsx'
import { Results } from './components/Results.tsx'
import { scoreAssessment } from './lib/scoring.ts'
import {
  canShowResults,
  clearAssessment,
  emptyAssessment,
  loadAssessment,
  saveAssessment,
  todayIsoDate,
} from './lib/storage.ts'
import type { Assessment, Score } from './lib/types.ts'

export default function App() {
  const [assessment, setAssessment] = useState<Assessment>(() =>
    loadAssessment(localStorage) ?? emptyAssessment(todayIsoDate(new Date())),
  )

  function updateAssessment(updater: (current: Assessment) => Assessment) {
    setAssessment((current) => {
      const next = updater(current)
      saveAssessment(localStorage, next)
      return next
    })
  }

  function setScore(index: number, score: Score) {
    updateAssessment((current) => {
      const scores = current.scores.slice()
      scores[index] = score
      return { ...current, scores }
    })
  }

  function startNewAssessment() {
    const confirmed = window.confirm('Start a new assessment? This clears the current answers.')
    if (!confirmed) return

    clearAssessment(localStorage)
    setAssessment(emptyAssessment(todayIsoDate(new Date())))
  }

  const showResults = canShowResults(assessment)
  const result = showResults
    ? scoreAssessment(assessment.scores.filter((score): score is Score => score !== null))
    : null

  return (
    <>
      <h1>Delivery Health Check</h1>
      <AssessmentForm
        assessment={assessment}
        onName={(engagementName) =>
          updateAssessment((current) => ({ ...current, engagementName }))
        }
        onClient={(client) => updateAssessment((current) => ({ ...current, client }))}
        onDate={(assessmentDate) =>
          updateAssessment((current) => ({
            ...current,
            assessmentDate:
              assessmentDate === '' ? todayIsoDate(new Date()) : assessmentDate,
          }))
        }
        onScore={setScore}
        onStartNew={startNewAssessment}
      />
      {result ? (
        <Results result={result} />
      ) : (
        <p>Enter the engagement name and answer all 20 statements to see results.</p>
      )}
    </>
  )
}
