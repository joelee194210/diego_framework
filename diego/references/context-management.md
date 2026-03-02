<!--
 ═══════════════════════════════════════════════════════════════
  Diego Framework
  Created by Jose Lee <joelee1942@gmail.com>

  For Pampo — my Kwan Ambassador
 ═══════════════════════════════════════════════════════════════
-->
# Diego — Context Management

## Context Brackets

| Bracket | Usage | Action |
|---------|-------|--------|
| Small | < 30% | Normal operation |
| Medium | 30-60% | Consider handoff after current task |
| Large | 60-90% | Handoff recommended, finish current task |
| Critical | > 90% | Force handoff immediately |

## When to Use Subagents

**USE subagent:**
- Task is independent and parallelizable
- Needs a different model (cheaper or more capable)
- Output is large (research, mapping)
- Multiple tasks can run simultaneously

**SKIP subagent (inline):**
- Task is simple (< 5 lines of change)
- Needs context from the main conversation
- Depends on result of previous step
- Single sequential operation

## Handoff Protocol

1. Create HANDOFF.md with: current state, context, completed work, next steps
2. Update STATE.md with session info
3. Commit planning docs
4. `/diego:resume` in next session restores context

## Progress Check Frequency

Every 3-4 tasks, assess:
- Context window usage
- Remaining work
- Whether to continue or handoff
