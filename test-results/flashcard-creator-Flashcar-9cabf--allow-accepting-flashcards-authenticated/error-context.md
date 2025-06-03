# Test info

- Name: Flashcard Creator >> should allow accepting flashcards
- Location: C:\Users\wolan\projects\fiszki\e2e\tests\flashcard-creator.spec.ts:87:3

# Error details

```
Error: Timed out 15000ms waiting for expect(locator).toBeDisabled()

Locator: getByTestId('flashcard-item-6122eb02-c46f-41e3-b955-069d992c79cc').locator('[data-testid="accept-flashcard-button"]')
Expected: disabled
Received: enabled
Call log:
  - expect.toBeDisabled with timeout 15000ms
  - waiting for getByTestId('flashcard-item-6122eb02-c46f-41e3-b955-069d992c79cc').locator('[data-testid="accept-flashcard-button"]')
    18 × locator resolved to <button data-slot="button" data-testid="accept-flashcard-button" class="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:ho…>…</button>
       - unexpected value "enabled"

    at C:\Users\wolan\projects\fiszki\e2e\tests\flashcard-creator.spec.ts:164:44
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
  - text: "Ostatnio zapisano: 9:57:24 PM Liczba słów: 2100 / 1000-10000"
  - progressbar
  - textbox "Wprowadź tekst źródłowy (minimum 1000 słów)...": lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do .
  - button "Generuj fiszki":
    - img
    - text: Generuj fiszki
  - img
  - heading "Błąd aktualizacji" [level=3]
  - paragraph: Unexpected token '<', "<!doctype "... is not valid JSON
  - text: "Czas generowania: 7.9 sekund Wygenerowano: 5 z 5 fiszek"
  - heading "Wygenerowane fiszki" [level=2]
  - button "Kliknij aby pokazać tył fiszki":
    - text: Pytanie
    - paragraph: What is the primary theme of 'lorem ipsum' text?
    - text: Kliknij aby zobaczyć odpowiedź
  - button "Akceptuj":
    - img
    - text: Akceptuj
  - button "Odrzuć":
    - img
    - text: Odrzuć
  - button "Regeneruj":
    - img
    - text: Regeneruj
  - button "Kliknij aby pokazać tył fiszki":
    - text: Pytanie
    - paragraph: What does 'lorem ipsum' translate to in English?
    - text: Kliknij aby zobaczyć odpowiedź
  - button "Akceptuj":
    - img
    - text: Akceptuj
  - button "Odrzuć":
    - img
    - text: Odrzuć
  - button "Regeneruj":
    - img
    - text: Regeneruj
  - button "Kliknij aby pokazać tył fiszki":
    - text: Pytanie
    - paragraph: Why is 'lorem ipsum' used instead of actual text?
    - text: Kliknij aby zobaczyć odpowiedź
  - button "Akceptuj":
    - img
    - text: Akceptuj
  - button "Odrzuć":
    - img
    - text: Odrzuć
  - button "Regeneruj":
    - img
    - text: Regeneruj
  - button "Kliknij aby pokazać tył fiszki":
    - text: Pytanie
    - paragraph: In what contexts is 'lorem ipsum' commonly applied?
    - text: Kliknij aby zobaczyć odpowiedź
  - button "Akceptuj":
    - img
    - text: Akceptuj
  - button "Odrzuć":
    - img
    - text: Odrzuć
  - button "Regeneruj":
    - img
    - text: Regeneruj
  - button "Kliknij aby pokazać tył fiszki":
    - text: Pytanie
    - paragraph: What is the origin of 'lorem ipsum'?
    - text: Kliknij aby zobaczyć odpowiedź
  - button "Akceptuj":
    - img
    - text: Akceptuj
  - button "Odrzuć":
    - img
    - text: Odrzuć
  - button "Regeneruj":
    - img
    - text: Regeneruj
- contentinfo: © 2025 Fiszki. Wszystkie prawa zastrzeżone.
```

# Test source

