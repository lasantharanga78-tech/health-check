import { areas } from '../data/questions.ts'
import type { AssessmentResult, Rag } from '../lib/scoring.ts'
import type { AreaName } from '../lib/types.ts'
import { AreaChart } from './AreaChart.tsx'

type ResultsProps = {
  result: AssessmentResult
}

function ragClass(rag: Rag): string {
  return `rag-${rag.toLowerCase()}`
}

function actionsFor(area: AreaName): readonly [string, string] {
  const match = areas.find((item) => item.name === area)
  if (!match) {
    throw new Error(`Missing suggested actions for ${area}`)
  }
  return match.actions
}

export function Results({ result }: ResultsProps) {
  return (
    <section className="results" aria-label="Results">
      <p>
        <span>Overall</span> <span>{result.overallText}</span>{' '}
        <span className={ragClass(result.overallRag)}>{result.overallRag}</span>
      </p>
      <table>
        <thead>
          <tr>
            <th>Area</th>
            <th>Score</th>
            <th>RAG</th>
          </tr>
        </thead>
        <tbody>
          {result.areas.map((area) => (
            <tr key={area.area}>
              <th scope="row">{area.area}</th>
              <td>{area.text}</td>
              <td>
                <span className={ragClass(area.rag)}>{area.rag}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <AreaChart areas={result.areas} />
      <p>Focus first: {result.focusFirst}</p>
      <section aria-label="Suggested actions">
        {result.areas.map((area) => (
          <section key={area.area}>
            <h3>{area.area}</h3>
            {area.rag === 'Green' ? (
              <p>No action needed</p>
            ) : (
              <ul>
                {actionsFor(area.area).map((action) => (
                  <li key={action}>{action}</li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </section>
    </section>
  )
}
