import type { AreaName } from '../lib/types.ts'

export type AreaQuestions = {
  name: AreaName
  statements: readonly [string, string, string, string]
  actions: readonly [string, string]
}

export const scaleLabels = [
  '1 Strongly disagree',
  '2 Disagree',
  '3 Partly',
  '4 Agree',
  '5 Strongly agree',
] as const

export const areas: readonly AreaQuestions[] = [
  {
    name: 'Scope',
    statements: [
      'The engagement’s goals and success measures are written down and agreed with the client.',
      'The backlog for the next four to six weeks is prioritised and ready to work on.',
      'Changes to scope go through an agreed change process.',
      'The team can explain how this week’s work links to the client’s goals.',
    ],
    actions: [
      'Run a one-hour goals and success-measures workshop with the sponsor.',
      'Agree a lightweight change-request process and keep a change log.',
    ],
  },
  {
    name: 'Schedule',
    statements: [
      'There is a realistic, up-to-date plan with milestones the client has seen.',
      'The last three sprints delivered at least 80% of what was planned.',
      'Dependencies on other teams or vendors are tracked with owners and dates.',
      'Delays are raised early, not discovered at milestone dates.',
    ],
    actions: [
      'Re-plan with the team and share the new baseline with the client.',
      'Start a dependency log with owners and due dates, reviewed weekly.',
    ],
  },
  {
    name: 'Team',
    statements: [
      'The team has the skills it needs, or a plan to close the gaps.',
      'Roles and decision rights are clear: everyone knows who decides what.',
      'The workload is sustainable; nobody is routinely working late or at weekends.',
      'Key knowledge is shared; losing one person would not stop delivery.',
    ],
    actions: [
      'Map skills against the next quarter’s work and close the biggest gap.',
      'Pair people on critical areas to spread knowledge.',
    ],
  },
  {
    name: 'Quality',
    statements: [
      'There is a shared Definition of Done that includes testing.',
      'Automated tests run on every change.',
      'Defects found by the client are tracked and trending down.',
      'Code is reviewed by someone else before it is merged.',
    ],
    actions: [
      'Agree a Definition of Done that includes tests and code review.',
      'Add automated tests and run them on every pull request.',
    ],
  },
  {
    name: 'Stakeholders',
    statements: [
      'The client sponsor is engaged and available for decisions.',
      'Status reporting is regular, honest and trusted by the client.',
      'Risks and issues are reviewed with the client at least every two weeks.',
      'The client would describe the working relationship as positive.',
    ],
    actions: [
      'Set a fixed fortnightly risk review with the sponsor.',
      'Switch status reports to a simple RAG with honest commentary.',
    ],
  },
]
