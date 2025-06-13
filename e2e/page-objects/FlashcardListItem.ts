import type { Locator, Page } from "@playwright/test";

/**
 * Component class for interacting with a single flashcard item in the list
 * Handles editing, deleting, and content operations
 */
export class FlashcardListItem {
  readonly page: Page;
  readonly locator: Locator;
  readonly id: string;

  constructor(page: Page, id: string) {
    this.page = page;
    this.id = id;
    this.locator = page.getByTestId(`flashcard-item-${id}`);
  }

  // Content elements
  get content() {
    return this.page.getByTestId(`flashcard-content-${this.id}`);
  }

  get term() {
    return this.page.getByTestId(`flashcard-term-${this.id}`);
  }

  get definition() {
    return this.page.getByTestId(`flashcard-definition-${this.id}`);
  }

  // Action buttons
  get editButton() {
    return this.page.getByTestId(`edit-button-${this.id}`);
  }

  get deleteButton() {
    return this.page.getByTestId(`delete-button-${this.id}`);
  }

  // Edit form elements
  get editForm() {
    return this.page.getByTestId(`edit-form-${this.id}`);
  }

  get editTermInput() {
    return this.page.getByTestId(`edit-term-input-${this.id}`);
  }

  get editDefinitionInput() {
    return this.page.getByTestId(`edit-definition-input-${this.id}`);
  }

  get saveEditButton() {
    return this.page.getByTestId(`save-edit-button-${this.id}`);
  }

  get cancelEditButton() {
    return this.page.getByTestId(`cancel-edit-button-${this.id}`);
  }

  /**
   * Check if the flashcard is visible on the page
   */
  async isVisible(): Promise<boolean> {
    return await this.locator.isVisible();
  }

  /**
   * Check if the flashcard is in edit mode
   */
  async isEditing(): Promise<boolean> {
    return await this.editForm.isVisible();
  }

  /**
   * Get the term text
   */
  async getTerm(): Promise<string | null> {
    if (await this.isEditing()) {
      return await this.editTermInput.inputValue();
    }
    return await this.term.textContent();
  }

  /**
   * Get the definition text
   */
  async getDefinition(): Promise<string | null> {
    if (await this.isEditing()) {
      return await this.editDefinitionInput.inputValue();
    }
    return await this.definition.textContent();
  }

  /**
   * Start editing the flashcard
   */
  async startEdit() {
    if (await this.isEditing()) {
      return; // Already in edit mode
    }

    await this.editButton.click();
    await this.editForm.waitFor({ state: "visible" });
  }

  /**
   * Edit the flashcard with new term and definition
   */
  async edit(newTerm: string, newDefinition: string) {
    await this.startEdit();

    // Clear and fill the term input
    await this.editTermInput.clear();
    await this.editTermInput.fill(newTerm);

    // Clear and fill the definition input
    await this.editDefinitionInput.clear();
    await this.editDefinitionInput.fill(newDefinition);

    // Save the changes
    await this.saveEdit();
  }

  /**
   * Save the current edit
   */
  async saveEdit() {
    if (!(await this.isEditing())) {
      throw new Error("Not in edit mode");
    }

    await this.saveEditButton.click();

    // Wait for edit mode to close
    await this.editForm.waitFor({ state: "hidden" });
  }

  /**
   * Cancel the current edit
   */
  async cancelEdit() {
    if (!(await this.isEditing())) {
      return; // Not in edit mode
    }

    await this.cancelEditButton.click();

    // Wait for edit mode to close
    await this.editForm.waitFor({ state: "hidden" });
  }

  /**
   * Delete the flashcard
   * Note: This will trigger a native confirmation dialog
   */
  async delete() {
    await this.deleteButton.click();

    // Handle the native confirmation dialog
    await this.page.on("dialog", async (dialog) => {
      if (dialog.type() === "confirm") {
        await dialog.accept();
      }
    });

    // Wait for the item to be removed from DOM
    await this.locator.waitFor({ state: "detached" });
  }

  /**
   * Delete the flashcard and confirm the action
   */
  async deleteAndConfirm() {
    // Set up dialog handler for native confirm dialog
    this.page.on("dialog", async (dialog) => {
      if (dialog.type() === "confirm") {
        await dialog.accept();
      }
    });

    await this.deleteButton.click();

    // Wait for the item to be removed from DOM
    await this.locator.waitFor({ state: "detached" });
  }

  /**
   * Delete the flashcard but cancel the confirmation
   */
  async deleteAndCancel() {
    // Set up dialog handler for native confirm dialog
    this.page.on("dialog", async (dialog) => {
      if (dialog.type() === "confirm") {
        await dialog.dismiss();
      }
    });

    await this.deleteButton.click();

    // Verify the item is still visible
    await this.locator.waitFor({ state: "visible" });
  }

  /**
   * Wait for the flashcard to load completely
   */
  async waitForLoad() {
    await this.locator.waitFor({ state: "visible" });
    await this.content.waitFor({ state: "visible" });
  }

  /**
   * Verify the flashcard content matches expected values
   */
  async verifyContent(expectedTerm: string, expectedDefinition: string): Promise<boolean> {
    const actualTerm = await this.getTerm();
    const actualDefinition = await this.getDefinition();

    return actualTerm === expectedTerm && actualDefinition === expectedDefinition;
  }
}
