<!--
 ═══════════════════════════════════════════════════════════════
  Diego Framework
  Created by Jose Lee <joelee1942@gmail.com>

  For Pampo — my Kwan Ambassador
 ═══════════════════════════════════════════════════════════════
-->
# Workflow: Initialize Project

<context>
Run `node ~/.claude/diego/bin/diego-tools.cjs init project` to get project context.
Store result as INIT_CTX.
</context>

<constants>
DIEGO_TOOLS="node ~/.claude/diego/bin/diego-tools.cjs"
TEMPLATE_DIR="~/.claude/diego/templates"
</constants>

## Pre-flight

1. Parse INIT_CTX JSON
2. If INIT_CTX.has_project is true:
   - Show: "Project already initialized. Use /diego:progress to check status."
   - EXIT
3. Create `.planning/` directory if not exists

## Phase 1: Questioning

Engage the user in adaptive questioning to understand their project. Ask 3-5 focused questions covering:

1. **What** are you building? (elevator pitch)
2. **Who** is it for? (target users)
3. **Tech stack** — what's already decided?
4. **Constraints** — timeline, budget, existing code?
5. **What's NOT in scope?** (critical for avoiding scope creep)

Adapt questions based on context:
- If codebase exists (files in cwd), ask about extending vs rebuilding
- If package.json/Cargo.toml/etc exists, infer tech stack
- Skip questions the user has already answered

## Phase 2: Create PROJECT.md

Using the user's answers, create `.planning/PROJECT.md` based on the template:

```bash
$DIEGO_TOOLS template fill project
```

Fill in all sections with specific, actionable content from the conversation.

## Phase 3: Create REQUIREMENTS.md

Synthesize requirements from the conversation:
- **P0 (Must Have):** Core functionality that defines the MVP
- **P1 (Should Have):** Important but not blocking
- **P2 (Nice to Have):** Polish, optimizations
- **Out of Scope:** Explicitly excluded

Write `.planning/REQUIREMENTS.md`.

## Phase 4: Create ROADMAP.md

Break the work into phases:
- Each phase has a clear goal and deliverable
- Phases are ordered by dependency and priority
- 3-7 phases typical for v1
- Each phase should be completable in 1-3 sessions

Write `.planning/ROADMAP.md` with phase details.

For each phase, create the directory:
```bash
$DIEGO_TOOLS phase add "Phase description"
```

## Phase 5: Create STATE.md and config.json

Initialize project state:
```bash
$DIEGO_TOOLS state patch --milestone v1 --version 1.0.0 --phase 1 --plan 0 --status initialized --profile balanced
```

Create `.planning/config.json`:
```json
{
  "model_profile": "balanced",
  "commit_docs": true,
  "branching_strategy": "none",
  "thorough_default": false,
  "auto_unify": true
}
```

## Phase 6: Commit and Report

If in a git repo and config.commit_docs is true:
```bash
$DIEGO_TOOLS commit "docs(planning): initialize project with Diego"
```

Show summary:
```
╔═══════════════════════════════════════════════╗
║  DIEGO — Project Initialized                 ║
╚═══════════════════════════════════════════════╝

✓ PROJECT.md — Vision and context
✓ REQUIREMENTS.md — {N} requirements across P0/P1/P2
✓ ROADMAP.md — {M} phases planned
✓ STATE.md — Tracking initialized
✓ config.json — Default configuration

Next: /diego:plan 1 to create the first phase plan
```
