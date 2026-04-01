#!/usr/bin/env bash
# mybuddy-plugin universal installer
# Works for Claude Code and Codex CLI
# Usage: bash install.sh
#    or: curl -sSL https://raw.githubusercontent.com/YichenWei0601/mybuddy-plugin/main/install.sh | bash

set -e

REPO_URL="https://raw.githubusercontent.com/YichenWei0601/mybuddy-plugin/main"
BUDDY_DIR="$HOME/.config/mybuddy"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]:-install.sh}")" 2>/dev/null && pwd || echo "")"

echo "🐾 Installing buddy companion..."
echo ""

# 1. Install roll.js to stable path
mkdir -p "$BUDDY_DIR"

if [ -n "$SCRIPT_DIR" ] && [ -f "$SCRIPT_DIR/scripts/roll.js" ]; then
  cp "$SCRIPT_DIR/scripts/roll.js" "$BUDDY_DIR/roll.js"
else
  echo "  Downloading roll.js..."
  curl -sSL "$REPO_URL/scripts/roll.js" -o "$BUDDY_DIR/roll.js"
fi
echo "  ✓ roll.js → $BUDDY_DIR/roll.js"

# Copy tmux scripts
for f in get-companion.sh watch.js tmux-start.sh launch-companion.sh; do
  if [ -n "$SCRIPT_DIR" ] && [ -f "$SCRIPT_DIR/scripts/$f" ]; then
    cp "$SCRIPT_DIR/scripts/$f" "$BUDDY_DIR/$f"
  else
    curl -sSL "$REPO_URL/scripts/$f" -o "$BUDDY_DIR/$f"
  fi
  chmod +x "$BUDDY_DIR/$f" 2>/dev/null || true
done
echo "  ✓ tmux scripts → $BUDDY_DIR/"

# 2. Verify Node.js
if ! command -v node &>/dev/null; then
  echo ""
  echo "  ⚠️  Node.js not found. Install from https://nodejs.org"
  echo "     buddy will not work until Node.js is available."
fi

echo ""

# 3. Claude Code
if command -v claude &>/dev/null || [ -d "$HOME/.claude" ]; then
  echo "Claude Code detected."
  echo "  Run this to install the plugin:"
  echo "    /plugin install github:YichenWei0601/mybuddy-plugin"
  echo ""
fi

# 4. Codex CLI
CODEX_INSTRUCTIONS=""
if [ -n "$SCRIPT_DIR" ] && [ -f "$SCRIPT_DIR/codex/instructions.md" ]; then
  CODEX_INSTRUCTIONS="$SCRIPT_DIR/codex/instructions.md"
fi

if command -v codex &>/dev/null || [ -d "$HOME/.codex" ]; then
  echo "Codex CLI detected."
  mkdir -p "$HOME/.codex"
  TARGET="$HOME/.codex/instructions.md"

  if grep -q "## MyBuddy Companion" "$TARGET" 2>/dev/null; then
    echo "  ✓ Buddy instructions already in $TARGET"
  else
    echo "" >> "$TARGET"
    if [ -n "$CODEX_INSTRUCTIONS" ]; then
      cat "$CODEX_INSTRUCTIONS" >> "$TARGET"
    else
      curl -sSL "$REPO_URL/codex/instructions.md" >> "$TARGET"
    fi
    echo "  ✓ Buddy instructions appended to $TARGET"
  fi
  echo ""
fi

# 5. Neither detected — manual fallback
if ! command -v claude &>/dev/null && ! [ -d "$HOME/.claude" ] && \
   ! command -v codex &>/dev/null && ! [ -d "$HOME/.codex" ]; then
  echo "No AI coding tool detected."
  echo ""
  echo "Manual setup:"
  echo "  Claude Code: /plugin install github:YichenWei0601/mybuddy-plugin"
  echo "  Codex:       append codex/instructions.md to ~/.codex/instructions.md"
  echo "               or to your project's AGENTS.md"
  echo ""
fi

echo "Done! Type /mybuddy to meet your companion."
echo ""
echo "Tip: run 'bash ~/.config/mybuddy/tmux-start.sh' to show companion in a tmux pane."
echo "     Works with Claude Code, Codex, or any terminal tool."
