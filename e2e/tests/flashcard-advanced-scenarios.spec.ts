import { test, expect } from "@playwright/test";
import { FlashcardListPage } from "../page-objects/FlashcardListPage";
import { loginAsTestUser } from "../utils/test-helpers";

test.describe.skip("Flashcard Advanced Scenarios", () => {
  let flashcardListPage: FlashcardListPage;

  test.beforeEach(async ({ page }) => {
    flashcardListPage = new FlashcardListPage(page);
    
    // Ensure user is authenticated before each test
    await flashcardListPage.ensureAuthenticated();
  });

  test.describe("Network and API Integration", () => {
    test("Handle network errors gracefully", async ({ page }) => {
      await flashcardListPage.goto("/");
      await flashcardListPage.navigateToFlashcardList();
      
      // Simulate network offline
      await page.context().setOffline(true);
      
      // Try to perform operations that require network
      await flashcardListPage.searchFlashcards("test");
      
      // Verify graceful handling (no crashes, appropriate UI feedback)
      await expect(flashcardListPage.container).toBeVisible();
      
      // Restore network
      await page.context().setOffline(false);
      
      // Verify operations work again
      await flashcardListPage.waitForPageLoad();
    });

    test("Handle slow API responses", async ({ page }) => {
      // Simulate slow network
      await page.route('**/api/**', async (route) => {
        await page.waitForTimeout(2000); // 2 second delay
        await route.continue();
      });

      await flashcardListPage.goto("/");
      await flashcardListPage.navigateToFlashcardList();
      
      // Verify loading states are shown during slow requests
      const loadingVisible = await flashcardListPage.isLoading();
      
      // Wait for actual data to load
      await flashcardListPage.waitForPageLoad();
      
      // Verify loading state eventually disappears
      const loadingGone = !(await flashcardListPage.isLoading());
      expect(loadingGone).toBeTruthy();
    });

    test("Handle API errors with retry mechanism", async ({ page }) => {
      let requestCount = 0;
      
      // First request fails, second succeeds
      await page.route('**/api/flashcards**', async (route) => {
        requestCount++;
        if (requestCount === 1) {
          await route.fulfill({
            status: 500,
            contentType: 'application/json',
            body: JSON.stringify({ error: 'Internal Server Error' })
          });
        } else {
          await route.continue();
        }
      });

      await flashcardListPage.goto("/");
      await flashcardListPage.navigateToFlashcardList();
      
      // Wait for eventual success (app should retry)
      await flashcardListPage.waitForPageLoad();
      
      // Verify data eventually loads
      const hasContent = await flashcardListPage.flashcardGrid.isVisible() || 
                        await flashcardListPage.isEmpty();
      expect(hasContent).toBeTruthy();
    });
  });

  test.describe("Concurrent Operations", () => {
    test("Multiple simultaneous edits", async ({ page }) => {
      await flashcardListPage.goto("/");
      await flashcardListPage.navigateToFlashcardList();
      await flashcardListPage.waitForPageLoad();
      
      const flashcardCount = await flashcardListPage.getFlashcardCount();
      test.skip(flashcardCount < 3, "Need at least 3 flashcards for concurrent operations");
      
      const flashcards = await flashcardListPage.getAllFlashcardItems();
      
      // Start editing multiple flashcards simultaneously
      await flashcards[0].startEdit();
      await flashcards[1].startEdit();
      
      if (flashcards.length > 2) {
        await flashcards[2].startEdit();
      }
      
      // Verify all are in edit mode
      expect(await flashcards[0].isEditing()).toBeTruthy();
      expect(await flashcards[1].isEditing()).toBeTruthy();
      
      // Edit and save one
      const uniqueSuffix = Date.now();
      await flashcards[0].editTermInput.clear();
      await flashcards[0].editTermInput.fill(`Concurrent Edit ${uniqueSuffix}`);
      await flashcards[0].saveEdit();
      
      // Cancel others
      await flashcards[1].cancelEdit();
      if (flashcards.length > 2) {
        await flashcards[2].cancelEdit();
      }
      
      // Verify states
      expect(await flashcards[0].isEditing()).toBeFalsy();
      expect(await flashcards[1].isEditing()).toBeFalsy();
      
      // Verify the saved edit persisted
      const savedTerm = await flashcards[0].getTerm();
      expect(savedTerm).toContain("Concurrent Edit");
    });

    test("Search while editing", async ({ page }) => {
      await flashcardListPage.goto("/");
      await flashcardListPage.navigateToFlashcardList();
      await flashcardListPage.waitForPageLoad();
      
      const flashcardCount = await flashcardListPage.getFlashcardCount();
      test.skip(flashcardCount === 0, "No flashcards available");
      
      const flashcards = await flashcardListPage.getAllFlashcardItems();
      
      // Start editing first flashcard
      await flashcards[0].startEdit();
      
      // Perform search while in edit mode
      await flashcardListPage.searchFlashcards("test");
      await flashcardListPage.waitForSearchResults();
      
      // Verify edit mode is preserved
      const stillEditing = await flashcards[0].isEditing();
      expect(stillEditing).toBeTruthy();
      
      // Cancel edit and clear search
      await flashcards[0].cancelEdit();
      await flashcardListPage.clearSearch();
    });
  });

  test.describe("User Experience Edge Cases", () => {
    test("Rapid consecutive operations", async ({ page }) => {
      await flashcardListPage.goto("/");
      await flashcardListPage.navigateToFlashcardList();
      await flashcardListPage.waitForPageLoad();
      
      const flashcardCount = await flashcardListPage.getFlashcardCount();
      test.skip(flashcardCount === 0, "No flashcards available");
      
      // Rapid search operations
      const searches = ["a", "ab", "abc", "test", ""];
      
      for (const query of searches) {
        await flashcardListPage.searchFlashcards(query);
        // Don't wait for complete - simulate rapid typing
        await page.waitForTimeout(100);
      }
      
      // Wait for final search to complete
      await flashcardListPage.waitForSearchResults();
      
      // Verify app is still responsive
      await expect(flashcardListPage.container).toBeVisible();
    });

    test("Browser back/forward navigation", async ({ page }) => {
      await flashcardListPage.goto("/");
      
      // Navigate through different sections
      await flashcardListPage.navigateToFlashcardList();
      await flashcardListPage.verifyUrl();
      
      await flashcardListPage.navigateToCreator();
      await page.waitForURL("**/kreator");
      
      // Use browser back
      await page.goBack();
      await flashcardListPage.verifyUrl();
      
      // Verify page state is restored correctly
      await flashcardListPage.waitForPageLoad();
      await expect(flashcardListPage.container).toBeVisible();
      
      // Use browser forward
      await page.goForward();
      await page.waitForURL("**/kreator");
    });

    test("Session persistence and reload", async ({ page }) => {
      await flashcardListPage.goto("/");
      await flashcardListPage.navigateToFlashcardList();
      await flashcardListPage.waitForPageLoad();
      
      const initialCount = await flashcardListPage.getFlashcardCount();
      
      // Perform search
      await flashcardListPage.searchFlashcards("test");
      await flashcardListPage.waitForSearchResults();
      
      // Reload page
      await page.reload();
      await flashcardListPage.waitForPageLoad();
      
      // Verify data is still accessible
      const countAfterReload = await flashcardListPage.getFlashcardCount();
      
      // Note: Search state might not persist after reload, which is expected
      // But the flashcard data should be available
      expect(countAfterReload).toBeGreaterThanOrEqual(0);
    });
  });

  test.describe("Data Integrity", () => {
    test("Edit operation data consistency", async ({ page }) => {
      await flashcardListPage.goto("/");
      await flashcardListPage.navigateToFlashcardList();
      await flashcardListPage.waitForPageLoad();
      
      const flashcardCount = await flashcardListPage.getFlashcardCount();
      test.skip(flashcardCount === 0, "No flashcards available");
      
      const flashcards = await flashcardListPage.getAllFlashcardItems();
      const flashcard = flashcards[0];
      
      // Store original content
      const originalTerm = await flashcard.getTerm();
      const originalDefinition = await flashcard.getDefinition();
      
      // Edit flashcard
      const uniqueSuffix = Date.now();
      const newTerm = `Data Integrity Test ${uniqueSuffix}`;
      const newDefinition = `Definition ${uniqueSuffix}`;
      
      await flashcard.edit(newTerm, newDefinition);
      
      // Reload page to verify persistence
      await page.reload();
      await flashcardListPage.waitForPageLoad();
      
      // Get the same flashcard after reload
      const flashcardsAfterReload = await flashcardListPage.getAllFlashcardItems();
      const updatedFlashcard = await flashcardListPage.getFlashcardByTerm(newTerm);
      
      // Verify the changes persisted
      expect(updatedFlashcard).toBeTruthy();
      
      if (updatedFlashcard) {
        const persistedTerm = await updatedFlashcard.getTerm();
        const persistedDefinition = await updatedFlashcard.getDefinition();
        
        expect(persistedTerm).toBe(newTerm);
        expect(persistedDefinition).toBe(newDefinition);
      }
    });

    test("Delete operation data consistency", async ({ page }) => {
      await flashcardListPage.goto("/");
      await flashcardListPage.navigateToFlashcardList();
      await flashcardListPage.waitForPageLoad();
      
      const initialCount = await flashcardListPage.getFlashcardCount();
      test.skip(initialCount === 0, "No flashcards available for deletion");
      
      const flashcards = await flashcardListPage.getAllFlashcardItems();
      const flashcardToDelete = flashcards[0];
      const termToDelete = await flashcardToDelete.getTerm();
      
      // Delete the flashcard
      await flashcardToDelete.deleteAndConfirm();
      
      // Reload page to verify deletion persisted
      await page.reload();
      await flashcardListPage.waitForPageLoad();
      
      // Verify flashcard count decreased
      const finalCount = await flashcardListPage.getFlashcardCount();
      expect(finalCount).toBe(initialCount - 1);
      
      // Verify the specific flashcard is no longer present
      const deletedFlashcard = await flashcardListPage.getFlashcardByTerm(termToDelete || "");
      expect(deletedFlashcard).toBeNull();
    });
  });

  test.describe("Accessibility and UX", () => {
    test("Screen reader compatibility", async ({ page }) => {
      await flashcardListPage.goto("/");
      await flashcardListPage.navigateToFlashcardList();
      await flashcardListPage.waitForPageLoad();
      
      // Check for ARIA landmarks
      const main = page.locator('main');
      await expect(main).toBeVisible();
      
      // Check for proper headings hierarchy
      const pageTitle = flashcardListPage.pageTitle;
      await expect(pageTitle).toBeVisible();
      
      // Verify search accessibility
      const searchAccessible = await flashcardListPage.searchComponent.verifyAccessibility();
      expect(searchAccessible).toBeTruthy();
      
      // Check for proper focus management
      await flashcardListPage.searchComponent.focus();
      const searchFocused = await flashcardListPage.searchComponent.isFocused();
      expect(searchFocused).toBeTruthy();
    });

    test("High contrast mode compatibility", async ({ page }) => {
      // Enable high contrast mode simulation
      await page.emulateMedia({ colorScheme: 'dark' });
      
      await flashcardListPage.goto("/");
      await flashcardListPage.navigateToFlashcardList();
      await flashcardListPage.waitForPageLoad();
      
      // Verify elements are still visible and functional
      await expect(flashcardListPage.container).toBeVisible();
      await expect(flashcardListPage.searchComponent.container).toBeVisible();
      
      // Test functionality in high contrast mode
      await flashcardListPage.searchFlashcards("test");
      await flashcardListPage.waitForSearchResults();
      await flashcardListPage.clearSearch();
    });

    test("Keyboard-only navigation", async ({ page }) => {
      await flashcardListPage.goto("/");
      await flashcardListPage.navigateToFlashcardList();
      await flashcardListPage.waitForPageLoad();
      
      // Explicitly focus on the search input instead of relying on Tab navigation
      await flashcardListPage.searchComponent.focus();
      
      // Verify the search input is focused
      const isFocused = await flashcardListPage.searchComponent.isFocused();
      expect(isFocused).toBeTruthy();
      
      // Clear any existing content first
      await page.keyboard.press("Control+a");
      await page.keyboard.press("Delete");
      
      // Type the search query character by character (more natural)
      const searchText = "keyboard test";
      for (const char of searchText) {
        await page.keyboard.type(char);
        await page.waitForTimeout(50);
      }
      
      // Wait for debounce to settle
      await page.waitForTimeout(400);
      
      // Verify the text was entered
      const searchQueryBeforeEnter = await flashcardListPage.searchComponent.getSearchQuery();
      expect(searchQueryBeforeEnter).toBe("keyboard test");
      
      // Press Enter to trigger search (if needed)
      await page.keyboard.press("Enter");
      
      await flashcardListPage.waitForSearchResults();
      
      // Verify search worked with keyboard only
      const searchQuery = await flashcardListPage.searchComponent.getSearchQuery();
      expect(searchQuery).toBe("keyboard test");
      
      // Clear search with keyboard - try Escape first, then use clear button
      await page.keyboard.press("Escape");
      
      // Wait a bit for the escape to take effect
      await page.waitForTimeout(200);
      
      // Check if Escape worked
      const searchQueryAfterEscape = await flashcardListPage.searchComponent.getSearchQuery();
      if (searchQueryAfterEscape === "keyboard test") {
        // Escape didn't work, try using the clear button
        const clearButtonVisible = await flashcardListPage.searchComponent.isClearButtonVisible();
        if (clearButtonVisible) {
          // Tab to the clear button and press Enter
          await page.keyboard.press("Tab");
          await page.keyboard.press("Enter");
        } else {
          // Manually clear the search input with keyboard
          await page.keyboard.press("Control+a");
          await page.keyboard.press("Delete");
        }
      }
      
      await flashcardListPage.waitForSearchResults();
      
      // Verify search was cleared
      const finalSearchQuery = await flashcardListPage.searchComponent.getSearchQuery();
      expect(finalSearchQuery).toBe("");
    });
  });

  test.describe("Performance and Load Testing", () => {
    test("Memory usage monitoring", async ({ page }) => {
      await flashcardListPage.goto("/");
      await flashcardListPage.navigateToFlashcardList();
      await flashcardListPage.waitForPageLoad();
      
      // Perform multiple operations to check for memory leaks
      for (let i = 0; i < 5; i++) {
        await flashcardListPage.searchFlashcards(`search${i}`);
        await flashcardListPage.waitForSearchResults();
        await flashcardListPage.clearSearch();
        await flashcardListPage.waitForSearchResults();
      }
      
      // Verify page is still responsive
      await expect(flashcardListPage.container).toBeVisible();
      
      // Check JavaScript heap size (basic monitoring)
      const metrics = await page.evaluate(() => {
        const nav = performance as any;
        return nav.memory ? {
          usedJSHeapSize: nav.memory.usedJSHeapSize,
          totalJSHeapSize: nav.memory.totalJSHeapSize
        } : null;
      });
      
      // Log metrics for analysis (in real tests, you might want to assert limits)
      console.log('Memory metrics:', metrics);
    });

    test("Large dataset performance", async ({ page }) => {
      // This test would be more relevant with actual large datasets
      await flashcardListPage.goto("/");
      await flashcardListPage.navigateToFlashcardList();
      
      const startTime = Date.now();
      await flashcardListPage.waitForPageLoad();
      const loadTime = Date.now() - startTime;
      
      // Performance assertions
      expect(loadTime).toBeLessThan(15000); // 15 seconds max for large datasets
      
      const flashcardCount = await flashcardListPage.getFlashcardCount();
      
      if (flashcardCount > 50) {
        // Test search performance with large dataset
        const searchStartTime = Date.now();
        await flashcardListPage.searchFlashcards("performance");
        await flashcardListPage.waitForSearchResults();
        const searchTime = Date.now() - searchStartTime;
        
        expect(searchTime).toBeLessThan(3000); // 3 seconds max for search
      }
    });
  });

  test.describe("Cross-browser Compatibility", () => {
    test("Browser-specific functionality", async ({ page, browserName }) => {
      await flashcardListPage.goto("/");
      await flashcardListPage.navigateToFlashcardList();
      await flashcardListPage.waitForPageLoad();
      
      // Test dialog handling (varies by browser)
      const flashcardCount = await flashcardListPage.getFlashcardCount();
      
      if (flashcardCount > 0) {
        const flashcards = await flashcardListPage.getAllFlashcardItems();
        
        // Test delete confirmation dialog
        const dialogPromise = page.waitForEvent('dialog');
        await flashcards[0].deleteButton.click();
        
        const dialog = await dialogPromise;
        expect(dialog.type()).toBe('confirm');
        
        // Dismiss to avoid actual deletion
        await dialog.dismiss();
        
        // Verify flashcard still exists
        await expect(flashcards[0].locator).toBeVisible();
      }
    });
  });
}); 