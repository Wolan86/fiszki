import type { Locator, Page } from '@playwright/test';

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
    this.locator = page.getByTestId(`flashcard-item-${id}`);
  }

  // Content locators
  get content() {
    return this.locator.locator('[data-testid^="flashcard-content"]');
  }

  get frontContent() {
    return this.locator.locator('[data-testid="flashcard-front-content"]');
  }

  get backContent() {
    return this.locator.locator('[data-testid="flashcard-back-content"]');
  }

  // Action buttons
  get actionsContainer() {
    return this.locator.locator('[data-testid^="flashcard-actions"]');
  }

  get acceptButton() {
    return this.locator.locator('[data-testid="accept-flashcard-button"]');
  }

  get rejectButton() {
    return this.locator.locator('[data-testid="reject-flashcard-button"]');
  }

  get regenerateButton() {
    return this.locator.locator('[data-testid="regenerate-flashcard-button"]');
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
    await this.actionsContainer.waitFor({ state: 'visible', timeout: 5000 });
    await this.acceptButton.evaluate(element => {
      element.dispatchEvent(new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        view: window
      }));
    });
  }

  /**
   * Reject the flashcard
   */
  async reject() {
    await this.actionsContainer.waitFor({ state: 'visible', timeout: 5000 });
    await this.rejectButton.click();
  }

  /**
   * Regenerate the flashcard
   */
  async regenerate() {
    await this.actionsContainer.waitFor({ state: 'visible', timeout: 5000 });
    await this.regenerateButton.click();
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
      await this.flip();
    }
    return this.frontContent.textContent();
  }

  /**
   * Get the back content text
   */
  async getBackText() {
    const isFlipped = await this.isFlipped();
    if (!isFlipped) {
      await this.flip();
    }
    return this.backContent.textContent();
  }
} 