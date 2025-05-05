import { test, expect } from '@playwright/test';
import { testUser, loginAsTestUser, wait } from '../utils/test-helpers';

test.describe('Authentication', () => {
  test('should allow user to log in', async ({ page }) => {
    await loginAsTestUser(page);
    
    // Verify user is logged in
    await page.getByTestId('user-menu-button').waitFor({ state: 'visible' });
    
    // Verify user email is displayed somewhere on the page
    const userInfo = await page.locator('.text-sm.font-medium').filter({ hasText: testUser.email });
    await expect(userInfo).toBeVisible();
  });
  
  test('should display error with invalid credentials', async ({ page }) => {
    // Navigate to login page
    await page.goto('/auth/login');
    
    // Wait for the login form to be visible
    await page.getByTestId('login-form').waitFor({ state: 'visible' });
    
    // Set up console message listener before filling the form
    const consoleMessages: string[] = [];
    page.on('console', msg => {
      consoleMessages.push(msg.text());
    });
    
    // Fill in login form with invalid credentials
    await page.getByTestId('email-input').click();
    await page.getByTestId('email-input').clear();
    await page.getByTestId('email-input').fill('invalid@example.com');
    await page.getByTestId('password-input').click();
    await page.getByTestId('password-input').clear();
    await page.getByTestId('password-input').fill('wrongpassword');
    
    // Submit the form
    await page.evaluate(() => {
      document.querySelector('[data-testid="login-button"]')?.dispatchEvent(new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        view: window
      }));
    });
    
    await wait(1000);
    
    // Check for error in console messages
    const hasErrorMessage = consoleMessages.some(message => 
      message.includes('Invalid login credentials') ||
      message.includes('Login error')
    );
    expect(hasErrorMessage).toBeTruthy();
    
    // Verify we're still on the login page
    await expect(page).toHaveURL(/.*login/);
  });

  test('should display validation error when password is empty', async ({ page }) => {
    // Navigate to login page
    await page.goto('/auth/login');
    
    // Wait for the login form to be visible
    await page.getByTestId('login-form').waitFor({ state: 'visible' });
    
    // Fill in email but leave password empty
    await page.getByTestId('email-input').fill(testUser.email);
    await page.getByTestId('password-input').fill('');
    
    // Submit the form
    await page.getByTestId('login-button').click();
    
    // Verify validation error message is displayed
    const validationError = await page.getByText('Hasło jest wymagane');
    await expect(validationError).toBeVisible();
    
    // Verify we're still on the login page
    await expect(page).toHaveURL(/.*login/);
  });
  
  test('should allow user to log out', async ({ page }) => {
    // Login first
    await loginAsTestUser(page);
    
    // Click on user menu button
    await page.getByTestId('user-menu-button').click();
    
    // Click on logout option
    await page.getByText('Wyloguj się').click();
    
    // Wait for logout to complete
    await wait(1000);
    
    // Verify logged out - check for login form
    await page.getByTestId('login-form').waitFor({ state: 'visible' });
  });
}); 