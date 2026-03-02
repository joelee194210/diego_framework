---
name: diego:quick
description: Quick task — execute directly without planning
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Grep
  - Glob
---
<objective>
Execute a quick task directly without the planning phase. For when you already know what to do.
</objective>

<execution_context>
@/Users/slacker/.claude/diego/workflows/quick.md
</execution_context>

<process>
Execute the quick workflow from @/Users/slacker/.claude/diego/workflows/quick.md.
Task description comes from $ARGUMENTS. Supports --thorough flag.
</process>
