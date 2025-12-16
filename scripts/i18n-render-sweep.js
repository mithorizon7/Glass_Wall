#!/usr/bin/env node
/**
 * i18n Render Sweep Test
 * 
 * Scans all locale files for patterns that indicate problems:
 * - [MISSING: markers left in locale files
 * - Pseudo-locale text accidentally committed
 * - Empty translations that would show nothing in prod
 * 
 * Run: node scripts/i18n-render-sweep.js
 */

import path from 'path';
import { fileURLToPath } from 'url';
import { flattenKeys, loadJsonFile, getNestedValue, getConfig } from './i18n-utils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const config = getConfig(__dirname);

const issues = [];

const PSEUDO_LOCALE_PATTERN = /^\[.+\s*!!!\]$/;

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
      
      if (PSEUDO_LOCALE_PATTERN.test(value)) {
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
  
  for (const lang of config.productionLanguages) {
    for (const ns of config.namespaces) {
      const filePath = path.join(config.localesDir, lang, `${ns}.json`);
      const displayPath = `${lang}/${ns}.json`;
      
      const { data, error } = loadJsonFile(filePath);
      
      if (error) {
        issues.push({
          type: error.includes('not found') ? 'missing_file' : 'json_error',
          file: displayPath,
          key: '-',
          value: error
        });
        continue;
      }
      
      scanForProblems(data, displayPath);
      console.log(`  Scanned: ${displayPath}`);
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
  
  const typeLabels = {
    missing_marker: '[MISSING: markers found',
    pseudo_locale: 'Pseudo-locale text leaked',
    empty_translation: 'Empty translations',
    missing_file: 'Missing locale files',
    json_error: 'JSON parse errors'
  };
  
  for (const [type, typeIssues] of Object.entries(byType)) {
    const label = typeLabels[type] || type;
    console.log(`${label}:`);
    for (const issue of typeIssues) {
      console.log(`  - ${issue.file}: ${issue.key}`);
      if (issue.value !== '(empty)' && issue.value !== '-') {
        console.log(`    "${issue.value}${issue.value.length >= 50 ? '...' : ''}"`);
      }
    }
    console.log();
  }
  
  console.log(`Total issues: ${issues.length}`);
  process.exit(1);
}

main();
