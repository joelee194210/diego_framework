<!--
 ═══════════════════════════════════════════════════════════════
  Diego Framework
  Created by Jose Lee <joelee194210@gmail.com>

  For Pampo — my Kwan Ambassador
 ═══════════════════════════════════════════════════════════════
-->
# Diego — Checkpoints

## Types

### DECISION (`◇`)
Architectural or design choice. Always logged in STATE.md.
```
◇ DECISION: Using JWT for auth instead of sessions — stateless, easier to scale
```

### VERIFY (`◆`)
Automated verification check.
```
◆ CHECKPOINT: Tests pass (14/14)
◆ CHECKPOINT: Build succeeds
◆ CHECKPOINT: Files exist: src/auth/middleware.ts
```

### ACTION (`●`)
Human-visible action taken.
```
● ACTION: Committed feat(p01-t03): add auth middleware [abc1234]
● ACTION: Created branch diego/phase-02-auth
```

### GATE (`⊘`)
Optional stopping point. Activated by `--thorough`, skipped in fast mode.
```
⊘ GATE: Plan verification — SKIPPED (fast mode)
⊘ GATE: Research phase — SKIPPED (fast mode)
```

## Logging Rules

| Type | Fast Mode | Thorough Mode |
|------|-----------|---------------|
| DECISION | Always logged | Always logged |
| VERIFY | Only failures | All checks |
| ACTION | Always shown | Always shown |
| GATE | Show as skipped | Execute fully |