```ts
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
   96 |     // Wait for everything to load properly
   97 |     await page.waitForTimeout(2000);
   98 |     
   99 |     // Debug: List all data-testid attributes in the page
  100 |     console.log('Examining page structure for flashcards...');
  101 |     const pageStructure = await page.evaluate(() => {
  102 |       const testIds: Record<string, { 
  103 |         tagName: string; 
  104 |         className: string; 
  105 |         children: number; 
  106 |         text: string | undefined; 
  107 |       }> = {};
  108 |       
  109 |       document.querySelectorAll('[data-testid]').forEach(el => {
  110 |         const id = el.getAttribute('data-testid');
  111 |         if (id) { // Only add to testIds if id is not null
  112 |           testIds[id] = {
  113 |             tagName: el.tagName,
  114 |             className: el.className,
  115 |             children: el.childElementCount,
  116 |             text: el.textContent?.substring(0, 30)
  117 |           };
  118 |         }
  119 |       });
  120 |       
  121 |       // Check the flashcard grid specifically
  122 |       const grid = document.querySelector('[data-testid="flashcard-grid"]');
  123 |       const gridDetails = grid ? {
  124 |         childCount: grid.childElementCount,
  125 |         firstChildTestId: grid.firstElementChild?.getAttribute('data-testid'),
  126 |         children: Array.from(grid.children).map(c => ({
  127 |           testId: c.getAttribute('data-testid'),
  128 |           tag: c.tagName,
  129 |           class: c.className
  130 |         }))
  131 |       } : 'Grid not found';
  132 |       
  133 |       return { testIds, gridDetails };
  134 |     });
  135 |     console.log('Page structure:', pageStructure);
  136 |     
  137 |     // Make sure the grid is visible first
  138 |     await expect(page.locator('[data-testid="flashcard-grid"]')).toBeVisible({ timeout: 10000 });
  139 |     
  140 |     // Get a direct reference to flashcard items in the grid
  141 |     const flashcardItems = page.locator('[data-testid^="flashcard-item-"]');
  142 |     const count = await flashcardItems.count();
  143 |     console.log(`Found ${count} flashcard items`);
  144 |     
  145 |     if (count > 0) {
  146 |       // Get the first flashcard item
  147 |       const firstFlashcard = flashcardItems.first();
  148 |       
  149 |       // Get its ID to create a FlashcardComponent
  150 |       const testId = await firstFlashcard.getAttribute('data-testid');
  151 |       console.log(`First flashcard test ID: ${testId}`);
  152 |       
  153 |       // Extract the numeric ID from the test ID (flashcard-item-XXX)
  154 |       const flashcardId = testId ? testId.replace('flashcard-item-', '') : '';
  155 |       console.log(`Extracted ID: ${flashcardId}`);
  156 |       
  157 |       // Create a FlashcardComponent for the first flashcard
  158 |       const flashcard = new FlashcardComponent(page, flashcardId);
  159 |       
  160 |       // Accept the flashcard
  161 |       await flashcard.accept();
  162 |       
  163 |       // Verify the button is disabled after accepting
> 164 |       await expect(flashcard.acceptButton).toBeDisabled();
      |                                            ^ Error: Timed out 15000ms waiting for expect(locator).toBeDisabled()
  165 |     } else {
  166 |       // If no items found with our new selector, try an alternative approach
  167 |       console.log('No flashcard items found with [data-testid^="flashcard-item-"], trying direct button click');
  168 |       
  169 |       // Directly click the first accept button
  170 |       const acceptButton = page.locator('[data-testid="accept-flashcard-button"]').first();
  171 |       await expect(acceptButton).toBeVisible({ timeout: 5000 });
  172 |       await acceptButton.click();
  173 |       
  174 |       // Verify it's now disabled
  175 |       await expect(acceptButton).toBeDisabled();
  176 |     }
  177 |   });
  178 |
  179 |   // Example test for complete workflow (create, generate, accept)
  180 |   test('should complete the entire flashcard creation workflow', async ({ page }) => {
  181 |     // Arrange
  182 |     const creatorPage = new CreatorPage(page);
  183 |     const sampleText = generateSampleText(3000);
  184 |     
  185 |     // Act & Assert - Step 1: Open creator and enter text
  186 |     await creatorPage.goto();
  187 |     await creatorPage.enterSourceText(sampleText);
  188 |     await expect(creatorPage.saveStatus).toContainText('Ostatnio zapisano');
  189 |     
  190 |     // Act & Assert - Step 2: Generate flashcards
  191 |     await creatorPage.clickGenerateButton();
  192 |     await creatorPage.waitForFlashcardsGeneration();
  193 |     await expect(creatorPage.flashcardList).toBeVisible();
  194 |     
  195 |     // Act & Assert - Step 3: Accept all flashcards
  196 |     const flashcards = await creatorPage.getAllFlashcards();
  197 |     expect(flashcards.length).toBeGreaterThan(0);
  198 |     
  199 |     for (let i = 0; i < flashcards.length; i++) {
  200 |       const testId = await flashcards[i].getAttribute('data-testid');
  201 |       const flashcardId = testId ? testId.replace('flashcard-', '') : '';
  202 |       const flashcard = new FlashcardComponent(page, flashcardId);
  203 |       
  204 |       // Check front and back content
  205 |       const frontText = await flashcard.getFrontText();
  206 |       expect(frontText).not.toBeNull();
  207 |       expect(frontText).not.toBe('');
  208 |       
  209 |       const backText = await flashcard.getBackText();
  210 |       expect(backText).not.toBeNull();
  211 |       expect(backText).not.toBe('');
  212 |       
  213 |       // Accept the flashcard
  214 |       await flashcard.accept();
  215 |       await expect(flashcard.acceptButton).toBeDisabled();
  216 |       
  217 |       // Wait a bit between actions to avoid race conditions
  218 |       if (i < flashcards.length - 1) {
  219 |         await wait(300);
  220 |       }
  221 |     }
  222 |   });
  223 | }); 
```