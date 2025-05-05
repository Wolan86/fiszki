# Test info

- Name: Authentication >> should allow user to log out
- Location: C:\Users\wolan\projects\fiszki\e2e\tests\auth.spec.ts:81:3

# Error details

```
TimeoutError: locator.click: Timeout 15000ms exceeded.
Call log:
  - waiting for getByText('Wyloguj się')

    at C:\Users\wolan\projects\fiszki\e2e\tests\auth.spec.ts:89:41
```

# Page snapshot

```yaml
- banner:
  - link "Fiszki":
    - /url: /
  - navigation
  - button "Zaloguj się":
    - img
    - text: Zaloguj się
- main:
  - heading "Logowanie" [level=1]
  - text: Logowanie Zaloguj się do swojego konta, aby mieć dostęp do swoich fiszek Email
  - textbox "Email"
  - text: Hasło
  - link "Zapomniałeś hasła?":
    - /url: /auth/forgot-password
  - textbox "Hasło"
  - button "Zaloguj się"
  - paragraph:
    - text: Nie masz jeszcze konta?
    - link "Zarejestruj się":
      - /url: /auth/register
- contentinfo: © 2025 Fiszki. Wszystkie prawa zastrzeżone.
```

# Test source

```ts
   1 | import { test, expect } from '@playwright/test';
   2 | import { testUser, loginAsTestUser, wait } from '../utils/test-helpers';
   3 |
   4 | test.describe('Authentication', () => {
   5 |   test('should allow user to log in', async ({ page }) => {
   6 |     await loginAsTestUser(page);
   7 |     
   8 |     // Verify user is logged in
   9 |     await page.getByTestId('user-menu-button').waitFor({ state: 'visible' });
  10 |     
  11 |     // Verify user email is displayed somewhere on the page
  12 |     const userInfo = await page.locator('.text-sm.font-medium').filter({ hasText: testUser.email });
  13 |     await expect(userInfo).toBeVisible();
  14 |   });
  15 |   
  16 |   test('should display error with invalid credentials', async ({ page }) => {
  17 |     // Navigate to login page
  18 |     await page.goto('/auth/login');
  19 |     
  20 |     // Wait for the login form to be visible
  21 |     await page.getByTestId('login-form').waitFor({ state: 'visible' });
  22 |     
  23 |     // Set up console message listener before filling the form
  24 |     const consoleMessages: string[] = [];
  25 |     page.on('console', msg => {
  26 |       consoleMessages.push(msg.text());
  27 |     });
  28 |     
  29 |     // Fill in login form with invalid credentials
  30 |     await page.getByTestId('email-input').click();
  31 |     await page.getByTestId('email-input').clear();
  32 |     await page.getByTestId('email-input').fill('invalid@example.com');
  33 |     await page.getByTestId('password-input').click();
  34 |     await page.getByTestId('password-input').clear();
  35 |     await page.getByTestId('password-input').fill('wrongpassword');
  36 |     
  37 |     // Submit the form
  38 |     await page.evaluate(() => {
  39 |       document.querySelector('[data-testid="login-button"]')?.dispatchEvent(new MouseEvent('click', {
  40 |         bubbles: true,
  41 |         cancelable: true,
  42 |         view: window
  43 |       }));
  44 |     });
  45 |     
  46 |     await wait(1000);
  47 |     
  48 |     // Check for error in console messages
  49 |     const hasErrorMessage = consoleMessages.some(message => 
  50 |       message.includes('Invalid login credentials') ||
  51 |       message.includes('Login error')
  52 |     );
  53 |     expect(hasErrorMessage).toBeTruthy();
  54 |     
  55 |     // Verify we're still on the login page
  56 |     await expect(page).toHaveURL(/.*login/);
  57 |   });
  58 |
  59 |   test('should display validation error when password is empty', async ({ page }) => {
  60 |     // Navigate to login page
  61 |     await page.goto('/auth/login');
  62 |     
  63 |     // Wait for the login form to be visible
  64 |     await page.getByTestId('login-form').waitFor({ state: 'visible' });
  65 |     
  66 |     // Fill in email but leave password empty
  67 |     await page.getByTestId('email-input').fill(testUser.email);
  68 |     await page.getByTestId('password-input').fill('');
  69 |     
  70 |     // Submit the form
  71 |     await page.getByTestId('login-button').click();
  72 |     
  73 |     // Verify validation error message is displayed
  74 |     const validationError = await page.getByText('Hasło jest wymagane');
  75 |     await expect(validationError).toBeVisible();
  76 |     
  77 |     // Verify we're still on the login page
  78 |     await expect(page).toHaveURL(/.*login/);
  79 |   });
  80 |   
  81 |   test('should allow user to log out', async ({ page }) => {
  82 |     // Login first
  83 |     await loginAsTestUser(page);
  84 |     
  85 |     // Click on user menu button
  86 |     await page.getByTestId('user-menu-button').click();
  87 |     
  88 |     // Click on logout option
> 89 |     await page.getByText('Wyloguj się').click();
     |                                         ^ TimeoutError: locator.click: Timeout 15000ms exceeded.
  90 |     
  91 |     // Wait for logout to complete
  92 |     await wait(1000);
  93 |     
  94 |     // Verify logged out - check for login form
  95 |     await page.getByTestId('login-form').waitFor({ state: 'visible' });
  96 |   });
  97 | }); 
```