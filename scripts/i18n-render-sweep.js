#!/usr/bin/env node
/**
 * i18n Render Sweep Test
 * 
 * Scans all locale files for [MISSING: patterns that indicate
 * untranslated keys. This catches cases where pseudo-locale
 * text or missing key markers have leaked into translations.
 * 
 * Run: node scripts/i18n-render-sweep.js
 * 
 * This script is designed to be run in CI to catch:
 * - [MISSING: markers left in locale files
 * - Pseudo-locale text accidentally committed
 * - Empty translations that would show nothing in prod
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LOCALES_DIR = path.join(__dirname, '../client/src/locales');
const PRODUCTION_LANGUAGES = ['en', 'lv', 'ru'];
const NAMESPACES = ['common', 'glass-wall'];

const issues = [];

function scanForProblems(obj, filePath, keyPath = '') {
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = keyPath ? `${keyPath}.${key}` : key;
    
    if (typeof value === 'string') {
      if (value.includes('[MISSING:')) {
        issues.push({
          type: 'missing_marker',
          file: filePath,
          key: fullKey,
          value: value.substring(0, 50)
        });
      }
      
      if (value.match(/\[.*!!!\]/)) {
        issues.push({
          type: 'pseudo_locale',
          file: filePath,
          key: fullKey,
          value: value.substring(0, 50)
        });
      }
      
      if (value.trim() === '') {
        issues.push({
          type: 'empty_translation',
          file: filePath,
          key: fullKey,
          value: '(empty)'
        });
      }
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      scanForProblems(value, filePath, fullKey);
    }
  }
}

function main() {
  console.log('Running i18n Render Sweep...\n');
  console.log('Checking production locales for problems:\n');
  
  for (const lang of PRODUCTION_LANGUAGES) {
    for (const ns of NAMESPACES) {
      const filePath = path.join(LOCALES_DIR, lang, `${ns}.json`);
      
      if (!fs.existsSync(filePath)) {
        issues.push({
          type: 'missing_file',
          file: filePath,
          key: '-',
          value: 'File not found'
        });
        continue;
      }
      
      try {
        const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        scanForProblems(content, `${lang}/${ns}.json`);
        console.log(`  Scanned: ${lang}/${ns}.json`);
      } catch (e) {
        issues.push({
          type: 'json_error',
          file: filePath,
          key: '-',
          value: e.message
        });
      }
    }
  }
  
  console.log();
  
  if (issues.length === 0) {
    console.log('Render sweep passed! No issues found.');
    process.exit(0);
  }
  
  console.log('ISSUES FOUND:\n');
  
  const byType = {};
  for (const issue of issues) {
    if (!byType[issue.type]) byType[issue.type] = [];
    byType[issue.type].push(issue);
  }
  
  for (const [type, typeIssues] of Object.entries(byType)) {
    const typeLabel = {
      missing_marker: '[MISSING: markers found',
      pseudo_locale: 'Pseudo-locale text leaked',
      empty_translation: 'Empty translations',
      missing_file: 'Missing locale files',
      json_error: 'JSON parse errors'
    }[type] || type;
    
    console.log(`${typeLabel}:`);
    for (const issue of typeIssues) {
      console.log(`  - ${issue.file}: ${issue.key}`);
      if (issue.value !== '(empty)' && issue.value !== '-') {
        console.log(`    "${issue.value}..."`);
      }
    }
    console.log();
  }
  
  console.log(`Total issues: ${issues.length}`);
  process.exit(1);
}

main();
