#!/usr/bin/env node
/**
 * i18n Check Script (CI-ready)
 * 
 * Runs extraction + validation in sequence.
 * Exits with code 1 if any issues are found.
 * 
 * Usage: node scripts/i18n-check.js
 */

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function runScript(scriptPath) {
  return new Promise((resolve) => {
    const child = spawn('node', [scriptPath], {
      stdio: 'inherit',
      cwd: path.join(__dirname, '..')
    });
    
    child.on('close', (code) => {
      resolve(code);
    });
  });
}

async function main() {
  console.log('='.repeat(60));
  console.log('Running i18n:check (extract + validate + render-sweep)');
  console.log('='.repeat(60));
  console.log();
  
  console.log('Step 1: Extracting keys from source...\n');
  const extractCode = await runScript(path.join(__dirname, 'i18n-extract.js'));
  
  console.log();
  console.log('Step 2: Validating translation files...\n');
  const validateCode = await runScript(path.join(__dirname, 'validate-i18n.js'));
  
  console.log();
  console.log('Step 3: Running render sweep...\n');
  const sweepCode = await runScript(path.join(__dirname, 'i18n-render-sweep.js'));
  
  console.log();
  console.log('='.repeat(60));
  
  if (extractCode !== 0 || validateCode !== 0 || sweepCode !== 0) {
    console.log('i18n:check FAILED');
    console.log(`  Extract: ${extractCode === 0 ? 'PASS' : 'FAIL'}`);
    console.log(`  Validate: ${validateCode === 0 ? 'PASS' : 'FAIL'}`);
    console.log(`  Render Sweep: ${sweepCode === 0 ? 'PASS' : 'FAIL'}`);
    process.exit(1);
  }
  
  console.log('i18n:check PASSED');
  console.log('='.repeat(60));
  process.exit(0);
}

main();
