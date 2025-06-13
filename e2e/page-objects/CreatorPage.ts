import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";
import { BasePage } from "./BasePage";

/**
 * Page Object Model for the Flashcard Creator page
 */
export class CreatorPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

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
    console.log(`[CreatorPage.goto] Current URL after authentication: ${currentUrl}`);
    
    if (currentUrl.includes('/kreator')) {
      console.log('[CreatorPage.goto] Already on kreator page, skipping navigation');
      // Just wait for the creator view to be ready
      await this.waitForCreatorView();
      return;
    }

    // Only navigate if we're not already on the kreator page
    console.log('[CreatorPage.goto] Navigating to kreator page...');
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
      // Wait for the text area to be visible and enabled with increased timeout
      await this.sourceTextInput.waitFor({ state: "visible", timeout: 10000 });

      // Type text in chunks instead of using fill to avoid performance issues with large text
      const chunkSize = 500; // Process in smaller chunks
      for (let i = 0; i < text.length; i += chunkSize) {
        const chunk = text.substring(i, i + chunkSize);
        await this.sourceTextInput.type(chunk, { delay: 0 }); // Type with no delay between keystrokes

        // Short pause between chunks to allow processing
        await this.page.waitForTimeout(100);
      }

      await this.sourceTextInput.blur();

      // Wait for auto-save to complete with increased timeout
      await this.page.waitForTimeout(3500); // Increased from 2500ms

      console.log("Source text entered successfully");
    } catch (error) {
      console.error("Error entering source text:", error);
      throw error;
    }
  }

  /**
   * Click the generate button to generate flashcards
   */
  async clickGenerateButton() {
    await this.generateButton.evaluate((element) => {
      element.dispatchEvent(
        new MouseEvent("click", {
          bubbles: true,
          cancelable: true,
          view: window,
        })
      );
    });
  }

  /**
   * Wait for flashcards to be generated
   */
  async waitForFlashcardsGeneration() {
    // Wait for the generate button to be disabled (generation starts)
    await this.generateButton.waitFor({ state: "visible" });
    await expect(this.generateButton).toBeDisabled();
    
    // Wait for either flashcards to appear or an error to occur
    await Promise.race([
      this.generatedFlashcardsResult.waitFor({ state: "visible", timeout: 30000 }),
      this.page.locator('[data-testid="flashcard-generation-error"]').waitFor({ state: "visible", timeout: 30000 }),
    ]);
    
    // Wait for the generate button to be enabled again (generation finished)
    await expect(this.generateButton).toBeEnabled({ timeout: 5000 });
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

    console.log("Looking for flashcard items with data-testid pattern flashcard-item-*");

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
}
