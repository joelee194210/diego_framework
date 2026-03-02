---
name: diego:pause
description: Create handoff and pause work
allowed-tools:
  - Read
  - Write
  - Bash
  - Grep
  - Glob
---
<objective>
Save current work context to HANDOFF.md for resuming later.
</objective>

<execution_context>
@/Users/slacker/.claude/diego/workflows/pause-work.md
</execution_context>

<process>
Execute the pause-work workflow from @/Users/slacker/.claude/diego/workflows/pause-work.md.
Optional reason comes from $ARGUMENTS.
</process>
