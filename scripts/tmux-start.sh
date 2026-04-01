#!/usr/bin/env bash
# tmux-start.sh — start AI tool with mybuddy companion in a side pane
# Usage:
#   bash tmux-start.sh          # auto-detect (claude first, then codex)
#   bash tmux-start.sh claude
#   bash tmux-start.sh codex
#   bash tmux-start.sh zsh      # any command works

BUDDY_DIR="$HOME/.config/mybuddy"
SESSION="mybuddy-session"

# Determine which AI tool to run
TOOL="${1:-}"
if [ -z "$TOOL" ]; then
  if command -v claude &>/dev/null; then
    TOOL="claude"
  elif command -v codex &>/dev/null; then
    TOOL="codex"
  else
    TOOL="${SHELL:-bash}"
  fi
fi

# Kill existing session if any
tmux kill-session -t "$SESSION" 2>/dev/null || true

# Create new session (main pane = AI tool)
tmux new-session -d -s "$SESSION" -x "$(tput cols)" -y "$(tput lines)"

# Split right: 16 columns for companion
tmux split-window -h -t "$SESSION:0" -l 16

# Right pane (index 1): run watch.js
tmux send-keys -t "$SESSION:0.1" "node $BUDDY_DIR/watch.js" Enter

# Left pane (index 0): run the AI tool
tmux select-pane -t "$SESSION:0.0"
tmux send-keys -t "$SESSION:0.0" "$TOOL" Enter

# Attach
tmux attach-session -t "$SESSION"
