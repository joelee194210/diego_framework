<!--
 ═══════════════════════════════════════════════════════════════
  Diego Framework
  Created by Jose Lee <joelee1942@gmail.com>

  For Pampo — my Kwan Ambassador
 ═══════════════════════════════════════════════════════════════
-->
# Diego — Model Profiles

## Profile Table

| Agent | quality | balanced | budget |
|-------|---------|----------|--------|
| diego-planner | opus | opus | sonnet |
| diego-executor | opus | sonnet | sonnet |
| diego-verifier | sonnet | sonnet | haiku |
| diego-researcher | opus | sonnet | haiku |
| diego-mapper | sonnet | haiku | haiku |
| diego-debugger | opus | sonnet | sonnet |

## Selecting a Profile

Set in `.planning/config.json`:
```json
{ "model_profile": "balanced" }
```

Or via `/diego:settings`.

## When to Use Each

- **quality**: Complex architecture, critical decisions, novel problems. Higher cost but better reasoning.
- **balanced** (default): Normal development work. Good balance of capability and cost.
- **budget**: High-volume tasks, repetitive operations, simple mapping. Lowest cost.

## Resolution Logic

```bash
node ~/.claude/diego/bin/diego-tools.cjs resolve-model <agent-type>
```

Reads `model_profile` from config, looks up the agent in the table, returns the model name (opus/sonnet/haiku).
