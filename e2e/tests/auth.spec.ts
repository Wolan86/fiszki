import { test, expect } from "../utils/test-fixtures";
import { testUser, loginAsTestUser } from "../utils/test-helpers";

test.describe("Authentication", () => {
  test("should allow user to log in", async ({ page }) => {
    await loginAsTestUser(page);

    // Verify user is logged in
    await page.getByTestId("logout-button").waitFor({ state: "visible" });

    // Verify user email is displayed somewhere on the page
    const userInfo = await page.locator(".text-sm.font-medium").filter({ hasText: testUser.email });
    await expect(userInfo).toBeVisible();
  });

  test("should display error with invalid credentials", async ({ page }) => {
    // Navigate to login page
    await page.goto("/auth/login");

    // Wait for the login form to be visible
    await page.getByTestId("login-form").waitFor({ state: "visible" });

    // Fill in login form with invalid credentials
    await page.getByTestId("email-input").fill("invalid@example.com");
    await page.getByTestId("password-input").fill("wrongpassword");

    // Wait for the API response when submitting the form
    const responsePromise = page.waitForResponse(
      (response) => response.url().includes("/api/auth/login") && response.request().method() === "POST"
    );

    // Submit the form
    await page.getByTestId("login-button").click();

    // Wait for the login API response
    const response = await responsePromise;

    // Verify the API returned an error status
    expect(response.status()).not.toBe(200);

    // Wait for error message to appear in the UI
    await page.waitForSelector('[role="alert"]', { timeout: 5000 });

    // Verify error alert is displayed
    const errorAlert = page.locator('[role="alert"]').first();
    await expect(errorAlert).toBeVisible();

    // Verify error message content
    const errorText = await errorAlert.textContent();
    expect(errorText).toBeTruthy();

    // Verify we're still on the login page
    await expect(page).toHaveURL(/.*login/);
  });

  test("should display validation error when email is invalid", async ({ page }) => {
    // Navigate to login page
    await page.goto("/auth/login");

    // Wait for the login form to be visible
    await page.getByTestId("login-form").waitFor({ state: "visible" });

    // Fill in invalid email and valid password
    await page.getByTestId("email-input").fill("invalid-email");
    await page.getByTestId("password-input").fill("validpassword123");

    // Trigger validation by submitting the form
    await page.getByTestId("login-button").click();

    // Verify that the email field is marked as invalid
    await expect(page.getByTestId("email-input")).toHaveAttribute("aria-invalid", "true");

    // Verify we're still on the login page
    await expect(page).toHaveURL(/.*login/);
  });

  test("should display validation error when password is empty", async ({ page }) => {
    // Navigate to login page
    await page.goto("/auth/login");

    // Wait for the login form to be visible
    await page.getByTestId("login-form").waitFor({ state: "visible" });

    // Fill in email but leave password empty
    await page.getByTestId("email-input").fill(testUser.email);
    await page.getByTestId("password-input").fill("");

    // Trigger validation by submitting the form
    await page.getByTestId("login-button").click();

    // Wait for validation error to appear
    await page.waitForSelector('p[role="alert"]:has-text("Hasło jest wymagane")', { timeout: 5000 });

    // Verify validation error message is displayed
    const validationError = page.getByText("Hasło jest wymagane");
    await expect(validationError).toBeVisible();

    // Verify we're still on the login page
    await expect(page).toHaveURL(/.*login/);
  });

  test("should display validation error when password is too short", async ({ page }) => {
    // Navigate to login page
    await page.goto("/auth/login");

    // Wait for the login form to be visible
    await page.getByTestId("login-form").waitFor({ state: "visible" });

    // Fill in email and short password
    await page.getByTestId("email-input").fill(testUser.email);
    await page.getByTestId("password-input").fill("123");

    // Trigger validation by submitting the form
    await page.getByTestId("login-button").click();

    // Wait for validation error to appear
    await page.waitForSelector('p[role="alert"]:has-text("Hasło musi mieć co najmniej 8 znaków")', { timeout: 5000 });

    // Verify validation error message is displayed
    const validationError = page.getByText("Hasło musi mieć co najmniej 8 znaków");
    await expect(validationError).toBeVisible();

    // Verify we're still on the login page
    await expect(page).toHaveURL(/.*login/);
  });

  test("should allow user to log out", async ({ page }) => {
    // Login first
    await loginAsTestUser(page);

    // Click on logout option
    await page.getByTestId("logout-button").click();

    // Wait for redirect to login page
    await page.waitForURL(/\/auth\/login/, { timeout: 10000 });

    // Verify logged out - check for login form
    await page.getByTestId("login-form").waitFor({ state: "visible" });
  });
});
