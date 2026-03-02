# Workflow: Discuss Phase

<context>
Parse $ARGUMENTS to extract phase number (optional).
PHASE_NUM = first numeric argument, or current phase from state
</context>

<constants>
DIEGO_TOOLS="node ~/.claude/diego/bin/diego-tools.cjs"
</constants>

## Pre-flight

1. If no PHASE_NUM provided, get current phase from STATE.md
2. Read ROADMAP.md for phase goal
3. Read PROJECT.md and REQUIREMENTS.md for context

## Adaptive Questioning

Engage user in discussion about the phase approach. Focus on:

1. **Vision:** What should this phase look and feel like when done?
2. **Approach:** Any preferences on how to implement?
3. **Patterns:** Specific patterns or libraries to use/avoid?
4. **Prior Art:** Reference implementations or examples?
5. **Concerns:** What could go wrong? What are you worried about?

Adapt questions based on:
- Phase complexity (simple = fewer questions)
- User expertise signals (technical = more specific questions)
- Previous phase context (build on what's done)

Limit: 3-5 questions max. Don't over-question.

## Capture Context

Write `.planning/phases/{NN}-{slug}/CONTEXT.md`:
```markdown
# Phase {N} — Context

## Vision
{user's vision for this phase}

## Key Decisions
{decisions made during discussion}

## User Preferences
{style, patterns, libraries preferences}

## Technical Constraints
{constraints identified}

## Open Questions
{unresolved questions to address during planning}
```

## Commit

If config.commit_docs:
```bash
$DIEGO_TOOLS commit "docs(p{NN}): capture phase context"
```

## Report
```
─── Phase {N} Context Captured ────────────────
✓ CONTEXT.md saved
  {decision_count} decisions captured
  {question_count} open questions

Next: /diego:plan {N} to create the plan
```
