#!/usr/bin/env node

import { PrivyJiner } from './main.js';

const app = new PrivyJiner({
  autoStart: true,
});

app.start().then(() => {
  console.log('Privy-Jiner started successfully!');
  console.log('Open http://localhost:3001 in your browser');
}).catch((error) => {
  console.error('Failed to start Privy-Jiner:', error);
  process.exit(1);
});

process.on('SIGINT', () => {
  console.log('Shutting down...');
  app.stop();
  process.exit(0);
});
