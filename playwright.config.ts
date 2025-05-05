import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load test-specific variables
dotenv.config({ path: '.env.test', override: true });

// Define storage state file path
const storageStatePath = './e2e/auth/storageState.json';
const emptyStatePath = './e2e/auth/empty-state.json';

// Check if storage state file exists, create it from empty state if not
if (!fs.existsSync(storageStatePath)) {
  try {
    // Ensure directory exists
    if (!fs.existsSync(path.dirname(storageStatePath))) {
      fs.mkdirSync(path.dirname(storageStatePath), { recursive: true });
    }
    
    // Copy empty state to storage state if it doesn't exist
    if (fs.existsSync(emptyStatePath)) {
      fs.copyFileSync(emptyStatePath, storageStatePath);
    } else {
      // Create empty state file
      fs.writeFileSync(storageStatePath, JSON.stringify({ cookies: [], origins: [] }));
    }
  } catch (error) {
    console.error('Failed to create storage state file:', error);
  }
}

/**
 * Playwright configuration for E2E testing
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './e2e/tests',
  timeout: 60 * 1000,
  expect: {
    timeout: 15000
  },
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: 1,
  reporter: 'html',
  
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    navigationTimeout: 30000,
    actionTimeout: 15000,
  },

  /* Configure projects for different scenarios */
  projects: [
    {
      name: 'setup',
      testMatch: /global\.setup\.ts/,
      use: { storageState: emptyStatePath },
    },
    {
      name: 'authenticated',
      testMatch: /flashcard-creator\.spec\.ts/,
      use: { 
        ...devices['Desktop Chrome'],
        storageState: storageStatePath,
      },
      dependencies: ['setup'],
    },
    {
      name: 'unauthenticated',
      testMatch: /auth\.spec\.ts/,
      use: { 
        ...devices['Desktop Chrome'],
        storageState: emptyStatePath,
      },
    },
  ],

  /* Run local development server before tests */
  webServer: {
    command: 'npm run dev:e2e',
    port: 3000,
    reuseExistingServer: !process.env.CI,
    env: {
      NODE_ENV: 'test',
    },
  },
}); 