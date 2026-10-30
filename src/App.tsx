import { useState } from 'react'
import { AssessmentForm } from './components/AssessmentForm.tsx'
import { Results } from './components/Results.tsx'
import { scoreAssessment } from './lib/scoring.ts'
import { canShowResults, todayIsoDate } from './lib/storage.ts'
import type { Assessment, Score } from './lib/types.ts'

function emptyAssessment(today: string): Assessment {
  return {
    engagementName: '',
    client: '',
    assessmentDate: today,
    scores: Array.from({ length: 20 }, () => null),
  }
}

export default function App() {
  const [assessment, setAssessment] = useState<Assessment>(() =>
    emptyAssessment(todayIsoDate(new Date())),
  )

  function setScore(index: number, score: Score) {
    setAssessment((current) => {
      const scores = current.scores.slice()
      scores[index] = score
      return { ...current, scores }
    })
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
      {result ? (
        <Results result={result} />
      ) : (
        <p>Enter the engagement name and answer all 20 statements to see results.</p>
      )}
    </>
  )
}
