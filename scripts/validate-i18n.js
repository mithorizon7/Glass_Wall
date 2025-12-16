#!/usr/bin/env node
/**
 * i18n Validation Script
 * 
 * Validates translation files for:
 * - Valid JSON syntax
 * - Missing keys across languages
 * - Invalid ICU message format syntax
 * - Missing required placeholders
 * 
 * Usage: node scripts/validate-i18n.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LOCALES_DIR = path.join(__dirname, '../client/src/locales');
const LANGUAGES = ['en', 'lv', 'ru'];
const NAMESPACES = ['common', 'glass-wall'];

const errors = [];
const warnings = [];

function validateJsonSyntax(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    JSON.parse(content);
    return true;
  } catch (e) {
    errors.push(`JSON syntax error in ${filePath}: ${e.message}`);
    return false;
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

function extractPlaceholders(str) {
  if (typeof str !== 'string') return [];
  const matches = str.match(/\{([^,}]+)/g) || [];
  return matches.map(m => m.replace('{', ''));
}

function validateIcuSyntax(str, keyPath, lang) {
  if (typeof str !== 'string') return;
  
  const icuPatterns = [
    /\{[^}]+,\s*plural\s*,/,
    /\{[^}]+,\s*select\s*,/,
    /\{[^}]+,\s*selectordinal\s*,/
  ];
  
  const hasIcu = icuPatterns.some(p => p.test(str));
  if (!hasIcu) return;
  
  let braceCount = 0;
  for (const char of str) {
    if (char === '{') braceCount++;
    if (char === '}') braceCount--;
  }
  
  if (braceCount !== 0) {
    errors.push(`Unbalanced braces in ICU message: ${lang}/${keyPath}`);
  }
}

function loadTranslations() {
  const translations = {};
  
  for (const lang of LANGUAGES) {
    translations[lang] = {};
    
    for (const ns of NAMESPACES) {
      const filePath = path.join(LOCALES_DIR, lang, `${ns}.json`);
      
      if (!fs.existsSync(filePath)) {
        errors.push(`Missing locale file: ${filePath}`);
        continue;
      }
      
      if (!validateJsonSyntax(filePath)) continue;
      
      const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      translations[lang][ns] = content;
    }
  }
  
  return translations;
}

function compareKeys(translations) {
  for (const ns of NAMESPACES) {
    const allKeys = new Set();
    const keysByLang = {};
    
    for (const lang of LANGUAGES) {
      if (!translations[lang][ns]) continue;
      const keys = flattenKeys(translations[lang][ns]);
      keysByLang[lang] = new Set(keys);
      keys.forEach(k => allKeys.add(k));
    }
    
    for (const key of allKeys) {
      for (const lang of LANGUAGES) {
        if (keysByLang[lang] && !keysByLang[lang].has(key)) {
          warnings.push(`Missing key "${key}" in ${lang}/${ns}.json`);
        }
      }
    }
  }
}

function validatePlaceholderConsistency(translations) {
  for (const ns of NAMESPACES) {
    const enContent = translations['en']?.[ns];
    if (!enContent) continue;
    
    const enKeys = flattenKeys(enContent);
    
    for (const key of enKeys) {
      const enValue = key.split('.').reduce((o, k) => o?.[k], enContent);
      const enPlaceholders = extractPlaceholders(enValue);
      
      if (enPlaceholders.length === 0) continue;
      
      for (const lang of LANGUAGES) {
        if (lang === 'en') continue;
        
        const langContent = translations[lang]?.[ns];
        if (!langContent) continue;
        
        const langValue = key.split('.').reduce((o, k) => o?.[k], langContent);
        const langPlaceholders = extractPlaceholders(langValue);
        
        for (const ph of enPlaceholders) {
          if (!langPlaceholders.includes(ph)) {
            warnings.push(`Missing placeholder {${ph}} in ${lang}/${ns}.json key "${key}"`);
          }
        }
      }
    }
  }
}

function validateIcuMessages(translations) {
  for (const lang of LANGUAGES) {
    for (const ns of NAMESPACES) {
      const content = translations[lang]?.[ns];
      if (!content) continue;
      
      const validateRecursive = (obj, prefix = '') => {
        for (const [key, value] of Object.entries(obj)) {
          const fullKey = prefix ? `${prefix}.${key}` : key;
          if (typeof value === 'string') {
            validateIcuSyntax(value, fullKey, lang);
          } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
            validateRecursive(value, fullKey);
          }
        }
      };
      
      validateRecursive(content);
    }
  }
}

function main() {
  console.log('Validating i18n translations...\n');
  
  const translations = loadTranslations();
  
  compareKeys(translations);
  validatePlaceholderConsistency(translations);
  validateIcuMessages(translations);
  
  if (errors.length > 0) {
    console.log('ERRORS:');
    errors.forEach(e => console.log(`  - ${e}`));
    console.log();
  }
  
  if (warnings.length > 0) {
    console.log('WARNINGS:');
    warnings.forEach(w => console.log(`  - ${w}`));
    console.log();
  }
  
  if (errors.length === 0 && warnings.length === 0) {
    console.log('All translations are valid!');
  }
  
  console.log(`\nSummary: ${errors.length} errors, ${warnings.length} warnings`);
  
  process.exit(errors.length > 0 ? 1 : 0);
}

main();
