# Workflow: Remove Phase

<context>
Parse $ARGUMENTS to extract phase number.
PHASE_NUM = first numeric argument
FORCE = $ARGUMENTS contains "--force"
</context>

<constants>
DIEGO_TOOLS="node ~/.claude/diego/bin/diego-tools.cjs"
</constants>

## Pre-flight

1. Run `$DIEGO_TOOLS phase find $PHASE_NUM` — verify phase exists
2. Check if phase has plans:
   - If yes and no --force: ask user to confirm
   - If it's the current executing phase: refuse (too dangerous)

## Remove Phase

```bash
$DIEGO_TOOLS phase remove $PHASE_NUM $( [ "$FORCE" = true ] && echo "--force" )
```

## Report
```
─── Phase Removed ─────────────────────────────
✗ Phase {N} removed from roadmap
  Directory cleaned up
```
