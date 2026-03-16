#!/usr/bin/env node
import { execSync } from 'child_process';
import * as fs from 'fs';

function test() {
  console.log('[Test 7.2] Verifying startup script environment checks...');
  
  try {
    const nodeVersion = execSync('node -v', { encoding: 'utf-8' }).trim();
    console.log(`Node.js version: ${nodeVersion}`);
    
    const majorVersion = parseInt(nodeVersion.replace('v', '').split('.')[0]);
    
    if (majorVersion >= 18) {
      console.log('[PASS] Node.js version >= 18');
    } else {
      console.error(`[FAIL] Node.js version ${majorVersion} < 18`);
      process.exit(1);
    }

    const scriptContent = fs.readFileSync('start-jiner.sh', 'utf-8');
    
    if (scriptContent.includes('check_node_version')) {
      console.log('[PASS] Script contains Node.js version check');
    } else {
      console.error('[FAIL] Script missing Node.js version check');
      process.exit(1);
    }
    
    if (scriptContent.includes('check_port')) {
      console.log('[PASS] Script contains port availability check');
    } else {
      console.error('[FAIL] Script missing port availability check');
      process.exit(1);
    }
    
    if (scriptContent.includes('check_dependencies')) {
      console.log('[PASS] Script contains dependency check');
    } else {
      console.error('[FAIL] Script missing dependency check');
      process.exit(1);
    }

    console.log('');
    console.log('✓ Test 7.2: Startup script test PASSED');
  } catch (error) {
    console.error('[FAIL]', error.message);
    process.exit(1);
  }
}

test();
