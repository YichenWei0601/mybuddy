# buddy

A tiny personal companion for Claude Code. Each user gets a unique creature — species, rarity, stats, and personality generated deterministically from their identity.

```
}~(______)~{
}~(@ .. @)~{
  ( .--. )  
  (_/  \_)  

  Mochi the axolotl   ★
  ──────────────────────────────────────
  Solves your bugs before you finish typing.

  DEBUGGING  ████████░░   84
  PATIENCE   ░░░░░░░░░░    1
  CHAOS      ████░░░░░░   38
  WISDOM     ██░░░░░░░░   22
  SNARK      ████░░░░░░   43
```

## Install

```
/plugin install github:YichenWei0601/buddy-plugin
```

## Usage

| Command | Description |
|---------|-------------|
| `/buddy` | Meet your companion (hatches on first use) |
| `/buddy pet` | Give your buddy some love |
| `/buddy mute` | Toggle companion reactions |

## How it works

Your companion is generated from a seeded PRNG keyed to your user identity — same machine, same buddy, every time. Species, rarity (common → legendary), eye style, hat, and stats are all deterministic. Only the name and personality are AI-generated on first hatch and then stored in `~/.config/buddy/companion.json`.

18 species: duck, goose, blob, cat, dragon, octopus, owl, penguin, turtle, snail, ghost, axolotl, capybara, cactus, robot, rabbit, mushroom, chonk.

## Codex / AGENTS.md users

Add this block to your repo's `AGENTS.md`:

```markdown
## /buddy command

When the user types `/buddy` (or `/buddy pet` / `/buddy mute`):
1. Run: `node ~/.config/buddy/roll.js "$USER"` to get companion bones (JSON).
   - If missing, find and copy from: `find ~/.claude/plugins -name "roll.js" -path "*/buddy*" | head -1`
2. Read soul from `~/.config/buddy/companion.json` (null if missing).
3. If null: generate name + personality, save to that file, print "✨ A new companion has hatched!".
4. Display the companion card using the `sprite` and `statLines` fields from the JSON.
5. `/buddy pet`: show ♥ ♥ ♥ and a one-liner in the companion's voice.
6. `/buddy mute`: toggle `muted` field in the JSON file.
```

## License

MIT
