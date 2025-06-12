import type { Locator, Page } from "@playwright/test";

/**
 * Component class for interacting with the search functionality
 * Handles search input, clear button, and loading states
 */
export class SearchComponent {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  // Search elements
  get container() {
    return this.page.getByTestId("flashcard-search-container");
  }

  get searchInput() {
    return this.page.getByTestId("search-input");
  }

  get clearButton() {
    return this.page.getByTestId("search-clear-button");
  }

  get loadingIndicator() {
    return this.page.getByTestId("search-loading-indicator");
  }

  /**
   * Perform a search with the given query
   */
  async search(query: string) {
    await this.searchInput.clear();
    await this.searchInput.fill(query);
    
    // Trigger search by pressing Enter or waiting for debounce
    await this.searchInput.press("Enter");
    
    // Wait for search to complete
    await this.waitForSearchComplete();
  }

  /**
   * Clear the search input
   */
  async clear() {
    // Use clear button if visible, otherwise clear input directly
    if (await this.clearButton.isVisible()) {
      await this.clearButton.click();
    } else {
      await this.searchInput.clear();
    }
    
    await this.waitForSearchComplete();
  }

  /**
   * Get the current search query
   */
  async getSearchQuery(): Promise<string> {
    return await this.searchInput.inputValue();
  }

  /**
   * Check if search is currently loading
   */
  async isLoading(): Promise<boolean> {
    return await this.loadingIndicator.isVisible();
  }

  /**
   * Check if the clear button is visible
   */
  async isClearButtonVisible(): Promise<boolean> {
    return await this.clearButton.isVisible();
  }

  /**
   * Check if the search container is visible
   */
  async isVisible(): Promise<boolean> {
    return await this.container.isVisible();
  }

  /**
   * Wait for search operation to complete (no loading indicator)
   */
  async waitForSearchComplete() {
    // Wait for loading indicator to disappear if it was visible
    try {
      await this.loadingIndicator.waitFor({ state: "hidden", timeout: 5000 });
    } catch (error) {
      // Loading indicator might not have appeared, which is fine
    }
  }

  /**
   * Type in search input without triggering immediate search
   */
  async typeInSearch(text: string) {
    await this.searchInput.clear();
    await this.searchInput.type(text);
  }

  /**
   * Focus on search input
   */
  async focus() {
    await this.searchInput.focus();
    // Wait longer for focus to be actually set
    await this.page.waitForTimeout(200);
    
    // Verify focus was set, retry if needed
    const isFocused = await this.isFocused();
    if (!isFocused) {
      await this.searchInput.click();
      await this.page.waitForTimeout(100);
    }
  }

  /**
   * Check if search input is focused
   */
  async isFocused(): Promise<boolean> {
    return await this.searchInput.evaluate((element) => {
      return document.activeElement === element;
    });
  }

  /**
   * Get placeholder text of search input
   */
  async getPlaceholder(): Promise<string | null> {
    return await this.searchInput.getAttribute("placeholder");
  }

  /**
   * Perform search and wait for specific number of results
   */
  async searchAndWaitForResults(query: string, expectedCount?: number) {
    await this.search(query);
    
    if (expectedCount !== undefined) {
      // Wait for specific number of flashcard items to be visible
      await this.page.waitForFunction(
        (count) => {
          const flashcards = document.querySelectorAll('[data-testid^="flashcard-item-"]');
          return flashcards.length === count;
        },
        expectedCount,
        { timeout: 10000 }
      );
    }
  }

  /**
   * Verify search input has correct attributes for accessibility
   */
  async verifyAccessibility(): Promise<boolean> {
    const hasRole = await this.searchInput.getAttribute("role");
    const hasAriaLabel = await this.searchInput.getAttribute("aria-label");
    const hasPlaceholder = await this.searchInput.getAttribute("placeholder");
    
    return Boolean(hasRole || hasAriaLabel || hasPlaceholder);
  }
} 