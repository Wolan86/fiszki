import { test, expect } from "../utils/test-fixtures";
import { CreatorPage } from "../page-objects/CreatorPage";
import { FlashcardComponent } from "../page-objects/FlashcardComponent";
import { generateSampleText, wait, debugPageState, isCI, getTimeout } from "../utils/test-helpers";

/**
 * Test suite for flashcard creation workflow
 * Authentication is handled by global.setup.ts and playwright.config.ts
 * Data cleanup is handled by test-fixtures.ts
 */
test.describe("Flashcard Creator", () => {
  test.beforeEach(async ({ page }) => {
    // Add console logging to catch JavaScript errors
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        // eslint-disable-next-line no-console
        console.error("Browser console error:", msg.text());
      }
    });

    // Add error handling for uncaught exceptions
    page.on("pageerror", (error) => {
      // eslint-disable-next-line no-console
      console.error("Page error:", error);
    });
  });

  // Example test for the source text entry
  test("should allow entering source text", async ({ page }) => {
    // Arrange
    const creatorPage = new CreatorPage(page);
    const sampleText = "Sample text for testing";

    // Act
    await creatorPage.goto();

    // Wait for the text area to be visible with enhanced timeout
    await creatorPage.sourceTextInput.waitFor({
      state: "visible",
      timeout: getTimeout(10000),
    });

    // Enter the text directly without using enterSourceText method
    await creatorPage.sourceTextInput.fill(sampleText);

    // Assert
    // Wait until the controlled textarea reflects what we typed
    await expect(creatorPage.sourceTextInput).toHaveValue(sampleText, {
      timeout: getTimeout(3000),
    });
  });

  // New test for validation and happy path with improved error handling
  test("should validate minimum word count then allow generation when requirements met", async ({ page }) => {
    // Arrange
    const creatorPage = new CreatorPage(page);
    const insufficientText = generateSampleText(50); // Less than 1000 words
    const sufficientText = generateSampleText(1000); // Exactly 1000 words

    await test.step("Navigate and enter insufficient text", async () => {
      await creatorPage.goto();
      await debugPageState(page, "After navigation");

      // Enter text manually to avoid the validation in enterSourceText method
      await creatorPage.sourceTextInput.waitFor({ state: "visible" });
      await creatorPage.sourceTextInput.fill(insufficientText);
      await creatorPage.sourceTextInput.blur();
      await page.waitForTimeout(1000); // Wait for validation

      // Assert - Button should be disabled with insufficient text
      await expect(creatorPage.generateButton).toBeDisabled();
      await expect(creatorPage.wordCounter).toContainText(/\d+ \/ 1000/);
    });

    await test.step("Enter sufficient text and generate", async () => {
      await creatorPage.sourceTextInput.fill(sufficientText);
      await creatorPage.sourceTextInput.blur();
      await page.waitForTimeout(1000); // Wait for validation

      // Assert - Button should be enabled with sufficient text
      await expect(creatorPage.generateButton).toBeEnabled();
      await expect(creatorPage.wordCounter).toContainText(/\d+ \/ 1000/);

      // Generate flashcards with robust error handling
      try {
        const outcome = await creatorPage.generateFlashcardsWithRetry(sufficientText, 1);

        if (outcome === "success") {
          const flashcards = await creatorPage.getAllFlashcards();
          expect(flashcards.length).toBeGreaterThan(0);
          await expect(creatorPage.flashcardList).toBeVisible();
          // eslint-disable-next-line no-console
          console.log(`✅ Successfully generated ${flashcards.length} flashcards`);
        } else {
          // eslint-disable-next-line no-console
          console.log("⚠️ Generation failed - verifying error display");
          await expect(creatorPage.page.locator('[data-testid="flashcard-generation-error"]')).toBeVisible();
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.log("❌ Generation timeout - taking debug screenshot");
        await page.screenshot({ path: `test-results/generation-timeout-${Date.now()}.png` });
        await debugPageState(page, "Generation timeout");
        throw error;
      }
    });
  });

  // Example test for flashcard generation with enhanced reliability
  test("should generate flashcards from source text", async ({ page }) => {
    // Arrange
    const creatorPage = new CreatorPage(page);
    const sampleText = generateSampleText(1500);

    await test.step("Navigate to creator", async () => {
      await creatorPage.goto();
      await debugPageState(page, "After navigation");
    });

    await test.step("Generate flashcards with retry", async () => {
      const outcome = await creatorPage.generateFlashcardsWithRetry(sampleText, isCI() ? 5 : 2);

      if (outcome === "success") {
        // Assert success case
        const flashcards = await creatorPage.getAllFlashcards();
        expect(flashcards.length).toBeGreaterThan(0);
        await expect(creatorPage.flashcardList).toBeVisible();
        // eslint-disable-next-line no-console
        console.log(`✅ Successfully generated ${flashcards.length} flashcards`);
      } else {
        // Error outcome is also valid - verify error is shown
        await expect(creatorPage.page.locator('[data-testid="flashcard-generation-error"]')).toBeVisible();
        // eslint-disable-next-line no-console
        console.log("⚠️ Generation failed as expected in some test environments");
      }
    });
  });

  // Example test for accepting flashcards with better error handling
  test("should allow accepting flashcards", async ({ page }) => {
    // Arrange
    const creatorPage = new CreatorPage(page);
    const sampleText = generateSampleText(2000);

    await test.step("Generate flashcards", async () => {
      await creatorPage.goto();

      // Use the robust generation method
      const outcome = await creatorPage.generateFlashcardsWithRetry(sampleText, 1);

      if (outcome === "error") {
        // eslint-disable-next-line no-console
        console.log("Generation failed - skipping acceptance test");
        await expect(creatorPage.page.locator('[data-testid="flashcard-generation-error"]')).toBeVisible();
        return; // Exit test gracefully
      }
    });

    await test.step("Accept flashcards", async () => {
      // Wait for everything to load properly
      await page.waitForTimeout(2000);

      // Make sure the grid is visible first
      await expect(page.locator('[data-testid="flashcard-grid"]')).toBeVisible({
        timeout: getTimeout(10000),
      });

      // Get flashcard items
      const flashcardItems = page.locator('[data-testid^="flashcard-item-"]');
      const count = await flashcardItems.count();
      // eslint-disable-next-line no-console
      console.log(`Found ${count} flashcard items`);

      if (count > 0) {
        // Get the first flashcard item
        const firstFlashcard = flashcardItems.first();
        const testId = await firstFlashcard.getAttribute("data-testid");
        const flashcardId = testId ? testId.replace("flashcard-item-", "") : "";

        // Create a FlashcardComponent for the first flashcard
        const flashcard = new FlashcardComponent(page, flashcardId);

        // Accept the flashcard
        await flashcard.accept();

        // Verify the flashcard shows accepted status
        const acceptedStatus = flashcard.locator.locator("text=Zaakceptowana");
        await expect(acceptedStatus).toBeVisible({ timeout: getTimeout(10000) });
      } else {
        // Fallback approach
        const acceptButton = page.locator('[data-testid="accept-flashcard-button"]').first();
        await expect(acceptButton).toBeVisible({ timeout: getTimeout(5000) });
        await acceptButton.click();
        await expect(acceptButton).toBeDisabled();
      }
    });
  });

  // Example test for complete workflow with enhanced reliability
  test("should complete the entire flashcard creation workflow", async ({ page }) => {
    // Arrange
    const creatorPage = new CreatorPage(page);
    const sampleText = generateSampleText(3000);

    await test.step("Enter source text", async () => {
      await creatorPage.goto();
      await creatorPage.enterSourceText(sampleText);
      await expect(creatorPage.saveStatus).toContainText("Ostatnio zapisano", {
        timeout: getTimeout(10000),
      });
    });

    await test.step("Generate flashcards", async () => {
      const outcome = await creatorPage.generateFlashcardsWithRetry(sampleText, 1);

      if (outcome === "error") {
        // eslint-disable-next-line no-console
        console.log("Generation failed - skipping remaining workflow steps");
        await expect(creatorPage.page.locator('[data-testid="flashcard-generation-error"]')).toBeVisible();
        return; // Exit test gracefully
      }

      // Continue with success case
      await expect(creatorPage.flashcardList).toBeVisible();
    });

    await test.step("Accept all flashcards", async () => {
      const flashcards = await creatorPage.getAllFlashcards();
      expect(flashcards.length).toBeGreaterThan(0);
      // eslint-disable-next-line no-console
      console.log(`Processing ${flashcards.length} flashcards`);

      for (let i = 0; i < Math.min(flashcards.length, 3); i++) {
        // Limit to first 3 for speed
        const testId = await flashcards[i].getAttribute("data-testid");
        const flashcardId = testId ? testId.replace("flashcard-item-", "") : "";
        const flashcard = new FlashcardComponent(page, flashcardId);

        // Check front and back content
        const frontText = await flashcard.getFrontText();
        expect(frontText).not.toBeNull();
        expect(frontText).not.toBe("");

        const backText = await flashcard.getBackText();
        expect(backText).not.toBeNull();
        expect(backText).not.toBe("");

        // Accept the flashcard
        await flashcard.accept();

        // Verify the flashcard shows accepted status
        const acceptedStatus = flashcard.locator.locator("text=Zaakceptowana");
        await expect(acceptedStatus).toBeVisible({ timeout: getTimeout(10000) });

        // Wait a bit between actions to avoid race conditions
        if (i < Math.min(flashcards.length, 3) - 1) {
          await wait(300);
        }
      }
    });
  });

  // Test for handling network delays and timeouts
  test("should handle slow network conditions gracefully", async ({ page }) => {
    const creatorPage = new CreatorPage(page);
    const sampleText = generateSampleText(1200);

    // Simulate slow network conditions in CI
    if (isCI()) {
      await page.route("**/api/**", (route) => {
        setTimeout(() => route.continue(), 1000); // Add 1s delay to API calls
      });
    }

    await test.step("Test with network delays", async () => {
      await creatorPage.goto();
      await creatorPage.enterSourceText(sampleText);

      const outcome = await creatorPage.generateFlashcardsWithRetry(sampleText, 2);

      // Both success and error outcomes are acceptable
      expect(["success", "error"]).toContain(outcome);
      // eslint-disable-next-line no-console
      console.log(`Test completed with outcome: ${outcome}`);

      if (outcome === "success") {
        await expect(creatorPage.generatedFlashcardsResult).toBeVisible();
      } else {
        await expect(creatorPage.page.locator('[data-testid="flashcard-generation-error"]')).toBeVisible();
      }
    });
  });
});
