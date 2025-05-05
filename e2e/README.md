# E2E Testing with Playwright

This directory contains end-to-end tests using Playwright.

## Authentication Setup

### Common Authentication Issues

If tests are failing due to authentication issues, try the following:

1. **Check Credentials**: Ensure test user credentials are correct in `.env.test` file or as environment variables:
   ```
   TEST_USER_EMAIL=test@example.com
   TEST_USER_PASSWORD=test123456
   ```

2. **Delete Storage State**: Remove the stored authentication state and let the tests regenerate it:
   ```bash
   rm e2e/auth/storageState.json
   ```

3. **Verify Login Page Selectors**: Ensure the login page selectors in `global.setup.ts` match your actual login form:
   ```typescript
   // These selectors must match what's in your app
   await page.getByTestId('login-form').waitFor({ state: 'visible' });
   await page.getByTestId('email-input').fill(testUser.email);
   await page.getByTestId('password-input').fill(testUser.password);
   await page.getByTestId('login-button').click();
   ```

4. **Check Redirect URLs**: Verify the redirect URL after login matches your app's flow:
   ```typescript
   // This should match where your app redirects after login
   await page.waitForURL('/**/dashboard', { timeout: 10000 });
   ```

5. **Debug Authentication Flow**: Run the authentication setup in debug mode:
   ```bash
   npx playwright test e2e/global.setup.ts --debug
   ```

### Fixing "ENOENT: no such file or directory, open 'e2e/storageState.json'" Error

If you encounter this error, it means Playwright can't find the storage state file. Here's how to fix it:

1. **Create the auth directory**:
   ```bash
   mkdir -p e2e/auth
   ```

2. **Create an empty state file**:
   ```bash
   echo '{"cookies":[],"origins":[]}' > e2e/auth/empty-state.json
   ```

3. **Run the setup manually**:
   ```bash
   npx playwright test e2e/global.setup.ts
   ```

4. **Check if the storage state file exists**:
   ```bash
   ls -la e2e/auth/storageState.json
   ```

5. **Run your tests**:
   ```bash
   npm run test:e2e
   ```

### Creating a Test User

To create a test user for E2E tests:

1. Register a new user in the application dedicated for testing
2. Update the `.env.test` file with the credentials
3. Make sure this user has the necessary permissions for tests

### Running Tests Without Authentication

For tests that don't require authentication, you can skip the authentication setup:

```typescript
// In your test file
test.describe('Public pages', () => {
  test.use({ storageState: { cookies: [], origins: [] } });
  
  test('should display the public homepage', async ({ page }) => {
    await page.goto('/');
    // Your test code
  });
});
```

## Troubleshooting

If you're still having issues:

1. Check the application logs for authentication errors
2. Verify that your test user has not been locked out or deactivated
3. Check for CORS or CSP issues that might be affecting the test environment
4. Clear your browser cache and cookies before running tests
5. Make sure the app is correctly running in test mode with proper API endpoints 