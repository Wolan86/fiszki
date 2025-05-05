import { Locator, Page } from '@playwright/test';

/**
 * Component class for interacting with a single flashcard
 */
export class FlashcardComponent {
  readonly page: Page;
  readonly locator: Locator;
  readonly id: string;

  constructor(page: Page, id: string) {
    this.page = page;
    this.id = id;
    this.locator = page.getByTestId(`flashcard-${id}`);
  }

  // Content locators
  get content() {
    return this.page.getByTestId(`flashcard-content-${this.id}`);
  }

  get frontContent() {
    return this.page.getByTestId('flashcard-front-content');
  }

  get backContent() {
    return this.page.getByTestId('flashcard-back-content');
  }

  // Action buttons
  get actionsContainer() {
    return this.page.getByTestId(`flashcard-actions-${this.id}`);
  }

  get acceptButton() {
    return this.page.getByTestId('accept-flashcard-button');
  }

  get rejectButton() {
    return this.page.getByTestId('reject-flashcard-button');
  }

  get regenerateButton() {
    return this.page.getByTestId('regenerate-flashcard-button');
  }

  /**
   * Flip the flashcard to see the back side
   */
  async flip() {
    await this.content.click();
  }

  /**
   * Accept the flashcard
   */
  async accept() {
    // Make sure the actions are visible first
    await this.actionsContainer.waitFor({ state: 'visible' });
    await this.acceptButton.click();
  }

  /**
   * Reject the flashcard
   */
  async reject() {
    // Make sure the actions are visible first
    await this.actionsContainer.waitFor({ state: 'visible' });
    await this.rejectButton.click();
  }

  /**
   * Regenerate the flashcard
   */
  async regenerate() {
    // Make sure the actions are visible first
    await this.actionsContainer.waitFor({ state: 'visible' });
    await this.regenerateButton.click();
    // Wait for regeneration to complete (the button has a loading state)
    await this.page.waitForSelector('[data-testid="regenerate-flashcard-button"]:not(:has(.animate-spin))');
  }

  /**
   * Check if the flashcard is flipped
   */
  async isFlipped() {
    const flipped = await this.content.getAttribute('data-flipped');
    return flipped === 'true';
  }

  /**
   * Get the front content text
   */
  async getFrontText() {
    const isFlipped = await this.isFlipped();
    if (isFlipped) {
      await this.flip(); // Flip back to front
    }
    return this.frontContent.textContent();
  }

  /**
   * Get the back content text
   */
  async getBackText() {
    const isFlipped = await this.isFlipped();
    if (!isFlipped) {
      await this.flip(); // Flip to back
    }
    return this.backContent.textContent();
  }
} 