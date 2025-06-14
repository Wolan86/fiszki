import { expect } from "@playwright/test";
import { BasePage } from "./BasePage";

/**
 * Page Object Model for the Flashcard Creator page
 */
export class CreatorPage extends BasePage {
  // Main container locators
  get creatorView() {
    return this.page.getByTestId("flashcard-creator-view");
  }

  // Source text form locators
  get sourceTextCard() {
    return this.page.getByTestId("source-text-card");
  }

  get sourceTextInput() {
    return this.page.getByTestId("source-text-textarea");
  }

  get wordCounter() {
    return this.page.getByTestId("word-counter");
  }

  get generateButton() {
    return this.page.getByTestId("generate-button");
  }

  get saveStatus() {
    return this.page.getByTestId("save-status");
  }

  // Progress indicator locator
  get progressIndicator() {
    return this.page.getByTestId("flashcard-generation-progress");
  }

  // Generated flashcards locators
  get generatedFlashcardsResult() {
    return this.page.getByTestId("generated-flashcards-result");
  }

  get flashcardList() {
    return this.page.getByTestId("flashcard-list-container");
  }

  get flashcardGrid() {
    return this.page.getByTestId("flashcard-grid");
  }

  /**
   * Navigate to the creator page
   */
  async goto() {
    // Ensure user is authenticated before accessing the creator page
    await this.ensureAuthenticated();

    // Check if we're already on the kreator page (after successful login)
    const currentUrl = this.page.url();

    if (currentUrl.includes("/kreator")) {
      // Just wait for the creator view to be ready
      await this.waitForCreatorView();
      return;
    }

    // Only navigate if we're not already on the kreator page
    await this.page.goto("/kreator");
    await this.waitForCreatorView();
  }

  /**
   * Wait for the creator view to be visible
   */
  async waitForCreatorView() {
    await this.creatorView.waitFor({ state: "visible" });
  }

