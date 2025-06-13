import { test, expect } from "@playwright/test";
import { FlashcardListPage } from "../page-objects/FlashcardListPage";

test.describe.skip("Flashcard List Scenarios", () => {
  let flashcardListPage: FlashcardListPage;

  test.beforeEach(async ({ page }) => {
    flashcardListPage = new FlashcardListPage(page);
  });

  test("Debug: Check home page redirect", async ({ page }) => {
    // eslint-disable-next-line no-console
    console.log("Starting debug test...");

    // Navigate to home page
    await flashcardListPage.goto("/");
    // eslint-disable-next-line no-console
    console.log(`Navigated to home page, current URL: ${page.url()}`);

    // Wait a bit to see if there's any redirect
    await page.waitForTimeout(1000);
    // eslint-disable-next-line no-console
    console.log(`After wait, current URL: ${page.url()}`);

    // Check final URL
    // eslint-disable-next-line no-console
    console.log(`Final URL: ${page.url()}`);

    // Check if navigation is visible
    const navVisible = await page.getByTestId("nav-moje-fiszki").isVisible();
    // eslint-disable-next-line no-console
    console.log(`Nav 'Moje fiszki' visible: ${navVisible}`);

    if (!navVisible) {
      // eslint-disable-next-line no-console
      console.log("Navigation is not visible, checking if on login page");
      const loginFormVisible = await page.locator('form[action="/api/auth/login"]').isVisible();
      // eslint-disable-next-line no-console
      console.log(`Login form visible: ${loginFormVisible}`);
    }

    // Take screenshot for debugging
    await page.screenshot({ path: "debug-home-redirect.png" });
  });

  test("Debug: Check cookie in requests", async ({ page }) => {
    // eslint-disable-next-line no-console
    console.log("Starting cookie debug test...");

    // Listen to all requests to see cookies
    page.on("request", (request) => {
      const cookies = request.headers()["cookie"];
      if (cookies && cookies.includes("sb-ctckruhijobdabxvrwxi-auth-token")) {
        // eslint-disable-next-line no-console
        console.log(`Request to ${request.url()} has auth cookie`);
        // eslint-disable-next-line no-console
        console.log(`Cookie header: ${cookies.substring(0, 100)}...`);
      } else {
        // eslint-disable-next-line no-console
        console.log(`Request to ${request.url()} has NO auth cookie`);
        if (cookies) {
          // eslint-disable-next-line no-console
          console.log(`Available cookies: ${cookies.substring(0, 100)}...`);
        } else {
          // eslint-disable-next-line no-console
          console.log(`No cookies at all`);
        }
      }
    });

    // Navigate to home page
    await flashcardListPage.goto("/");
    // eslint-disable-next-line no-console
    console.log(`Navigated to home page, current URL: ${page.url()}`);

    // Wait for any redirects
    await page.waitForTimeout(2000);
    // eslint-disable-next-line no-console
    console.log(`Final URL: ${page.url()}`);
  });

  test("Scenario 1: Navigate to flashcard list via 'Moje fiszki'", async ({ page }) => {
    const flashcardListPage = new FlashcardListPage(page);

    // Debug: Check cookies before navigation
    const cookies = await page.context().cookies();
    // eslint-disable-next-line no-console
    console.log(`[Test] Cookies available: ${cookies.length}`);
    cookies.forEach((cookie, index) => {
      // eslint-disable-next-line no-console
      console.log(
        `[Test] Cookie ${index + 1}: ${cookie.name} = ${cookie.value.substring(0, 50)}... (domain: ${cookie.domain})`
      );
    });

    // Navigate to home page first
    await page.goto("/");
    // eslint-disable-next-line no-console
    console.log(`[Test] Navigated to home, current URL: ${page.url()}`);

    // Check if we're redirected to login (which would indicate auth failure)
    if (page.url().includes("/auth/login")) {
      // eslint-disable-next-line no-console
      console.log(`[Test] ERROR: Redirected to login page - authentication failed`);

      // Take a screenshot for debugging
      await page.screenshot({ path: "test-results/auth-debug-scenario1.png" });

      throw new Error("Authentication failed - user was redirected to login page");
    }

    // Ensure the home page is loaded before navigating to flashcard list
    await flashcardListPage.waitForPageLoad();

    // Navigate to flashcard list via "Moje fiszki" link
    await flashcardListPage.navigateToFlashcardList();

    // Wait for the flashcard list page to load
    await flashcardListPage.waitForPageLoad();

    // Verify we're on the correct page
    await expect(page).toHaveURL(/.*\/fiszki/);
    await expect(flashcardListPage.pageTitle).toBeVisible();
  });

  test("Scenario 2: Edit a flashcard", async () => {
    // Navigate to flashcard list
    await flashcardListPage.goto("/");
    await flashcardListPage.navigateToFlashcardList();
    await flashcardListPage.waitForPageLoad();

    // Skip test if no flashcards exist
    const flashcardCount = await flashcardListPage.getFlashcardCount();
    test.skip(flashcardCount === 0, "No flashcards available for editing");

    // Get the first flashcard
    const flashcardItems = await flashcardListPage.getAllFlashcardItems();
    const firstFlashcard = flashcardItems[0];

    // Edit the flashcard
    const newTerm = `Edited Term ${Date.now()}`;
    const newDefinition = `Edited Definition ${Date.now()}`;

    await firstFlashcard.edit(newTerm, newDefinition);

    // Verify the changes were saved
    const updatedTerm = await firstFlashcard.getTerm();
    const updatedDefinition = await firstFlashcard.getDefinition();

    expect(updatedTerm).toBe(newTerm);
    expect(updatedDefinition).toBe(newDefinition);

    // Verify the flashcard is no longer in edit mode
    const isEditing = await firstFlashcard.isEditing();
    expect(isEditing).toBeFalsy();
  });

  test("Scenario 3: Search for an edited flashcard", async () => {
    // Navigate to flashcard list
    await flashcardListPage.goto("/");
    await flashcardListPage.navigateToFlashcardList();
    await flashcardListPage.waitForPageLoad();

    // Skip test if no flashcards exist
    const flashcardCount = await flashcardListPage.getFlashcardCount();
    test.skip(flashcardCount === 0, "No flashcards available for searching");

    // Get a flashcard to search for
    const flashcardItems = await flashcardListPage.getAllFlashcardItems();
    const firstFlashcard = flashcardItems[0];
    const searchTerm = await firstFlashcard.getTerm();

    if (!searchTerm) {
      test.skip(true, "Flashcard has no term to search for");
      return; // This line will never be reached, but helps TypeScript understand
    }

    // Perform search with partial term
    const partialTerm = searchTerm.substring(0, 5);
    await flashcardListPage.searchFlashcards(partialTerm);

    // Wait for search results
    await flashcardListPage.waitForSearchResults();

    // Verify search was performed
    const searchQuery = await flashcardListPage.searchComponent.getSearchQuery();
    expect(searchQuery).toBe(partialTerm);

    // Verify search results contain the flashcard
    const searchResults = await flashcardListPage.getAllFlashcardItems();
    expect(searchResults.length).toBeGreaterThan(0);

    // Verify the searched flashcard is in results (search by partial term)
    const foundFlashcard = await flashcardListPage.getFlashcardByTerm(partialTerm);
    expect(foundFlashcard).toBeTruthy();
  });

  test("Scenario 4: Delete a flashcard", async () => {
    // Navigate to flashcard list
    await flashcardListPage.goto("/");
    await flashcardListPage.navigateToFlashcardList();
    await flashcardListPage.waitForPageLoad();

    // Skip test if no flashcards exist
    const initialCount = await flashcardListPage.getFlashcardCount();
    test.skip(initialCount === 0, "No flashcards available for deletion");

    // Get the first flashcard for deletion
    const flashcardItems = await flashcardListPage.getAllFlashcardItems();
    const flashcardToDelete = flashcardItems[0];

    // Store the flashcard ID for verification
    const flashcardId = flashcardToDelete.id;

    // Delete the flashcard and confirm
    await flashcardToDelete.deleteAndConfirm();

    // Verify the flashcard count decreased
    const finalCount = await flashcardListPage.getFlashcardCount();
    expect(finalCount).toBe(initialCount - 1);

    // Verify the specific flashcard is no longer visible
    const deletedFlashcard = flashcardListPage.getFlashcardItem(flashcardId);
    await expect(deletedFlashcard.locator).not.toBeVisible();
  });

  test("Complete E2E Flow: Navigate → Edit → Search → Delete", async () => {
    // Step 1: Navigate to flashcard list
    await flashcardListPage.goto("/");
    await flashcardListPage.navigateToFlashcardList();
    await flashcardListPage.verifyUrl();
    await flashcardListPage.waitForPageLoad();

    // Skip test if no flashcards exist
    const initialCount = await flashcardListPage.getFlashcardCount();
    test.skip(initialCount === 0, "No flashcards available for E2E flow");

    // Step 2: Edit a flashcard
    const flashcardItems = await flashcardListPage.getAllFlashcardItems();
    const targetFlashcard = flashcardItems[0];

    const uniqueSuffix = Date.now();
    const editedTerm = `E2E Test Term ${uniqueSuffix}`;
    const editedDefinition = `E2E Test Definition ${uniqueSuffix}`;

    await targetFlashcard.edit(editedTerm, editedDefinition);

    // Verify edit was successful
    const verifiedTerm = await targetFlashcard.getTerm();
    const verifiedDefinition = await targetFlashcard.getDefinition();
    expect(verifiedTerm).toBe(editedTerm);
    expect(verifiedDefinition).toBe(editedDefinition);

    // Step 3: Search for the edited flashcard
    await flashcardListPage.searchFlashcards(editedTerm);
    await flashcardListPage.waitForSearchResults();

    // Verify search found the flashcard
    const foundFlashcard = await flashcardListPage.getFlashcardByTerm(editedTerm);
    expect(foundFlashcard).toBeTruthy();

    // Clear search to show all flashcards
    await flashcardListPage.clearSearch();
    await flashcardListPage.waitForSearchResults();

    // Step 4: Delete the edited flashcard
    const flashcardToDelete = await flashcardListPage.getFlashcardByTerm(editedTerm);
    if (flashcardToDelete) {
      await flashcardToDelete.deleteAndConfirm();

      // Verify deletion
      const finalCount = await flashcardListPage.getFlashcardCount();
      expect(finalCount).toBe(initialCount - 1);
    }
  });

  test("Search functionality edge cases", async () => {
    await flashcardListPage.goto("/");
    await flashcardListPage.navigateToFlashcardList();
    await flashcardListPage.waitForPageLoad();

    // Test empty search
    await flashcardListPage.searchFlashcards("");
    await flashcardListPage.waitForSearchResults();

    // Test search with no results
    await flashcardListPage.searchFlashcards("NonExistentSearchTerm12345");
    await flashcardListPage.waitForSearchResults();

    // Verify search input is accessible
    const isAccessible = await flashcardListPage.searchComponent.verifyAccessibility();
    expect(isAccessible).toBeTruthy();

    // Test clear functionality
    await flashcardListPage.clearSearch();
    const searchQuery = await flashcardListPage.searchComponent.getSearchQuery();
    expect(searchQuery).toBe("");
  });

  test("Edit flashcard with cancel action", async () => {
    await flashcardListPage.goto("/");
    await flashcardListPage.navigateToFlashcardList();
    await flashcardListPage.waitForPageLoad();

    const flashcardCount = await flashcardListPage.getFlashcardCount();
    test.skip(flashcardCount === 0, "No flashcards available for editing");

    const flashcardItems = await flashcardListPage.getAllFlashcardItems();
    const flashcard = flashcardItems[0];

    // Store original content
    const originalTerm = await flashcard.getTerm();
    const originalDefinition = await flashcard.getDefinition();

    // Start editing
    await flashcard.startEdit();

    // Make changes without saving
    await flashcard.editTermInput.clear();
    await flashcard.editTermInput.fill("Temporary Change");

    // Cancel the edit
    await flashcard.cancelEdit();

    // Verify original content is preserved
    const currentTerm = await flashcard.getTerm();
    const currentDefinition = await flashcard.getDefinition();

    expect(currentTerm).toBe(originalTerm);
    expect(currentDefinition).toBe(originalDefinition);
  });

  test("Delete flashcard with cancel action", async () => {
    await flashcardListPage.goto("/");
    await flashcardListPage.navigateToFlashcardList();
    await flashcardListPage.waitForPageLoad();

    const initialCount = await flashcardListPage.getFlashcardCount();
    test.skip(initialCount === 0, "No flashcards available for deletion test");

    const flashcardItems = await flashcardListPage.getAllFlashcardItems();
    const flashcard = flashcardItems[0];

    // Attempt delete but cancel
    await flashcard.deleteAndCancel();

    // Verify flashcard still exists
    const finalCount = await flashcardListPage.getFlashcardCount();
    expect(finalCount).toBe(initialCount);

    // Verify the flashcard is still visible
    await expect(flashcard.locator).toBeVisible();
  });

  test("Page loading states and error handling", async () => {
    await flashcardListPage.goto("/");
    await flashcardListPage.navigateToFlashcardList();

    // Wait for page to finish loading
    await flashcardListPage.waitForPageLoad();

    // Verify loading state disappears
    const isStillLoading = await flashcardListPage.isLoading();
    expect(isStillLoading).toBeFalsy();

    // Verify either content or empty state is shown
    const hasContent = await flashcardListPage.flashcardGrid.isVisible();
    const isEmpty = await flashcardListPage.isEmpty();
    expect(hasContent || isEmpty).toBeTruthy();
  });

  test("Keyboard navigation and accessibility", async ({ page }) => {
    await flashcardListPage.goto("/");
    await flashcardListPage.navigateToFlashcardList();
    await flashcardListPage.waitForPageLoad();

    // Test keyboard navigation to search
    await page.keyboard.press("Tab");
    await flashcardListPage.searchComponent.focus();
    const isFocused = await flashcardListPage.searchComponent.isFocused();
    expect(isFocused).toBeTruthy();

    // Test search with keyboard
    await page.keyboard.type("test");
    await page.keyboard.press("Enter");
    await flashcardListPage.waitForSearchResults();

    // Verify accessibility attributes
    const isAccessible = await flashcardListPage.searchComponent.verifyAccessibility();
    expect(isAccessible).toBeTruthy();
  });

  test("Multiple flashcard operations", async () => {
    await flashcardListPage.goto("/");
    await flashcardListPage.navigateToFlashcardList();
    await flashcardListPage.waitForPageLoad();

    const flashcardCount = await flashcardListPage.getFlashcardCount();
    test.skip(flashcardCount < 2, "Need at least 2 flashcards for multiple operations test");

    const flashcards = await flashcardListPage.getAllFlashcardItems();

    // Edit multiple flashcards
    const uniqueSuffix = Date.now();
    await flashcards[0].edit(`Term1 ${uniqueSuffix}`, `Definition1 ${uniqueSuffix}`);

    if (flashcards.length > 1) {
      await flashcards[1].edit(`Term2 ${uniqueSuffix}`, `Definition2 ${uniqueSuffix}`);
    }

    // Search for first edited flashcard
    await flashcardListPage.searchFlashcards(`Term1 ${uniqueSuffix}`);
    await flashcardListPage.waitForSearchResults();

    const searchResults = await flashcardListPage.getFlashcardCount();
    expect(searchResults).toBeGreaterThan(0);

    // Clear search
    await flashcardListPage.clearSearch();
    await flashcardListPage.waitForSearchResults();
  });

  test("Search functionality with special characters", async () => {
    await flashcardListPage.goto("/");
    await flashcardListPage.navigateToFlashcardList();
    await flashcardListPage.waitForPageLoad();

    // Test search with special characters
    const specialQueries = ["@test", "#tag", "ąęóść", "123", "test!", "test&more"];

    for (const query of specialQueries) {
      await flashcardListPage.searchFlashcards(query);
      await flashcardListPage.waitForSearchResults();

      // Verify search completed without errors
      const searchQuery = await flashcardListPage.searchComponent.getSearchQuery();
      expect(searchQuery).toBe(query);

      // Clear for next iteration
      await flashcardListPage.clearSearch();
      await flashcardListPage.waitForSearchResults();
    }
  });

  test("Edit validation - empty fields", async () => {
    await flashcardListPage.goto("/");
    await flashcardListPage.navigateToFlashcardList();
    await flashcardListPage.waitForPageLoad();

    const flashcardCount = await flashcardListPage.getFlashcardCount();
    test.skip(flashcardCount === 0, "No flashcards available for validation test");

    const flashcards = await flashcardListPage.getAllFlashcardItems();
    const flashcard = flashcards[0];

    // Store original content
    const originalTerm = await flashcard.getTerm();
    const originalDefinition = await flashcard.getDefinition();

    // Start editing
    await flashcard.startEdit();

    // Try to save with empty fields
    await flashcard.editTermInput.clear();
    await flashcard.editDefinitionInput.clear();

    // Click save button (should not save with empty fields)
    await flashcard.saveEditButton.click();

    // Verify still in edit mode (validation should prevent saving)
    const isStillEditing = await flashcard.isEditing();
    expect(isStillEditing).toBeTruthy();

    // Cancel to restore original state
    await flashcard.cancelEdit();

    // Verify original content preserved
    const currentTerm = await flashcard.getTerm();
    const currentDefinition = await flashcard.getDefinition();
    expect(currentTerm).toBe(originalTerm);
    expect(currentDefinition).toBe(originalDefinition);
  });

  test("Responsive layout verification", async ({ page }) => {
    // Test desktop layout
    await page.setViewportSize({ width: 1920, height: 1080 });
    await flashcardListPage.goto("/");
    await flashcardListPage.navigateToFlashcardList();
    await flashcardListPage.waitForPageLoad();

    // Verify elements are visible in desktop layout
    await expect(flashcardListPage.container).toBeVisible();
    await expect(flashcardListPage.searchComponent.container).toBeVisible();

    // Test tablet layout
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(500); // Wait for layout adjustment

    // Verify elements still visible
    await expect(flashcardListPage.container).toBeVisible();
    await expect(flashcardListPage.searchComponent.container).toBeVisible();

    // Test mobile layout
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500); // Wait for layout adjustment

    // Verify core functionality still works on mobile
    await expect(flashcardListPage.container).toBeVisible();
    await expect(flashcardListPage.searchComponent.container).toBeVisible();
  });

  test("Performance test - loading large number of flashcards", async () => {
    await flashcardListPage.goto("/");
    await flashcardListPage.navigateToFlashcardList();

    // Measure initial load time
    const startTime = Date.now();
    await flashcardListPage.waitForPageLoad();
    const loadTime = Date.now() - startTime;

    // Verify page loads within reasonable time (adjust threshold as needed)
    expect(loadTime).toBeLessThan(10000); // 10 seconds max

    const flashcardCount = await flashcardListPage.getFlashcardCount();

    if (flashcardCount > 0) {
      // Test search performance
      const searchStartTime = Date.now();
      await flashcardListPage.searchFlashcards("test");
      await flashcardListPage.waitForSearchResults();
      const searchTime = Date.now() - searchStartTime;

      // Verify search completes within reasonable time
      expect(searchTime).toBeLessThan(5000); // 5 seconds max
    }
  });

  test("Debug: Direct navigation to protected page", async ({ page }) => {
    // eslint-disable-next-line no-console
    console.log("[Test] Starting direct navigation test...");

    // Check cookies before navigation
    const cookies = await page.context().cookies();
    // eslint-disable-next-line no-console
    console.log(`[Test] Cookies available: ${cookies.length}`);
    cookies.forEach((cookie, index) => {
      // eslint-disable-next-line no-console
      console.log(
        `[Test] Cookie ${index + 1}: ${cookie.name} = ${cookie.value.substring(0, 50)}... (domain: ${cookie.domain})`
      );
    });

    // Navigate directly to a protected page
    // eslint-disable-next-line no-console
    console.log("[Test] Navigating directly to /kreator...");
    const response = await page.goto("http://localhost:3000/kreator");
    // eslint-disable-next-line no-console
    console.log(`[Test] Response status: ${response?.status()}`);
    // eslint-disable-next-line no-console
    console.log(`[Test] Final URL: ${page.url()}`);

    // Wait a bit for any redirects
    await page.waitForTimeout(2000);
    // eslint-disable-next-line no-console
    console.log(`[Test] URL after wait: ${page.url()}`);

    // Check if we're on the login page
    if (page.url().includes("/auth/login")) {
      // eslint-disable-next-line no-console
      console.log("[Test] ERROR: Redirected to login page - authentication failed");
      await page.screenshot({ path: "test-results/auth-debug-direct.png" });
      throw new Error("Authentication failed - user was redirected to login page");
    }

    // eslint-disable-next-line no-console
    console.log("[Test] SUCCESS: Stayed on protected page");
  });
});
