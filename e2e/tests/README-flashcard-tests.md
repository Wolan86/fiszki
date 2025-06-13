# Testy E2E dla komponentu "Moje fiszki"

## Przegląd

Ten katalog zawiera kompleksowe testy end-to-end dla komponentu "Moje fiszki" aplikacji fiszek. Testy są zorganizowane w trzech głównych plikach, każdy skupiający się na różnych aspektach funkcjonalności.

## Struktura testów

### 📋 `flashcard-list-scenarios.spec.ts`

**Podstawowe scenariusze funkcjonalne**

- ✅ Nawigacja do listy fiszek przez "Moje fiszki"
- ✅ Edycja fiszki (inline editing)
- ✅ Wyszukiwanie fiszek
- ✅ Usuwanie fiszek z potwierdzeniem
- ✅ Kompletny flow E2E (nawigacja → edycja → wyszukiwanie → usuwanie)
- ✅ Edge cases wyszukiwania
- ✅ Anulowanie operacji edycji i usuwania
- ✅ Stany ładowania i obsługa błędów
- ✅ Nawigacja klawiaturą i dostępność
- ✅ Operacje na wielu fiszkach
- ✅ Wyszukiwanie ze znakami specjalnymi
- ✅ Walidacja pustych pól podczas edycji
- ✅ Responsywność layoutu
- ✅ Testy wydajności

### 🔧 `flashcard-advanced-scenarios.spec.ts`

**Zaawansowane scenariusze techniczne**

- ⚡ **Integracja sieciowa i API**

  - Obsługa błędów sieciowych
  - Wolne odpowiedzi API
  - Mechanizmy retry dla błędów API

- 🔄 **Operacje współbieżne**

  - Wieloczesne edycje fiszek
  - Wyszukiwanie podczas edycji

- 🎯 **Edge cases UX**

  - Szybkie kolejne operacje
  - Nawigacja wstecz/naprzód w przeglądarce
  - Persistence sesji i przeładowanie

- 📊 **Integralność danych**

  - Konsystencja operacji edycji
  - Konsystencja operacji usuwania

- ♿ **Dostępność i UX**

  - Kompatybilność ze screen readerami
  - Tryb wysokiego kontrastu
  - Nawigacja tylko klawiaturą

- ⚡ **Wydajność i obciążenie**

  - Monitoring użycia pamięci
  - Wydajność z dużymi zestawami danych

- 🌐 **Kompatybilność między przeglądarkami**
  - Funkcjonalności specyficzne dla przeglądarek

### 🔗 `flashcard-integration-tests.spec.ts`

**Testy integracji między komponentami**

- 🧭 **Integracja nawigacji**

  - Pełny flow nawigacji między sekcjami
  - Preservacja kontekstu użytkownika

- 🔨 **Integracja Kreator → Lista**

  - Tworzenie fiszki i weryfikacja w liście

- 🎓 **Integracja Lista → Nauka**

  - Wybór fiszek do sesji nauki

- 🔍 **Integracja Wyszukiwanie → Edycja**

  - Edycja fiszek w wynikach wyszukiwania

- ❌ **Obsługa błędów między komponentami**

  - Graceful handling błędów w nawigacji
  - Stan uwierzytelnienia

- 🔄 **Synchronizacja danych**

  - Konsystencja danych między kartami

- 📱 **Responsywna integracja**

  - Działanie na różnych rozmiarach ekranu

- ⚡ **Wydajność integracji**
  - Wydajność nawigacji między komponentami

## Uruchamianie testów

### Podstawowe komendy

```bash
# Uruchom wszystkie testy podstawowe
npx playwright test --config=e2e/playwright.config.flashcards.ts --project=flashcard-basic-scenarios

# Uruchom zaawansowane scenariusze
npx playwright test --config=e2e/playwright.config.flashcards.ts --project=flashcard-advanced-scenarios

# Uruchom testy integracji
npx playwright test --config=e2e/playwright.config.flashcards.ts --project=flashcard-integration-tests

# Uruchom wszystkie testy fiszek
npx playwright test --config=e2e/playwright.config.flashcards.ts
```

### Testy cross-browser

```bash
# Firefox
npx playwright test --config=e2e/playwright.config.flashcards.ts --project=flashcard-cross-browser

# Mobile (Pixel 5)
npx playwright test --config=e2e/playwright.config.flashcards.ts --project=flashcard-mobile

# Tablet (iPad)
npx playwright test --config=e2e/playwright.config.flashcards.ts --project=flashcard-tablet
```

### Tryb debugowania

```bash
# Uruchom z interfejsem UI
npx playwright test --config=e2e/playwright.config.flashcards.ts --ui

# Debugowanie konkretnego testu
npx playwright test --config=e2e/playwright.config.flashcards.ts --debug flashcard-list-scenarios.spec.ts

# Headed mode (widoczna przeglądarka)
npx playwright test --config=e2e/playwright.config.flashcards.ts --headed
```

