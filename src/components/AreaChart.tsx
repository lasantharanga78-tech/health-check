import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart } from 'recharts'
import type { AreaScore } from '../lib/scoring.ts'

type AreaChartProps = {
  areas: readonly AreaScore[]
}

export function AreaChart({ areas }: AreaChartProps) {
  const data = areas.map((area) => ({
    area: area.area,
    score: area.tenths / 10,
  }))

  return (
    <div className="area-chart" role="img" aria-label="Area scores">
      <RadarChart width={360} height={280} data={data} outerRadius="70%">
        <PolarGrid />
        <PolarAngleAxis dataKey="area" />
        <PolarRadiusAxis domain={[0, 5]} />
        <Radar
          dataKey="score"
          stroke="#1a1a1a"
          fill="#5b7c99"
          fillOpacity={0.35}
          isAnimationActive={false}
        />
      </RadarChart>
    </div>
  )
}
