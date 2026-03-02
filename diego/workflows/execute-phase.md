<!--
 ═══════════════════════════════════════════════════════════════
  Diego Framework
  Created by Jose Lee <joelee1942@gmail.com>

  For Pampo — my Kwan Ambassador
 ═══════════════════════════════════════════════════════════════
-->
# Workflow: Execute Phase

<context>
Parse $ARGUMENTS to extract phase number and flags.
PHASE_NUM = first numeric argument
THOROUGH = $ARGUMENTS contains "--thorough"

Run: `node ~/.claude/diego/bin/diego-tools.cjs init execute-phase $PHASE_NUM`
Store result as EXEC_CTX.
</context>

<constants>
DIEGO_TOOLS="node ~/.claude/diego/bin/diego-tools.cjs"
</constants>

## Pre-flight

1. Parse EXEC_CTX JSON
2. If EXEC_CTX.incomplete_plans is empty:
   - Show: "All plans in Phase {N} are complete. Run /diego:unify {N} to reconcile."
   - EXIT
3. Update STATE.md:
   ```bash
   $DIEGO_TOOLS state patch --phase $PHASE_NUM --status executing
   ```

## Wave Discovery

EXEC_CTX.waves contains plans grouped by wave number.
Process waves sequentially (Wave 1 → Wave 2 → ...).
Within each wave, execute plans in parallel.

## Wave Execution Loop

For each wave (starting from EXEC_CTX.first_wave):

### 1. Read Plans
For each plan in the wave, read the PLAN.md file.

### 2. Spawn Executors
For each plan in the wave, spawn a diego-executor agent:
- **Model:** EXEC_CTX.executor_model
- **Instructions:** Execute all tasks in the plan sequentially
- **Context:** The full PLAN.md content + relevant project files
- **Requirements:**
  - Execute each `<task>` in order
  - Run `<verify>` check after each task
  - Create atomic commit per task: `feat(p{NN}-t{XX}): {task_name}`
  - If a task fails verification, attempt fix (max 2 retries)
  - If still failing, log as deviation and continue
  - After all tasks, create SUMMARY.md

If only 1 plan in wave, execute inline (no subagent needed) to save context overhead.

### 3. Collect Results
Wait for all executors in the wave to complete.
For each executor result:
- Check SUMMARY.md was created
- Check commits exist
- Log any deviations

### 4. Update Progress
```bash
$DIEGO_TOOLS roadmap update-plan-progress $PHASE_NUM
```

### 5. Next Wave
Continue to next wave if more waves exist.

## Post-Execution

### Update State
```bash
$DIEGO_TOOLS state patch --status executed --plan $LAST_PLAN
```

### Optional: Verification (--thorough only)

**If THOROUGH:**
Spawn diego-verifier agent:
- Check all AC from all plans are satisfied
- Check all expected files exist
- Run any automated tests
- Write VERIFICATION.md

**If NOT THOROUGH:** Skip verification.

### Auto-Unify

If config.auto_unify is true:
- Run the unify workflow inline (minimal mode)
- This reconciles plan vs actual and updates STATE.md

## Report

```
╔═══════════════════════════════════════════════╗
║  DIEGO — Phase {N} Executed                  ║
╚═══════════════════════════════════════════════╝

Plans: {completed}/{total}
Tasks: {tasks_done}/{tasks_total}
Commits: {commit_count}
Deviations: {deviation_count}

Next: /diego:unify {N} (if not auto-unified)
  or: /diego:plan {N+1} (if phase complete)
```
