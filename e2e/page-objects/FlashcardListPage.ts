import type { Locator, Page } from "@playwright/test";
import { BasePage } from "./BasePage";
import { FlashcardListItem } from "./FlashcardListItem";
import { SearchComponent } from "./SearchComponent";

/**
 * Page Object Model for the Flashcard List page
 * Handles navigation, search functionality, and flashcard list operations
 */
export class FlashcardListPage extends BasePage {
  readonly searchComponent: SearchComponent;

  constructor(page: Page) {
    super(page);
    this.searchComponent = new SearchComponent(page);
  }

  // Navigation elements
  get navMojeFiszkiLink() {
    return this.page.getByTestId("nav-moje-fiszki");
  }

  get navKreatorLink() {
    return this.page.getByTestId("nav-kreator");
  }

  get navNaukaLink() {
    return this.page.getByTestId("nav-nauka");
  }

  // Page elements
  get container() {
    return this.page.getByTestId("flashcard-list-container");
  }

  get pageTitle() {
    return this.page.getByTestId("page-title");
  }

  get flashcardGrid() {
    return this.page.getByTestId("flashcard-grid");
  }

  get loadingGrid() {
    return this.page.getByTestId("flashcard-grid-loading");
  }

  get emptyGrid() {
    return this.page.getByTestId("flashcard-grid-empty");
  }

  get loadingMoreIndicator() {
    return this.page.getByTestId("flashcard-grid-loading-more");
  }

  // Loading skeleton elements
  getLoadingSkeleton(index: number) {
    return this.page.getByTestId(`loading-skeleton-${index}`);
  }

  /**
   * Navigate to the flashcard list page via "Moje fiszki" link
   */
  async navigateToFlashcardList() {
    await this.navMojeFiszkiLink.click();
    await this.page.waitForURL("**/fiszki");
    await this.container.waitFor({ state: "visible" });
  }

  /**
   * Navigate to creator page
   */
  async navigateToCreator() {
    await this.navKreatorLink.click();
    await this.page.waitForURL("**/kreator");
  }

  /**
   * Navigate to learning page
   */
  async navigateToLearning() {
    await this.navNaukaLink.click();
    await this.page.waitForURL("**/nauka");
  }

  /**
   * Wait for the page to load completely
   */
  async waitForPageLoad() {
    await this.container.waitFor({ state: "visible" });
    await this.pageTitle.waitFor({ state: "visible" });

    // Wait for loading to finish first
    try {
      await this.loadingGrid.waitFor({ state: "visible", timeout: 2000 });
      await this.loadingGrid.waitFor({ state: "hidden", timeout: 15000 });
    } catch {
      // Loading grid might not appear if data loads quickly
    }

    // Wait for either grid with flashcards or empty state
    try {
      await Promise.race([
        this.flashcardGrid.waitFor({ state: "visible", timeout: 10000 }),
        this.emptyGrid.waitFor({ state: "visible", timeout: 10000 }),
      ]);
    } catch (error) {
      // If neither state appears, check if we have any flashcard items at all
      const flashcardCount = await this.getFlashcardCount();
      if (flashcardCount === 0) {
        // If no flashcards, empty state should be visible
        await this.emptyGrid.waitFor({ state: "visible", timeout: 5000 });
      } else {
        // If we have flashcards, grid should be visible
        await this.flashcardGrid.waitFor({ state: "visible", timeout: 5000 });
      }
    }
  }

  /**
   * Check if the page is in loading state
   */
  async isLoading() {
    return await this.loadingGrid.isVisible();
  }

  /**
   * Check if the page shows empty state
   */
  async isEmpty() {
    return await this.emptyGrid.isVisible();
  }

  /**
   * Check if more content is being loaded
   */
  async isLoadingMore() {
    return await this.loadingMoreIndicator.isVisible();
  }

  /**
   * Get all flashcard items on the page
   */
  async getAllFlashcardItems(): Promise<FlashcardListItem[]> {
    const flashcardItems = await this.page.locator('[data-testid^="flashcard-item-"]').all();
    const items: FlashcardListItem[] = [];

    for (const locator of flashcardItems) {
      const testId = await locator.getAttribute("data-testid");
      const id = testId?.replace("flashcard-item-", "") || "";
      items.push(new FlashcardListItem(this.page, id));
    }

    return items;
  }

  /**
   * Get flashcard item by ID
   */
  getFlashcardItem(id: string): FlashcardListItem {
    return new FlashcardListItem(this.page, id);
  }

  /**
   * Get flashcard item by term text
   */
  async getFlashcardByTerm(term: string): Promise<FlashcardListItem | null> {
    const flashcardItems = await this.getAllFlashcardItems();

    for (const item of flashcardItems) {
      const itemTerm = await item.getTerm();
      if (itemTerm?.includes(term)) {
        return item;
      }
    }

    return null;
  }

  /**
   * Get the number of visible flashcards
   */
  async getFlashcardCount(): Promise<number> {
    const flashcardItems = await this.page.locator('[data-testid^="flashcard-item-"]').count();
    return flashcardItems;
  }

  /**
   * Search for flashcards using the search component
   */
  async searchFlashcards(query: string) {
    await this.searchComponent.search(query);
  }

  /**
   * Clear the search
   */
  async clearSearch() {
    await this.searchComponent.clear();
  }

  /**
   * Wait for search results to load
   */
  async waitForSearchResults() {
    await this.searchComponent.waitForSearchComplete();
    await this.waitForPageLoad();
  }

  /**
   * Check if URL is correct for flashcard list page
   */
  async verifyUrl() {
    await this.page.waitForURL("**/fiszki");
  }

  /**
   * Get page title text
   */
  async getPageTitle(): Promise<string | null> {
    return await this.pageTitle.textContent();
  }
}
