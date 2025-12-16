#!/usr/bin/env node
/**
 * i18n Check Script (CI-ready)
 * 
 * Runs extraction + validation + render-sweep in sequence.
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
    
    child.on('error', (err) => {
      console.error(`Failed to start script ${scriptPath}: ${err.message}`);
      resolve(1);
    });
    
    child.on('close', (code) => {
      resolve(code ?? 1);
    });
  });
}

async function main() {
  console.log('='.repeat(60));
  console.log('Running i18n:check (extract + validate + render-sweep)');
  console.log('='.repeat(60));
  console.log();
  
  const steps = [
    { name: 'Extract', script: 'i18n-extract.js', label: 'Extracting keys from source...' },
    { name: 'Validate', script: 'validate-i18n.js', label: 'Validating translation files...' },
    { name: 'Render Sweep', script: 'i18n-render-sweep.js', label: 'Running render sweep...' }
  ];
  
  const results = {};
  
  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    console.log(`Step ${i + 1}: ${step.label}\n`);
    results[step.name] = await runScript(path.join(__dirname, step.script));
    console.log();
  }
  
  console.log('='.repeat(60));
  
  const allPassed = Object.values(results).every(code => code === 0);
  
  if (!allPassed) {
    console.log('i18n:check FAILED');
    for (const [name, code] of Object.entries(results)) {
      console.log(`  ${name}: ${code === 0 ? 'PASS' : 'FAIL'}`);
    }
    process.exit(1);
  }
  
  console.log('i18n:check PASSED');
  console.log('='.repeat(60));
  process.exit(0);
}

main().catch(err => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
