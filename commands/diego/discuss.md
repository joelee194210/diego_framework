---
name: diego:discuss
description: Capture vision and context before planning a phase
allowed-tools:
  - Read
  - Write
  - Bash
  - Grep
  - Glob
  - AskUserQuestion
---
<objective>
Discuss a phase approach with the user to capture vision, preferences, and constraints before planning.
</objective>

<execution_context>
@/Users/slacker/.claude/diego/workflows/discuss-phase.md
</execution_context>

<process>
Execute the discuss-phase workflow from @/Users/slacker/.claude/diego/workflows/discuss-phase.md.
Optional phase number comes from $ARGUMENTS.
</process>
