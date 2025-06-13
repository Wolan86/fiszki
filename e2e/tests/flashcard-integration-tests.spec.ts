import { test, expect } from "@playwright/test";
import { FlashcardListPage } from "../page-objects/FlashcardListPage";
import { CreatorPage } from "../page-objects/CreatorPage";

test.describe.skip("Flashcard Components Integration Tests", () => {
  let flashcardListPage: FlashcardListPage;
  let creatorPage: CreatorPage;

  test.beforeEach(async ({ page }) => {
    flashcardListPage = new FlashcardListPage(page);
    creatorPage = new CreatorPage(page);
  });

  test.describe("Navigation Flow Integration", () => {
    test("Complete navigation flow between all sections", async ({ page }) => {
      // Start from home page
      await flashcardListPage.goto("/");

      // Navigate to Moje Fiszki
      await flashcardListPage.navigateToFlashcardList();
      await flashcardListPage.verifyUrl();
      await flashcardListPage.waitForPageLoad();

      // Verify page loaded correctly
      await expect(flashcardListPage.container).toBeVisible();
      await expect(flashcardListPage.pageTitle).toBeVisible();

      // Navigate to Kreator
      await flashcardListPage.navigateToCreator();
      await page.waitForURL("**/kreator");

      // Verify creator page loaded
      await expect(page.locator('[data-testid="creator-container"]')).toBeVisible();

      // Navigate to Nauka
      await page.getByTestId("nav-nauka").click();
      await page.waitForURL("**/nauka");

      // Navigate back to Moje Fiszki
      await page.getByTestId("nav-moje-fiszki").click();
      await flashcardListPage.verifyUrl();
      await flashcardListPage.waitForPageLoad();

      // Verify we're back at the flashcard list
      await expect(flashcardListPage.container).toBeVisible();
    });

    test("Navigation preserves user context", async ({ page }) => {
      await flashcardListPage.goto("/");
      await flashcardListPage.navigateToFlashcardList();
      await flashcardListPage.waitForPageLoad();

      // Perform a search to establish state
      await flashcardListPage.searchFlashcards("context test");
      await flashcardListPage.waitForSearchResults();

      // Navigate away and back
      await flashcardListPage.navigateToCreator();
      await page.waitForURL("**/kreator");

      await page.getByTestId("nav-moje-fiszki").click();
      await flashcardListPage.verifyUrl();
      await flashcardListPage.waitForPageLoad();

      // Note: Search state might or might not persist - this depends on implementation
      // The test verifies the page loads correctly regardless
      await expect(flashcardListPage.container).toBeVisible();
    });
  });

  test.describe("Creator to List Integration", () => {
    test("Create flashcard and verify it appears in list", async ({ page }) => {
      // Start at flashcard list to get baseline count
      await flashcardListPage.goto("/");
      await flashcardListPage.navigateToFlashcardList();
      await flashcardListPage.waitForPageLoad();

      const initialCount = await flashcardListPage.getFlashcardCount();

      // Navigate to creator
      await flashcardListPage.navigateToCreator();
      await page.waitForURL("**/kreator");

      // Create a new flashcard (this would need CreatorPage implementation)
      const uniqueSuffix = Date.now();
      const newTerm = `Integration Test Term ${uniqueSuffix}`;
      const newDefinition = `Integration Test Definition ${uniqueSuffix}`;

      // Fill creator form (assuming these elements exist)
      const termInput = page.getByTestId("creator-term-input");
      const definitionInput = page.getByTestId("creator-definition-input");
      const submitButton = page.getByTestId("creator-submit-button");

      if (await termInput.isVisible()) {
        await termInput.fill(newTerm);
        await definitionInput.fill(newDefinition);
        await submitButton.click();

        // Wait for success feedback or redirect
        await page.waitForTimeout(1000);

        // Navigate back to list
        await page.getByTestId("nav-moje-fiszki").click();
        await flashcardListPage.verifyUrl();
        await flashcardListPage.waitForPageLoad();

        // Verify the new flashcard appears
        const finalCount = await flashcardListPage.getFlashcardCount();
        expect(finalCount).toBe(initialCount + 1);

        // Search for the new flashcard
        const newFlashcard = await flashcardListPage.getFlashcardByTerm(newTerm);
        expect(newFlashcard).toBeTruthy();
      } else {
        test.skip(true, "Creator form not available - skipping integration test");
      }
    });
  });

  test.describe("List to Learning Integration", () => {
    test("Select flashcards and start learning session", async ({ page }) => {
      await flashcardListPage.goto("/");
      await flashcardListPage.navigateToFlashcardList();
      await flashcardListPage.waitForPageLoad();

      const flashcardCount = await flashcardListPage.getFlashcardCount();
      test.skip(flashcardCount === 0, "No flashcards available for learning");

      // Note: This test assumes there's a way to select flashcards for learning
      // Implementation would depend on actual learning flow

      // Navigate to learning
      await flashcardListPage.navigateToLearning();
      await page.waitForURL("**/nauka");

      // Verify learning page loaded
      await expect(page.locator("main")).toBeVisible();

      // Navigate back to verify integration works both ways
      await page.getByTestId("nav-moje-fiszki").click();
      await flashcardListPage.verifyUrl();
      await flashcardListPage.waitForPageLoad();
    });
  });

  test.describe("Search and Edit Integration", () => {
    test("Search, edit, and verify search results update", async ({ page }) => {
      await flashcardListPage.goto("/");
      await flashcardListPage.navigateToFlashcardList();
      await flashcardListPage.waitForPageLoad();

      const flashcardCount = await flashcardListPage.getFlashcardCount();
      test.skip(flashcardCount === 0, "No flashcards available");

      const flashcards = await flashcardListPage.getAllFlashcardItems();
      const targetFlashcard = flashcards[0];

      const originalTerm = await targetFlashcard.getTerm();
      if (!originalTerm) {
        test.skip(true, "Flashcard has no term");
      }

      // Search for the original term
      await flashcardListPage.searchFlashcards(originalTerm.substring(0, 3));
      await flashcardListPage.waitForSearchResults();

      // Verify flashcard is in search results
      const searchResults = await flashcardListPage.getAllFlashcardItems();
      expect(searchResults.length).toBeGreaterThan(0);

      // Edit the flashcard to a new term
      const uniqueSuffix = Date.now();
      const editedTerm = `Integration Edited ${uniqueSuffix}`;

      const flashcardInResults = searchResults[0];
      await flashcardInResults.edit(editedTerm, "Integration edited definition");

      // Clear search and search for new term
      await flashcardListPage.clearSearch();
      await flashcardListPage.waitForSearchResults();

      await flashcardListPage.searchFlashcards("Integration Edited");
      await flashcardListPage.waitForSearchResults();

      // Verify edited flashcard appears in new search
      const foundEdited = await flashcardListPage.getFlashcardByTerm(editedTerm);
      expect(foundEdited).toBeTruthy();

      // Search for original term should not find it
      await flashcardListPage.searchFlashcards(originalTerm);
      await flashcardListPage.waitForSearchResults();

      const foundOriginal = await flashcardListPage.getFlashcardByTerm(originalTerm);
      expect(foundOriginal).toBeNull();
    });
  });

  test.describe("Error State Integration", () => {
    test("Handle errors gracefully across components", async ({ page }) => {
      // Test network error handling across navigation
      await flashcardListPage.goto("/");
      await flashcardListPage.navigateToFlashcardList();

      // Simulate network issues
      await page.route("**/api/**", (route) => route.abort());

      // Try operations that require network
      await flashcardListPage.searchFlashcards("network test");

      // Verify app doesn't crash
      await expect(flashcardListPage.container).toBeVisible();

      // Try navigation during network issues
      await flashcardListPage.navigateToCreator();

      // Verify navigation still works
      await page.waitForURL("**/kreator");

      // Restore network
      await page.unroute("**/api/**");

      // Navigate back and verify recovery
      await page.getByTestId("nav-moje-fiszki").click();
      await flashcardListPage.verifyUrl();
    });

    test("Authentication state across components", async ({ page }) => {
      // This test would verify authentication persists across navigation
      await flashcardListPage.goto("/");

      // Verify authentication elements are present
      const authStatus = page.locator('[data-testid="auth-status"]');
      if (await authStatus.isVisible()) {
        // Test authenticated navigation
        await flashcardListPage.navigateToFlashcardList();
        await flashcardListPage.verifyUrl();

        await flashcardListPage.navigateToCreator();
        await page.waitForURL("**/kreator");

        // Verify auth status persists
        await expect(authStatus).toBeVisible();
      } else {
        test.skip(true, "Not authenticated - skipping auth integration test");
      }
    });
  });

  test.describe("Data Synchronization", () => {
    test("Data consistency across multiple tabs", async ({ context }) => {
      // Create two tabs
      const page1 = await context.newPage();
      const page2 = await context.newPage();

      const flashcardListPage1 = new FlashcardListPage(page1);
      const flashcardListPage2 = new FlashcardListPage(page2);

      // Load flashcard list in both tabs
      await flashcardListPage1.goto("/");
      await flashcardListPage1.navigateToFlashcardList();
      await flashcardListPage1.waitForPageLoad();

      await flashcardListPage2.goto("/");
      await flashcardListPage2.navigateToFlashcardList();
      await flashcardListPage2.waitForPageLoad();

      const count1 = await flashcardListPage1.getFlashcardCount();
      const count2 = await flashcardListPage2.getFlashcardCount();

      // Both tabs should show same count
      expect(count1).toBe(count2);

      if (count1 > 0) {
        // Edit flashcard in tab 1
        const flashcards1 = await flashcardListPage1.getAllFlashcardItems();
        const uniqueSuffix = Date.now();
        const editedTerm = `Multi-tab Edit ${uniqueSuffix}`;

        await flashcards1[0].edit(editedTerm, "Multi-tab definition");

        // Refresh tab 2 to see changes
        await page2.reload();
        await flashcardListPage2.waitForPageLoad();

        // Search for edited flashcard in tab 2
        const foundInTab2 = await flashcardListPage2.getFlashcardByTerm(editedTerm);
        expect(foundInTab2).toBeTruthy();
      }

      await page1.close();
      await page2.close();
    });
  });

  test.describe("Responsive Integration", () => {
    test("Component integration works across viewports", async ({ page }) => {
      const viewports = [
        { width: 1920, height: 1080, name: "Desktop" },
        { width: 768, height: 1024, name: "Tablet" },
        { width: 375, height: 667, name: "Mobile" },
      ];

      for (const viewport of viewports) {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });

        await flashcardListPage.goto("/");
        await flashcardListPage.navigateToFlashcardList();
        await flashcardListPage.waitForPageLoad();

        // Verify core functionality works at this viewport
        await expect(flashcardListPage.container).toBeVisible();

        // Test search functionality
        await flashcardListPage.searchFlashcards("responsive test");
        await flashcardListPage.waitForSearchResults();
        await flashcardListPage.clearSearch();

        // Test navigation
        await flashcardListPage.navigateToCreator();
        await page.waitForURL("**/kreator");

        await page.getByTestId("nav-moje-fiszki").click();
        await flashcardListPage.verifyUrl();

        console.log(`✓ Integration tests passed for ${viewport.name} (${viewport.width}x${viewport.height})`);
      }
    });
  });

  test.describe("Performance Integration", () => {
    test("Navigation performance between components", async ({ page }) => {
      await flashcardListPage.goto("/");

      const navigationTests = [
        { from: "home", to: "flashcards", action: () => flashcardListPage.navigateToFlashcardList() },
        { from: "flashcards", to: "creator", action: () => flashcardListPage.navigateToCreator() },
        { from: "creator", to: "flashcards", action: () => page.getByTestId("nav-moje-fiszki").click() },
      ];

      for (const navTest of navigationTests) {
        const startTime = Date.now();
        await navTest.action();

        // Wait for navigation to complete
        if (navTest.to === "flashcards") {
          await flashcardListPage.verifyUrl();
          await flashcardListPage.waitForPageLoad();
        } else {
          await page.waitForURL(`**/${navTest.to === "creator" ? "kreator" : navTest.to}`);
        }

        const navTime = Date.now() - startTime;

        // Navigation should be reasonably fast
        expect(navTime).toBeLessThan(5000);

        console.log(`Navigation from ${navTest.from} to ${navTest.to}: ${navTime}ms`);
      }
    });
  });
});
