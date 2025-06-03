# Test info

- Name: Flashcard Creator >> should complete the entire flashcard creation workflow
- Location: C:\Users\wolan\projects\fiszki\e2e\tests\flashcard-creator.spec.ts:180:3

# Error details

```
TimeoutError: locator.getAttribute: Timeout 15000ms exceeded.
Call log:
  - waiting for getByTestId('flashcard-item-item-10974c88-0cbb-4a10-a35c-56143075961a').locator('[data-testid^="flashcard-content"]')

    at FlashcardComponent.isFlipped (C:\Users\wolan\projects\fiszki\e2e\page-objects\FlashcardComponent.ts:89:40)
    at FlashcardComponent.getFrontText (C:\Users\wolan\projects\fiszki\e2e\page-objects\FlashcardComponent.ts:97:34)
    at C:\Users\wolan\projects\fiszki\e2e\tests\flashcard-creator.spec.ts:205:41
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
  - text: "Ostatnio zapisano: 9:59:12 PM Liczba słów: 3150 / 1000-10000"
  - progressbar
  - textbox "Wprowadź tekst źródłowy (minimum 1000 słów)...": lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do . lorem ipsum dolor sit amet consectetur adipiscing elit sed do lorem ipsum dolor sit amet consectetur adipiscing elit sed do .
  - button "Generuj fiszki":
    - img
    - text: Generuj fiszki
  - text: "Czas generowania: 5.9 sekund Wygenerowano: 5 z 5 fiszek"
  - heading "Wygenerowane fiszki" [level=2]
  - button "Kliknij aby pokazać tył fiszki":
    - text: Pytanie
    - paragraph: What is the primary theme of the text?
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
    - paragraph: What is 'lorem ipsum' commonly used for?
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
    - paragraph: What does 'consectetur adipiscing elit' imply in the context of the text?
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
    - paragraph: How does the repetition in the text affect its purpose?
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
    - paragraph: Why is 'lorem ipsum' preferred over traditional English text?
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
   1 | import type { Locator, Page } from '@playwright/test';
   2 |
   3 | /**
   4 |  * Component class for interacting with a single flashcard
   5 |  */
   6 | export class FlashcardComponent {
   7 |   readonly page: Page;
   8 |   readonly locator: Locator;
   9 |   readonly id: string;
   10 |
   11 |   constructor(page: Page, id: string) {
   12 |     this.page = page;
   13 |     this.id = id;
   14 |     this.locator = page.getByTestId(`flashcard-item-${id}`);
   15 |   }
   16 |
   17 |   // Content locators
   18 |   get content() {
   19 |     return this.locator.locator('[data-testid^="flashcard-content"]');
   20 |   }
   21 |
   22 |   get frontContent() {
   23 |     return this.locator.locator('[data-testid="flashcard-front-content"]');
   24 |   }
   25 |
   26 |   get backContent() {
   27 |     return this.locator.locator('[data-testid="flashcard-back-content"]');
   28 |   }
   29 |
   30 |   // Action buttons
   31 |   get actionsContainer() {
   32 |     return this.locator.locator('[data-testid^="flashcard-actions"]');
   33 |   }
   34 |
   35 |   get acceptButton() {
   36 |     return this.locator.locator('[data-testid="accept-flashcard-button"]');
   37 |   }
   38 |
   39 |   get rejectButton() {
   40 |     return this.locator.locator('[data-testid="reject-flashcard-button"]');
   41 |   }
   42 |
   43 |   get regenerateButton() {
   44 |     return this.locator.locator('[data-testid="regenerate-flashcard-button"]');
   45 |   }
   46 |
   47 |   /**
   48 |    * Flip the flashcard to see the back side
   49 |    */
   50 |   async flip() {
   51 |     await this.content.click();
   52 |   }
   53 |
   54 |   /**
   55 |    * Accept the flashcard
   56 |    */
   57 |   async accept() {
   58 |     await this.actionsContainer.waitFor({ state: 'visible', timeout: 5000 });
   59 |     await this.acceptButton.evaluate(element => {
   60 |       element.dispatchEvent(new MouseEvent('click', {
   61 |         bubbles: true,
   62 |         cancelable: true,
   63 |         view: window
   64 |       }));
   65 |     });
   66 |   }
   67 |
   68 |   /**
   69 |    * Reject the flashcard
   70 |    */
   71 |   async reject() {
   72 |     await this.actionsContainer.waitFor({ state: 'visible', timeout: 5000 });
   73 |     await this.rejectButton.click();
   74 |   }
   75 |
   76 |   /**
   77 |    * Regenerate the flashcard
   78 |    */
   79 |   async regenerate() {
   80 |     await this.actionsContainer.waitFor({ state: 'visible', timeout: 5000 });
   81 |     await this.regenerateButton.click();
   82 |     await this.page.waitForSelector('[data-testid="regenerate-flashcard-button"]:not(:has(.animate-spin))');
   83 |   }
   84 |
   85 |   /**
   86 |    * Check if the flashcard is flipped
   87 |    */
   88 |   async isFlipped() {
>  89 |     const flipped = await this.content.getAttribute('data-flipped');
      |                                        ^ TimeoutError: locator.getAttribute: Timeout 15000ms exceeded.
   90 |     return flipped === 'true';
   91 |   }
   92 |
   93 |   /**
   94 |    * Get the front content text
   95 |    */
   96 |   async getFrontText() {
   97 |     const isFlipped = await this.isFlipped();
   98 |     if (isFlipped) {
   99 |       await this.flip();
  100 |     }
  101 |     return this.frontContent.textContent();
  102 |   }
  103 |
  104 |   /**
  105 |    * Get the back content text
  106 |    */
  107 |   async getBackText() {
  108 |     const isFlipped = await this.isFlipped();
  109 |     if (!isFlipped) {
  110 |       await this.flip();
  111 |     }
  112 |     return this.backContent.textContent();
  113 |   }
  114 | } 
```