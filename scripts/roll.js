#!/usr/bin/env node
// Buddy companion roller — portable Node.js, no dependencies
// Usage: node roll.js [userId]
// Output: JSON with bones + rendered sprite

const SALT = 'friend-2026-401'

const RARITIES = ['common', 'uncommon', 'rare', 'epic', 'legendary']
const RARITY_WEIGHTS = { common: 60, uncommon: 25, rare: 10, epic: 4, legendary: 1 }
const RARITY_STARS   = { common: '★', uncommon: '★★', rare: '★★★', epic: '★★★★', legendary: '★★★★★' }
const RARITY_FLOOR   = { common: 5, uncommon: 15, rare: 25, epic: 35, legendary: 50 }

const SPECIES = [
  'duck','goose','blob','cat','dragon','octopus','owl','penguin',
  'turtle','snail','ghost','axolotl','capybara','cactus','robot',
  'rabbit','mushroom','chonk',
]
const EYES = ['·', '✦', '×', '◉', '@', '°']
const HATS = ['none','crown','tophat','propeller','halo','wizard','beanie','tinyduck']
const STAT_NAMES = ['DEBUGGING', 'PATIENCE', 'CHAOS', 'WISDOM', 'SNARK']

// Mulberry32 — seeded PRNG
function mulberry32(seed) {
  let a = seed >>> 0
  return function () {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// FNV-1a hash (matches the non-Bun fallback in companion.ts)
function hashString(s) {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

function pick(rng, arr) {
  return arr[Math.floor(rng() * arr.length)]
}

function rollRarity(rng) {
  const total = Object.values(RARITY_WEIGHTS).reduce((a, b) => a + b, 0)
  let roll = rng() * total
  for (const r of RARITIES) {
    roll -= RARITY_WEIGHTS[r]
    if (roll < 0) return r
  }
  return 'common'
}

function rollStats(rng, rarity) {
  const floor = RARITY_FLOOR[rarity]
  const peak = pick(rng, STAT_NAMES)
  let dump = pick(rng, STAT_NAMES)
  while (dump === peak) dump = pick(rng, STAT_NAMES)
  const stats = {}
  for (const name of STAT_NAMES) {
    if (name === peak)       stats[name] = Math.min(100, floor + 50 + Math.floor(rng() * 30))
    else if (name === dump)  stats[name] = Math.max(1,   floor - 10 + Math.floor(rng() * 15))
    else                     stats[name] = floor + Math.floor(rng() * 40)
  }
  return stats
}

// Sprite data (frame 0 of each species, {E} = eye placeholder)
const BODIES = {
  duck:     ['            ','    __      ','  <({E} )___  ','   (  ._>   ','    `--´    '],
  goose:    ['            ','     ({E}>    ','     ||     ','   _(__)_   ','    ^^^^    '],
  blob:     ['            ','   .----.   ','  ( {E}  {E} )  ','  (      )  ','   `----´   '],
  cat:      ['            ','   /\\_/\\    ','  ( {E}   {E})  ','  (  ω  )   ','  (")_(")   '],
  dragon:   ['            ','  /^\\  /^\\  ',' <  {E}  {E}  > ',' (   ~~   ) ','  `-vvvv-´  '],
  octopus:  ['            ','   .----.   ','  ( {E}  {E} )  ','  (______)  ','  /\\/\\/\\/\\  '],
  owl:      ['            ','   /\\  /\\   ','  (({E})({E}))  ','  (  ><  )  ','   `----´   '],
  penguin:  ['            ','  .---.     ','  ({E}>{E})     ',' /(   )\\    ','  `---´     '],
  turtle:   ['            ','   _,--._   ','  ( {E}  {E} )  ',' /[______]\\ ','  ``    ``  '],
  snail:    ['            ',' {E}    .--.  ','  \\  ( @ )  ','   \\_`--´   ','  ~~~~~~~   '],
  ghost:    ['            ','   .----.   ','  / {E}  {E} \\  ','  |      |  ','  ~`~``~`~  '],
  axolotl:  ['            ','}~(______)~{','}~({E} .. {E})~{','  ( .--. )  ','  (_/  \\_)  '],
  capybara: ['            ','  n______n  ',' ( {E}    {E} ) ',' (   oo   ) ','  `------´  '],
  cactus:   ['            ',' n  ____  n ',' | |{E}  {E}| | ',' |_|    |_| ','   |    |   '],
  robot:    ['            ','   .[||].   ','  [ {E}  {E} ]  ','  [ ==== ]  ','  `------´  '],
  rabbit:   ['            ','   (\\__/)   ','  ( {E}  {E} )  ',' =(  ..  )= ','  (")__(")  '],
  mushroom: ['            ',' .-o-OO-o-. ','(__________)','   |{E}  {E}|   ','   |____|   '],
  chonk:    ['            ','  /\\    /\\  ',' ( {E}    {E} ) ',' (   ..   ) ','  `------´  '],
}

const HAT_LINES = {
  none: '',
  crown: '   \\^^^/    ',
  tophat: '   [___]    ',
  propeller: '    -+-     ',
  halo: '   (   )    ',
  wizard: '    /^\\     ',
  beanie: '   (___)    ',
  tinyduck: '    ,>      ',
}

function renderSprite(species, eye, hat) {
  const body = BODIES[species].map(line => line.replaceAll('{E}', eye))
  // Apply hat if line 0 is blank
  if (hat !== 'none' && !body[0].trim()) {
    body[0] = HAT_LINES[hat]
  }
  // Drop blank top row if unused
  if (!body[0].trim()) body.shift()
  return body
}

function renderFace(species, eye) {
  const e = eye
  switch (species) {
    case 'duck':
    case 'goose':    return `(${e}>`
    case 'blob':     return `(${e}${e})`
    case 'cat':      return `=${e}ω${e}=`
    case 'dragon':   return `<${e}~${e}>`
    case 'octopus':  return `~(${e}${e})~`
    case 'owl':      return `(${e})(${e})`
    case 'penguin':  return `(${e}>)`
    case 'turtle':   return `[${e}_${e}]`
    case 'snail':    return `${e}(@)`
    case 'ghost':    return `/${e}${e}\\`
    case 'axolotl':  return `}${e}.${e}{`
    case 'capybara': return `(${e}oo${e})`
    case 'cactus':   return `|${e}  ${e}|`
    case 'robot':    return `[${e}${e}]`
    case 'rabbit':   return `(${e}..${e})`
    case 'mushroom': return `|${e}  ${e}|`
    case 'chonk':    return `(${e}.${e})`
    default:         return `(${e}${e})`
  }
}

function statBar(score) {
  const filled = Math.round(score / 10)
  return '█'.repeat(filled) + '░'.repeat(10 - filled)
}

// Main
const userId = process.argv[2] || process.env.USER || process.env.USERNAME || 'anon'
const companionName = process.argv[3] || null
const key = userId + SALT
const rng = mulberry32(hashString(key))

const rarity = rollRarity(rng)
const species = pick(rng, SPECIES)
const eye = pick(rng, EYES)
const hat = rarity === 'common' ? 'none' : pick(rng, HATS)
const shiny = rng() < 0.01
const stats = rollStats(rng, rarity)
const inspirationSeed = Math.floor(rng() * 1e9)

const sprite = renderSprite(species, eye, hat)
const face = renderFace(species, eye)

const statLines = STAT_NAMES.map(name =>
  `  ${name.padEnd(10)} ${statBar(stats[name])}  ${String(stats[name]).padStart(3)}`
).join('\n')

// --- dailySeed ---
function getDailyDate() {
  const d = new Date()
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`
}

const dailySeed = hashString(userId + '-daily-' + getDailyDate()) % 1000000

// --- tradeCardLines ---
function statBar6(score) {
  const filled = Math.round(score / 17)
  return '█'.repeat(filled) + '░'.repeat(6 - filled)
}

function cardLine(content) {
  return '│ ' + content.padEnd(28) + ' │'
}

function buildTradeCard(name, species, stars, shiny, sprite, stats) {
  const CARD_WIDTH = 32
  const topBorder    = '┌' + '─'.repeat(CARD_WIDTH - 2) + '┐'
  const midBorder    = '├' + '─'.repeat(CARD_WIDTH - 2) + '┤'
  const botBorder    = '└' + '─'.repeat(CARD_WIDTH - 2) + '┘'

  const nameStr    = name.slice(0, 12)
  const speciesStr = species.slice(0, 14)
  const starsStr   = stars + (shiny ? ' ✨' : '')

  const lines = []
  lines.push(topBorder)
  lines.push(cardLine(' BUDDY CARD'))
  lines.push(cardLine(' ' + nameStr.padEnd(13) + starsStr))
  lines.push(cardLine(' ' + speciesStr))
  lines.push(midBorder)

  for (const spriteLine of sprite) {
    lines.push(cardLine(spriteLine))
  }

  lines.push(midBorder)

  for (const statName of STAT_NAMES) {
    const score = stats[statName]
    const bar = statBar6(score)
    const scoreStr = String(score).padStart(3)
    lines.push(cardLine(' ' + statName.padEnd(10) + bar + '  ' + scoreStr))
  }

  lines.push(botBorder)
  return lines
}

const tradeCardLines = buildTradeCard(companionName || userId, species, RARITY_STARS[rarity], shiny, sprite, stats)

console.log(JSON.stringify({
  userId,
  rarity,
  stars: RARITY_STARS[rarity],
  species,
  eye,
  hat,
  shiny,
  stats,
  statLines,
  sprite,
  face,
  inspirationSeed,
  dailySeed,
  tradeCardLines,
}, null, 2))
