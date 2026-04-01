#!/usr/bin/env bash
# mybuddy-plugin universal installer
# Works for Claude Code and Codex CLI
# Usage:
#   bash install.sh
#   curl -sSL https://raw.githubusercontent.com/YichenWei0601/mybuddy-plugin/main/install.sh | bash

set -e

REPO_URL="https://raw.githubusercontent.com/YichenWei0601/mybuddy-plugin/main"
BUDDY_DIR="$HOME/.config/mybuddy"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]:-install.sh}")" 2>/dev/null && pwd || echo "")"

echo "🐾 Installing mybuddy..."
echo ""

# Helper: copy a file from local repo or download it
install_file() {
  local src="$1" dst="$2"
  mkdir -p "$(dirname "$dst")"
  if [ -n "$SCRIPT_DIR" ] && [ -f "$SCRIPT_DIR/$src" ]; then
    cp "$SCRIPT_DIR/$src" "$dst"
  else
    curl -sSL "$REPO_URL/$src" -o "$dst"
  fi
}

# Check Node.js
if ! command -v node &>/dev/null; then
  echo "  ✗ Node.js not found. Install from https://nodejs.org then re-run this script."
  exit 1
fi
echo "  ✓ Node.js $(node -v)"

# 1. Install scripts to ~/.config/mybuddy/
mkdir -p "$BUDDY_DIR"
for f in scripts/roll.js scripts/get-companion.sh scripts/watch.js scripts/tmux-start.sh scripts/launch-companion.sh; do
  install_file "$f" "$BUDDY_DIR/$(basename $f)"
  chmod +x "$BUDDY_DIR/$(basename $f)" 2>/dev/null || true
done
echo "  ✓ scripts → $BUDDY_DIR/"

# 2. Claude Code
if [ -d "$HOME/.claude" ]; then
  mkdir -p "$HOME/.claude/skills/mybuddy"
  install_file "skills/mybuddy/SKILL.md" "$HOME/.claude/skills/mybuddy/SKILL.md"
  echo "  ✓ skill → ~/.claude/skills/mybuddy/SKILL.md"
  CLAUDE_DONE=1
fi

# 3. Codex CLI
if command -v codex &>/dev/null || [ -d "$HOME/.codex" ]; then
  mkdir -p "$HOME/.codex"
  TARGET="$HOME/.codex/instructions.md"
  if grep -q "## MyBuddy Companion" "$TARGET" 2>/dev/null; then
    echo "  ✓ Codex instructions already installed"
  else
    echo "" >> "$TARGET"
    install_file "codex/instructions.md" /tmp/mybuddy-codex-instructions.md
    cat /tmp/mybuddy-codex-instructions.md >> "$TARGET"
    rm /tmp/mybuddy-codex-instructions.md
    echo "  ✓ Codex instructions → ~/.codex/instructions.md"
  fi
  CODEX_DONE=1
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ -n "$CLAUDE_DONE" ]; then
  echo ""
  echo "Claude Code:"
  echo "  1. Start a new Claude Code session"
  echo "  2. Type: /mybuddy"
fi

if [ -n "$CODEX_DONE" ]; then
  echo ""
  echo "Codex:"
  echo "  Type: /mybuddy"
fi

if [ -z "$CLAUDE_DONE" ] && [ -z "$CODEX_DONE" ]; then
  echo ""
  echo "No AI tool detected. Manual setup:"
  echo ""
  echo "  Claude Code:"
  echo "    mkdir -p ~/.claude/skills/mybuddy"
  echo "    cp $BUDDY_DIR/SKILL.md ~/.claude/skills/mybuddy/SKILL.md  (if cloned locally)"
  echo "    → start new session → /mybuddy"
  echo ""
  echo "  Codex:"
  echo "    cat codex/instructions.md >> ~/.codex/instructions.md"
  echo "    → /mybuddy"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Done! 🐾"
