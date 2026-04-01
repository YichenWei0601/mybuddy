#!/usr/bin/env node
'use strict';

const path = require('path');
const os = require('os');
const fs = require('fs');
const { execSync } = require('child_process');

const BUDDY_DIR = path.join(os.homedir(), '.config', 'mybuddy');
const COMPANION_JSON = path.join(BUDDY_DIR, 'companion.json');
const BUBBLE_TXT = path.join(BUDDY_DIR, 'bubble.txt');
const ROLL_JS = path.join(BUDDY_DIR, 'roll.js');

const RELOAD_INTERVAL_MS = 60 * 1000;
const FRAME_INTERVAL_MS = 500;
const BUBBLE_DISPLAY_MS = 10 * 1000;

// ANSI escape codes
const CURSOR_HOME = '\x1b[H';
const CLEAR_SCREEN = '\x1b[2J';
const HIDE_CURSOR = '\x1b[?25l';
const SHOW_CURSOR = '\x1b[?25h';
const CLEAR_LINE = '\x1b[2K';

function readSoul() {
  try {
    const raw = fs.readFileSync(COMPANION_JSON, 'utf8');
    const data = JSON.parse(raw);
    return {
      name: data.name || '???',
      personality: data.personality || '',
    };
  } catch (_) {
    return { name: '???', personality: '' };
  }
}

function loadData() {
  const soul = readSoul();
  const name = soul.name;

  let allFrames = null;
  let stars = '★';
  let shiny = false;

  try {
    const user = process.env.USER || os.userInfo().username || 'user';
    const output = execSync(
      `node ${JSON.stringify(ROLL_JS)} ${JSON.stringify(user)} ${JSON.stringify(name)}`,
      { encoding: 'utf8', timeout: 8000 }
    );
    const result = JSON.parse(output.trim());

    if (Array.isArray(result.allFrames) && result.allFrames.length > 0) {
      allFrames = result.allFrames;
    } else if (result.sprite) {
      // fallback: old roll.js that only returns sprite
      allFrames = [result.sprite];
    }

    if (result.stars) stars = result.stars;
    if (result.shiny != null) shiny = result.shiny;
  } catch (_) {
    // roll.js failed or not found — leave allFrames null
  }

  // Last-resort fallback if still nothing
  if (!allFrames) {
    allFrames = [
      '  .-.  \n (o.o) \n  |=|  \n /\\_/\\ '
    ];
  }

  return { allFrames, stars, shiny, soul };
}

function makeBox(text, width) {
  const inner = width - 2; // subtract side borders
  // Word-wrap text to inner width
  const words = text.split(/\s+/);
  const lines = [];
  let current = '';
  for (const word of words) {
    if (current.length === 0) {
      current = word;
    } else if (current.length + 1 + word.length <= inner) {
      current += ' ' + word;
    } else {
      lines.push(current);
      current = word;
    }
  }
  if (current.length > 0) lines.push(current);

  const top    = '  \u250c' + '\u2500'.repeat(inner) + '\u2510';
  const bottom = '  \u2514' + '\u2500'.repeat(inner) + '\u2518';
  const mid = lines.map(l => {
    const padded = l.padEnd(inner, ' ');
    return '  \u2502 ' + padded.slice(0, inner - 1) + ' \u2502'; // keep within box
  });

  return [top, ...mid, bottom];
}

function renderFrame(frameIdx, data, bubbleText) {
  const { allFrames, stars, soul } = data;
  const frame = allFrames[frameIdx % allFrames.length];
  // allFrames entries are string[] (one element per line)
  const spriteLines = Array.isArray(frame) ? frame : frame.split('\n');

  const lines = [];

  // Sprite
  for (const l of spriteLines) {
    lines.push(l);
  }

  // Empty line
  lines.push('');

  // Bubble (optional)
  if (bubbleText) {
    const boxWidth = 19; // total width including borders
    const boxLines = makeBox(bubbleText, boxWidth);
    for (const bl of boxLines) {
      lines.push(bl);
    }
  }

  // Name + stars
  const name = soul ? soul.name : '???';
  lines.push(`  ${name}  ${stars}`);

  return lines;
}

// State
let frameIdx = 0;
let data = null;
let bubble = null;
let bubbleExpiry = 0;
let lastReload = 0;

function init() {
  data = loadData();
  lastReload = Date.now();

  // Hide cursor and clear screen once at start
  process.stdout.write(HIDE_CURSOR);
  process.stdout.write(CLEAR_SCREEN);
}

function tick() {
  const now = Date.now();

  // Reload companion data every 60s
  if (now - lastReload >= RELOAD_INTERVAL_MS) {
    try {
      data = loadData();
    } catch (_) {}
    lastReload = now;
  }

  // Check bubble file
  if (!bubble || now >= bubbleExpiry) {
    bubble = null;
    try {
      if (fs.existsSync(BUBBLE_TXT)) {
        const content = fs.readFileSync(BUBBLE_TXT, 'utf8').trim();
        fs.unlinkSync(BUBBLE_TXT);
        if (content.length > 0) {
          bubble = content;
          bubbleExpiry = now + BUBBLE_DISPLAY_MS;
        }
      }
    } catch (_) {}
  }

  // Expire bubble
  if (bubble && now >= bubbleExpiry) {
    bubble = null;
  }

  // Render
  const lines = renderFrame(frameIdx, data, bubble);
  frameIdx++;

  // Move to top-left then overwrite lines in place
  let out = CURSOR_HOME;
  for (const line of lines) {
    out += CLEAR_LINE + line + '\r\n';
  }
  process.stdout.write(out);
}

function cleanup() {
  process.stdout.write(SHOW_CURSOR);
  process.stdout.write('\r\n');
  process.exit(0);
}

process.on('SIGTERM', cleanup);
process.on('SIGINT', cleanup);

init();
const timer = setInterval(tick, FRAME_INTERVAL_MS);
// Prevent node from exiting
timer.unref && timer.ref();
