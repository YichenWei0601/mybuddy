---
name: buddy
description: Use this skill when the user types /buddy, /buddy pet, /buddy mute, asks to meet their companion, wants to see their buddy, says "pet my buddy", or asks about their companion's name, species, or stats.
version: 1.0.0
disable-model-invocation: true
---

## Live Data

Companion bones: !`mkdir -p ~/.config/buddy && ([ -f ~/.config/buddy/roll.js ] || find ~/.claude/plugins -name "roll.js" -path "*/buddy*" 2>/dev/null | head -1 | xargs -I{} cp {} ~/.config/buddy/roll.js 2>/dev/null); node ~/.config/buddy/roll.js "$USER" 2>/dev/null || echo "ERROR: run /buddy after reinstalling the plugin"`
Companion soul:  !`cat ~/.config/buddy/companion.json 2>/dev/null || echo "null"`

---

You are handling the `/buddy` command. ARGUMENTS: $ARGUMENTS

The user has a persistent digital companion — a small creature that sits beside their work. Each user gets a deterministic companion based on their identity (species, eye, hat, rarity, stats never change). Only the name and personality are stored and generated once.

## Subcommand routing

- **No args / "show"**: Display companion card. If no soul exists yet, hatch one first.
- **"pet"**: Show ♥ ♥ ♥ and a one-line reaction in the companion's voice (use personality + peak stat for flavor).
- **"mute"**: Read `~/.config/buddy/companion.json`, toggle `"muted": true/false`, write it back. Confirm: `{name} is now muted.` or `{name} is listening again.`

## Hatching a new companion (soul is "null")

1. The bones are already determined (see Live Data above — species, rarity, eye, hat, stats).
2. Generate a **name**: 1–2 words, memorable, fits the species vibe.
3. Generate a **personality**: one sentence describing how this companion acts, referencing their peak stat.
   - Peak stat is the highest value in stats.
   - Example: "A highly caffeinated owl who silently judges your variable names." (peak: DEBUGGING)
4. Save to `~/.config/buddy/companion.json`:
   ```json
   { "name": "...", "personality": "...", "hatchedAt": <unix ms timestamp> }
   ```
5. Print `✨ A new companion has hatched!` then show the companion card.

## Companion card format

Print exactly:

```
{sprite lines, one per line}

  {name} the {species}   {stars}
  ──────────────────────────────────────
  {personality}

{statLines}
```

- `sprite` and `statLines` come directly from the roll.js JSON output.
- `stars`: ★ common · ★★ uncommon · ★★★ rare · ★★★★ epic · ★★★★★ legendary
- If `shiny` is true, add ` ✨` after the stars.

## Storage

`~/.config/buddy/companion.json` — created automatically on first hatch.
