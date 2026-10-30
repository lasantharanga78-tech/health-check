# Delivery Health Check — idea brief

## Who

Delivery consultants assessing a client's software delivery engagement, usually with the delivery lead in a 30-minute session.

## Problem

Health checks are done in spreadsheets, scored inconsistently, and take an hour to turn into something the client can read.

## What v1 does

- **Engagement details:** engagement name (required), client, and assessment date (defaults to today).
- **20 statements in 5 areas:** Scope, Schedule, Team, Quality, and Stakeholders. Four statements per area, taken from `docs/question-bank.md`.
- **Each statement is answered from 1 to 5:**

  | Score | Meaning           |
  | ----- | ----------------- |
  | 1     | Strongly disagree |
  | 2     | Disagree          |
  | 3     | Partly            |
  | 4     | Agree             |
  | 5     | Strongly agree    |

- **Results appear only when** all 20 statements are answered and the engagement name is filled in.

## Scoring rules

- **Area score** = average of its 4 answers, rounded to 1 decimal place (halves round up: 4.25 → 4.3).
- **RAG bands:**

  | Band  | Score        |
  | ----- | ------------ |
  | Green | 4.0 and above |
  | Amber | 3.0 to 3.9   |
  | Red   | Below 3.0    |

- **Overall score** = average of the 5 area scores, rounded to 1 decimal. Overall RAG uses the same bands, except it cannot be Green if any area is Red (then it is Amber).
- **Focus first** = the lowest-scoring area. On a tie, use the area listed first.

## Results

- Overall score and RAG.
- Table of areas with score and RAG (word plus colour).
- Radar chart on a 0–5 scale.
- A "Focus first" label.
- Two suggested actions for each Red or Amber area. Green areas show "No action needed".

## Also in v1

- Answers are saved in the browser and restored on reload.
- **Start new assessment** clears the form after confirming.
- **Print / Save as PDF** gives a one-page A4 summary without buttons.

## Not in v1

Login, a database, multiple users, sharing links, and editing statements in the app.
