<!--
 ═══════════════════════════════════════════════════════════════
  Diego Framework
  Created by Jose Lee <joelee1942@gmail.com>

  For Pampo — my Kwan Ambassador
 ═══════════════════════════════════════════════════════════════
-->
# Workflow: Generate Handoff

<context>
Run: `node ~/.claude/diego/bin/diego-tools.cjs state snapshot`
Store result as STATE.
</context>

<constants>
DIEGO_TOOLS="node ~/.claude/diego/bin/diego-tools.cjs"
</constants>

## Generate Comprehensive Handoff

This is a more detailed version of pause-work, designed for sharing context with another person or session.

1. Read all project files:
   - PROJECT.md, REQUIREMENTS.md, ROADMAP.md, STATE.md
   - Current phase plans and summaries
   - Recent decisions

2. Write `.planning/HANDOFF.md` with comprehensive context:
   - Full project overview
   - Current position and status
   - All work completed
   - Detailed next steps
   - Architecture decisions and rationale
   - Known issues and risks
   - File index of key files

## Commit

If config.commit_docs:
```bash
$DIEGO_TOOLS commit "docs(planning): comprehensive handoff"
```

## Report
```
─── Handoff Generated ─────────────────────────
Saved to .planning/HANDOFF.md
Share this file to transfer full project context.
```
