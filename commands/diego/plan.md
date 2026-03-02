---
name: diego:plan
description: Create an executable plan for a phase
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Grep
  - Glob
  - Agent
---
<objective>
Create a detailed, executable plan (PLAN.md) for the specified phase with acceptance criteria and task breakdown.
</objective>

<execution_context>
@/Users/slacker/.claude/diego/workflows/plan-phase.md
</execution_context>

<process>
Execute the plan-phase workflow from @/Users/slacker/.claude/diego/workflows/plan-phase.md.
Phase number comes from $ARGUMENTS. Supports --thorough flag for research + plan-check.
Use model profiles from @/Users/slacker/.claude/diego/references/model-profiles.md.
Use plan format from @/Users/slacker/.claude/diego/references/plan-format.md.
</process>
