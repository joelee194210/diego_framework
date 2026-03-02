# Diego — Plan Format

## Structure

```markdown
---
phase: {NN}
plan: {MM}
wave: 1
autonomous: true
---

<objective>
What to build and why.
</objective>

<acceptance_criteria>
## AC-1: [Name]
Given [precondition]
When [action]
Then [expected result]

## AC-2: [Name]
Given ...
When ...
Then ...
</acceptance_criteria>

<tasks>
<task id="1">
  <name>Descriptive name</name>
  <files>src/path/file.ts</files>
  <action>Exactly what to do</action>
  <verify>Command or check that proves it worked</verify>
  <done>AC-1 satisfied</done>
</task>
</tasks>

<boundaries>
## NO TOCAR
- database/migrations/*
- src/config/secrets.ts
</boundaries>
```

## Naming Convention
`{phase}-{plan}-PLAN.md` — e.g., `01-01-PLAN.md`, `02-03-PLAN.md`

## Frontmatter Fields
- **phase**: Phase number (integer)
- **plan**: Plan number within phase (integer)
- **wave**: Execution wave (for parallelization)
- **autonomous**: Whether executor can run without human approval

## Acceptance Criteria Format
Given/When/Then with AC-N numbering. Each task must link to at least one AC via `<done>`.

## Task Fields
- **id**: Sequential integer
- **name**: Human-readable description
- **files**: Files to create or modify
- **action**: Specific implementation instructions
- **verify**: How to confirm the task succeeded
- **done**: Which AC(s) this task satisfies

## Boundaries
Files and directories that MUST NOT be modified during execution. Critical for safety.
