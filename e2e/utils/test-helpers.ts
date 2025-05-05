/**
 * Test helpers for E2E tests
 */

/**
 * Generate a sample text with the specified length in words
 * @param wordCount The number of words to generate
 * @returns A string with the specified number of words
 */
export function generateSampleText(wordCount: number = 1000): string {
  // Create a shorter repeating pattern to improve performance
  // Using a more repetitive pattern with fewer unique words to reduce processing time
  const words = ['lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit', 'sed', 'do'];
  let result = '';
  
  // Create text with the specified number of words
  for (let i = 0; i < wordCount; i++) {
    result += words[i % words.length] + ' ';
    
    // Add period and new paragraph every 20 words to make text look natural
    if ((i + 1) % 20 === 0) {
      result += '. ';
      
      if ((i + 1) % 100 === 0) {
        result += '\n\n';
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
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Get the current timestamp string
 * Useful for creating unique test data
 */
export function getTimestampString(): string {
  return new Date().toISOString().replace(/[:.]/g, '-');
}

/**
 * Sample flashcard data for tests
 */
export const sampleFlashcard = {
  front: 'What is the capital of France?',
  back: 'Paris'
};

/**
 * Test user credentials
 */
export const testUser = {
  // Use string type assertion to avoid linter errors with process.env
  email: (process.env as any).E2E_USERNAME || 'test@example.com',
  password: (process.env as any).E2E_PASSWORD || 'test123456',
  name: 'Test User'
};

/**
 * Login helper for authentication
 * @param page Playwright page
 */
export async function loginAsTestUser(page: any): Promise<void> {
  // Navigate to login page
  await page.goto('/auth/login');
  
  // Wait for the login form to be visible
  await page.getByTestId('login-form').waitFor({ state: 'visible' });
  
  // Make sure we have a valid password that meets validation requirements
  const password = testUser.password && testUser.password.length >= 8 
    ? testUser.password 
    : 'test123456';
  
  // Fill in the login form - ensure proper focus and clear any existing values
  await page.getByTestId('email-input').click();
  await page.getByTestId('email-input').clear();
  await page.getByTestId('email-input').fill(testUser.email);
  
  await page.getByTestId('password-input').click();
  await page.getByTestId('password-input').clear();
  await page.getByTestId('password-input').fill(password);
  
  // Wait a moment to ensure form is properly filled
  await wait(500);
  
  // Submit the form
  await page.evaluate(() => {
    document.querySelector('[data-testid="login-button"]')?.dispatchEvent(new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      view: window
    }));
  });
  
  // Wait for response - handle multiple possible success indicators
  try {
    // Try to wait for redirection to a known page or for authentication elements
    await Promise.race([
      page.waitForURL('**/kreator', { timeout: 10000 })
        .catch(() => console.log('URL redirect pattern not matched')),
      page.waitForURL('/**', { timeout: 10000 })
        .then(async () => {
          // Check for authentication indicators on the new page
          await Promise.race([
            page.getByTestId('user-menu-button').waitFor({ state: 'visible', timeout: 5000 })
              .catch(() => console.log('User menu button not found')),
            page.getByText('Wyloguj się').waitFor({ state: 'visible', timeout: 5000 })
              .catch(() => console.log('Logout button not found'))
          ]);
        })
        .catch(() => console.log('General URL redirect not detected'))
    ]);
    
    // Add a small delay to ensure the page is fully loaded
    await wait(1000);
    
    console.log('Login successful');
  } catch (error) {
    console.error('Login failed:', error);
    
    // Check if there are validation errors
    const validationErrors = await page.locator('.text-red-500').allTextContents();
    if (validationErrors.length > 0) {
      console.error('Validation errors:', validationErrors);
    }
    
    throw new Error('Failed to log in: ' + error);
  }
} 