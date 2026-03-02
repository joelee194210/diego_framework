---
name: diego:map-codebase
description: Analyze existing codebase with parallel mapper agents
allowed-tools:
  - Read
  - Write
  - Bash
  - Grep
  - Glob
  - Agent
---
<!--
 ═══════════════════════════════════════════════════════════════
  Diego Framework
  Created by Jose Lee <joelee194210@gmail.com>

  For Pampo — my Kwan Ambassador
 ═══════════════════════════════════════════════════════════════
-->
<objective>
Map the existing codebase across 4 dimensions: technology, architecture, quality, and concerns.
</objective>

<execution_context>
@/Users/slacker/.claude/diego/workflows/map-codebase.md
</execution_context>

<process>
Execute the map-codebase workflow from @/Users/slacker/.claude/diego/workflows/map-codebase.md.
Spawns 4 parallel mapper agents for comprehensive analysis.
</process>
