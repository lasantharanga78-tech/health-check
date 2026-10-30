# Delivery Health Check — requirements

**Version 1.1**
**Date:** 29 October 2026

## Change log

| Version | Date | Changes |
| --- | --- | --- |
| 1.0 | 29 October 2026 | First version. Six stories for the single-page health check. |
| 1.1 | 29 October 2026 | Made date, rounding, results visibility, the saved shape, and print testable, and added the missing score and RAG cases. |

## Assumptions

The idea brief leaves these points open. Version 1.1 uses the choices below.

1. **Reader of the stories.** The consultant runs the session, usually with the delivery lead. Every story is for the delivery consultant.
2. **When results appear.** Results stay out of the page until the engagement name contains at least one character other than a normal space (U+0020) and all 20 statements have a score. A tab, a non-breaking space, an emoji, or a letter all count. A name made only of normal spaces does not. Leading and trailing spaces are kept. Until results appear, the page shows exactly: `Enter the engagement name and answer all 20 statements to see results.` That sentence is absent while results are shown. A blank client is allowed. The client is kept as typed and is blank only when its text is empty. The date always has a value.
3. **Field labels and date.** The labels are `Engagement name`, `Client`, and `Assessment date`. The date value is the browser’s local calendar date, stored and read as `YYYY-MM-DD`. A date control may paint that value in the browser’s own locale; tests read the value, not that painting. The user can change it to any real past or future calendar date. Clearing the date sets it back to today’s local date, so the value is never empty. “Today” is the local calendar date at the moment the default is applied.
4. **How a statement is answered.** The scale is shown once, as five separate items in this order: `1 Strongly disagree`, `2 Disagree`, `3 Partly`, `4 Agree`, `5 Strongly agree`. It is not repeated for each statement. Each statement has five choices labelled `1`, `2`, `3`, `4`, and `5`, and only one of them can be selected. Nothing is selected on a new assessment. Choosing the number that is already selected leaves it selected. A score cannot be cleared. It stays until the user picks another score for that statement or starts a new assessment.
5. **Rounding order.** Use exact decimal division, not a binary floating-point approximation. An area score is the sum of its four integer answers divided by 4, then rounded to one decimal place. Half rounds up: if the second decimal digit is 5 or more, the first decimal digit increases by one (`4.25` becomes `4.3`, `4.24` stays `4.2`). Round each area first. The overall score is the sum of those five rounded area scores divided by 5, rounded the same way. The worked examples use the decimals as written: `21.2 ÷ 5 = 4.24` rounds to `4.2`, and `21.4 ÷ 5 = 4.28` rounds to `4.3`. RAG bands and focus-first use the rounded scores, not the raw average. `3.75` rounds to `3.8` and is Amber. `2.75` rounds to `2.8` and is Red.
6. **Overall RAG exception.** If the overall band would be Green and any area is Red, the overall RAG is Amber. An overall score that is already Red or Amber stays Red or Amber, including when an area is Red. An Amber area does not turn a Green overall result into Amber.
7. **Focus-first ties.** Compare the rounded area scores. When two or more areas share the lowest score, pick the earliest in this order: Scope, Schedule, Team, Quality, Stakeholders.
8. **Suggested actions.** Every Red or Amber area shows the two sentences from `docs/question-bank.md`, in that order. This is not limited to the focus-first area. A Green area shows `No action needed`.
9. **What is saved.** The whole form is saved, including a partly filled assessment, as a JSON string under the localStorage key `dhc-assessment`. The object has these fields:

   - `engagementName`: string, kept as typed, including leading and trailing spaces.
   - `client`: string, kept as typed. `""` is the empty client.
   - `assessmentDate`: a real calendar date, as `YYYY-MM-DD`.
   - `scores`: an array of 20 values in the statement order in DHC-1 AC3 (Scope, then Schedule, then Team, then Quality, then Stakeholders). Each value is `null` when unanswered, or an integer from 1 to 5.

   Extra JSON properties are ignored. The save is written immediately on each change of the name, the client, the date, or a score, so a reload straight after the change restores it. Only one assessment is kept. Another open tab is not updated until it reloads.

   If the key is missing, reading storage throws, or the value is rejected, the form opens empty with today’s date. Reject the whole value when it is not a JSON object, `engagementName` or `client` is not a string, `assessmentDate` is not a real date in the form `YYYY-MM-DD`, `scores` is not an array of 20 values, or any value is not `null` or an integer from 1 to 5. A numeric string such as `"4"` is rejected. Nothing is kept from a rejected value. The bad value may stay in storage until the next successful save overwrites it. If a save throws, the on-screen answers stay and the page does not crash.
