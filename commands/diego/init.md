---
name: diego:init
description: Initialize a new project with Diego (questioning, requirements, roadmap)
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Grep
  - Glob
  - Agent
  - AskUserQuestion
---
<!--
 ═══════════════════════════════════════════════════════════════
  Diego Framework
  Created by Jose Lee <joelee194210@gmail.com>

  For Pampo — my Kwan Ambassador
 ═══════════════════════════════════════════════════════════════
-->
<objective>
Initialize a new project by gathering requirements through adaptive questioning, then creating PROJECT.md, REQUIREMENTS.md, ROADMAP.md, STATE.md and config.json.
</objective>

<execution_context>
@/Users/slacker/.claude/diego/workflows/init-project.md
</execution_context>

<process>
Execute the init-project workflow from @/Users/slacker/.claude/diego/workflows/init-project.md end-to-end.
Follow all phases: questioning, PROJECT.md, REQUIREMENTS.md, ROADMAP.md, STATE.md, config.json.
Use the Diego UI brand from @/Users/slacker/.claude/diego/references/ui-brand.md for output formatting.
</process>
