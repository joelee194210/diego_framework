---
name: diego:verify
description: Verify that a phase achieved its goal
allowed-tools:
  - Read
  - Write
  - Bash
  - Grep
  - Glob
  - Agent
---
<objective>
Goal-backward verification: check if the phase delivered what it promised.
</objective>

<execution_context>
@/Users/slacker/.claude/diego/workflows/verify-phase.md
</execution_context>

<process>
Execute the verify-phase workflow from @/Users/slacker/.claude/diego/workflows/verify-phase.md.
Phase number comes from $ARGUMENTS.
</process>
