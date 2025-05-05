# Test info

- Name: Flashcard Creator >> should complete the entire flashcard creation workflow
- Location: C:\Users\wolan\projects\fiszki\e2e\tests\flashcard-creator.spec.ts:116:3

# Error details

```
Error: expect(locator).toContainText(expected)

Locator: getByTestId('save-status')
Expected string: "Ostatnio zapisano"
Received string: "Niezapisany"
Call log:
  - expect.toContainText with timeout 15000ms
  - waiting for getByTestId('save-status')
    13 × locator resolved to <span data-testid="save-status" class="text-sm text-neutral-500">Niezapisany</span>
       - unexpected value "Niezapisany"

    at C:\Users\wolan\projects\fiszki\e2e\tests\flashcard-creator.spec.ts:124:42
```

# Page snapshot

```yaml
- banner:
  - link "Fiszki":
    - /url: /
  - navigation:
    - link "Moje fiszki":
      - /url: /
    - link "Kreator":
      - /url: /kreator
    - link "Nauka":
      - /url: /nauka
  - text: test@test.com
  - button "Wyloguj się":
    - img
    - text: Wyloguj się
- main:
  - heading "Kreator fiszek" [level=1]
  - paragraph: Wprowadź tekst źródłowy i wygeneruj fiszki edukacyjne przy pomocy sztucznej inteligencji.
  - heading "Tekst źródłowy" [level=2]
  - text: "Niezapisany Liczba słów: 78 / 1000-10000"
  - progressbar
  - paragraph: Wymagane minimum 1000 słów (brakuje 922)
  - textbox "Wprowadź tekst źródłowy (minimum 1000 słów)...": ing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do .
  - text: Wprowadź co najmniej 1000 słów
  - button "Generuj fiszki" [disabled]:
    - img
    - text: Generuj fiszki
- contentinfo: © 2025 Fiszki. Wszystkie prawa zastrzeżone.
```

# Test source

