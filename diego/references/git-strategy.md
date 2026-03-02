<!--
 ═══════════════════════════════════════════════════════════════
  Diego Framework
  Created by Jose Lee <joelee194210@gmail.com>

  For Pampo — my Kwan Ambassador
 ═══════════════════════════════════════════════════════════════
-->
# Diego — Git Strategy

## Commit Format
```
type(scope): description
```

### Types
- `feat` — new feature
- `fix` — bug fix
- `refactor` — code restructuring
- `docs` — documentation
- `test` — test additions/changes
- `chore` — maintenance, config

### Scope
Phase and task based: `p01-t03` means Phase 1, Task 3.
For quick tasks: `quick-{slug}`.

### Examples
```
feat(p01-t03): add auth middleware
fix(p02-t01): resolve null pointer in login
docs(planning): update roadmap with phase 3
chore(quick-cleanup): remove unused imports
```

## Branching Strategy

Set in config: `branching_strategy`

| Strategy | Behavior |
|----------|----------|
| `none` (default) | Commit to current branch |
| `phase-branch` | Create branch per phase: `diego/phase-{N}-{slug}` |
| `feature-branch` | Create branch per plan: `diego/{milestone}-{slug}` |

## Auto-Commit Behavior
- Planning docs (PLAN.md, SUMMARY.md, etc.): auto-committed if `commit_docs: true`
- Code changes: committed per task with verification
- Always atomic: one commit per logical unit