## Page Object Model (POM)

Testy wykorzystują wzorzec Page Object Model dla maintainable kodowania:

### 🏠 `FlashcardListPage`

Główna klasa dla strony listy fiszek

- Nawigacja i weryfikacja URL
- Operacje na liście fiszek
- Integracja z komponentem wyszukiwania
- Zarządzanie stanami ładowania

### 📝 `FlashcardListItem`

Klasa dla pojedynczej fiszki

- Operacje edycji (start, save, cancel)
- Operacje usuwania z obsługą dialogów
- Pobieranie zawartości fiszki
- Weryfikacja stanów

### 🔍 `SearchComponent`

Komponent wyszukiwania

- Wykonywanie wyszukiwań
- Czyszczenie wyszukiwania
- Weryfikacja dostępności
- Obsługa stanów ładowania

## Wymagania wstępne

```bash
# Zainstaluj dependencies
npm install

# Zainstaluj przeglądarki Playwright
npx playwright install

# Uruchom serwer dev (w osobnym terminalu)
npm run dev
```

## Raportowanie

Testy generują raporty w katalogu `test-results/`:

- `flashcard-report/` - HTML raport z wizualizacjami
- `flashcard-results.json` - JSON wyniki dla CI/CD
- Screenshots i videos niepowodzeń

```bash
# Otwórz HTML raport
npx playwright show-report test-results/flashcard-report
```

## Konwencje testowe

### ✅ Dobre praktyki

1. **Używaj Page Object Model**: Wszystkie operacje przez klasy POM
2. **Obsługuj dynamiczne ID**: Fiszki mają dynamiczne identyfikatory
3. **Graceful skipping**: Testy pomijają scenariusze bez danych
4. **Async/await**: Wszystkie operacje asynchroniczne
5. **Timeouts**: Odpowiednie timeouty dla operacji sieciowych
6. **Native dialogi**: Proper handling confirmation dialogs

### 🎯 Aserje i weryfikacje

```typescript
// ✅ Sprawdź widoczność przed interakcją
await expect(flashcardListPage.container).toBeVisible();

// ✅ Użyj testid dla niezawodności
const flashcard = page.getByTestId(`flashcard-item-${id}`);

// ✅ Weryfikuj stany przed operacjami
const isEditing = await flashcard.isEditing();
expect(isEditing).toBeFalsy();

// ✅ Obsłuż case gdy brak danych
test.skip(flashcardCount === 0, "No flashcards available");
```

### 🚫 Antypatterns

```typescript
// ❌ Nie używaj hard-coded timeouts
await page.waitForTimeout(5000);

// ❌ Nie polegaj na selektorach CSS
const button = page.locator(".btn-primary");

// ❌ Nie ignoruj błędów asynchronicznych
flashcard.edit("term", "def"); // Missing await

// ❌ Nie zakładaj porządku elementów
const firstFlashcard = page.locator(".flashcard").first();
```

## Data testowe

Testy są zaprojektowane do pracy z istniejącymi danymi użytkownika:

- **Zero-state**: Obsługa pustych list fiszek
- **Populated-state**: Operacje na istniejących fiszkach
- **Mixed-state**: Kombinacja różnych scenariuszy

## CI/CD Integration

```yaml
# Przykład GitHub Actions
- name: Run Flashcard E2E Tests
  run: |
    npm ci
    npx playwright install
    npx playwright test --config=e2e/playwright.config.flashcards.ts
```

## Troubleshooting

### Częste problemy

1. **Testy timeout**: Zwiększ timeout w konfiguracji
2. **Elementy not found**: Sprawdź `data-testid` attributes
3. **Dialog handling**: Upewnij się, że dialog listeners są ustawione przed akcją
4. **Flaky tests**: Dodaj proper waiting strategies

### Debug tips

```bash
# Zapisz trace dla niepowodzenia
npx playwright test --trace=on

# Zobacz trace
npx playwright show-trace trace.zip

# Pokaż browser developer tools
npx playwright test --headed --debug
```

## Metrics i monitorowanie

Testy zbierają metryki wydajności:

- Czas ładowania strony
- Czas nawigacji
- Czas wyszukiwania
- Użycie pamięci (w przeglądarkach obsługujących)

## Kontrybuowanie

Przy dodawaniu nowych testów:

1. Wykorzystuj istniejące klasy POM
2. Dodaj odpowiednie `data-testid` do komponentów
3. Uwzględnij edge cases i error handling
4. Dokumentuj nowe scenariusze w tym README
5. Testuj na różnych rozmiarach ekranu

---

**📝 Uwaga**: Te testy wymagają uruchomionego serwera deweloperskiego na `localhost:4321` oraz odpowiednio skonfigurowanej bazy danych z danymi testowymi.
