# Delivery Health Check

A single-page app for delivery consultants. It walks through 20 statements in five areas — Scope, Schedule, Team, Quality, and Stakeholders — each scored from 1 to 5.

When the engagement name is filled in and every statement is answered, the app scores each area and the overall result as Red, Amber, or Green. It shows a results table, a radar chart, and suggested actions. Answers stay in this browser (`localStorage`). You can print a one-page summary. There is no login and no server.

Live app: [https://health-check-believ1.vercel.app](https://health-check-believ1.vercel.app)

How to run a session: [docs/how-to.pdf](docs/how-to.pdf)

## Run it locally

From this folder, in PowerShell:

```powershell
npm install
npm run dev
```

Vite prints a local URL (usually `http://localhost:5173`). Open that in a browser.

## Tests

```powershell
npm test
```

That runs the Vitest suite once. `npm run lint` checks the code, and `npm run build` typechecks and builds for production.

## How work is tracked

Stories live in the Jira space **DHC**.

- Branch names: `DHC-<n>-short-name` (for example `DHC-3-results-table`).
- Commit messages start with the story key: `DHC-3: add results table`.
- In a branch name, commit message, or pull request, mention only the story you are working on. A second key attaches the change to the wrong story.
