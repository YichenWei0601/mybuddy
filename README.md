# mybuddy

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

## Requirements

- [Node.js](https://nodejs.org) (v16+)
- tmux *(optional, for persistent companion animation)*

---

## Install

**One command for both Claude Code and Codex:**

```bash
curl -sSL https://raw.githubusercontent.com/YichenWei0601/mybuddy/main/install.sh | bash
```

The script auto-detects which tools you have installed and configures each one.

### What it does

| | Claude Code | Codex |
|---|---|---|
| Installs scripts | `~/.config/mybuddy/` | `~/.config/mybuddy/` |
| Registers skill | `~/.claude/skills/mybuddy/` | `~/.codex/instructions.md` |

### After install

**Claude Code:** start a new session, then type `/mybuddy`

**Codex:** type `/mybuddy`

---

## Usage

| Command | Description |
|---------|-------------|
| `/mybuddy` | Meet your companion (hatches on first use, starts animation) |
| `/mybuddy pet` | Give your buddy some love ♥ |
| `/mybuddy react` | Companion comments on what you're doing |
| `/mybuddy daily` | Today's quip (same content all day) |
| `/mybuddy rename <name>` | Rename your companion |
| `/mybuddy card` | Shareable text card |
| `/mybuddy trade` | ASCII trade card |
| `/mybuddy info` | Species info, level, peak/dump stats |
| `/mybuddy mute` | Toggle companion reactions |

---

## Companion animation (tmux)

On first `/mybuddy`, the companion animation auto-launches:
- **Inside tmux** → splits a side pane automatically
- **macOS, no tmux** → opens a new Terminal window
- **Other** → shows the command to run manually

To launch manually at any time:
```bash
bash ~/.config/mybuddy/tmux-start.sh           # auto-detect tool
bash ~/.config/mybuddy/tmux-start.sh claude    # Claude Code
bash ~/.config/mybuddy/tmux-start.sh codex     # Codex
```

---

## How it works

Your companion is generated from a seeded PRNG keyed to your username — same machine, same buddy, every time. Species, rarity (common → legendary), eye style, hat, and stats never change. Only the name and personality are AI-generated on first hatch, stored in `~/.config/mybuddy/companion.json`.

**18 species:** duck, goose, blob, cat, dragon, octopus, owl, penguin, turtle, snail, ghost, axolotl, capybara, cactus, robot, rabbit, mushroom, chonk

**5 stats:** DEBUGGING · PATIENCE · CHAOS · WISDOM · SNARK

**Rarity:** common (60%) · uncommon (25%) · rare (10%) · epic (4%) · legendary (1%) · shiny (1%)

**Level system:** grows over time — `floor(√days_alive)`

---

## License

MIT
