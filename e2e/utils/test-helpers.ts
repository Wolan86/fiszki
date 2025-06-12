/**
 * Test helpers for E2E tests
 */

import fs from 'fs';
import path from 'path';
import type { Page } from '@playwright/test';

/**
 * Generate a sample text with the specified length in words
 * @param wordCount The number of words to generate
 * @returns A string with the specified number of words
 */
export function generateSampleText(wordCount = 1000): string {
  // Create a shorter repeating pattern to improve performance
  // Using a more repetitive pattern with fewer unique words to reduce processing time
  const words = ["lorem", "ipsum", "dolor", "sit", "amet", "consectetur", "adipiscing", "elit", "sed", "do"];
  let result = "";

  // Create text with the specified number of words
  for (let i = 0; i < wordCount; i++) {
    result += words[i % words.length] + " ";

    // Add period and new paragraph every 20 words to make text look natural
    if ((i + 1) % 20 === 0) {
      result += ". ";

      if ((i + 1) % 100 === 0) {
        result += "\n\n";
      }
    }
  }

  return result;
}

/**
 * Wait for a specified amount of time
 * This should be used sparingly, only when there's no better way to wait for an operation
 * @param ms Milliseconds to wait
 */
export async function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Get the current timestamp string
 * Useful for creating unique test data
 */
export function getTimestampString(): string {
  return new Date().toISOString().replace(/[:.]/g, "-");
}

/**
 * Sample flashcard data for tests
 */
export const sampleFlashcard = {
  front: "What is the capital of France?",
  back: "Paris",
};

/**
 * Test user credentials
 */
export const testUser = {
  // Use string type assertion to avoid linter errors with process.env
  email: (process.env as any).E2E_USERNAME || "test@example.com",
  password: (process.env as any).E2E_PASSWORD || "test123456",
  name: "Test User",
};

/**
 * Login helper for authentication
 * @param page Playwright page
 */
export async function loginAsTestUser(page: Page): Promise<void> {
  const context = page.context();
  
  console.log('Starting authentication process...');
  
  // Navigate to login page
  await page.goto('/auth/login');
  await page.waitForLoadState('networkidle');
  
  // Wait for the login form to be visible
  await page.waitForSelector('[data-testid="login-form"]', { timeout: 5000 });
  
  // Fill in login form using the correct test IDs
  await page.fill('[data-testid="email-input"]', process.env.E2E_USERNAME!);
  await page.fill('[data-testid="password-input"]', process.env.E2E_PASSWORD!);
  
  // Submit the form using the login button
  await page.click('[data-testid="login-button"]');
  
  // Wait a moment and check what URL we're on
  await page.waitForTimeout(3000);
  const currentUrl = page.url();
  console.log(`[loginAsTestUser] Current URL after form submission: ${currentUrl}`);
  
  // Check if there are any error messages on the page
  const errorAlert = await page.locator('[role="alert"]').first();
  if (await errorAlert.isVisible()) {
    const errorText = await errorAlert.textContent();
    console.log(`[loginAsTestUser] Error message found: ${errorText}`);
  }
  
  // Wait for redirect after successful login (should go to /kreator)
  // Use a more flexible URL pattern in case there are query parameters
  await page.waitForURL(/\/kreator/, { timeout: 10000 });
  
  // Save the storage state
  const storageState = await context.storageState();
  const storageStatePath = path.resolve('e2e/auth/storageState.json');
  
  fs.writeFileSync(storageStatePath, JSON.stringify(storageState, null, 2));
  console.log(`[loginAsTestUser] Saved storage state with ${storageState.cookies.length} cookies`);
  
  console.log('[loginAsTestUser] Login verification successful');
}
