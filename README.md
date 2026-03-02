<!--
 ═══════════════════════════════════════════════════════════════
  Diego Framework
  Created by Jose Lee <joelee1942@gmail.com>

  For Pampo — my Kwan Ambassador
 ═══════════════════════════════════════════════════════════════
-->

# Diego Framework

**Quality with shortcuts.** Fast by default, rigorous when you ask with `--thorough`.

Diego is a project management framework for [Claude Code](https://claude.ai/code) that combines the best of structured workflows with speed. It uses subagents when they make sense, shortcuts to go fast, and quality gates when you need them.

## Quick Start

```bash
git clone https://github.com/joelee194210/diego_framework.git
cd diego_framework
bash install.sh
```

Then in Claude Code:
```
/diego:init          # Initialize a project
/diego:plan 1        # Plan phase 1
/diego:execute 1     # Execute phase 1
/diego:do "add auth" # All-in-one shortcut
```

## Architecture

```
~/.claude/diego/
├── VERSION                   # 1.0.0
├── bin/diego-tools.cjs       # CLI helper (deterministic brain)
├── workflows/                # 22 workflow definitions
├── templates/                # 12 document templates
├── references/               # 8 reference guides
└── hooks/                    # 2 hooks (session, statusline)

~/.claude/commands/diego/     # 22 slash commands
~/.claude/agents/diego-*.md   # 6 agent definitions
```

## Commands (22)

### Core Loop
| Command | Description |
|---------|-------------|
| `/diego:init` | Initialize project (questioning → requirements → roadmap) |
| `/diego:plan [phase]` | Create executable plan for a phase |
| `/diego:execute [phase]` | Execute plans with wave-based parallelization |
| `/diego:verify [phase]` | Verify phase achieved its goal |
| `/diego:unify [phase]` | Reconcile plan vs reality, close loop |
| `/diego:progress` | Project status + next action |

### Shortcuts
| Command | Description |
|---------|-------------|
| `/diego:do <desc>` | All-in-one: plan + execute + unify |
| `/diego:fix <desc>` | Bug fix: diagnose + plan + execute |
| `/diego:quick <desc>` | Ad-hoc task (skip planning) |

### Session
| Command | Description |
|---------|-------------|
| `/diego:pause` | Save context for later |
| `/diego:resume` | Restore previous session |
| `/diego:handoff` | Generate handoff document |

### Roadmap
| Command | Description |
|---------|-------------|
| `/diego:add-phase <desc>` | Add phase to end |
| `/diego:remove-phase <N>` | Remove future phase |
| `/diego:insert-phase <after> <desc>` | Insert between phases |

### Milestone
| Command | Description |
|---------|-------------|
| `/diego:milestone <name>` | Create new milestone |
| `/diego:complete-milestone` | Archive completed milestone |

### Pre-Planning
| Command | Description |
|---------|-------------|
| `/diego:discuss [phase]` | Capture vision before planning |
| `/diego:research <topic>` | Ecosystem research |
| `/diego:map-codebase` | Analyze existing codebase |

### Config
| Command | Description |
|---------|-------------|
| `/diego:settings` | Configure workflow and profile |
| `/diego:help` | Command reference |

## Key Concept: `--thorough` vs Default (Fast)

Diego is **fast by default**. Optional quality gates activate with `--thorough`:

| Gate | Default (fast) | --thorough |
|------|---------------|------------|
| Research before plan | Skip | Spawn researcher |
| Plan-checker loop | Skip | Verify plan, max 2 iterations |
| Verification post-execute | Skip | Spawn verifier |
| Unify reconciliation | Auto-minimal | Full AC check |

## Model Profiles

Configure with `/diego:settings`:

| Agent | quality | balanced | budget |
|-------|---------|----------|--------|
| diego-planner | opus | opus | sonnet |
| diego-executor | opus | sonnet | sonnet |
| diego-verifier | sonnet | sonnet | haiku |
| diego-researcher | opus | sonnet | haiku |
| diego-mapper | sonnet | haiku | haiku |
| diego-debugger | opus | sonnet | sonnet |

## Project Structure

Diego creates a `.planning/` directory in your project:

```
.planning/
├── PROJECT.md          # Vision and context
├── REQUIREMENTS.md     # P0/P1/P2 requirements
├── ROADMAP.md          # Phases with goals
├── STATE.md            # Current position + decisions
├── config.json         # Diego configuration
├── phases/             # Phase plans and summaries
├── quick/              # Quick task artifacts
└── milestones/         # Archived milestones
```

## License

MIT
