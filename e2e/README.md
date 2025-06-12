# E2E Testing

This directory contains end-to-end tests for the Fiszki AI application using Playwright.

## Structure

- `auth/` - Authentication storage state files
- `page-objects/` - Page Object Model classes
- `tests/` - Test files
- `utils/` - Test utilities and helpers
- `global.setup.ts` - Global setup for authentication
- `global.teardown.ts` - Global teardown for data cleanup
- `tsconfig.json` - TypeScript configuration

## Data Cleanup

The E2E tests include automatic cleanup mechanisms to ensure test isolation:

### Test-level Cleanup (Fixture)

Each test automatically cleans up data after completion using a custom Playwright fixture:

- **File**: `utils/test-fixtures.ts`
- **Purpose**: Removes flashcards and source texts created during individual tests
- **Scope**: Worker-level (runs after each worker completes)
- **Usage**: Import `test` and `expect` from `../utils/test-fixtures` instead of `@playwright/test`

### Global Cleanup (Teardown)

A global teardown runs after all tests complete:

- **File**: `global.teardown.ts`
- **Purpose**: Final cleanup of any remaining test data
- **Scope**: Runs once after all test projects complete
- **Target**: Removes all data for the test user ID specified in `E2E_USERNAME_ID`

### Environment Variables

The cleanup system uses these environment variables from `.env.test`:

```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_PUBLIC_KEY=your-anon-key
E2E_USERNAME_ID=test-user-uuid
E2E_USERNAME=test@test.com
E2E_PASSWORD=your-test-password
```

### Database Tables Cleaned

The cleanup process removes data from:

1. **flashcards** - All flashcards created by the test user
2. **source_texts** - All source texts created by the test user

### Row Level Security (RLS)

All cleanup operations respect Supabase Row Level Security policies, ensuring:

- Only data belonging to the test user is affected
- No accidental deletion of production data
- Secure isolation between test and production environments

## Running Tests

```bash
# Run all E2E tests with cleanup
npm run test:e2e

# Run specific test file
npx playwright test flashcard-creator.spec.ts

# Run tests with cleanup disabled (for debugging)
npx playwright test --grep-invert "cleanup test data"
```

## Test Structure

Tests are organized using Playwright's global setup/teardown and projects:

1. **globalSetup** - Runs `global.setup.ts` for authentication before all tests
2. **authenticated** - Tests requiring login (`flashcard-creator.spec.ts`)
3. **unauthenticated** - Tests not requiring login (`auth.spec.ts`)
4. **globalTeardown** - Runs `global.teardown.ts` for cleanup after all tests

### Global Setup and Teardown

- **Setup**: `e2e/global.setup.ts` - Authenticates test user and saves session state
- **Teardown**: `e2e/global.teardown.ts` - Cleans up all test data after test completion

The global setup/teardown approach ensures:
- Authentication happens once before all tests
- Cleanup happens once after all tests complete
- Better performance compared to per-test authentication
- Reliable test isolation through data cleanup

## Development Guidelines

When writing new E2E tests:

1. **Import test utilities**: Use `import { test, expect } from "../utils/test-fixtures"`
2. **Add cleanup parameter**: Include `cleanupTestData` in test function parameters when creating data
3. **Use test user**: Always use the test user credentials from environment variables
4. **Test isolation**: Each test should be independent and not rely on data from other tests

Example:

```typescript
import { test, expect } from "../utils/test-fixtures";

test("should create flashcard", async ({ page, cleanupTestData }) => {
  // Test code that creates data
  // Cleanup happens automatically after test completion
});
```

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