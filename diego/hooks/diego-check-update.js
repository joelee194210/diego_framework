#!/usr/bin/env node

/**
 * Diego SessionStart Hook — Background version check
 * Non-blocking check against npm registry for newer versions.
 * Caches results to avoid repeated checks.
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const CACHE_DIR = path.join(process.env.HOME, '.claude', 'cache');
const CACHE_FILE = path.join(CACHE_DIR, 'diego-update-check.json');
const VERSION_FILE = path.join(process.env.HOME, '.claude', 'diego', 'VERSION');
const CHECK_INTERVAL_MS = 24 * 60 * 60 * 1000; // 24 hours

function getCurrentVersion() {
  try {
    return fs.readFileSync(VERSION_FILE, 'utf-8').trim();
  } catch {
    return '0.0.0';
  }
}

function getCachedCheck() {
  try {
    const cached = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf-8'));
    if (Date.now() - cached.timestamp < CHECK_INTERVAL_MS) {
      return cached;
    }
  } catch {}
  return null;
}

function saveCache(data) {
  try {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
    fs.writeFileSync(CACHE_FILE, JSON.stringify({
      ...data,
      timestamp: Date.now(),
    }));
  } catch {}
}

// For now, Diego is local-only. This hook is a placeholder for when
// Diego gets published to npm. It checks the cache and reports.
const cached = getCachedCheck();
const currentVersion = getCurrentVersion();

if (cached && cached.latest && cached.latest !== currentVersion) {
  // Output update notice (will be shown as hook feedback)
  console.log(`Diego update available: ${currentVersion} → ${cached.latest}`);
} else {
  // Save current version as "latest" in cache (local-only mode)
  saveCache({ latest: currentVersion, current: currentVersion });
}
