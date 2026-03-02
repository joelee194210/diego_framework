# Workflow: Verify Phase

<context>
Parse $ARGUMENTS to extract phase number.
PHASE_NUM = first numeric argument

Run: `node ~/.claude/diego/bin/diego-tools.cjs init verify $PHASE_NUM`
Store result as VERIFY_CTX.
</context>

<constants>
DIEGO_TOOLS="node ~/.claude/diego/bin/diego-tools.cjs"
</constants>

## Pre-flight

1. Parse VERIFY_CTX JSON
2. If VERIFY_CTX.completed < VERIFY_CTX.total:
   - Show: "Phase {N} has incomplete plans ({completed}/{total}). Execute remaining first."
   - EXIT unless user confirms partial verification

## Verification

Spawn diego-verifier agent (model: VERIFY_CTX.verifier_model) with:

### Goal-Backward Analysis
Start from the phase goal (VERIFY_CTX.phase_goal) and work backward:

1. **Goal Check:** Does the codebase now deliver what the phase promised?
2. **AC Check:** For each plan's acceptance criteria:
   - Run the `<verify>` command from each task
   - Check Given/When/Then conditions
   - Mark as PASS/FAIL/PARTIAL
3. **Artifact Check:** Do all expected files exist?
4. **Integration Check:** Does the new code work with existing code?
5. **Regression Check:** Are there obvious regressions?

### Write Verification Report

Create `{phase_dir}/{NN}-VERIFICATION.md`:
```
---
phase: {N}
verified: true/false
timestamp: {now}
---
# Verification — Phase {N}
## Phase Goal
{goal}
## Results
| Check | Result | Evidence |
...
## Assessment
{pass/fail with reasoning}
## Issues
{any issues found}
## Recommendation
{proceed/fix/replan}
```

## Update State

```bash
$DIEGO_TOOLS state update status "verified"
```

If config.commit_docs:
```bash
$DIEGO_TOOLS commit "docs(p{NN}): verification report"
```

## Report

```
─── Verification Complete ─────────────────────
Phase {N}: {PASS/FAIL}
AC: {passed}/{total} passed
Issues: {count}
Recommendation: {proceed/fix/replan}
```
