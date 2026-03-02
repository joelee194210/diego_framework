---
name: diego:unify
description: Reconcile plan vs reality and close the phase loop
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Grep
  - Glob
---
<objective>
Reconcile what was planned vs what was actually built. Update state, mark phase complete.
</objective>

<execution_context>
@/Users/slacker/.claude/diego/workflows/unify-phase.md
</execution_context>

<process>
Execute the unify-phase workflow from @/Users/slacker/.claude/diego/workflows/unify-phase.md.
Phase number comes from $ARGUMENTS. Supports --thorough flag for full AC verification.
</process>
