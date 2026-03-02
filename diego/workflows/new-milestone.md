# Workflow: New Milestone

<context>
Parse $ARGUMENTS to extract milestone name.
MILESTONE_NAME = everything after "milestone"
</context>

<constants>
DIEGO_TOOLS="node ~/.claude/diego/bin/diego-tools.cjs"
</constants>

## Pre-flight

1. Load state: `$DIEGO_TOOLS state load`
2. Check if current milestone is complete (all phases done)
3. If not complete, warn user and ask to confirm

## Create Milestone

1. Update PROJECT.md with new milestone context
2. Create new ROADMAP.md (or append milestone section)
3. Update STATE.md:
   ```bash
   $DIEGO_TOOLS state patch --milestone "$MILESTONE_NAME" --phase 1 --plan 0 --status initialized
   ```
4. Create `.planning/milestones/` directory if not exists

## Engage User

Ask for milestone requirements:
1. What are the goals for this milestone?
2. Key features/deliverables?
3. Any constraints or deadlines?

Create/update REQUIREMENTS.md with new milestone scope.

## Commit

If config.commit_docs:
```bash
$DIEGO_TOOLS commit "docs(milestone): start {MILESTONE_NAME}"
```

## Report
```
╔═══════════════════════════════════════════════╗
║  DIEGO — New Milestone: {NAME}               ║
╚═══════════════════════════════════════════════╝

✓ Milestone initialized
✓ Requirements captured

Next: /diego:plan 1 to plan the first phase
```
