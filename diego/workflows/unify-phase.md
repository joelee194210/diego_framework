<!--
 ═══════════════════════════════════════════════════════════════
  Diego Framework
  Created by Jose Lee <joelee1942@gmail.com>

  For Pampo — my Kwan Ambassador
 ═══════════════════════════════════════════════════════════════
-->
# Workflow: Unify Phase

<context>
Parse $ARGUMENTS to extract phase number and flags.
PHASE_NUM = first numeric argument
THOROUGH = $ARGUMENTS contains "--thorough"

Run: `node ~/.claude/diego/bin/diego-tools.cjs init execute-phase $PHASE_NUM`
Store result as UNIFY_CTX (reuses execute-phase init for plan index).
</context>

<constants>
DIEGO_TOOLS="node ~/.claude/diego/bin/diego-tools.cjs"
</constants>

## Pre-flight

1. Parse UNIFY_CTX JSON
2. Read all SUMMARY.md files from the phase directory
3. Read all PLAN.md files from the phase directory

## Reconciliation

### Plan vs Reality Comparison
For each plan:
1. Read the PLAN.md (intended)
2. Read the SUMMARY.md (actual)
3. Compare:
   - Tasks planned vs tasks completed
   - Files intended vs files actually modified
   - AC expected vs AC satisfied
   - Deviations logged

### Minimal Mode (default / fast)
- Verify all SUMMARY.md files exist
- Check that key files mentioned in plans exist on disk
- Quick AC spot-check (verify 1-2 commands)
- Update STATE.md with completion status

### Full Mode (--thorough)
- Complete AC verification for every criterion
- Run all `<verify>` commands from all tasks
- Check for unintended side effects (unexpected file changes)
- Detailed reconciliation report

## Write Phase Summary

Create `.planning/phases/{NN}-{slug}/PHASE-SUMMARY.md` with:
- Total tasks completed
- All AC results
- Deviations from plan
- Cumulative file changes
- Cumulative commits

## Update State

```bash
$DIEGO_TOOLS phase complete $PHASE_NUM
$DIEGO_TOOLS state patch --phase $NEXT_PHASE --plan 0 --status unified
```

## Commit

If config.commit_docs:
```bash
$DIEGO_TOOLS commit "docs(p{NN}): unify phase — plan vs reality reconciled"
```

## Report

```
─── Phase {N} Unified ─────────────────────────
✓ {plans_total} plans reconciled
✓ {ac_passed}/{ac_total} acceptance criteria met
{deviations_count > 0 ? "⚠ {N} deviations logged" : "✓ No deviations"}

◇ DECISION: Phase {N} complete — moving to Phase {N+1}

Next: /diego:plan {N+1}
```