10. **Start new.** The button label is `Start new assessment`. Activating it opens the browser confirm dialog (`window.confirm`) with the exact message `Start a new assessment? This clears the current answers.` Cancel, or dismissing the dialog, leaves the form and the saved value unchanged. OK clears the name, the client, and all scores, sets the date to today’s local date at the moment of OK, removes `dhc-assessment`, and hides the results. The key stays absent until the user next changes the name, the client, the date, or a score. Reloading before that next change opens an empty form with today’s date.
11. **Print.** The button label is `Print / Save as PDF`, and it is in the page only while results are shown. Activating it calls the browser print function (`window.print`) and does not build or download a PDF. Saving a PDF means choosing that destination in the dialog. The printed page is one summary, in this order: the heading `Delivery Health Check`, the engagement name, the client (the label `Client` with a blank value when the client text is empty), the assessment date as `YYYY-MM-DD`, the overall score and RAG word, the area table, the radar chart, the focus-first line, and the suggested actions. The three input fields, the statement choices, the scale, the results prompt, and both buttons are left off the printed page, so the name, client, and date are not printed twice.
12. **Colour.** Each RAG is the word `Red`, `Amber`, or `Green` together with a colour: red, amber, and green. The word is the part a test can read. Whether the colour looks right is checked by eye.
13. **Chart name.** The radar chart has the accessible name `Area scores`.
14. **Wording.** Statement text and suggested actions are copied from `docs/question-bank.md`, including punctuation. The same page shows the form and the results. Changing a score while results are visible updates the results immediately.

## User stories

### DHC-1 Fill in the assessment

**Story points:** 3

As a delivery consultant, I want to enter the engagement details and answer the 20 statements, so that I can capture the health check during the session.

**AC1.** The page has one main heading, `Delivery Health Check`. It is the only `h1`.

**AC2.** The page shows three fields labelled `Engagement name`, `Client`, and `Assessment date`. On a new assessment, `Client` is empty and the assessment date value is today’s local date in the form `YYYY-MM-DD`. Tests read that value. The user can set any real past or future date. The date value is never empty: clearing it sets it back to today’s local date.

**AC3.** The page shows five area headings in this order: `Scope`, `Schedule`, `Team`, `Quality`, `Stakeholders`. Each area name is a heading. Under each heading the four statements below appear in this order and with this wording.

Scope:

1. The engagement’s goals and success measures are written down and agreed with the client.
2. The backlog for the next four to six weeks is prioritised and ready to work on.
3. Changes to scope go through an agreed change process.
4. The team can explain how this week’s work links to the client’s goals.

Schedule:

1. There is a realistic, up-to-date plan with milestones the client has seen.
2. The last three sprints delivered at least 80% of what was planned.
3. Dependencies on other teams or vendors are tracked with owners and dates.
4. Delays are raised early, not discovered at milestone dates.

Team:

1. The team has the skills it needs, or a plan to close the gaps.
2. Roles and decision rights are clear: everyone knows who decides what.
3. The workload is sustainable; nobody is routinely working late or at weekends.
4. Key knowledge is shared; losing one person would not stop delivery.

Quality:

1. There is a shared Definition of Done that includes testing.
2. Automated tests run on every change.
3. Defects found by the client are tracked and trending down.
4. Code is reviewed by someone else before it is merged.

Stakeholders:

1. The client sponsor is engaged and available for decisions.
2. Status reporting is regular, honest and trusted by the client.
3. Risks and issues are reviewed with the client at least every two weeks.
4. The client would describe the working relationship as positive.

