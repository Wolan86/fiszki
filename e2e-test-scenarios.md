# Scenariusze testowe E2E - Fiszki

## Przegląd

Ten dokument zawiera szczegółowe mapowanie atrybutów `data-testid` dla scenariuszy testowych E2E związanych z funkcjonalnością fiszek. Wszystkie komponenty zostały zaktualizowane, aby używać konwencji `data-testid` zgodnej z Playwright.

## Page Object Model (POM) Classes

Dla maintainable testów E2E, zostały utworzone dedykowane klasy POM:

### FlashcardListPage (`e2e/page-objects/FlashcardListPage.ts`)
Główna klasa dla strony listy fiszek z metodami:
- `navigateToFlashcardList()` - nawigacja przez "Moje fiszki"
- `getAllFlashcardItems()` - pobieranie wszystkich fiszek
- `getFlashcardByTerm(term)` - znajdowanie fiszki po terminie
- `searchFlashcards(query)` - wyszukiwanie fiszek
- `clearSearch()` - czyszczenie wyszukiwania
- `waitForPageLoad()` - oczekiwanie na załadowanie strony

### FlashcardListItem (`e2e/page-objects/FlashcardListItem.ts`)
Klasa dla pojedynczej fiszki z metodami:
- `edit(newTerm, newDefinition)` - edycja fiszki
- `delete()` / `deleteAndConfirm()` - usuwanie fiszki
- `startEdit()` / `cancelEdit()` - zarządzanie trybem edycji
- `getTerm()` / `getDefinition()` - pobieranie zawartości

### SearchComponent (`e2e/page-objects/SearchComponent.ts`)
Komponent wyszukiwania z metodami:
- `search(query)` - wykonanie wyszukiwania
- `clear()` - czyszczenie wyszukiwania
- `waitForSearchComplete()` - oczekiwanie na zakończenie wyszukiwania
- `verifyAccessibility()` - weryfikacja dostępności

### Użycie w testach

```typescript
import { FlashcardListPage } from "../page-objects/FlashcardListPage";

test("Example test", async ({ page }) => {
  const flashcardListPage = new FlashcardListPage(page);
  
  // Navigate to flashcard list
  await flashcardListPage.navigateToFlashcardList();
  
  // Edit first flashcard
  const flashcards = await flashcardListPage.getAllFlashcardItems();
  await flashcards[0].edit("New Term", "New Definition");
  
  // Search for edited flashcard
  await flashcardListPage.searchFlashcards("New Term");
  
  // Delete flashcard
  const foundFlashcard = await flashcardListPage.getFlashcardByTerm("New Term");
  await foundFlashcard?.deleteAndConfirm();
});
```

## Mapowanie atrybutów data-testid

### Główna nawigacja (Layout.astro)
- `nav-moje-fiszki` - Link "Moje fiszki"
- `nav-kreator` - Link "Kreator"
- `nav-nauka` - Link "Nauka"

### Lista fiszek (FlashcardListView.tsx)
- `flashcard-list-container` - Główny kontener strony
- `page-title` - Tytuł strony

### Funkcjonalność wyszukiwania (SimpleFlashcardSearch.tsx)
- `flashcard-search-container` - Kontener wyszukiwania
- `search-input` - Pole wyszukiwania
- `search-clear-button` - Przycisk czyszczenia wyszukiwania
- `search-loading-indicator` - Wskaźnik ładowania wyszukiwania

### Siatka fiszek (FlashcardGrid.tsx)
- `flashcard-grid` - Główna siatka fiszek
- `flashcard-grid-loading` - Stan ładowania siatki
- `flashcard-grid-empty` - Stan pustej siatki
- `flashcard-grid-loading-more` - Wskaźnik ładowania kolejnych fiszek
- `loading-skeleton-{index}` - Szkielety ładowania (index 0-5)

### Pojedyncza fiszka (FlashcardViewItem.tsx)
- `flashcard-item-{id}` - Kontener fiszki (gdzie {id} to ID fiszki)
- `flashcard-content-{id}` - Zawartość fiszki w trybie wyświetlania
- `flashcard-term-{id}` - Termin fiszki
- `flashcard-definition-{id}` - Definicja fiszki
- `edit-button-{id}` - Przycisk edycji
- `delete-button-{id}` - Przycisk usuwania

#### Tryb edycji
- `edit-form-{id}` - Formularz edycji
- `edit-term-input-{id}` - Pole edycji terminu
- `edit-definition-input-{id}` - Pole edycji definicji
- `save-edit-button-{id}` - Przycisk zapisz edycję
- `cancel-edit-button-{id}` - Przycisk anuluj edycję

## Scenariusze testowe

### Scenariusz 1: Kliknięcie "Moje fiszki"

**Cel:** Nawigacja do widoku listy fiszek

**Kluczowe elementy:**
- `nav-moje-fiszki` - główny link nawigacyjny
- `flashcard-list-container` - kontener docelowej strony
- `page-title` - tytuł strony

