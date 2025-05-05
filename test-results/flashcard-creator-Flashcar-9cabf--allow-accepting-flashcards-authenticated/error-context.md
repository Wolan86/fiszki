# Test info

- Name: Flashcard Creator >> should allow accepting flashcards
- Location: C:\Users\wolan\projects\fiszki\e2e\tests\flashcard-creator.spec.ts:87:3

# Error details

```
TimeoutError: locator.click: Timeout 15000ms exceeded.
Call log:
  - waiting for getByTestId('generate-button')
    - locator resolved to <button disabled data-slot="button" data-testid="generate-button" class="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-d…>…</button>
  - attempting click action
    2 × waiting for element to be visible, enabled and stable
      - element is not enabled
    - retrying click action
    - waiting 20ms
    2 × waiting for element to be visible, enabled and stable
      - element is not enabled
    - retrying click action
      - waiting 100ms
    29 × waiting for element to be visible, enabled and stable
       - element is not enabled
     - retrying click action
       - waiting 500ms

    at CreatorPage.clickGenerateButton (C:\Users\wolan\projects\fiszki\e2e\page-objects\CreatorPage.ts:115:31)
    at CreatorPage.generateFlashcards (C:\Users\wolan\projects\fiszki\e2e\page-objects\CreatorPage.ts:161:16)
    at C:\Users\wolan\projects\fiszki\e2e\tests\flashcard-creator.spec.ts:94:5
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
  - text: "Niezapisany Liczba słów: 25 / 1000-10000"
  - progressbar
  - paragraph: Wymagane minimum 1000 słów (brakuje 975)
  - textbox "Wprowadź tekst źródłowy (minimum 1000 słów)...": it sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do .
  - text: Wprowadź co najmniej 1000 słów
  - button "Generuj fiszki" [disabled]:
    - img
    - text: Generuj fiszki
- contentinfo: © 2025 Fiszki. Wszystkie prawa zastrzeżone.
```

# Test source

```ts
   15 |     return this.page.getByTestId('flashcard-creator-view');
   16 |   }
   17 |
   18 |   // Source text form locators
   19 |   get sourceTextCard() {
   20 |     return this.page.getByTestId('source-text-card');
   21 |   }
   22 |
   23 |   get sourceTextInput() {
   24 |     return this.page.getByTestId('source-text-textarea');
   25 |   }
   26 |
   27 |   get wordCounter() {
   28 |     return this.page.getByTestId('word-counter');
   29 |   }
   30 |
   31 |   get generateButton() {
   32 |     return this.page.getByTestId('generate-button');
   33 |   }
   34 |
   35 |   get saveStatus() {
   36 |     return this.page.getByTestId('save-status');
   37 |   }
   38 |
   39 |   // Progress indicator locator
   40 |   get progressIndicator() {
   41 |     return this.page.getByTestId('flashcard-generation-progress');
   42 |   }
   43 |
   44 |   // Generated flashcards locators
   45 |   get generatedFlashcardsResult() {
   46 |     return this.page.getByTestId('generated-flashcards-result');
   47 |   }
   48 |
   49 |   get flashcardList() {
   50 |     return this.page.getByTestId('flashcard-list-container');
   51 |   }
   52 |
   53 |   get flashcardGrid() {
   54 |     return this.page.getByTestId('flashcard-grid');
   55 |   }
   56 |
   57 |   /**
   58 |    * Navigate to the creator page
   59 |    */
   60 |   async goto() {
   61 |     // Ensure user is authenticated before accessing the creator page
   62 |     await this.ensureAuthenticated();
   63 |     
   64 |     // Navigate to the creator page
   65 |     await this.page.goto('/kreator');
   66 |     await this.waitForCreatorView();
   67 |   }
   68 |
   69 |   /**
   70 |    * Wait for the creator view to be visible
   71 |    */
   72 |   async waitForCreatorView() {
   73 |     await this.creatorView.waitFor({ state: 'visible' });
   74 |   }
   75 |
   76 |   /**
   77 |    * Enter text into the source text input
   78 |    */
   79 |   async enterSourceText(text: string) {
   80 |     // Ensure user is on the creator page
   81 |     await this.ensureAuthenticated();
   82 |     
   83 |     try {
   84 |       // Wait for the text area to be visible and enabled with increased timeout
   85 |       await this.sourceTextInput.waitFor({ state: 'visible', timeout: 10000 });
   86 |       
   87 |       // Type text in chunks instead of using fill to avoid performance issues with large text
   88 |       const chunkSize = 500; // Process in smaller chunks
   89 |       for (let i = 0; i < text.length; i += chunkSize) {
   90 |         const chunk = text.substring(i, i + chunkSize);
   91 |         await this.sourceTextInput.press('Control+a'); // Select all existing text
   92 |         await this.sourceTextInput.press('Delete'); // Clear it
   93 |         await this.sourceTextInput.type(chunk, { delay: 0 }); // Type with no delay between keystrokes
   94 |         
   95 |         // Short pause between chunks to allow processing
   96 |         await this.page.waitForTimeout(100);
   97 |       }
   98 |       
   99 |       await this.sourceTextInput.blur();
  100 |       
  101 |       // Wait for auto-save to complete with increased timeout
  102 |       await this.page.waitForTimeout(3500); // Increased from 2500ms
  103 |       
  104 |       console.log('Source text entered successfully');
  105 |     } catch (error) {
  106 |       console.error('Error entering source text:', error);
  107 |       throw error;
  108 |     }
  109 |   }
  110 |
  111 |   /**
  112 |    * Click the generate button to generate flashcards
  113 |    */
  114 |   async clickGenerateButton() {
> 115 |     await this.generateButton.click();
      |                               ^ TimeoutError: locator.click: Timeout 15000ms exceeded.
  116 |   }
  117 |
  118 |   /**
  119 |    * Wait for flashcards to be generated
  120 |    */
  121 |   async waitForFlashcardsGeneration() {
  122 |     // First wait for the progress indicator to appear
  123 |     await this.progressIndicator.waitFor({ state: 'visible' });
  124 |     // Then wait for it to disappear or for flashcards to appear
  125 |     await Promise.race([
  126 |       this.progressIndicator.waitFor({ state: 'hidden' }),
  127 |       this.generatedFlashcardsResult.waitFor({ state: 'visible' })
  128 |     ]);
  129 |   }
  130 |
  131 |   /**
  132 |    * Get a specific flashcard by ID
  133 |    */
  134 |   getFlashcard(id: string) {
  135 |     return this.page.getByTestId(`flashcard-${id}`);
  136 |   }
  137 |
  138 |   /**
  139 |    * Get all flashcards
  140 |    */
  141 |   async getAllFlashcards() {
  142 |     // Wait for the flashcard grid to be visible
  143 |     await this.flashcardGrid.waitFor({ state: 'visible' });
  144 |     // Get all flashcards
  145 |     return this.page.locator('[data-testid^="flashcard-"]').all();
  146 |   }
  147 |
  148 |   /**
  149 |    * Generate flashcards from source text
  150 |    */
  151 |   async generateFlashcards(sourceText: string) {
  152 |     // Ensure user is authenticated
  153 |     await this.ensureAuthenticated();
  154 |     
  155 |     // Navigate to creator if not already there
  156 |     if (!await this.creatorView.isVisible()) {
  157 |       await this.goto();
  158 |     }
  159 |     
  160 |     await this.enterSourceText(sourceText);
  161 |     await this.clickGenerateButton();
  162 |     await this.waitForFlashcardsGeneration();
  163 |   }
  164 | } 
```