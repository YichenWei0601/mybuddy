#!/usr/bin/env bash
# get-companion.sh — called by SKILL.md !` injection
# Outputs a single JSON with bones + soul merged

BUDDY_DIR="$HOME/.config/mybuddy"
mkdir -p "$BUDDY_DIR"

# Bootstrap roll.js from plugin dir if not yet installed
if [ ! -f "$BUDDY_DIR/roll.js" ]; then
  SRC=$(find "$HOME/.claude/plugins" -name "roll.js" -path "*/mybuddy*" 2>/dev/null | head -1)
  [ -n "$SRC" ] && cp "$SRC" "$BUDDY_DIR/roll.js"
fi

SOUL_FILE="$BUDDY_DIR/companion.json"

# Get stored companion name for trade card rendering
BNAME=""
if [ -f "$SOUL_FILE" ]; then
  BNAME=$(node -e "try{const d=require('fs').readFileSync('$SOUL_FILE','utf8'); console.log(JSON.parse(d).name||'')}catch{console.log('')}" 2>/dev/null || echo "")
fi

# Merge bones + soul using node (avoids shell quoting issues with JSON)
node - "${USER:-anon}" "$BNAME" "$SOUL_FILE" <<'NJSEOF'
const fs = require('fs')
const path = require('path')
const buddyDir = path.join(process.env.HOME, '.config', 'mybuddy')
const rollJs = path.join(buddyDir, 'roll.js')

const [,, userId, bname, soulFile] = process.argv

let bones
try {
  bones = JSON.parse(require('child_process').execSync(
    `node ${rollJs} ${userId} "${bname}"`, { encoding: 'utf8' }
  ))
} catch {
  process.stdout.write(JSON.stringify({ error: 'roll.js missing — reinstall plugin' }))
  process.exit(0)
}

let soul = null
try {
  if (fs.existsSync(soulFile)) soul = JSON.parse(fs.readFileSync(soulFile, 'utf8'))
} catch {}

bones.soul = soul
process.stdout.write(JSON.stringify(bones, null, 2))
NJSEOF
