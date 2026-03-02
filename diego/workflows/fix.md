# Workflow: Fix Bug

<context>
Parse $ARGUMENTS to extract description and flags.
DESCRIPTION = everything after "fix" that isn't a flag
THOROUGH = $ARGUMENTS contains "--thorough"

Run: `node ~/.claude/diego/bin/diego-tools.cjs init fix $DESCRIPTION`
Store result as FIX_CTX.
</context>

<constants>
DIEGO_TOOLS="node ~/.claude/diego/bin/diego-tools.cjs"
</constants>

## Pre-flight

1. Parse FIX_CTX JSON

## Step 1: Diagnose

Spawn diego-debugger agent (model: FIX_CTX.debugger_model):

**Instructions:**
- Investigate the bug: "{DESCRIPTION}"
- Use scientific method: hypothesis → test → conclude
- Identify root cause
- Write diagnosis to `{FIX_CTX.task_dir}/DIAGNOSIS.md`
- Include: symptoms, root cause, affected files, proposed fix

If the bug is simple/obvious, diagnose inline (no subagent).

## Step 2: Plan Fix

Based on the diagnosis, create a minimal fix plan:

Spawn diego-planner agent (model: FIX_CTX.planner_model) in `fix-plan` mode:

**Instructions:**
- Read DIAGNOSIS.md
- Create minimal plan to fix the root cause
- Include regression test if applicable
- Write to `{FIX_CTX.task_dir}/PLAN.md`
- 1-3 tasks max

For simple bugs (single file fix), skip the planner and create plan inline.

## Step 3: Execute Fix

Spawn diego-executor agent (model: FIX_CTX.executor_model):

**Instructions:**
- Execute the fix plan
- Commit: `fix({scope}): {description}`
- Run tests to verify fix
- Run tests to check no regression
- Write SUMMARY.md

For simple fixes, execute inline.

## Step 4: Auto-Unify

1. Verify fix was committed
2. Verify tests pass (if applicable)
3. Update STATE.md:
   ```bash
   $DIEGO_TOOLS state add-decision "Fixed: {DESCRIPTION}"
   ```

**If THOROUGH:**
- Full regression test suite
- Verify all related functionality still works
- Detailed fix report

## Report

```
─── Bug Fixed ─────────────────────────────────
🔧 {DESCRIPTION}

Root Cause: {root_cause}
Fix: {fix_summary}
Commits: {commit_list}
Tests: {test_results}
```
