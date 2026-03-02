---
name: diego:research
description: Research a topic or ecosystem for the project
allowed-tools:
  - Read
  - Write
  - Bash
  - Grep
  - Glob
  - Agent
  - WebSearch
  - WebFetch
---
<!--
 ═══════════════════════════════════════════════════════════════
  Diego Framework
  Created by Jose Lee <joelee194210@gmail.com>

  For Pampo — my Kwan Ambassador
 ═══════════════════════════════════════════════════════════════
-->
<objective>
Research a topic, technology, or ecosystem and produce a structured research document.
</objective>

<execution_context>
@/Users/slacker/.claude/diego/workflows/research.md
</execution_context>

<process>
Execute the research workflow from @/Users/slacker/.claude/diego/workflows/research.md.
Research topic comes from $ARGUMENTS.
</process>
