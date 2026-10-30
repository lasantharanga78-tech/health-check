---
name: review-story
description: >-
  Review uncommitted changes against one story’s acceptance criteria in
  docs/requirements.md. Use when the user gives a ticket id such as DHC-3,
  or asks to review the current changes against a story.
disable-model-invocation: true
---

# Review a story

The user gives only a ticket id, such as `DHC-3`. Review the uncommitted changes against that story. Do not edit anything.

## Steps

1. Read `docs/requirements.md` and use only that ticket’s acceptance criteria. Treat criteria marked `(manual)` as manual.
2. Read the uncommitted changes, including untracked files. Do not review committed work on the branch.
3. Find tests named `DHC-<n> AC<k>:`.

## Report

For each AC, say met / not met / unsure, and which test covers it. Then list anything risky or unnecessary in the changes. Don't edit anything.

- **met**: the change does what the criterion says, and a test named for that criterion checks it. A `(manual)` criterion is met when the change does it and no automated test is required.
- **not met**: the change misses the criterion, or the named test is missing for a criterion that is not `(manual)`.
- **unsure**: the diff is not enough to decide.

Name the test by its full `it(...)` title. If no test covers the criterion, say so.
