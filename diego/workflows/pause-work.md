<!--
 ═══════════════════════════════════════════════════════════════
  Diego Framework
  Created by Jose Lee <joelee1942@gmail.com>

  For Pampo — my Kwan Ambassador
 ═══════════════════════════════════════════════════════════════
-->
# Workflow: Pause Work

<context>
Parse $ARGUMENTS to extract optional reason.
REASON = everything after "pause" that isn't a flag

Run: `node ~/.claude/diego/bin/diego-tools.cjs state snapshot`
Store result as STATE.
</context>

<constants>
DIEGO_TOOLS="node ~/.claude/diego/bin/diego-tools.cjs"
</constants>

## Create Handoff

1. Read current STATE.md
2. Summarize what was done in this session
3. Identify what's next
4. Note any important decisions or open questions

Write `.planning/HANDOFF.md`:
```markdown
# Handoff — {timestamp}

## Current State
- Phase: {phase} — {name}
- Plan: {plan}
- Status: {status}
- Reason for pause: {REASON or "Session ended"}

## What Was Done
{summary of work completed this session}

## What's Next
{immediate next steps}

## Important Decisions
{decisions made this session}

## Open Questions
{unresolved questions}

## Resume Command
/diego:resume
```

## Update State

```bash
$DIEGO_TOOLS state patch --status paused
$DIEGO_TOOLS state add-decision "Paused: {REASON}"
```

## Commit

If config.commit_docs:
```bash
$DIEGO_TOOLS commit "docs(planning): pause handoff"
```

## Report

```
─── Paused ────────────────────────────────────
Handoff saved to .planning/HANDOFF.md
Resume with: /diego:resume
```