  /**
   * Enter text into the source text input
   */
  async enterSourceText(text: string) {
    // Ensure user is on the creator page
    await this.ensureAuthenticated();

    try {
      // Wait for the text area to be visible and enabled
      await this.sourceTextInput.waitFor({ state: "visible", timeout: 10000 });

      // Clear existing content first
      await this.sourceTextInput.clear();

      // Use fill for better performance and reliability
      await this.sourceTextInput.fill(text);

      // Blur to trigger any change events
      await this.sourceTextInput.blur();

      // Short wait to allow React state updates to complete
      await this.page.waitForTimeout(500);
    } catch (error) {
      throw new Error(`Failed to enter source text: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Click the generate button to generate flashcards
   */
  async clickGenerateButton() {
    try {
      // Wait for the button to be visible and enabled
      await this.generateButton.waitFor({ state: "visible", timeout: 10000 });
      await expect(this.generateButton).toBeEnabled({ timeout: 5000 });

      // Scroll the button into view if needed
      await this.generateButton.scrollIntoViewIfNeeded();

      // Additional wait for CI environments - ensure button is fully interactive
      if (process.env.CI) {
        await this.page.waitForTimeout(2000);
        // Wait for any potential loading states to complete
        await this.page.waitForLoadState("networkidle");
      }

      // Try multiple click strategies for React apps
      let clickSuccessful = false;

      // Strategy 1: Force click (bypasses actionability checks)
      try {
        await this.generateButton.click({ force: true, timeout: 5000 });
        // Check if click was registered
        await this.page.waitForTimeout(1000);
        if (await this.generateButton.isDisabled()) {
          clickSuccessful = true;
        }
      } catch {
        // Force click failed, trying next strategy
      }

      // Strategy 2: Dispatch click event (works better with React synthetic events)
      if (!clickSuccessful) {
        try {
          await this.generateButton.dispatchEvent("click");
          await this.page.waitForTimeout(1000);
          if (await this.generateButton.isDisabled()) {
            clickSuccessful = true;
          }
        } catch {
          // Dispatch click failed, trying next strategy
        }
      }

      // Strategy 3: Focus and press Enter (keyboard activation)
      if (!clickSuccessful) {
        try {
          await this.generateButton.focus();
          await this.generateButton.press("Enter");
          await this.page.waitForTimeout(1000);
          if (await this.generateButton.isDisabled()) {
            clickSuccessful = true;
          }
        } catch {
          // Keyboard activation failed, trying next strategy
        }
      }

      // Strategy 4: Use page.click with selector (sometimes works when locator.click doesn't)
      if (!clickSuccessful) {
        try {
          await this.page.click('[data-testid="generate-button"]', { force: true });
          await this.page.waitForTimeout(1000);
          if (await this.generateButton.isDisabled()) {
            clickSuccessful = true;
          }
        } catch {
          // Page click failed, trying final strategy
        }
      }

      // Strategy 5: JavaScript click (last resort)
      if (!clickSuccessful) {
        await this.generateButton.evaluate((element) => {
          if (element instanceof HTMLElement) {
            element.click();
          }
        });
        await this.page.waitForTimeout(1000);
        if (await this.generateButton.isDisabled()) {
          clickSuccessful = true;
        }
      }

      if (!clickSuccessful) {
        // Capture more debug info for CI failures
        const buttonState = {
          isVisible: await this.generateButton.isVisible(),
          isEnabled: await this.generateButton.isEnabled(),
          isDisabled: await this.generateButton.isDisabled(),
          boundingBox: await this.generateButton.boundingBox(),
          textContent: await this.generateButton.textContent(),
        };

        // Take screenshot for debugging
        if (process.env.CI) {
          await this.page.screenshot({
            path: `test-results/click-failure-${Date.now()}.png`,
            fullPage: true,
          });
        }

        throw new Error(
          `All click strategies failed - button may not be responding to clicks. Button state: ${JSON.stringify(buttonState)}`
        );
      }

      // Verify the click was registered by checking if button becomes disabled
      await expect(this.generateButton).toBeDisabled({ timeout: 5000 });
    } catch (error) {
      throw new Error(`Failed to click generate button: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Wait for flashcards to be generated
   */
  async waitForFlashcardsGeneration() {
    // Wait for the generate button to be disabled (generation starts)
    await this.generateButton.waitFor({ state: "visible" });
    await expect(this.generateButton).toBeDisabled();

    // Wait for generation to complete - multiple possible outcomes
    try {
      await Promise.race([
        // Success case: flashcards appear
        this.generatedFlashcardsResult.waitFor({ state: "visible", timeout: 45000 }),

        // Error case: error message appears
        this.page.locator('[data-testid="flashcard-generation-error"]').waitFor({ state: "visible", timeout: 45000 }),

        // Alternative error case: check for any error message component
        this.page.locator('[data-testid="generation-error-message"]').waitFor({ state: "visible", timeout: 45000 }),

        // Fallback: wait for progress indicator to disappear (generation finished)
        this.progressIndicator.waitFor({ state: "hidden", timeout: 45000 }).then(() => {
          // Additional check - if progress is hidden, generation should be complete
          return this.page.waitForFunction(
            () => {
              const generateBtn = document.querySelector('[data-testid="generate-button"]');
              return generateBtn && !generateBtn.hasAttribute("disabled");
            },
            { timeout: 10000 }
          );
        }),
      ]);
    } catch (error) {
      // If all promises timeout, log current page state for debugging
      // eslint-disable-next-line no-console
      console.warn("Generation timeout - checking page state:", {
        url: this.page.url(),
        hasGenerateButton: await this.generateButton.isVisible(),
        isGenerateButtonDisabled: await this.generateButton.isDisabled(),
        hasProgressIndicator: await this.progressIndicator.isVisible(),
        hasFlashcardsResult: await this.generatedFlashcardsResult.isVisible(),
        hasErrorMessage: await this.page.locator('[data-testid="flashcard-generation-error"]').isVisible(),
      });

      // Re-throw the error for the test to handle
      throw new Error(
        `Flashcard generation timeout after 45 seconds. ${error instanceof Error ? error.message : String(error)}`
      );
    }

    // Wait for the generate button to be enabled again (generation finished)
    // Increased timeout as this is crucial for determining completion
    await expect(this.generateButton).toBeEnabled({ timeout: 10000 });
  }

  /**
   * Check the outcome of flashcard generation
   * @returns 'success' | 'error' | 'unknown'
   */
  async getGenerationOutcome(): Promise<"success" | "error" | "unknown"> {
    const hasFlashcards = await this.generatedFlashcardsResult.isVisible();
    const hasError = await this.page.locator('[data-testid="flashcard-generation-error"]').isVisible();
    const hasErrorMessage = await this.page.locator('[data-testid="generation-error-message"]').isVisible();

    if (hasFlashcards) return "success";
    if (hasError || hasErrorMessage) return "error";
    return "unknown";
  }

  /**
   * Wait for flashcards generation with outcome verification
   */
  async waitForFlashcardsGenerationWithVerification() {
    await this.waitForFlashcardsGeneration();

    const outcome = await this.getGenerationOutcome();
    if (outcome === "unknown") {
      throw new Error("Generation completed but outcome is unclear - neither success nor error elements are visible");
    }

    return outcome;
  }

  /**
   * Get a specific flashcard by ID
   */
  getFlashcard(id: string) {
    return this.page.getByTestId(`flashcard-${id}`);
  }

  /**
   * Get all flashcards
   */
  async getAllFlashcards() {
    // Wait for the flashcard grid to be visible
    await this.flashcardGrid.waitFor({ state: "visible", timeout: 10000 });

    // Use the more specific selector for flashcard items
    return this.page.locator('[data-testid^="flashcard-item-"]').all();
  }

  /**
   * Generate flashcards from source text
   */
  async generateFlashcards(sourceText: string) {
    // Ensure user is authenticated
    await this.ensureAuthenticated();

    // Navigate to creator if not already there
    if (!(await this.creatorView.isVisible())) {
      await this.goto();
    }

    await this.enterSourceText(sourceText);
    await this.clickGenerateButton();
    await this.waitForFlashcardsGeneration();
  }

  /**
   * Generate flashcards with retry mechanism for better reliability
   */
  async generateFlashcardsWithRetry(sourceText: string, maxRetries = 2): Promise<"success" | "error"> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
      try {
        // eslint-disable-next-line no-console
        console.log(`Flashcard generation attempt ${attempt}/${maxRetries + 1}`);

        // Ensure user is authenticated
        await this.ensureAuthenticated();

        // Navigate to creator if not already there
        if (!(await this.creatorView.isVisible())) {
          await this.goto();
        }

        await this.enterSourceText(sourceText);
        await this.clickGenerateButton();

        const outcome = await this.waitForFlashcardsGenerationWithVerification();
        // eslint-disable-next-line no-console
        console.log(`Generation completed with outcome: ${outcome}`);

        return outcome;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        // eslint-disable-next-line no-console
        console.warn(`Generation attempt ${attempt} failed:`, lastError.message);

        if (attempt <= maxRetries) {
          // eslint-disable-next-line no-console
          console.log("Retrying in 2 seconds...");
          await this.page.waitForTimeout(2000);

          // Try to reset the form state
          try {
            await this.page.reload({ waitUntil: "networkidle" });
            await this.waitForCreatorView();
          } catch (reloadError) {
            // eslint-disable-next-line no-console
            console.warn("Failed to reload page for retry:", reloadError);
          }
        }
      }
    }

    throw new Error(
      `Failed to generate flashcards after ${maxRetries + 1} attempts. Last error: ${lastError?.message}`
    );
  }
}
