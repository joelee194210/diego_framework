# Workflow: Complete Milestone

<context>
Run: `node ~/.claude/diego/bin/diego-tools.cjs state load`
Store result as STATE.
</context>

<constants>
DIEGO_TOOLS="node ~/.claude/diego/bin/diego-tools.cjs"
</constants>

## Pre-flight

1. Parse STATE
2. Check all phases are complete
3. If not, show incomplete phases and ask user to confirm

## Archive Milestone

1. Read ROADMAP.md for final phase count and status
2. Create milestone summary in `.planning/milestones/{version}-{name}/`:
   - Copy ROADMAP.md
   - Create MILESTONE-SUMMARY.md with:
     - Phases completed
     - Total tasks/commits
     - Key decisions
     - Duration
3. Optionally archive phase directories (move to milestone dir)

## Update State

```bash
$DIEGO_TOOLS state patch --status milestone_complete
$DIEGO_TOOLS state add-decision "Milestone {name} completed"
```

## Commit

```bash
$DIEGO_TOOLS commit "docs(milestone): complete {name}"
```

## Report
```
╔═══════════════════════════════════════════════╗
║  DIEGO — Milestone Complete: {NAME}          ║
╚═══════════════════════════════════════════════╝

✓ {phase_count} phases completed
✓ Archived to milestones/{version}-{name}/

Next: /diego:milestone <name> for next milestone
```
