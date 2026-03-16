#!/usr/bin/env node
import * as fs from 'fs';
import * as path from 'path';

const DIST_PLUGIN = path.join(process.cwd(), 'dist/openclaw-plugin.js');

function test() {
  console.log('[Test 7.1] Verifying dist/openclaw-plugin.js exists...');
  
  if (!fs.existsSync(DIST_PLUGIN)) {
    console.error('[FAIL] dist/openclaw-plugin.js not found');
    process.exit(1);
  }

  const stats = fs.statSync(DIST_PLUGIN);
  const sizeKB = stats.size / 1024;
  
  console.log(`[PASS] Plugin exists: ${sizeKB.toFixed(2)} KB`);
  
  if (sizeKB > 2000) {
    console.error('[WARN] Plugin size > 2MB');
  } else {
    console.log('[PASS] Plugin size < 2MB');
  }

  const content = fs.readFileSync(DIST_PLUGIN, 'utf-8');
  if (!content.includes('OpenClawPlugin')) {
    console.error('[FAIL] Plugin does not contain OpenClawPlugin');
    process.exit(1);
  }
  
  console.log('[PASS] Plugin contains OpenClawPlugin');
  console.log('');
  console.log('✓ Test 7.1: Build test PASSED');
}

test();
