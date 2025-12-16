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
import { flattenKeys, getNestedValue, loadJsonFile, getConfig } from './i18n-utils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const config = getConfig(__dirname);
const { localesDir, languages, namespaces } = config;

const errors = [];
const warnings = [];

function extractPlaceholders(str) {
  if (typeof str !== 'string') return [];
  
  const icuPatterns = [
    /\{[^}]+,\s*plural\s*,/,
    /\{[^}]+,\s*select\s*,/,
    /\{[^}]+,\s*selectordinal\s*,/
  ];
  const hasIcu = icuPatterns.some(p => p.test(str));
  
  if (hasIcu) {
    const varMatches = str.match(/\{(\w+)\s*,\s*(?:plural|select|selectordinal)/g) || [];
    return varMatches.map(m => m.match(/\{(\w+)/)?.[1]).filter(Boolean);
  }
  
  const matches = str.match(/\{([^,}]+)/g) || [];
  return matches.map(m => m.replace('{', '').trim());
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
    if (braceCount < 0) {
      errors.push(`Unbalanced braces (extra closing brace) in ICU message: ${lang}/${keyPath}`);
      return;
    }
  }
  
  if (braceCount !== 0) {
    errors.push(`Unbalanced braces in ICU message: ${lang}/${keyPath}`);
  }
}

function loadTranslations() {
  const translations = {};
  
  for (const lang of languages) {
    translations[lang] = {};
    
    for (const ns of namespaces) {
      const filePath = path.join(localesDir, lang, `${ns}.json`);
      const { data, error } = loadJsonFile(filePath);
      
      if (error) {
        errors.push(error);
        continue;
      }
      
      translations[lang][ns] = data;
    }
  }
  
  return translations;
}

function compareKeys(translations) {
  for (const ns of namespaces) {
    const enContent = translations['en']?.[ns];
    if (!enContent) continue;
    
    const enKeys = new Set(flattenKeys(enContent));
    
    for (const lang of languages) {
      if (lang === 'en') continue;
      
      const langContent = translations[lang]?.[ns];
      if (!langContent) continue;
      
      const langKeys = new Set(flattenKeys(langContent));
      
      for (const key of enKeys) {
        if (!langKeys.has(key)) {
          errors.push(`Missing key "${key}" in ${lang}/${ns}.json (exists in en)`);
        }
      }
      
      for (const key of langKeys) {
        if (!enKeys.has(key)) {
          warnings.push(`Extra key "${key}" in ${lang}/${ns}.json (not in en)`);
        }
      }
    }
  }
}

function validatePlaceholderConsistency(translations) {
  for (const ns of namespaces) {
    const enContent = translations['en']?.[ns];
    if (!enContent) continue;
    
    const enKeys = flattenKeys(enContent);
    
    for (const key of enKeys) {
      const enValue = getNestedValue(enContent, key);
      const enPlaceholders = extractPlaceholders(enValue);
      
      if (enPlaceholders.length === 0) continue;
      
      for (const lang of languages) {
        if (lang === 'en') continue;
        
        const langContent = translations[lang]?.[ns];
        if (!langContent) continue;
        
        const langValue = getNestedValue(langContent, key);
        if (langValue === undefined) continue;
        
        const langPlaceholders = extractPlaceholders(langValue);
        
        for (const ph of enPlaceholders) {
          if (!langPlaceholders.includes(ph)) {
            errors.push(`Missing placeholder {${ph}} in ${lang}/${ns}.json key "${key}"`);
          }
        }
      }
    }
  }
}

function validateIcuMessages(translations) {
  for (const lang of languages) {
    for (const ns of namespaces) {
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
