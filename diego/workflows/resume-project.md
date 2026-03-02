<!--
 ═══════════════════════════════════════════════════════════════
  Diego Framework
  Created by Jose Lee <joelee1942@gmail.com>

  For Pampo — my Kwan Ambassador
 ═══════════════════════════════════════════════════════════════
-->
# Workflow: Resume Project

<context>
Run: `node ~/.claude/diego/bin/diego-tools.cjs init resume`
Store result as RESUME_CTX.
</context>

<constants>
DIEGO_TOOLS="node ~/.claude/diego/bin/diego-tools.cjs"
</constants>

## Pre-flight

1. Parse RESUME_CTX JSON
2. If not RESUME_CTX.state.exists:
   - Show: "No project found. Run /diego:init to start."
   - EXIT

## Context Restoration

### Read Handoff (if exists)
If RESUME_CTX.has_handoff:
1. Read HANDOFF.md
2. Display key sections to user:
   - What was done
   - What's next
   - Open questions

### Read State
1. Read STATE.md for position
2. Read ROADMAP.md for overview
3. Read current phase plans and summaries

### Build Context Summary

```
╔═══════════════════════════════════════════════╗
║  DIEGO — Resuming Project                    ║
╚═══════════════════════════════════════════════╝

Phase: {phase} — {name}
Status: {status}
Last Updated: {timestamp}
```

If handoff exists:
```
─── From Last Session ─────────────────────────
{what_was_done}

─── Next Steps ────────────────────────────────
{what_next}

─── Open Questions ────────────────────────────
{questions}
```

### Update State
```bash
$DIEGO_TOOLS state patch --status resuming
```

## Route to Next Action

Based on status, suggest next command (same routing as progress workflow):
```
─── Suggested Next Action ─────────────────────
{command and reason}
```

Remove HANDOFF.md after successful resume (it's been consumed).
