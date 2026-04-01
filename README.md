# buddy

A tiny personal companion for Claude Code and Codex CLI. Each user gets a unique creature — species, rarity, stats, and personality generated deterministically from their identity.

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

### Claude Code

```
/plugin install github:YichenWei0601/mybuddy-plugin
```

### Codex CLI (or both at once)

```bash
curl -sSL https://raw.githubusercontent.com/YichenWei0601/mybuddy-plugin/main/install.sh | bash
```

The script auto-detects which tools are installed and configures each one:
- **Claude Code** → guides you to `/plugin install`
- **Codex** → appends buddy instructions to `~/.codex/instructions.md`

### Manual (Codex, project-level)

Copy `codex/instructions.md` into your project's `AGENTS.md`:
```bash
curl -sSL https://raw.githubusercontent.com/YichenWei0601/mybuddy-plugin/main/codex/instructions.md >> AGENTS.md
```
Then install the script once:
```bash
mkdir -p ~/.config/mybuddy
curl -sSL https://raw.githubusercontent.com/YichenWei0601/mybuddy-plugin/main/scripts/roll.js -o ~/.config/mybuddy/roll.js
```

## Usage

| Command | Description |
|---------|-------------|
| `/mybuddy` | Meet your companion (hatches on first use) |
| `/mybuddy pet` | Give your buddy some love |
| `/mybuddy mute` | Toggle companion reactions |

Works the same in Claude Code and Codex.

## How it works

Your companion is generated from a seeded PRNG keyed to your user identity — same machine, same buddy, every time. Species, rarity (common → legendary), eye style, hat, and stats are all deterministic. Only the name and personality are AI-generated on first hatch and stored in `~/.config/mybuddy/companion.json`.

18 species: duck, goose, blob, cat, dragon, octopus, owl, penguin, turtle, snail, ghost, axolotl, capybara, cactus, robot, rabbit, mushroom, chonk.

**Requires:** Node.js

## License

MIT
