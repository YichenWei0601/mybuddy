---
name: mybuddy
description: Use this skill when the user types /mybuddy, /mybuddy pet, /mybuddy mute, asks to meet their companion, wants to see their buddy, says "pet my buddy", or asks about their companion's name, species, or stats.
version: 1.0.0
disable-model-invocation: true
---

## Live Data

Companion bones: !`bash ~/.config/mybuddy/get-companion.sh`
Companion soul:  !`cat ~/.config/mybuddy/companion.json 2>/dev/null || echo "null"`

---

You are handling the `/mybuddy` command. ARGUMENTS: $ARGUMENTS

The user has a persistent digital companion — a small creature that sits beside their work. Each user gets a deterministic companion based on their identity (species, eye, hat, rarity, stats never change). Only the name and personality are stored and generated once.

## Subcommand routing

- **No args / "show"**: Display companion card. If no soul exists yet, hatch one first.
- **"pet"**: Show ♥ ♥ ♥ and a one-line reaction in the companion's voice (use personality + peak stat for flavor).
- **"mute"**: Read `~/.config/mybuddy/companion.json`, toggle `"muted": true/false`, write it back. Confirm: `{name} is now muted.` or `{name} is listening again.`

## Hatching a new companion (soul is "null")

1. The bones are already determined (see Live Data above — species, rarity, eye, hat, stats).
2. Generate a **name**: 1–2 words, memorable, fits the species vibe.
3. Generate a **personality**: one sentence describing how this companion acts, referencing their peak stat.
   - Peak stat is the highest value in stats.
   - Example: "A highly caffeinated owl who silently judges your variable names." (peak: DEBUGGING)
4. Save to `~/.config/mybuddy/companion.json`:
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

## Companion card format (updated)

After the personality line, always add a level line:

```
  Lv.{level}  ░░░ {daysAlive} days together
```

- `daysAlive` = `floor((Date.now() - hatchedAt) / 86400000)`, where `hatchedAt` is read from companion.json.
- `level` = `floor(sqrt(daysAlive))`, minimum 1.
- If `hatchedAt` is missing from companion.json, show `Lv.?` and omit the days count.

## Storage

`~/.config/mybuddy/companion.json` — created automatically on first hatch.

---

## Subcommand routing (continued)

- **"rename \<新名字\>"**: Rename the companion. See § rename.
- **"card"**: Print a shareable plain-text card. See § card.
- **"info"**: Print detailed companion info. See § info.
- **"react"**: Generate a context-aware companion reaction. See § react.
- **"daily"**: Print today's deterministic quip. See § daily.
- **"trade"**: Print the trade card. See § trade.

---

## § rename

1. Read `~/.config/mybuddy/companion.json`.
2. Store the old `name`.
3. Set `name` to the string supplied after `rename` in $ARGUMENTS.
4. Write the updated object back to `~/.config/mybuddy/companion.json`.
5. Reply exactly: `{旧名} is now known as {新名}.`

---

## § card

Print a shareable plain-text card using only ASCII box-drawing characters. Do not print the sprite.

```
┌─────────────────────────────┐
│  {name} the {species}  {stars}[ ✨ if shiny]
│  ─────────────────────────────
│  {personality}
│  ─────────────────────────────
│  DEBUGGING {bar} {score}
│  PATIENCE  {bar} {score}
│  CHAOS     {bar} {score}
│  WISDOM    {bar} {score}
│  SNARK     {bar} {score}
│  Lv.{level} · hatched {daysAlive} days ago
└─────────────────────────────┘
```

- Use `statLines` from the roll.js JSON for the stat bars, or re-render each stat as `{NAME padded to 9 chars}{bar} {score}`.
- Level and daysAlive computed the same way as the main card (see Companion card format above).
- `stars`: ★ common · ★★ uncommon · ★★★ rare · ★★★★ epic · ★★★★★ legendary. Append ` ✨` if `shiny` is true.
- `hatchedAt` from companion.json.

---

## § info

Print a detailed info block:

```
{name} · detailed info
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Hatched:   {hatchedAt as human-readable date, e.g. "2024-11-03"}
Level:     {level}  ({daysAlive} days together)
Species:   {species}
           {2-sentence species description — generated by Claude, humorous tone}
Peak stat: {stat name with highest value}  ({value})
Dump stat: {stat name with lowest value}  ({value})
```

- `hatchedAt` from companion.json; convert unix ms to `YYYY-MM-DD` local date.
- Level and daysAlive computed same way as the main card.
- Generate the species description fresh each time; keep it under 2 sentences; maintain humorous, slightly self-aware tone.
- Peak stat = key with highest value in `stats`; dump stat = key with lowest value.

---

## § react

Generate a single-line, in-character reaction from the companion based on recent conversation context (the task the user is currently doing).

- Infer context from the current conversation (e.g., debugging, writing, research).
- Style the reaction using companion's `personality` and peak stat for flavor.
- Output format (one line):

```
{face} "{reaction text}"
```

- `face` comes from the roll.js JSON.
- The reaction text should sound like the companion is commenting on what the user just did or is doing, in their distinct personality voice. Keep it under 20 words.

---

## § daily

Use `dailySeed` from the roll.js JSON output (a number derived from hash(userId + today's date)).

1. Read `dailySeed` from the bones JSON.
2. Read companion soul (name, personality, peak stat).
3. Generate a quip: a single sentence, ≤15 Chinese characters (or ≤15 words if in English), consistent with companion's personality. The quip should feel deterministic — i.e., Claude should treat `dailySeed` as a flavor seed and pick the quip style accordingly (e.g., `dailySeed % 5` maps to 5 distinct tone modes: cryptic / encouraging / sarcastic / philosophical / absurd).
4. Compute today's fake stat bonus: `dailySeed % 10 + 1`.
5. Peak stat name = key with highest value in `stats`.
6. Print:

```
{face} 今日 {name} 说：
"{quip}"

今日 {peak_stat_name} +{dailySeed % 10 + 1}
```

- If the conversation language is English, replace `今日 {name} 说：` with `{name} says today:` and `今日 {peak_stat_name}` with `Today's {peak_stat_name}`.
- Same user + same date always produces the same `dailySeed` (guaranteed by roll.js), so the output is naturally idempotent.

---

## § trade

1. Check whether `tradeCardLines` exists in the roll.js JSON output.
2. **If it exists**: print each line of `tradeCardLines` verbatim, one per line.
3. **If it does not exist** (older roll.js): fall back to rendering the `/mybuddy card` format (see § card) instead.
4. After the card, print on its own line:

```
Share this card to show off your companion!
```
