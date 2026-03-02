---
name: diego:execute
description: Execute plans for a phase with wave-based parallelization
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
Execute all incomplete plans in a phase using subagent-based wave parallelization. Each task gets an atomic commit.
</objective>

<execution_context>
@/Users/slacker/.claude/diego/workflows/execute-phase.md
</execution_context>

<process>
Execute the execute-phase workflow from @/Users/slacker/.claude/diego/workflows/execute-phase.md.
Phase number comes from $ARGUMENTS. Supports --thorough flag for post-execution verification.
Use subagent criteria from @/Users/slacker/.claude/diego/references/subagent-criteria.md.
Use git strategy from @/Users/slacker/.claude/diego/references/git-strategy.md.
</process>
