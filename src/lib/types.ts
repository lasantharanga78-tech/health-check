export type Score = 1 | 2 | 3 | 4 | 5

export type AreaName = 'Scope' | 'Schedule' | 'Team' | 'Quality' | 'Stakeholders'

export type Assessment = {
  engagementName: string
  client: string
  assessmentDate: string
  scores: Array<Score | null>
}