**Kroki testowe:**
1. Zlokalizuj element `nav-moje-fiszki`
2. Kliknij element
3. Sprawdź URL (powinien zawierać `/flashcards`)
4. Sprawdź widoczność `flashcard-list-container`
5. Sprawdź widoczność `page-title`

### Scenariusz 2: Edycja fiszki

**Cel:** Modyfikacja istniejącej fiszki poprzez edycję inline

**Kluczowe elementy:**
- `edit-button-{id}` - przycisk rozpoczęcia edycji
- `edit-form-{id}` - formularz edycji
- `edit-term-input-{id}` / `edit-definition-input-{id}` - pola edycji
- `save-edit-button-{id}` - zapisz zmiany

**Kroki testowe:**
1. Zlokalizuj fiszkę do edycji
2. Kliknij `edit-button-{id}`
3. Sprawdź widoczność `edit-form-{id}`
4. Wypełnij `edit-term-input-{id}` i `edit-definition-input-{id}`
5. Kliknij `save-edit-button-{id}`
6. Sprawdź ukrycie formularza edycji
7. Zweryfikuj zapisane zmiany

### Scenariusz 3: Wyszukiwanie edytowanej fiszki

**Cel:** Użycie funkcji wyszukiwania do znalezienia konkretnej fiszki

**Kluczowe elementy:**
- `search-input` - pole wyszukiwania
- `search-loading-indicator` - wskaźnik ładowania
- `flashcard-grid` - wyniki wyszukiwania

**Kroki testowe:**
1. Zlokalizuj `search-input`
2. Wprowadź zapytanie wyszukiwania
3. Naciśnij Enter lub poczekaj na debounce
4. Sprawdź wskaźnik ładowania (opcjonalnie)
5. Zweryfikuj wyniki w `flashcard-grid`

### Scenariusz 4: Usunięcie edytowanej fiszki

**Cel:** Usunięcie fiszki z kolekcji użytkownika

**Kluczowe elementy:**
- `delete-button-{id}` - przycisk usuwania
- Native dialog confirmation - potwierdzenie systemu

**Kroki testowe:**
1. Zlokalizuj fiszkę do usunięcia
2. Kliknij `delete-button-{id}`
3. Obsłuż natywny dialog potwierdzenia (accept/dismiss)
4. Sprawdź usunięcie elementu z DOM
5. Zweryfikuj zmniejszenie liczby fiszek

## Przykładowa implementacja testów

Pełny przykład implementacji testów znajduje się w pliku `e2e/tests/flashcard-list-scenarios.spec.ts`.

### Przykład kompletnego flow:

```typescript
test("Complete E2E Flow", async ({ page }) => {
  const flashcardListPage = new FlashcardListPage(page);
  
  // Navigate to flashcard list
  await flashcardListPage.navigateToFlashcardList();
  
  // Edit flashcard
  const flashcards = await flashcardListPage.getAllFlashcardItems();
  await flashcards[0].edit("Edited Term", "Edited Definition");
  
  // Search for edited flashcard
  await flashcardListPage.searchFlashcards("Edited");
  const foundFlashcard = await flashcardListPage.getFlashcardByTerm("Edited Term");
  
  // Delete flashcard
  await foundFlashcard?.deleteAndConfirm();
});
```

## Dodatkowe elementy testowe

### Stany ładowania i błędów
- `flashcard-grid-loading` - stan ładowania siatki fiszek
- `flashcard-grid-empty` - stan pustej siatki
- `search-loading-indicator` - ładowanie wyszukiwania
- `loading-skeleton-{index}` - szkielety ładowania

### Nawigacja pomocnicza
- `nav-kreator` - link do kreatora fiszek
- `nav-nauka` - link do trybu nauki

## Wskazówki dla testerów

1. **Używaj Page Object Model:** Wszystkie operacje na elementach powinny być wykonywane przez klasy POM
2. **Obsługuj dynamiczne ID:** Identyfikatory fiszek są dynamiczne, używaj metod POM do ich pobrania
3. **Native dialogi:** Usuwanie fiszek wymaga obsługi natywnych dialogów przeglądarki
4. **Async operations:** Wszystkie operacje są asynchroniczne, używaj `await`
5. **Timeouts:** Używaj odpowiednich timeoutów dla operacji sieciowych i animacji
6. **Skip logic:** Testy automatycznie pomijają scenariusze, gdy brakuje danych (np. brak fiszek)

## Struktura plików testowych

```
e2e/
├── page-objects/
│   ├── FlashcardListPage.ts     # Główna strona listy fiszek
│   ├── FlashcardListItem.ts     # Pojedyncza fiszka
│   ├── SearchComponent.ts       # Komponent wyszukiwania
│   └── index.ts                 # Eksporty
└── tests/
    └── flashcard-list-scenarios.spec.ts  # Implementacja testów
```

Ten strukturalny podział zapewnia maintainable i skalowalne testy E2E z jasnym rozdziałem odpowiedzialności między różne komponenty aplikacji. 