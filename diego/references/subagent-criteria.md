<!--
 ═══════════════════════════════════════════════════════════════
  Diego Framework
  Created by Jose Lee <joelee1942@gmail.com>

  For Pampo — my Kwan Ambassador
 ═══════════════════════════════════════════════════════════════
-->
# Diego — Subagent Criteria

## Decision Matrix

| Criterion | Use Subagent | Stay Inline |
|-----------|-------------|-------------|
| Independence | Task has no deps on prior result | Needs main context |
| Size | Large output (research, analysis) | Small change (< 5 lines) |
| Parallelism | Can run with other tasks | Sequential dependency |
| Model | Needs different model than main | Same model fine |
| Isolation | Benefits from clean context | Needs conversation history |

## Agent-Specific Rules

### diego-planner
**Always subagent.** Planning benefits from focused context and opus-level reasoning.

### diego-executor
**Subagent per wave.** Multiple executors run in parallel for independent tasks. Sequential within a wave if tasks depend on each other.

### diego-verifier
**Only in --thorough mode.** Fast mode skips verification entirely.

### diego-researcher
**Only in --thorough mode** or explicit `/diego:research`. Research is the most skippable gate.

### diego-mapper
**Always subagent.** Can use cheaper model (haiku). Output is large (codebase analysis).

### diego-debugger
**Always subagent.** Needs isolation to explore without polluting main context.

## Wave-Based Parallelization

Tasks are grouped into waves by dependency:
- **Wave 1:** Independent tasks → all run in parallel
- **Wave 2:** Tasks depending on Wave 1 → run after Wave 1 completes
- **Wave N:** Continue until all tasks done

Within a wave, spawn one executor subagent per task (up to reasonable limit).
