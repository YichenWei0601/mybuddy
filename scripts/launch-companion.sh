#!/usr/bin/env bash
# launch-companion.sh — auto-start watch.js after /mybuddy
# Called by the skill after showing companion card.

WATCH_JS="$HOME/.config/mybuddy/watch.js"

# Already running?
if pgrep -f "node.*watch.js" > /dev/null 2>&1; then
  echo "(companion already running)"
  exit 0
fi

if [ -n "$TMUX" ]; then
  # Inside tmux: split a 16-col pane on the right
  tmux split-window -h -l 16 "node $WATCH_JS"
  echo "(companion started in tmux pane)"

elif [ "$(uname)" = "Darwin" ]; then
  # macOS outside tmux: open a new Terminal window
  osascript -e "tell application \"Terminal\" to do script \"node $WATCH_JS\""
  echo "(companion started in new Terminal window)"

else
  echo "To show companion animation, run in another terminal:"
  echo "  node $WATCH_JS"
fi
