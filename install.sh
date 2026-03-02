#!/usr/bin/env bash
set -euo pipefail

# ═══════════════════════════════════════════════════════════════
#  Diego Framework
#  Created by Jose Lee <joelee194210@gmail.com>
#
#  For Pampo — my Kwan Ambassador
# ═══════════════════════════════════════════════════════════════
#
# Diego Framework — Installer
# Installs Diego into ~/.claude/ for use with Claude Code

DIEGO_VERSION="1.0.0"
CLAUDE_DIR="${HOME}/.claude"
DIEGO_DIR="${CLAUDE_DIR}/diego"
COMMANDS_DIR="${CLAUDE_DIR}/commands/diego"
AGENTS_DIR="${CLAUDE_DIR}/agents"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo ""
echo "╔═══════════════════════════════════════════════╗"
echo "║  DIEGO — Framework Installer v${DIEGO_VERSION}          ║"
echo "╚═══════════════════════════════════════════════╝"
echo ""

# Check Claude Code directory exists
if [ ! -d "$CLAUDE_DIR" ]; then
  echo "ERROR: ~/.claude/ directory not found."
  echo "Please install Claude Code first: https://claude.ai/code"
  exit 1
fi

# Backup existing installation
if [ -d "$DIEGO_DIR" ]; then
  BACKUP_DIR="${CLAUDE_DIR}/backups/diego-$(date +%Y%m%d-%H%M%S)"
  echo "⟳ Backing up existing installation to ${BACKUP_DIR}..."
  mkdir -p "$BACKUP_DIR"
  cp -r "$DIEGO_DIR" "$BACKUP_DIR/diego"
  [ -d "$COMMANDS_DIR" ] && cp -r "$COMMANDS_DIR" "$BACKUP_DIR/commands"
  for f in "$AGENTS_DIR"/diego-*.md; do
    [ -f "$f" ] && cp "$f" "$BACKUP_DIR/"
  done
  echo "✓ Backup created"
fi

# Install core framework
echo "⟳ Installing Diego framework..."
mkdir -p "$DIEGO_DIR/bin" "$DIEGO_DIR/workflows" "$DIEGO_DIR/templates" "$DIEGO_DIR/references" "$DIEGO_DIR/hooks"

cp "$SCRIPT_DIR/diego/VERSION" "$DIEGO_DIR/"
cp "$SCRIPT_DIR/diego/bin/diego-tools.cjs" "$DIEGO_DIR/bin/"
cp "$SCRIPT_DIR"/diego/workflows/*.md "$DIEGO_DIR/workflows/"
cp "$SCRIPT_DIR"/diego/templates/*.md "$DIEGO_DIR/templates/"
cp "$SCRIPT_DIR"/diego/references/*.md "$DIEGO_DIR/references/"
cp "$SCRIPT_DIR"/diego/hooks/*.js "$DIEGO_DIR/hooks/"
echo "✓ Core framework installed"

# Install commands
echo "⟳ Installing slash commands..."
mkdir -p "$COMMANDS_DIR"
cp "$SCRIPT_DIR"/commands/diego/*.md "$COMMANDS_DIR/"
echo "✓ 22 slash commands installed"

# Install agents
echo "⟳ Installing agent definitions..."
mkdir -p "$AGENTS_DIR"
cp "$SCRIPT_DIR"/agents/diego-*.md "$AGENTS_DIR/"
echo "✓ 6 agents installed"

# Configure settings.json
SETTINGS_FILE="${CLAUDE_DIR}/settings.json"
if [ -f "$SETTINGS_FILE" ]; then
  # Check if diego-tools permission already exists
  if ! grep -q 'diego/bin/diego-tools.cjs' "$SETTINGS_FILE"; then
    echo ""
    echo "NOTE: Add this permission to your ~/.claude/settings.json:"
    echo '  "Bash(node /Users/'"$USER"'/.claude/diego/bin/diego-tools.cjs:*)"'
    echo ""
  fi

  # Check if statusline is configured
  if ! grep -q 'diego-statusline.js' "$SETTINGS_FILE"; then
    echo "NOTE: To use Diego's statusline, update settings.json:"
    echo '  "statusLine": {'
    echo '    "type": "command",'
    echo '    "command": "node \"'${DIEGO_DIR}'/hooks/diego-statusline.js\""'
    echo '  }'
    echo ""
  fi

  # Check if SessionStart hook is configured
  if ! grep -q 'diego-check-update.js' "$SETTINGS_FILE"; then
    echo "NOTE: To enable update checks, add to settings.json hooks.SessionStart:"
    echo '  { "type": "command", "command": "node \"'${DIEGO_DIR}'/hooks/diego-check-update.js\"" }'
    echo ""
  fi
else
  echo "NOTE: No settings.json found. Create one to configure permissions and hooks."
fi

echo ""
echo "╔═══════════════════════════════════════════════╗"
echo "║  DIEGO — Installation Complete!               ║"
echo "╚═══════════════════════════════════════════════╝"
echo ""
echo "Installed:"
echo "  ✓ diego-tools.cjs    — CLI helper ($(wc -l < "$DIEGO_DIR/bin/diego-tools.cjs" | tr -d ' ') lines)"
echo "  ✓ 22 workflows       — in ~/.claude/diego/workflows/"
echo "  ✓ 12 templates       — in ~/.claude/diego/templates/"
echo "  ✓ 8 references       — in ~/.claude/diego/references/"
echo "  ✓ 22 commands        — in ~/.claude/commands/diego/"
echo "  ✓ 6 agents           — in ~/.claude/agents/"
echo "  ✓ 2 hooks            — in ~/.claude/diego/hooks/"
echo ""
echo "Get started:"
echo "  /diego:help      — Show all commands"
echo "  /diego:init      — Initialize a new project"
echo "  /diego:do <task>  — Quick plan+execute+unify"
echo ""
