<!--
 ═══════════════════════════════════════════════════════════════
  Diego Framework
  Created by Jose Lee <joelee194210@gmail.com>

  For Pampo — my Kwan Ambassador
 ═══════════════════════════════════════════════════════════════
-->
# Workflow: Do (All-in-One)

<context>
Parse $ARGUMENTS to extract description and flags.
DESCRIPTION = everything after "do" that isn't a flag
THOROUGH = $ARGUMENTS contains "--thorough"

Run: `node ~/.claude/diego/bin/diego-tools.cjs init do $DESCRIPTION`
Store result as DO_CTX.
</context>

<constants>
DIEGO_TOOLS="node ~/.claude/diego/bin/diego-tools.cjs"
</constants>

## Pre-flight

1. Parse DO_CTX JSON
2. Verify .planning/ exists. If not:
   - Show: "No project initialized. Run /diego:init first, or use /diego:quick for standalone tasks."
   - EXIT

## Step 1: Quick Plan

Spawn diego-planner agent (model: DO_CTX.planner_model) in `quick-plan` mode:

**Instructions to planner:**
- Create a plan for: "{DESCRIPTION}"
- Keep it minimal: 1-3 tasks max
- Use ~30% context budget
- Write the plan to: `{DO_CTX.task_dir}/PLAN.md`
- Include AC (Given/When/Then) but keep them concise
- Include boundaries if relevant
- Return immediately — do NOT wait for approval

**If THOROUGH:** Also do plan-check (verify AC coverage, max 1 iteration).

## Step 2: Execute Immediately

Without waiting for user approval, spawn diego-executor agent (model: DO_CTX.executor_model):

**Instructions to executor:**
- Read the plan at `{DO_CTX.task_dir}/PLAN.md`
- Execute all tasks sequentially
- Atomic commit per task: `feat(quick-{slug}-t{N}): {task_name}`
- Run verify checks
- Write SUMMARY.md to `{DO_CTX.task_dir}/SUMMARY.md`

If only 1-2 tasks, execute inline (no subagent) to save overhead.

## Step 3: Auto-Unify (Minimal)

Quick reconciliation:
1. Verify SUMMARY.md exists
2. Verify commits were created
3. Check key files mentioned in plan exist on disk
4. Update STATE.md:
   ```bash
   $DIEGO_TOOLS state add-decision "Completed: {DESCRIPTION}"
   ```

**If THOROUGH:** Full reconciliation:
- Verify all AC
- Run all verify commands
- Check for unintended changes
- Write detailed SUMMARY.md

## Step 4: Commit Planning Docs

If config.commit_docs:
```bash
$DIEGO_TOOLS commit "docs(quick): {slug} — plan + summary"
```

## Report

```
─── Done ──────────────────────────────────────
⚡ {DESCRIPTION}

Tasks: {completed}/{total}
Commits: {commit_list}
Files: {files_modified}

{deviations > 0 ? "⚠ Deviations: {count}" : "✓ All AC satisfied"}
```