**AC4.** The scale is shown once, and not again under each statement. It is five separate items in this order: `1 Strongly disagree`, `2 Disagree`, `3 Partly`, `4 Agree`, and `5 Strongly agree`.

**AC5.** Each statement has five choices labelled `1`, `2`, `3`, `4`, and `5`. Only one choice can be selected for that statement. On a new assessment, none of the 20 statements has a choice selected.

**AC6.** Selecting a number for a statement selects that score and clears any other score on that statement only. Other statements stay as they are. Selecting the number that is already selected leaves it selected. The user can change a selected score to any other number from 1 to 5. There is no way to return a statement to unanswered.

### DHC-2 Calculate scores and RAG

**Story points:** 2

As a delivery consultant, I want each area and the overall result scored as Red, Amber, or Green, so that every assessment is rated the same way.

**AC1.** An area score is the exact sum of its four answers divided by 4, rounded to one decimal place as in assumption 5. Halves round up, so `4.25` becomes `4.3` and `3.75` becomes `3.8`.

| Answers | Area score |
| --- | --- |
| 5, 5, 5, 5 | 5.0 |
| 4, 5, 5, 5 | 4.8 |
| 4, 4, 5, 5 | 4.5 |
| 5, 4, 4, 4 | 4.3 |
| 4, 4, 4, 4 | 4.0 |
| 4, 4, 4, 3 | 3.8 |
| 4, 4, 3, 3 | 3.5 |
| 3, 3, 3, 4 | 3.3 |
| 3, 3, 3, 3 | 3.0 |
| 3, 3, 3, 2 | 2.8 |
| 1, 2, 3, 4 | 2.5 |
| 2, 2, 2, 3 | 2.3 |
| 2, 2, 2, 2 | 2.0 |
| 1, 1, 1, 4 | 1.8 |
| 1, 1, 1, 2 | 1.3 |
| 1, 1, 1, 1 | 1.0 |

**AC2.** RAG is decided from the rounded score, not the raw average.

| Band | Rounded score | Examples |
| --- | --- | --- |
| Green | 4.0 and above | 4.0 and 5.0 are Green |
| Amber | 3.0 to 3.9 | 3.0, 3.8, and 3.9 are Amber. 3.75 rounds to 3.8 before the band is chosen |
| Red | Below 3.0 | 2.8 and 2.9 are Red. 2.75 rounds to 2.8 before the band is chosen |

**AC3.** The overall score is the exact sum of the five rounded area scores divided by 5, then rounded to one decimal place with the same half-up rule. Use the one-decimal area scores as written, not a binary approximation of them.

| Rounded area scores (Scope, Schedule, Team, Quality, Stakeholders) | Overall score |
| --- | --- |
| 4.3, 4.3, 4.3, 4.3, 4.0 | 4.2 (21.2 ÷ 5 = 4.24) |
| 4.3, 4.3, 4.3, 4.3, 4.2 | 4.3 (21.4 ÷ 5 = 4.28) |
| 5.0, 5.0, 5.0, 5.0, 2.8 | 4.6 (22.8 ÷ 5 = 4.56) |
| 5.0, 5.0, 5.0, 5.0, 5.0 | 5.0 |
| 2.8, 2.8, 2.8, 2.8, 3.3 | 2.9 (14.5 ÷ 5 = 2.9) |
| 1.0, 1.0, 1.0, 1.0, 1.0 | 1.0 |

**AC4.** Overall RAG uses the bands in AC2. If that band would be Green and any area is Red, the overall RAG is Amber. A Red area does not change an overall result that is already Amber. An Amber area does not change an overall result that is Green.

| Rounded area scores (Scope, Schedule, Team, Quality, Stakeholders) | Overall score | Overall RAG |
| --- | --- | --- |
| 5.0, 5.0, 5.0, 5.0, 1.0 | 4.2 | Amber |
| 5.0, 5.0, 5.0, 5.0, 2.8 | 4.6 | Amber |
| 4.5, 4.5, 4.5, 4.5, 2.0 | 4.0 | Amber |
| 5.0, 5.0, 3.0, 3.0, 2.0 | 3.6 | Amber |
| 2.0, 2.0, 2.0, 2.0, 2.0 | 2.0 | Red |
| 2.8, 2.8, 2.8, 2.8, 3.3 | 2.9 | Red |
| 3.8, 3.8, 3.8, 3.8, 3.8 | 3.8 | Amber |
| 4.0, 4.0, 4.0, 4.0, 4.0 | 4.0 | Green |
| 5.0, 5.0, 5.0, 5.0, 3.8 | 4.8 | Green |

