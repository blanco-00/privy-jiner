/**
 * esbuild script to package OpenClaw plugin
 * Run: node scripts/build-plugin.js
 */
import * as esbuild from 'esbuild';
import * as path from 'path';
import * as fs from 'fs';

const PLUGIN_DIR = path.join(process.cwd(), 'packages/core/src/openclaw');
const OUTPUT_DIR = path.join(process.cwd(), 'dist');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'openclaw-plugin.js');

async function build() {
  console.log('[build-plugin] Starting build...');
  console.log('[build-plugin] Input:', path.join(PLUGIN_DIR, 'index.ts'));
  console.log('[build-plugin] Output:', OUTPUT_FILE);

  // Ensure dist directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    console.log('[build-plugin] Created dist directory');
  }

  try {
    await esbuild.build({
      entryPoints: [path.join(PLUGIN_DIR, 'index.ts')],
      bundle: true,
      platform: 'node',
      target: 'node18',
      format: 'esm',
      outfile: OUTPUT_FILE,
      external: [],
      sourcemap: false,
      minify: false,
      logLevel: 'info',
    });

    // Check output file
    if (fs.existsSync(OUTPUT_FILE)) {
      const stats = fs.statSync(OUTPUT_FILE);
      const sizeKB = (stats.size / 1024).toFixed(2);
      console.log(`[build-plugin] ✓ Build successful!`);
      console.log(`[build-plugin] Output: ${OUTPUT_FILE}`);
      console.log(`[build-plugin] Size: ${sizeKB} KB`);
    } else {
      console.error('[build-plugin] ✗ Output file not found');
      process.exit(1);
    }
  } catch (error) {
    console.error('[build-plugin] ✗ Build failed:', error);
    process.exit(1);
  }
}

build();
