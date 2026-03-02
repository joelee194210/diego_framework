# Workflow: Settings

<context>
Run: `node ~/.claude/diego/bin/diego-tools.cjs state load`
Store result as STATE.
</context>

<constants>
DIEGO_TOOLS="node ~/.claude/diego/bin/diego-tools.cjs"
</constants>

## Show Current Settings

Read `.planning/config.json` and display:

```
─── Diego Settings ────────────────────────────
Model Profile:     {model_profile} (quality/balanced/budget)
Commit Docs:       {commit_docs}
Branch Strategy:   {branching_strategy}
Thorough Default:  {thorough_default}
Auto Unify:        {auto_unify}
```

## Interactive Configuration

Ask user what they want to change. Options:

1. **Model Profile** — quality / balanced / budget
2. **Commit Docs** — auto-commit planning docs
3. **Branch Strategy** — none / phase-branch / feature-branch
4. **Thorough Default** — default to thorough mode
5. **Auto Unify** — auto-unify after execute

Apply changes to `.planning/config.json`.

## Report
```
─── Settings Updated ──────────────────────────
✓ {changed_fields}
```
