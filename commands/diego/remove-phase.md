---
name: diego:remove-phase
description: Remove a future phase from the roadmap
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
---
<objective>
Remove a phase from the roadmap and clean up its directory.
</objective>

<execution_context>
@/Users/slacker/.claude/diego/workflows/remove-phase.md
</execution_context>

<process>
Execute the remove-phase workflow from @/Users/slacker/.claude/diego/workflows/remove-phase.md.
Phase number comes from $ARGUMENTS. Supports --force flag.
</process>
