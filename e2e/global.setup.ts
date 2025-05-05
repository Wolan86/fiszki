import { test as setup } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { loginAsTestUser } from './utils/test-helpers';

// Define storage state path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const storageStatePath = path.join(__dirname, 'auth', 'storageState.json');

/**
 * Global setup to authenticate once before all tests
 * This performs an actual login for E2E testing
 */
setup('authenticate', async ({ page }) => {
  // Reset storage state before authentication
  if (fs.existsSync(storageStatePath)) {
    console.log('Resetting existing storage state...');
    fs.writeFileSync(storageStatePath, JSON.stringify({ cookies: [], origins: [] }));
  }
  
  // Create directory if it doesn't exist
  const dir = path.dirname(storageStatePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  console.log('Starting authentication process...');
  
  try {
    // Use the proven login helper from test-helpers.ts
    await loginAsTestUser(page);
    
    // Save authentication state to file
    console.log(`Saving authentication state to ${storageStatePath}...`);
    await page.context().storageState({ path: storageStatePath });
    
    console.log('Authentication completed successfully!');
  } catch (error) {
    console.error('Authentication failed:', error);
    
    // Take a screenshot to help diagnose the issue
    const screenshotPath = path.join(dir, 'auth-failure.png');
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.error(`Screenshot saved to ${screenshotPath}`);
    
    throw error;
  }
}); 