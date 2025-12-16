#!/usr/bin/env node
/**
 * i18n Key Extraction Script
 * 
 * Extracts translation keys from source code and compares against locale files.
 * Reports keys used in code but missing from locale files.
 * 
 * Usage: node scripts/i18n-extract.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SRC_DIR = path.join(__dirname, '../client/src');
const LOCALES_DIR = path.join(SRC_DIR, 'locales');

const extractedKeys = {
  common: new Set(),
  glassWall: new Set()
};

function extractKeysFromFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  
  let defaultNs = 'common';
  
  const useTransMatch = content.match(/useTranslation\(\s*["'](\w+)["']\s*\)/);
  if (useTransMatch) {
    defaultNs = useTransMatch[1];
  }
  
  const aliasedTranslations = {};
  const aliasMatches = content.matchAll(/const\s*\{\s*t:\s*(\w+)\s*\}\s*=\s*useTranslation\(\s*["'](\w+)["']\s*\)/g);
  for (const match of aliasMatches) {
    aliasedTranslations[match[1]] = match[2];
  }
  
  const patterns = [
    { regex: /\bt\(\s*["']([^"']+)["']/g, fn: 't' },
    { regex: /\btc\(\s*["']([^"']+)["']/g, fn: 'tc' },
  ];
  
  for (const { regex, fn } of patterns) {
    let match;
    while ((match = regex.exec(content)) !== null) {
      const key = match[1];
      
      let ns = defaultNs;
      if (aliasedTranslations[fn]) {
        ns = aliasedTranslations[fn];
      }
      
      if (key.includes(':')) {
        const [explicitNs, actualKey] = key.split(':');
        if (explicitNs === 'common') {
          extractedKeys.common.add(actualKey);
        } else if (explicitNs === 'glassWall') {
          extractedKeys.glassWall.add(actualKey);
        }
      } else {
        if (ns === 'glassWall') {
          extractedKeys.glassWall.add(key);
        } else {
          extractedKeys.common.add(key);
        }
      }
    }
  }
}

function walkDirectory(dir, callback) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      if (!file.startsWith('.') && file !== 'node_modules' && file !== 'locales') {
        walkDirectory(filePath, callback);
      }
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      callback(filePath);
    }
  }
}

function flattenKeys(obj, prefix = '') {
  const keys = [];
  for (const key of Object.keys(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
      keys.push(...flattenKeys(obj[key], fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys;
}

function loadLocaleKeys(lang, ns) {
  const nsFile = ns === 'glassWall' ? 'glass-wall' : ns;
  const filePath = path.join(LOCALES_DIR, lang, `${nsFile}.json`);
  
  if (!fs.existsSync(filePath)) {
    return { flat: new Set(), prefixes: new Set() };
  }
  
  const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const flatKeys = flattenKeys(content);
  
  const prefixes = new Set();
  for (const key of flatKeys) {
    const parts = key.split('.');
    let prefix = '';
    for (let i = 0; i < parts.length - 1; i++) {
      prefix = prefix ? `${prefix}.${parts[i]}` : parts[i];
      prefixes.add(prefix);
    }
  }
  
  return { flat: new Set(flatKeys), prefixes };
}

function keyExists(key, localeData) {
  return localeData.flat.has(key) || localeData.prefixes.has(key);
}

function main() {
  console.log('Extracting i18n keys from source code...\n');
  
  walkDirectory(SRC_DIR, extractKeysFromFile);
  
  console.log(`Found ${extractedKeys.common.size} common keys`);
  console.log(`Found ${extractedKeys.glassWall.size} glassWall keys\n`);
  
  const enCommonData = loadLocaleKeys('en', 'common');
  const enGlassWallData = loadLocaleKeys('en', 'glassWall');
  
  const missingFromCommon = [];
  const missingFromGlassWall = [];
  
  for (const key of extractedKeys.common) {
    if (!keyExists(key, enCommonData)) {
      missingFromCommon.push(key);
    }
  }
  
  for (const key of extractedKeys.glassWall) {
    if (!keyExists(key, enGlassWallData)) {
      missingFromGlassWall.push(key);
    }
  }
  
  if (missingFromCommon.length > 0) {
    console.log('MISSING from common.json:');
    missingFromCommon.forEach(k => console.log(`  - ${k}`));
    console.log();
  }
  
  if (missingFromGlassWall.length > 0) {
    console.log('MISSING from glass-wall.json:');
    missingFromGlassWall.forEach(k => console.log(`  - ${k}`));
    console.log();
  }
  
  const totalMissing = missingFromCommon.length + missingFromGlassWall.length;
  
  if (totalMissing === 0) {
    console.log('All extracted keys are present in locale files!');
  } else {
    console.log(`\nSummary: ${totalMissing} keys used in code but missing from English locale files`);
  }
  
  process.exit(totalMissing > 0 ? 1 : 0);
}

main();
