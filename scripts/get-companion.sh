#!/usr/bin/env bash
# get-companion.sh — called by SKILL.md !` injection
# Bootstraps roll.js if missing, then outputs companion JSON

BUDDY_DIR="$HOME/.config/mybuddy"
mkdir -p "$BUDDY_DIR"

# Bootstrap roll.js from plugin dir if not yet installed
if [ ! -f "$BUDDY_DIR/roll.js" ]; then
  SRC=$(find "$HOME/.claude/plugins" -name "roll.js" -path "*/mybuddy*" 2>/dev/null | head -1)
  [ -n "$SRC" ] && cp "$SRC" "$BUDDY_DIR/roll.js"
fi

# Get stored companion name (empty string if no soul yet)
BNAME=""
SOUL="$BUDDY_DIR/companion.json"
if [ -f "$SOUL" ]; then
  BNAME=$(python3 -c "import json; d=json.load(open('$SOUL')); print(d.get('name',''))" 2>/dev/null || echo "")
fi

node "$BUDDY_DIR/roll.js" "${USER:-anon}" "$BNAME" 2>/dev/null || echo '{"error":"roll.js missing — reinstall plugin"}'
