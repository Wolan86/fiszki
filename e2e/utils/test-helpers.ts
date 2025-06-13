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
  
  // Debug: Check what credentials we're using
  console.log(`[loginAsTestUser] Using credentials:`);
  console.log(`[loginAsTestUser] Email: ${process.env.E2E_USERNAME || 'NOT SET'}`);
  console.log(`[loginAsTestUser] Password: ${process.env.E2E_PASSWORD ? '[SET]' : 'NOT SET'}`);
  
  // Navigate to login page
  console.log('Navigating to /auth/login...');
  await page.goto('/auth/login');
  await page.waitForLoadState('networkidle');
  
  // Check if page loaded correctly
  const currentUrl = page.url();
  console.log(`[loginAsTestUser] Current URL after navigation: ${currentUrl}`);
  
  // Check if the page has any content
  const pageContent = await page.textContent('body');
  console.log(`[loginAsTestUser] Page content length: ${pageContent?.length || 0}`);
  
  // Wait for the login form to be visible
  console.log('Waiting for login form...');
  try {
    await page.waitForSelector('[data-testid="login-form"]', { timeout: 5000 });
    console.log('Login form found!');
  } catch (error) {
    console.error('Login form not found:', error);
    // Take a screenshot for debugging
    await page.screenshot({ path: 'login-form-not-found.png' });
    throw error;
  }
  
  // Check if inputs are present
  const emailInput = await page.locator('[data-testid="email-input"]');
  const passwordInput = await page.locator('[data-testid="password-input"]');
  const loginButton = await page.locator('[data-testid="login-button"]');
  
  console.log(`Email input visible: ${await emailInput.isVisible()}`);
  console.log(`Password input visible: ${await passwordInput.isVisible()}`);
  console.log(`Login button visible: ${await loginButton.isVisible()}`);
  
  // Fill in login form using the correct test IDs
  console.log('Filling form fields...');
  await page.fill('[data-testid="email-input"]', process.env.E2E_USERNAME!);
  await page.fill('[data-testid="password-input"]', process.env.E2E_PASSWORD!);
  
  // Wait for the API response when submitting the form
  const responsePromise = page.waitForResponse(response => 
    response.url().includes('/api/auth/login') && response.request().method() === 'POST'
  );
  
  // Submit the form to trigger the JavaScript event listener
  console.log('Submitting form...');
  await page.locator('[data-testid="login-form"]').evaluate((form) => {
    const submitEvent = new Event('submit', {
      bubbles: true,
      cancelable: true
    });
    form.dispatchEvent(submitEvent);
  });
  
  // Wait for the login API response
  const response = await responsePromise;
  
  console.log(`[loginAsTestUser] API Response status: ${response.status()}`);
  console.log(`[loginAsTestUser] API Response headers:`, await response.allHeaders());
  
  let responseBody;
  try {
    // Check if response has content-type header indicating JSON
    const contentType = response.headers()['content-type'] || '';
    if (contentType.includes('application/json')) {
      responseBody = await response.json();
    } else {
      // If not JSON, get as text for debugging
      const responseText = await response.text();
      console.log(`[loginAsTestUser] Non-JSON response body:`, responseText);
      responseBody = { error: 'Non-JSON response received', text: responseText };
    }
  } catch (error) {
    console.error(`[loginAsTestUser] Failed to parse response body:`, error);
    
    // Try to get response as text for debugging
    try {
      const responseText = await response.text();
      console.log(`[loginAsTestUser] Response text:`, responseText);
      responseBody = { error: 'Failed to parse JSON', text: responseText };
    } catch (textError) {
      console.error(`[loginAsTestUser] Could not get response as text:`, textError);
      responseBody = { error: 'Could not parse response at all' };
    }
  }
  
  console.log(`[loginAsTestUser] API Response body:`, responseBody);
  
  if (!response.ok()) {
    throw new Error(`Login API failed: ${response.status()} - ${JSON.stringify(responseBody)}`);
  }
  
  // Check if there are any error messages on the page
  const errorAlert = await page.locator('[role="alert"]').first();
  if (await errorAlert.isVisible()) {
    const errorText = await errorAlert.textContent();
    console.log(`[loginAsTestUser] Error message found: ${errorText}`);
    throw new Error(`Login failed with error: ${errorText}`);
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
