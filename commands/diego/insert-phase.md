---
name: diego:insert-phase
description: Insert a phase at a decimal position between existing phases
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
---
<objective>
Insert a new phase between existing phases using decimal numbering.
</objective>

<execution_context>
@/Users/slacker/.claude/diego/workflows/insert-phase.md
</execution_context>

<process>
Execute the insert-phase workflow from @/Users/slacker/.claude/diego/workflows/insert-phase.md.
Arguments: <after_phase_number> <description> from $ARGUMENTS.
</process>
