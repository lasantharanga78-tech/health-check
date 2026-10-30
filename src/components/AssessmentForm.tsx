import { areas, scaleLabels } from '../data/questions.ts'
import type { Assessment, Score } from '../lib/types.ts'

const scoreChoices = [1, 2, 3, 4, 5] as const satisfies readonly Score[]

type AssessmentFormProps = {
  assessment: Assessment
  onName: (engagementName: string) => void
  onClient: (client: string) => void
  onDate: (assessmentDate: string) => void
  onScore: (index: number, score: Score) => void
  onStartNew: () => void
}

export function AssessmentForm({
  assessment,
  onName,
  onClient,
  onDate,
  onScore,
  onStartNew,
}: AssessmentFormProps) {
  return (
    <form>
      <div className="details">
        <label>
          Engagement name
          <input
            type="text"
            value={assessment.engagementName}
            onChange={(event) => onName(event.target.value)}
          />
        </label>
        <label>
          Client
          <input
            type="text"
            value={assessment.client}
            onChange={(event) => onClient(event.target.value)}
          />
        </label>
        <label>
          Assessment date
          <input
            type="date"
            value={assessment.assessmentDate}
            onChange={(event) => onDate(event.target.value)}
          />
        </label>
      </div>

      <ul className="scale">
        {scaleLabels.map((label) => (
          <li key={label}>{label}</li>
        ))}
      </ul>

      {areas.map((area, areaIndex) => (
        <section key={area.name}>
          <h2>{area.name}</h2>
          {area.statements.map((statement, statementOffset) => {
            const index = areaIndex * 4 + statementOffset
            const selected = assessment.scores[index]

            return (
              <fieldset key={statement}>
                <legend>{statement}</legend>
                <div className="choices">
                  {scoreChoices.map((score) => (
                    <label key={score}>
                      <input
                        type="radio"
                        name={`statement-${index}`}
                        value={score}
                        checked={selected === score}
                        onChange={() => onScore(index, score)}
                      />
                      {score}
                    </label>
                  ))}
                </div>
              </fieldset>
            )
          })}
        </section>
      ))}
      <button type="button" className="start-new" onClick={onStartNew}>
        Start new assessment
      </button>
    </form>
  )
}
