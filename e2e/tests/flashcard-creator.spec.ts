import { test, expect } from '@playwright/test';
import { CreatorPage } from '../page-objects/CreatorPage';
import { FlashcardComponent } from '../page-objects/FlashcardComponent';
import { generateSampleText, wait, testUser } from '../utils/test-helpers';

/**
 * Test suite for flashcard creation workflow
 * Authentication is handled by global.setup.ts and playwright.config.ts
 */
test.describe('Flashcard Creator', () => {
  // Example test for the source text entry
  test('should allow entering source text', async ({ page }) => {
    // Arrange
    const creatorPage = new CreatorPage(page);
    const sampleText = "Sample text for testing";
    
    // Act
    await creatorPage.goto();
    
    // Wait for the text area to be visible
    await creatorPage.sourceTextInput.waitFor({ state: 'visible', timeout: 10000 });
    
    // Enter the text directly without using enterSourceText method
    await creatorPage.sourceTextInput.fill(sampleText);
    
    // Assert
    const inputValue = await creatorPage.sourceTextInput.inputValue();
    expect(inputValue).toBe(sampleText);
  });
  
  // New test for validation and happy path
  test('should validate minimum word count then allow generation when requirements met', async ({ page }) => {
    // Arrange
    const creatorPage = new CreatorPage(page);
    const insufficientText = generateSampleText(50); // Less than 1000 words
    const sufficientText = generateSampleText(1000); // Exactly 1000 words
    
    // Act - Step 1: Enter insufficient text
    await creatorPage.goto();
    
    // Enter text manually to avoid the validation in enterSourceText method
    await creatorPage.sourceTextInput.waitFor({ state: 'visible' });
    await creatorPage.sourceTextInput.fill(insufficientText);
    await creatorPage.sourceTextInput.blur();
    await page.waitForTimeout(1000); // Wait for validation
    
    // Assert - Button should be disabled with insufficient text
    await expect(creatorPage.generateButton).toBeDisabled();
    await expect(creatorPage.wordCounter).toContainText(/\d+ \/ 1000/); // Should show count below 1000
    
    // Act - Step 2: Enter sufficient text 
    await creatorPage.sourceTextInput.fill(sufficientText);
    await creatorPage.sourceTextInput.blur();
    await page.waitForTimeout(1000); // Wait for validation
    
    // Assert - Button should be enabled with sufficient text
    await expect(creatorPage.generateButton).toBeEnabled();
    await expect(creatorPage.wordCounter).toContainText(/\d+ \/ 1000/); // Should show count at least 1000
    
    // Act - Step 3: Generate flashcards (happy path)
    await creatorPage.clickGenerateButton();
    await creatorPage.waitForFlashcardsGeneration();
    
    // Assert - Flashcards should be generated
    const flashcards = await creatorPage.getAllFlashcards();
    expect(flashcards.length).toBeGreaterThan(0);
    await expect(creatorPage.flashcardList).toBeVisible();
  });
  
  // Example test for flashcard generation
  test('should generate flashcards from source text', async ({ page }) => {
    // Arrange
    const creatorPage = new CreatorPage(page);
    const sampleText = generateSampleText(1500);
    
    // Act
    await creatorPage.goto();
    await creatorPage.generateFlashcards(sampleText);
    
    // Assert
    const flashcards = await creatorPage.getAllFlashcards();
    expect(flashcards.length).toBeGreaterThan(0);
    await expect(creatorPage.flashcardList).toBeVisible();
  });
  
  // Example test for accepting flashcards
  test('should allow accepting flashcards', async ({ page }) => {
    // Arrange
    const creatorPage = new CreatorPage(page);
    const sampleText = generateSampleText(2000);
    
    // Act
    await creatorPage.goto();
    await creatorPage.generateFlashcards(sampleText);
    
    // Get the first flashcard
    const flashcards = await creatorPage.getAllFlashcards();
    expect(flashcards.length).toBeGreaterThan(0);
    
    // Extract the ID from the first flashcard's test-id attribute
    const testId = await flashcards[0].getAttribute('data-testid');
    const flashcardId = testId ? testId.replace('flashcard-', '') : '';
    
    // Create a FlashcardComponent for the first flashcard
    const flashcard = new FlashcardComponent(page, flashcardId);
    
    // Accept the flashcard
    await flashcard.accept();
    
    // Assert
    // The button should be disabled after accepting
    await expect(flashcard.acceptButton).toBeDisabled();
  });

  // Example test for complete workflow (create, generate, accept)
  test('should complete the entire flashcard creation workflow', async ({ page }) => {
    // Arrange
    const creatorPage = new CreatorPage(page);
    const sampleText = generateSampleText(3000);
    
    // Act & Assert - Step 1: Open creator and enter text
    await creatorPage.goto();
    await creatorPage.enterSourceText(sampleText);
    await expect(creatorPage.saveStatus).toContainText('Ostatnio zapisano');
    
    // Act & Assert - Step 2: Generate flashcards
    await creatorPage.clickGenerateButton();
    await creatorPage.waitForFlashcardsGeneration();
    await expect(creatorPage.flashcardList).toBeVisible();
    
    // Act & Assert - Step 3: Accept all flashcards
    const flashcards = await creatorPage.getAllFlashcards();
    expect(flashcards.length).toBeGreaterThan(0);
    
    for (let i = 0; i < flashcards.length; i++) {
      const testId = await flashcards[i].getAttribute('data-testid');
      const flashcardId = testId ? testId.replace('flashcard-', '') : '';
      const flashcard = new FlashcardComponent(page, flashcardId);
      
      // Check front and back content
      const frontText = await flashcard.getFrontText();
      expect(frontText).not.toBeNull();
      expect(frontText).not.toBe('');
      
      const backText = await flashcard.getBackText();
      expect(backText).not.toBeNull();
      expect(backText).not.toBe('');
      
      // Accept the flashcard
      await flashcard.accept();
      await expect(flashcard.acceptButton).toBeDisabled();
      
      // Wait a bit between actions to avoid race conditions
      if (i < flashcards.length - 1) {
        await wait(300);
      }
    }
  });
}); 