# Diego — Shortcuts

## Comparison

| Feature | `diego:do` | `diego:fix` | `diego:quick` |
|---------|-----------|------------|--------------|
| Planning | Auto-plan (quick) | Diagnose + plan | Skip (user has plan) |
| Execution | Yes | Yes | Yes |
| Unify | Auto-minimal | Auto-minimal | Auto-minimal |
| Use case | Known features | Bug fixes | Already planned work |
| Input | Description | Bug description | Description |
| Research | Only with --thorough | Diagnose phase | No |

## diego:do
**All-in-one: plan + execute + unify.** For tasks you can describe clearly.

```
/diego:do add user authentication with JWT
/diego:do refactor payment module to use strategy pattern
/diego:do add dark mode toggle to settings page
```

With `--thorough`: adds research + plan-check + verification + full unify.

## diego:fix
**Diagnose + plan + execute.** For bugs where you need investigation first.

```
/diego:fix login button not responding on mobile
/diego:fix memory leak in dashboard component
/diego:fix API returning 500 on large payloads
```

Flow: spawn debugger → diagnose → create fix plan → execute → unify.

## diego:quick
**Execute + unify only.** For when you already know what to do.

```
/diego:quick add error boundary to payment form
/diego:quick update navbar links
/diego:quick remove deprecated API endpoints
```

No planning phase. Just execute the description directly and create a summary.

## When to Use Each
- **"I know what I want built"** → `diego:do`
- **"Something is broken"** → `diego:fix`
- **"Just do this small thing"** → `diego:quick`
- **"I need full control"** → `diego:plan` + `diego:execute` + `diego:unify`
