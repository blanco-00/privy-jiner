#!/usr/bin/env node

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface TestData {
  finance?: Array<{
    type: string;
    amount: number;
    category: string;
    description: string;
    date: string;
  }>;
  health?: Array<{
    type: string;
    amount?: number;
    activity?: string;
    duration?: number;
    date: string;
    goal?: number;
  }>;
  fashion?: Array<{
    type: string;
    name: string;
    category?: string;
    color?: string;
    season?: string[];
    favorite?: boolean;
    items?: string[];
    rating?: number;
  }>;
  knowledge?: Array<{
    title: string;
    content: string;
    category: string;
    tags?: string[];
  }>;
  news?: Array<{
    title: string;
    source: string;
    category: string;
    url: string;
    summary: string;
  }>;
}

const dataPath = path.join(__dirname, 'sample-data.json');

if (!fs.existsSync(dataPath)) {
  console.error('Error: sample-data.json not found');
  process.exit(1);
}

const data: TestData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

console.log('Sample Test Data Loaded:');
console.log('========================\n');

if (data.finance) {
  console.log(`Finance: ${data.finance.length} records`);
  data.finance.forEach((r, i) => {
    console.log(`  ${i + 1}. ${r.type}: $${r.amount} (${r.category}) - ${r.description}`);
  });
  console.log('');
}

if (data.health) {
  console.log(`Health: ${data.health.length} records`);
  data.health.forEach((r, i) => {
    console.log(`  ${i + 1}. ${r.type}: ${r.amount || r.activity} - ${r.date}`);
  });
  console.log('');
}

if (data.fashion) {
  console.log(`Fashion: ${data.fashion.length} items`);
  data.fashion.forEach((r, i) => {
    console.log(`  ${i + 1}. ${r.type}: ${r.name} (${r.category || r.items?.join(', ')})`);
  });
  console.log('');
}

if (data.knowledge) {
  console.log(`Knowledge: ${data.knowledge.length} entries`);
  data.knowledge.forEach((r, i) => {
    console.log(`  ${i + 1}. ${r.title} (${r.category})`);
  });
  console.log('');
}

if (data.news) {
  console.log(`News: ${data.news.length} articles`);
  data.news.forEach((r, i) => {
    console.log(`  ${i + 1}. ${r.title} - ${r.source}`);
  });
  console.log('');
}

console.log('========================');
console.log('Use this data to test module functionality.');
