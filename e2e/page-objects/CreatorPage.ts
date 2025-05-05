import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Page Object Model for the Flashcard Creator page
 */
export class CreatorPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  // Main container locators
  get creatorView() {
    return this.page.getByTestId('flashcard-creator-view');
  }

  // Source text form locators
  get sourceTextCard() {
    return this.page.getByTestId('source-text-card');
  }

  get sourceTextInput() {
    return this.page.getByTestId('source-text-textarea');
  }

  get wordCounter() {
    return this.page.getByTestId('word-counter');
  }

  get generateButton() {
    return this.page.getByTestId('generate-button');
  }

  get saveStatus() {
    return this.page.getByTestId('save-status');
  }

  // Progress indicator locator
  get progressIndicator() {
    return this.page.getByTestId('flashcard-generation-progress');
  }

  // Generated flashcards locators
  get generatedFlashcardsResult() {
    return this.page.getByTestId('generated-flashcards-result');
  }

  get flashcardList() {
    return this.page.getByTestId('flashcard-list-container');
  }

  get flashcardGrid() {
    return this.page.getByTestId('flashcard-grid');
  }

  /**
   * Navigate to the creator page
   */
  async goto() {
    // Ensure user is authenticated before accessing the creator page
    await this.ensureAuthenticated();
    
    // Navigate to the creator page
    await this.page.goto('/kreator');
    await this.waitForCreatorView();
  }

  /**
   * Wait for the creator view to be visible
   */
  async waitForCreatorView() {
    await this.creatorView.waitFor({ state: 'visible' });
  }

  /**
   * Enter text into the source text input
   */
  async enterSourceText(text: string) {
    // Ensure user is on the creator page
    await this.ensureAuthenticated();
    
    try {
      // Wait for the text area to be visible and enabled with increased timeout
      await this.sourceTextInput.waitFor({ state: 'visible', timeout: 10000 });
      
      // Type text in chunks instead of using fill to avoid performance issues with large text
      const chunkSize = 500; // Process in smaller chunks
      for (let i = 0; i < text.length; i += chunkSize) {
        const chunk = text.substring(i, i + chunkSize);
        await this.sourceTextInput.press('Control+a'); // Select all existing text
        await this.sourceTextInput.press('Delete'); // Clear it
        await this.sourceTextInput.type(chunk, { delay: 0 }); // Type with no delay between keystrokes
        
        // Short pause between chunks to allow processing
        await this.page.waitForTimeout(100);
      }
      
      await this.sourceTextInput.blur();
      
      // Wait for auto-save to complete with increased timeout
      await this.page.waitForTimeout(3500); // Increased from 2500ms
      
      console.log('Source text entered successfully');
    } catch (error) {
      console.error('Error entering source text:', error);
      throw error;
    }
  }

  /**
   * Click the generate button to generate flashcards
   */
  async clickGenerateButton() {
    await this.generateButton.click();
  }

  /**
   * Wait for flashcards to be generated
   */
  async waitForFlashcardsGeneration() {
    // First wait for the progress indicator to appear
    await this.progressIndicator.waitFor({ state: 'visible' });
    // Then wait for it to disappear or for flashcards to appear
    await Promise.race([
      this.progressIndicator.waitFor({ state: 'hidden' }),
      this.generatedFlashcardsResult.waitFor({ state: 'visible' })
    ]);
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
    await this.flashcardGrid.waitFor({ state: 'visible' });
    // Get all flashcards
    return this.page.locator('[data-testid^="flashcard-"]').all();
  }

  /**
   * Generate flashcards from source text
   */
  async generateFlashcards(sourceText: string) {
    // Ensure user is authenticated
    await this.ensureAuthenticated();
    
    // Navigate to creator if not already there
    if (!await this.creatorView.isVisible()) {
      await this.goto();
    }
    
    await this.enterSourceText(sourceText);
    await this.clickGenerateButton();
    await this.waitForFlashcardsGeneration();
  }
} 