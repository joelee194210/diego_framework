# Workflow: Add Phase

<context>
Parse $ARGUMENTS to extract phase description.
DESCRIPTION = everything after "add-phase"
</context>

<constants>
DIEGO_TOOLS="node ~/.claude/diego/bin/diego-tools.cjs"
</constants>

## Add Phase

```bash
RESULT=$($DIEGO_TOOLS phase add "$DESCRIPTION")
```

Parse result for phase number and directory path.

## Update Roadmap Details

Read ROADMAP.md and enhance the new phase entry with:
- A clear, specific goal
- Key deliverables
- Dependencies on prior phases (if any)

## Commit

If config.commit_docs:
```bash
$DIEGO_TOOLS commit "docs(roadmap): add phase {N} — {description}"
```

## Report
```
─── Phase Added ───────────────────────────────
✓ Phase {N}: {description}
  Directory: .planning/phases/{dir_name}/

Next: /diego:plan {N} to create the plan
```