```ts
   24 |     await creatorPage.sourceTextInput.fill(sampleText);
   25 |     
   26 |     // Assert
   27 |     const inputValue = await creatorPage.sourceTextInput.inputValue();
   28 |     expect(inputValue).toBe(sampleText);
   29 |   });
   30 |   
   31 |   // New test for validation and happy path
   32 |   test('should validate minimum word count then allow generation when requirements met', async ({ page }) => {
   33 |     // Arrange
   34 |     const creatorPage = new CreatorPage(page);
   35 |     const insufficientText = generateSampleText(50); // Less than 1000 words
   36 |     const sufficientText = generateSampleText(1000); // Exactly 1000 words
   37 |     
   38 |     // Act - Step 1: Enter insufficient text
   39 |     await creatorPage.goto();
   40 |     
   41 |     // Enter text manually to avoid the validation in enterSourceText method
   42 |     await creatorPage.sourceTextInput.waitFor({ state: 'visible' });
   43 |     await creatorPage.sourceTextInput.fill(insufficientText);
   44 |     await creatorPage.sourceTextInput.blur();
   45 |     await page.waitForTimeout(1000); // Wait for validation
   46 |     
   47 |     // Assert - Button should be disabled with insufficient text
   48 |     await expect(creatorPage.generateButton).toBeDisabled();
   49 |     await expect(creatorPage.wordCounter).toContainText(/\d+ \/ 1000/); // Should show count below 1000
   50 |     
   51 |     // Act - Step 2: Enter sufficient text 
   52 |     await creatorPage.sourceTextInput.fill(sufficientText);
   53 |     await creatorPage.sourceTextInput.blur();
   54 |     await page.waitForTimeout(1000); // Wait for validation
   55 |     
   56 |     // Assert - Button should be enabled with sufficient text
   57 |     await expect(creatorPage.generateButton).toBeEnabled();
   58 |     await expect(creatorPage.wordCounter).toContainText(/\d+ \/ 1000/); // Should show count at least 1000
   59 |     
   60 |     // Act - Step 3: Generate flashcards (happy path)
   61 |     await creatorPage.clickGenerateButton();
   62 |     await creatorPage.waitForFlashcardsGeneration();
   63 |     
   64 |     // Assert - Flashcards should be generated
   65 |     const flashcards = await creatorPage.getAllFlashcards();
   66 |     expect(flashcards.length).toBeGreaterThan(0);
   67 |     await expect(creatorPage.flashcardList).toBeVisible();
   68 |   });
   69 |   
   70 |   // Example test for flashcard generation
   71 |   test('should generate flashcards from source text', async ({ page }) => {
   72 |     // Arrange
   73 |     const creatorPage = new CreatorPage(page);
   74 |     const sampleText = generateSampleText(1500);
   75 |     
   76 |     // Act
   77 |     await creatorPage.goto();
   78 |     await creatorPage.generateFlashcards(sampleText);
   79 |     
   80 |     // Assert
   81 |     const flashcards = await creatorPage.getAllFlashcards();
   82 |     expect(flashcards.length).toBeGreaterThan(0);
   83 |     await expect(creatorPage.flashcardList).toBeVisible();
   84 |   });
   85 |   
   86 |   // Example test for accepting flashcards
   87 |   test('should allow accepting flashcards', async ({ page }) => {
   88 |     // Arrange
   89 |     const creatorPage = new CreatorPage(page);
   90 |     const sampleText = generateSampleText(2000);
   91 |     
   92 |     // Act
   93 |     await creatorPage.goto();
   94 |     await creatorPage.generateFlashcards(sampleText);
   95 |     
   96 |     // Get the first flashcard
   97 |     const flashcards = await creatorPage.getAllFlashcards();
   98 |     expect(flashcards.length).toBeGreaterThan(0);
   99 |     
  100 |     // Extract the ID from the first flashcard's test-id attribute
  101 |     const testId = await flashcards[0].getAttribute('data-testid');
  102 |     const flashcardId = testId ? testId.replace('flashcard-', '') : '';
  103 |     
  104 |     // Create a FlashcardComponent for the first flashcard
  105 |     const flashcard = new FlashcardComponent(page, flashcardId);
  106 |     
  107 |     // Accept the flashcard
  108 |     await flashcard.accept();
  109 |     
  110 |     // Assert
  111 |     // The button should be disabled after accepting
  112 |     await expect(flashcard.acceptButton).toBeDisabled();
  113 |   });
  114 |
  115 |   // Example test for complete workflow (create, generate, accept)
  116 |   test('should complete the entire flashcard creation workflow', async ({ page }) => {
  117 |     // Arrange
  118 |     const creatorPage = new CreatorPage(page);
  119 |     const sampleText = generateSampleText(3000);
  120 |     
  121 |     // Act & Assert - Step 1: Open creator and enter text
  122 |     await creatorPage.goto();
  123 |     await creatorPage.enterSourceText(sampleText);
> 124 |     await expect(creatorPage.saveStatus).toContainText('Ostatnio zapisano');
      |                                          ^ Error: expect(locator).toContainText(expected)
  125 |     
  126 |     // Act & Assert - Step 2: Generate flashcards
  127 |     await creatorPage.clickGenerateButton();
  128 |     await creatorPage.waitForFlashcardsGeneration();
  129 |     await expect(creatorPage.flashcardList).toBeVisible();
  130 |     
  131 |     // Act & Assert - Step 3: Accept all flashcards
  132 |     const flashcards = await creatorPage.getAllFlashcards();
  133 |     expect(flashcards.length).toBeGreaterThan(0);
  134 |     
  135 |     for (let i = 0; i < flashcards.length; i++) {
  136 |       const testId = await flashcards[i].getAttribute('data-testid');
  137 |       const flashcardId = testId ? testId.replace('flashcard-', '') : '';
  138 |       const flashcard = new FlashcardComponent(page, flashcardId);
  139 |       
  140 |       // Check front and back content
  141 |       const frontText = await flashcard.getFrontText();
  142 |       expect(frontText).not.toBeNull();
  143 |       expect(frontText).not.toBe('');
  144 |       
  145 |       const backText = await flashcard.getBackText();
  146 |       expect(backText).not.toBeNull();
  147 |       expect(backText).not.toBe('');
  148 |       
  149 |       // Accept the flashcard
  150 |       await flashcard.accept();
  151 |       await expect(flashcard.acceptButton).toBeDisabled();
  152 |       
  153 |       // Wait a bit between actions to avoid race conditions
  154 |       if (i < flashcards.length - 1) {
  155 |         await wait(300);
  156 |       }
  157 |     }
  158 |   });
  159 | }); 
```