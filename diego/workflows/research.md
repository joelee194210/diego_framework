<!--
 ═══════════════════════════════════════════════════════════════
  Diego Framework
  Created by Jose Lee <joelee194210@gmail.com>

  For Pampo — my Kwan Ambassador
 ═══════════════════════════════════════════════════════════════
-->
# Workflow: Research

<context>
Parse $ARGUMENTS to extract topic.
TOPIC = everything after "research"
</context>

<constants>
DIEGO_TOOLS="node ~/.claude/diego/bin/diego-tools.cjs"
</constants>

## Pre-flight

1. Load state if project exists
2. Determine output directory:
   - If within a project: `.planning/research/`
   - If standalone: current directory

## Research

Spawn diego-researcher agent with:

**Instructions:**
- Research topic: "{TOPIC}"
- Use web search for current information
- Investigate:
  - Best practices and patterns
  - Available libraries/tools
  - Common pitfalls
  - Performance considerations
  - Security implications
- Write RESEARCH.md with findings
- Include code examples where relevant
- Cite sources

**Research approach:**
1. Web search for current state of the topic
2. Look for official documentation
3. Check for community best practices
4. Compare alternatives with pros/cons
5. Identify recommended approach

## Write Output

Write `{output_dir}/RESEARCH-{slug}.md` following the research template.

## Commit

If in a project and config.commit_docs:
```bash
$DIEGO_TOOLS commit "docs(research): {topic}"
```

## Report
```
─── Research Complete ─────────────────────────
📚 {TOPIC}

Key Findings:
{bullet_summary}

Recommendation: {recommended_approach}

Full report: {output_path}
```
