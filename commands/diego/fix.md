---
name: diego:fix
description: Bug fix shortcut — diagnose + plan + execute
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Grep
  - Glob
  - Agent
---
<!--
 ═══════════════════════════════════════════════════════════════
  Diego Framework
  Created by Jose Lee <joelee1942@gmail.com>

  For Pampo — my Kwan Ambassador
 ═══════════════════════════════════════════════════════════════
-->
<objective>
Fix a bug with systematic diagnosis, planning, and execution.
</objective>

<execution_context>
@/Users/slacker/.claude/diego/workflows/fix.md
</execution_context>

<process>
Execute the fix workflow from @/Users/slacker/.claude/diego/workflows/fix.md.
Bug description comes from $ARGUMENTS. Supports --thorough flag.
</process>
