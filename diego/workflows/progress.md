# Workflow: Progress

<context>
Run: `node ~/.claude/diego/bin/diego-tools.cjs init progress`
Store result as PROG_CTX.
</context>

<constants>
DIEGO_TOOLS="node ~/.claude/diego/bin/diego-tools.cjs"
</constants>

## Pre-flight

1. Parse PROG_CTX JSON
2. If PROG_CTX.state.exists is false:
   - Show: "No project initialized. Run /diego:init to start."
   - EXIT

## Status Display

Show current project status:

```
╔═══════════════════════════════════════════════╗
║  DIEGO — Project Progress                    ║
╚═══════════════════════════════════════════════╝

Milestone: {milestone} (v{version})
Profile: {profile} | Mode: ⚡ fast

Phases: [{progress_bar}] {completed}/{total}
```

### Phase Details
For each phase in the roadmap:
```
{status_symbol} Phase {N}: {name}
  Plans: {completed_plans}/{total_plans}
```

### Current Position
```
─── Current ───────────────────────────────────
Phase: {current_phase} — {phase_name}
Plan: {current_plan}
Status: {status}
```

### Recent Decisions
Show last 3 decisions from STATE.md.

### Blockers
Show any active blockers.

## Routing

Based on current status, suggest next action:

| Status | Suggestion |
|--------|------------|
| `initialized` | `/diego:plan 1` — Create first plan |
| `planning` | Continue planning current phase |
| `planned` | `/diego:execute {N}` — Execute the plan |
| `executing` | Resume execution |
| `executed` | `/diego:unify {N}` — Reconcile results |
| `unified` | `/diego:plan {N+1}` — Next phase |
| `verified` | `/diego:plan {N+1}` — Next phase |
| `phase_completed` | `/diego:plan {N+1}` — Next phase |
| `blocked` | Resolve blockers first |

Show:
```
─── Next Action ───────────────────────────────
Suggested: {command}
{reason}
```
