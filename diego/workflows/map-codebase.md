<!--
 ═══════════════════════════════════════════════════════════════
  Diego Framework
  Created by Jose Lee <joelee194210@gmail.com>

  For Pampo — my Kwan Ambassador
 ═══════════════════════════════════════════════════════════════
-->
# Workflow: Map Codebase

<context>
Run: `node ~/.claude/diego/bin/diego-tools.cjs state load`
Store result as STATE (may not exist if no project).
</context>

<constants>
DIEGO_TOOLS="node ~/.claude/diego/bin/diego-tools.cjs"
</constants>

## Pre-flight

1. Determine output directory:
   - If project exists: `.planning/codebase/`
   - If no project: `.planning/codebase/` (create it)
2. Create output directory

## Map Codebase

Spawn 4 diego-mapper agents in parallel, each with a different focus:

### Agent 1: Technology Map
- Languages and frameworks used
- Dependencies and versions
- Build tools and scripts
- Dev tools and config

Output: `codebase/TECH.md`

### Agent 2: Architecture Map
- Directory structure and organization
- Key modules and their responsibilities
- Data flow between modules
- Entry points and APIs

Output: `codebase/ARCHITECTURE.md`

### Agent 3: Quality Map
- Test coverage and patterns
- Error handling approach
- Logging and monitoring
- Code style and conventions

Output: `codebase/QUALITY.md`

### Agent 4: Concerns Map
- Technical debt
- Security considerations
- Performance bottlenecks
- Missing documentation

Output: `codebase/CONCERNS.md`

## Synthesize

After all 4 agents complete, create `codebase/SUMMARY.md`:
- Key takeaways from each analysis
- Overall codebase health assessment
- Recommendations for new development

## Commit

If config.commit_docs:
```bash
$DIEGO_TOOLS commit "docs(codebase): map analysis"
```

## Report
```
╔═══════════════════════════════════════════════╗
║  DIEGO — Codebase Mapped                     ║
╚═══════════════════════════════════════════════╝

✓ TECH.md — Technology analysis
✓ ARCHITECTURE.md — Architecture analysis
✓ QUALITY.md — Quality analysis
✓ CONCERNS.md — Concerns analysis
✓ SUMMARY.md — Synthesis

Location: .planning/codebase/
```