**AC5.** Focus first is the area with the lowest rounded score. On a tie of two or more areas, use the area listed first: Scope, then Schedule, then Team, then Quality, then Stakeholders.

| Rounded area scores (Scope, Schedule, Team, Quality, Stakeholders) | Focus first |
| --- | --- |
| 3.5, 2.8, 4.0, 2.8, 5.0 | Schedule |
| 2.0, 2.0, 2.0, 4.0, 5.0 | Scope |
| 4.0, 2.5, 2.5, 2.5, 5.0 | Schedule |
| 4.0, 4.0, 4.0, 4.0, 4.0 | Scope |
| 5.0, 5.0, 5.0, 3.0, 3.0 | Quality |

### DHC-3 See the results

**Story points:** 3

As a delivery consultant, I want to see the overall result, a table of areas, a radar chart, and where to focus first, so that I can walk the client through the outcome.

**AC1.** Results are absent from the page, not only visually hidden, until the engagement name contains at least one character other than a normal space (U+0020) and all 20 statements have a score. Until then the page shows exactly `Enter the engagement name and answer all 20 statements to see results.` The client may be empty. When both conditions are met, that message is absent and the results are in the page. Clearing the name so that it is empty or only normal spaces removes the results and shows that message again.

These names are filled: `A`, ` A ` (a letter with surrounding spaces), a tab, a non-breaking space, and an emoji. These names are not filled: an empty name, one normal space, and a name made only of normal spaces. A statement cannot be cleared (DHC-1 AC6), so scores stay answered until the user starts a new assessment.

**AC2.** When results are shown, they appear in this order: the overall line, the area table, the chart, the focus-first line, then the suggested actions from DHC-5. The overall line shows the label `Overall`, the overall score to one decimal place (for example `4.0` or `5.0`), and the overall RAG word `Red`, `Amber`, or `Green`. The on-screen results do not repeat the engagement name, client, or date. Those stay in the fields.

**AC3.** The results include a table with column headings `Area`, `Score`, and `RAG`, and five rows in this order: Scope, Schedule, Team, Quality, Stakeholders. Each score is shown to one decimal place. Each RAG cell shows the word `Red`, `Amber`, or `Green`.

**AC4.** (manual) Each RAG word is coloured red for Red, amber for Amber, and green for Green, both for the overall RAG and for each area row.

**AC5.** The results include a chart with the accessible name `Area scores`. The words `Scope`, `Schedule`, `Team`, `Quality`, and `Stakeholders` are visible text on that chart.

**AC6.** (manual) That chart is a radar chart on a scale from 0 to 5, and the plotted shape matches the five rounded area scores. After a score change, the shape matches the new rounded area scores.

**AC7.** The results show `Focus first:` followed by the focus-first area name, for example `Focus first: Schedule`.

**AC8.** While the results are shown, changing any statement’s score updates the overall score, the overall RAG, every table cell that changed, and the focus-first line, without reloading the page. The chart’s plotted scores update as in AC6.

**AC9.** While the results are shown, editing the client or the date, or changing the engagement name to another filled name, leaves the results on the page. Those edits are what the printed summary uses. Changing the name to empty or only normal spaces hides the results, removes the print button, and shows the message in AC1.

### DHC-4 Keep my answers in the browser

**Story points:** 2

As a delivery consultant, I want this browser to keep the assessment, and to clear it when I start a new one, so that a reload does not lose the session and I can begin another engagement.

**AC1.** The page shows a button labelled `Start new assessment`.

**AC2.** The engagement name, client, assessment date, and every score are stored in this browser under the localStorage key `dhc-assessment`, in the JSON shape in assumption 9. Unanswered statements are `null`. A reload immediately after a change restores the new values, including when some statements are still unanswered and the results are hidden.

