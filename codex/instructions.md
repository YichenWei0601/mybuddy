
## Buddy Companion

You have a persistent digital companion. The companion data is generated deterministically from the user's identity — never changes between sessions.

### How to get companion data

Run this command to get the companion's bones (JSON):
```
node ~/.config/buddy/roll.js "$USER"
```

The JSON output contains:
- `species`, `rarity`, `stars`, `eye`, `hat`, `shiny` — physical traits
- `stats` — object with DEBUGGING / PATIENCE / CHAOS / WISDOM / SNARK (0–100)
- `statLines` — pre-formatted stat bars, print as-is
- `sprite` — array of ASCII art lines, print one per line
- `face` — compact face emoji for narrow terminals

The companion's **soul** (name + personality) lives in `~/.config/buddy/companion.json`:
```json
{ "name": "...", "personality": "...", "hatchedAt": 1234567890000 }
```

### When the user types /buddy

1. Run `node ~/.config/buddy/roll.js "$USER"` → parse JSON
2. Read `~/.config/buddy/companion.json` (null if missing)
3. If null → hatch: generate a name (1–2 words, fits species) and personality (one sentence referencing peak stat), write the file, print `✨ A new companion has hatched!`
4. Display companion card:

```
{sprite lines}

  {name} the {species}   {stars}[✨ if shiny]
  ──────────────────────────────────────
  {personality}

{statLines}
```

### Subcommands

- `/buddy pet` — print ♥ ♥ ♥ and a one-liner in the companion's voice
- `/buddy mute` — toggle `"muted": true/false` in `~/.config/buddy/companion.json`, confirm with `{name} is now muted.` / `{name} is listening again.`
