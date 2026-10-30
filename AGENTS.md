# Delivery Health Check

Read this before working on the project.

## What this app is

Delivery Health Check is a single-page web app for delivery consultants. It shows 20 statements in 5 areas: Scope, Schedule, Team, Quality, and Stakeholders. Each statement is answered from 1 to 5.

The app scores each area and the overall result as Red, Amber, or Green. It shows a table and a radar chart, suggests actions, saves answers in the browser with localStorage, and prints a one-page summary. There is no backend and no login.

## Stack

React and TypeScript, Vite, Recharts, Vitest and Testing Library, Oxlint, and plain CSS. Hosted on Vercel.

## Commands

- `npm run dev` — start the local app
- `npm test` — run tests once
- `npm run lint` — run Oxlint
- `npm run build` — typecheck and production build

## Where things live

- `docs/requirements.md` — stories and acceptance criteria. This is the source of truth.
- `docs/design.md` — design notes
- `src/data/` — question bank content
- `src/lib/` — pure logic, no React
- `src/components/` — UI

## Working rules

- Work on one Jira story at a time.
- Name branches `DHC-<n>-short-name`.
- Start commit messages with the key, for example `DHC-3: add results table`.
- In branch names, commit messages, PR titles, and PR descriptions, mention only the current story’s key. Refer to any other story by its name. Jira links and moves every story whose key appears, so a second key in those places attaches the change to the wrong story.
- Give every acceptance criterion a test named `DHC-<n> AC<k>: …`, unless `requirements.md` marks it `(manual)`.
- Keep scoring logic in pure functions in `src/lib`.
- Do not add npm packages without asking first.
- Before saying a task is done, run lint, tests, and build, and fix any failures.

## Definition of Done

Acceptance criteria are met, tests pass, lint and build pass, and the change has been checked in the browser.
