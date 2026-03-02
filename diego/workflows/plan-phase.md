<!--
 ═══════════════════════════════════════════════════════════════
  Diego Framework
  Created by Jose Lee <joelee1942@gmail.com>

  For Pampo — my Kwan Ambassador
 ═══════════════════════════════════════════════════════════════
-->
# Workflow: Plan Phase

<context>
Parse $ARGUMENTS to extract phase number and flags.
PHASE_NUM = first numeric argument
THOROUGH = $ARGUMENTS contains "--thorough"

Run: `node ~/.claude/diego/bin/diego-tools.cjs init plan-phase $PHASE_NUM`
Store result as PLAN_CTX.
</context>

<constants>
DIEGO_TOOLS="node ~/.claude/diego/bin/diego-tools.cjs"
</constants>

## Pre-flight

1. Parse PLAN_CTX JSON
2. If PLAN_CTX.phase_dir is null, create phase directory:
   - Read ROADMAP.md to get phase name
   - `$DIEGO_TOOLS phase find $PHASE_NUM` — if not found, prompt user
3. If PLAN_CTX.incomplete_plans has entries:
   - Show: "Phase {N} has {X} incomplete plans. Continue planning or execute existing?"
   - If user wants to execute, suggest `/diego:execute {N}`

## Optional: Research (--thorough only)

**If THOROUGH:**
1. Spawn diego-researcher agent (model: from PLAN_CTX.planner_model):
   - Topic: Phase goal + requirements
   - Output: RESEARCH.md in phase directory
2. Wait for researcher to complete
3. Include research findings in planning context

**If NOT THOROUGH:** Skip research, proceed to planning.

## Planning

Read the following context files:
- `.planning/PROJECT.md` — project vision
- `.planning/REQUIREMENTS.md` — what to build
- `.planning/ROADMAP.md` — phase goal
- Previous phase summaries (if any) — what's already done

Spawn diego-planner agent (model: PLAN_CTX.planner_model) with instructions to:

1. Analyze the phase goal and requirements
2. Break into tasks with clear actions
3. Assign waves for parallelization
4. Write acceptance criteria (Given/When/Then)
5. Define boundaries (NO TOCAR)
6. Write PLAN.md to: `{phase_dir}/{next_plan}-PLAN.md`

The plan must follow the format in @references/plan-format.md.

## Optional: Plan Check (--thorough only)

**If THOROUGH:**
1. Spawn diego-verifier in plan-check mode:
   - Does the plan cover all relevant requirements?
   - Are AC measurable and testable?
   - Are boundaries appropriate?
2. If issues found, iterate (max 2 iterations)

**If NOT THOROUGH:** Skip plan check.

## Commit and Report

If config.commit_docs:
```bash
$DIEGO_TOOLS commit "docs(p{NN}): create plan {next_plan}"
```

Show:
```
─── Plan Created ──────────────────────────────
✓ {next_plan}-PLAN.md
  {task_count} tasks across {wave_count} waves
  {ac_count} acceptance criteria

Next: /diego:execute {N}
```