**AC3.** If `dhc-assessment` is missing, reading it throws, or the saved value is rejected by assumption 9, the form opens with an empty engagement name, an empty client, today’s local date, and no statement selected. A rejected value is not partly applied. These values are rejected: JSON that does not parse, a score of `0` or `6`, a score of `"4"`, a `scores` array whose length is not 20, and a date that is not a real `YYYY-MM-DD` date.

**AC4.** Activating `Start new assessment` opens `window.confirm` with `Start a new assessment? This clears the current answers.` Choosing Cancel, or dismissing the dialog, leaves the name, client, date, answers, and the saved `dhc-assessment` value unchanged.

**AC5.** Choosing OK clears the engagement name, the client, and all 20 answers, sets the assessment date to today’s local date at that moment (including when the session started on an earlier local date), removes `dhc-assessment`, and shows the message in DHC-3 AC1. The key is not written back until the user changes the name, the client, the date, or a score. Reloading before that change opens the empty form in AC3.

### DHC-5 Suggested actions

**Story points:** 1

As a delivery consultant, I want two suggested actions for each Red or Amber area, so that the session can move straight to what to do next.

**AC1.** When the results are shown, the five areas are listed in this order: Scope, Schedule, Team, Quality, Stakeholders. An area whose RAG is Red or Amber shows exactly these two actions, in this order.

Scope:

- Run a one-hour goals and success-measures workshop with the sponsor.
- Agree a lightweight change-request process and keep a change log.

Schedule:

- Re-plan with the team and share the new baseline with the client.
- Start a dependency log with owners and due dates, reviewed weekly.

Team:

- Map skills against the next quarter’s work and close the biggest gap.
- Pair people on critical areas to spread knowledge.

Quality:

- Agree a Definition of Done that includes tests and code review.
- Add automated tests and run them on every pull request.

Stakeholders:

- Set a fixed fortnightly risk review with the sponsor.
- Switch status reports to a simple RAG with honest commentary.

**AC2.** An area whose RAG is Green shows `No action needed` and does not show that area’s two actions. When Scope and Schedule are Red or Amber and Team, Quality, and Stakeholders are Green, Scope and Schedule show their two actions and the other three areas each show `No action needed`.

**AC3.** Changing scores so that an area moves from Green to Red or Amber, or from Red or Amber to Green, updates that area’s text as in AC1 and AC2, without reloading the page. Moving between Red and Amber leaves that area’s two actions as they are.

### DHC-6 One-page summary to print

**Story points:** 2

As a delivery consultant, I want a one-page summary I can print or save as a PDF, so that the client has something short to read after the session.

**AC1.** When the results are shown, a button labelled `Print / Save as PDF` is in the page. When the results are hidden, including after the engagement name is cleared, that button is absent from the page.

**AC2.** Activating `Print / Save as PDF` calls the browser print function (`window.print`). A test may replace that function. The app does not build or download a PDF file.

**AC3.** (manual) The print dialog opens. Print preview shows one summary, in this order: the heading `Delivery Health Check`, the engagement name, the label `Client` with a blank value when the client text is empty, the assessment date as `YYYY-MM-DD`, the overall score and RAG word, the area table, the radar chart, the focus-first line, and the suggested actions from DHC-5. The one-page check is Chrome, A4, default margins, an engagement name and a client that each fit on one line, and all five areas Red or Amber. In that check the summary fits on one page. A longer name or client is still printed in full and may wrap.

**AC4.** (manual) Print preview hides the engagement name field, the client field, the date field, the 20 statement choices, the score scale, the prompt from DHC-3 AC1, the `Print / Save as PDF` button, and the `Start new assessment` button.

## Out of scope for v1

- Login, accounts, and passwords.
- A database, or saving an assessment on a server.
- More than one user, and sharing a link to an assessment.
- Editing the statements, the 1 to 5 meanings, the RAG bands, or the suggested actions in the app.
- Keeping more than one assessment, or a history of past assessments.
- Emailing the summary, or exporting it to a spreadsheet.
- Updating a second open tab without a reload.
