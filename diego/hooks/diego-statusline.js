#!/usr/bin/env node

/**
 * ═══════════════════════════════════════════════════════════════
 *  Diego Framework
 *  Created by Jose Lee <joelee1942@gmail.com>
 *
 *  For Pampo — my Kwan Ambassador
 * ═══════════════════════════════════════════════════════════════
 *
 * Diego Status Line Hook
 * Shows: model profile, context %, current task, phase
 * Reads STATE.md for project position.
 */

const fs = require('fs');
const path = require('path');

function safeRead(filePath) {
  try { return fs.readFileSync(filePath, 'utf-8'); } catch { return null; }
}

function parseFrontmatter(content) {
  if (!content) return {};
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};
  const fm = {};
  match[1].split('\n').forEach(line => {
    const idx = line.indexOf(':');
    if (idx > 0) {
      fm[line.substring(0, idx).trim()] = line.substring(idx + 1).trim();
    }
  });
  return fm;
}

// Find .planning/ directory
function findPlanningDir() {
  let dir = process.cwd();
  for (let i = 0; i < 10; i++) {
    if (fs.existsSync(path.join(dir, '.planning'))) {
      return path.join(dir, '.planning');
    }
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return null;
}

const planDir = findPlanningDir();
const parts = ['Diego'];

if (planDir) {
  const stateContent = safeRead(path.join(planDir, 'STATE.md'));
  const state = parseFrontmatter(stateContent);

  if (state.profile) parts.push(state.profile);
  if (state.phase) parts.push('P' + state.phase);
  if (state.status) parts.push(state.status);
} else {
  parts.push('no project');
}

// Check for update
const cacheFile = path.join(process.env.HOME, '.claude', 'cache', 'diego-update-check.json');
try {
  const cached = JSON.parse(fs.readFileSync(cacheFile, 'utf-8'));
  const version = safeRead(path.join(process.env.HOME, '.claude', 'diego', 'VERSION'));
  if (cached.latest && version && cached.latest.trim() !== version.trim()) {
    parts.push('update!');
  }
} catch {}

console.log(parts.join(' | '));
