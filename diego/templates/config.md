<!--
 ═══════════════════════════════════════════════════════════════
  Diego Framework
  Created by Jose Lee <joelee194210@gmail.com>

  For Pampo — my Kwan Ambassador
 ═══════════════════════════════════════════════════════════════
-->
# Diego Configuration — config.json

## Location
`.planning/config.json`

## Schema

```json
{
  "model_profile": "balanced",
  "commit_docs": true,
  "branching_strategy": "none",
  "phase_branch_template": "diego/phase-{phase}-{slug}",
  "milestone_branch_template": "diego/{milestone}-{slug}",
  "thorough_default": false,
  "auto_unify": true
}
```

## Fields

### model_profile
- Type: `"quality" | "balanced" | "budget"`
- Default: `"balanced"`
- Controls which AI model each agent uses

### commit_docs
- Type: `boolean`
- Default: `true`
- Auto-commit planning documents after generation

### branching_strategy
- Type: `"none" | "phase-branch" | "feature-branch"`
- Default: `"none"`

### thorough_default
- Type: `boolean`
- Default: `false`
- If true, all commands run in thorough mode by default

### auto_unify
- Type: `boolean`
- Default: `true`
- Automatically run UNIFY after execute completes
