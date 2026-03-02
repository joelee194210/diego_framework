<!--
 ═══════════════════════════════════════════════════════════════
  Diego Framework
  Created by Jose Lee <joelee194210@gmail.com>

  For Pampo — my Kwan Ambassador
 ═══════════════════════════════════════════════════════════════
-->
# Workflow: Quick Task

<context>
Parse $ARGUMENTS to extract description and flags.
DESCRIPTION = everything after "quick" that isn't a flag
THOROUGH = $ARGUMENTS contains "--thorough"

Run: `node ~/.claude/diego/bin/diego-tools.cjs init quick $DESCRIPTION`
Store result as QUICK_CTX.
</context>

<constants>
DIEGO_TOOLS="node ~/.claude/diego/bin/diego-tools.cjs"
</constants>

## Pre-flight

1. Parse QUICK_CTX JSON
2. The quick workflow skips planning entirely — the user already knows what they want

## Execute Directly

Execute the task described by DESCRIPTION:

1. Analyze the description to understand what needs to be done
2. Read relevant files in the codebase
3. Make the changes directly
4. Create atomic commit: `feat(quick-{slug}): {description}`
5. Verify the changes work (run tests if applicable, check build)

No subagent spawning unless the task is clearly parallelizable.

## Auto-Unify (Minimal)

1. Create `{QUICK_CTX.task_dir}/SUMMARY.md` with:
   - What was done
   - Files modified
   - Commits created
2. Update STATE.md:
   ```bash
   $DIEGO_TOOLS state add-decision "Quick: {DESCRIPTION}"
   ```

**If THOROUGH:**
- Run full verification of changes
- Check for regressions
- Detailed summary

## Commit Planning Docs

If config.commit_docs:
```bash
$DIEGO_TOOLS commit "docs(quick): {slug} summary"
```

## Report

```
─── Quick Done ────────────────────────────────
⚡ {DESCRIPTION}
Commits: {commit_list}
Files: {files_changed}
```
