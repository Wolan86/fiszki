#!/usr/bin/env node

/**
 * Helper script to set up storage state for Playwright tests
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { exit } from 'process';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define paths
const authDir = path.join(__dirname, 'auth');
const emptyStatePath = path.join(authDir, 'empty-state.json');
const storageStatePath = path.join(authDir, 'storageState.json');

console.log('Setting up storage state for Playwright tests...');

// Create auth directory if it doesn't exist
console.log(`Creating auth directory: ${authDir}`);
if (!fs.existsSync(authDir)) {
  fs.mkdirSync(authDir, { recursive: true });
}

// Create empty state file if it doesn't exist
console.log(`Creating empty state file: ${emptyStatePath}`);
if (!fs.existsSync(emptyStatePath)) {
  fs.writeFileSync(emptyStatePath, JSON.stringify({ cookies: [], origins: [] }, null, 2));
}

// Create initial storage state file if it doesn't exist
console.log(`Checking storage state file: ${storageStatePath}`);
if (!fs.existsSync(storageStatePath)) {
  console.log('Storage state file not found. Creating initial one...');
  fs.copyFileSync(emptyStatePath, storageStatePath);
}

// Ask user if they want to regenerate the auth state
const args = process.argv.slice(2);
const forceReset = args.includes('--reset');

if (forceReset || !fs.existsSync(storageStatePath)) {
  try {
    console.log('Running Playwright authentication setup...');
    execSync('npx playwright test e2e/global.setup.ts', { stdio: 'inherit' });
    
    if (fs.existsSync(storageStatePath)) {
      console.log('Authentication state saved successfully!');
    } else {
      console.error('Authentication failed: Storage state file was not created.');
      exit(1);
    }
  } catch (error) {
    console.error('Authentication failed!', error.message);
    exit(1);
  }
} else {
  console.log('Storage state file already exists. Use --reset to regenerate it.');
}

console.log('Setup complete. You can now run your tests with: npm run test:e2e');
exit(0); 