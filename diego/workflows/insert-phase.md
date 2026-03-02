# Workflow: Insert Phase

<context>
Parse $ARGUMENTS to extract position and description.
AFTER = first numeric argument (insert after this phase)
DESCRIPTION = remaining text
</context>

<constants>
DIEGO_TOOLS="node ~/.claude/diego/bin/diego-tools.cjs"
</constants>

## Insert Phase

Calculate decimal phase number (e.g., inserting after Phase 2 → Phase 2.1).

1. Read ROADMAP.md
2. Find Phase {AFTER}
3. Determine next decimal: if 2.1 exists, use 2.2, etc.
4. Create directory: `.planning/phases/{NN.N}-{slug}/`
5. Add phase section to ROADMAP.md after Phase {AFTER}

## Commit

If config.commit_docs:
```bash
$DIEGO_TOOLS commit "docs(roadmap): insert phase {N.N} — {description}"
```

## Report
```
─── Phase Inserted ────────────────────────────
✓ Phase {N.N}: {description}
  Inserted after Phase {AFTER}
  Directory: .planning/phases/{dir_name}/

Next: /diego:plan {N.N}
```
