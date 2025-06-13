# Plan implementacji widoku Trybu Nauki

## 1. Przegląd

Widok trybu nauki umożliwia użytkownikom efektywne uczenie się przy pomocy fiszek w interfejsie przypominającym fizyczną talię kart. Widok oferuje interaktywne doświadczenie z animacjami odwracania fiszek, nawigacją za pomocą przycisków i skrótów klawiaturowych, oraz trybem pełnoekranowym dla maksymalnej koncentracji. System automatycznie pobiera zaakceptowane fiszki użytkownika i prezentuje je w losowej kolejności, wspierając efektywny proces nauki.

## 2. Routing widoku

- **Ścieżka**: `/nauka`
- **Typ**: Dynamiczna strona Astro z komponentami React
- **Uwierzytelnienie**: Wymagane - przekierowanie do `/login` jeśli użytkownik nie jest zalogowany
- **Layout**: Główny layout aplikacji z możliwością przełączenia do trybu pełnoekranowego

## 3. Struktura komponentów

```
src/pages/nauka.astro
└── LearningPage (React)
    ├── LoadingSpinner (gdy isLoading)
    ├── ErrorMessage (gdy error)
    ├── EmptyState (gdy brak fiszek)
    └── LearningSession (gdy flashcards.length > 0)
        ├── ProgressIndicator
        ├── FlashcardViewer
        │   └── FlashcardCard
        ├── NavigationControls
        └── FullscreenControls
```

## 4. Szczegóły komponentów

### LearningPage

- **Opis**: Główny komponent zarządzający stanem całej sesji nauki, odpowiedzialny za pobieranie danych z API i koordynację wszystkich podkomponentów
- **Główne elementy**: Container z warunkowymi renderowaniami stanów (loading, error, empty, session)
- **Obsługiwane interakcje**: Inicjalizacja sesji, obsługa błędów, zarządzanie stanem globalnym
- **Obsługiwana walidacja**: Sprawdzenie autoryzacji użytkownika, walidacja odpowiedzi API
- **Typy**: `LearningSessionState`, `FlashcardLearningResponse`, `ApiErrorResponse`
- **Propsy**: Brak (główny komponent strony)

### FlashcardViewer

- **Opis**: Kontener dla pojedynczej fiszki, zarządzający jej stanem wizualnym i interakcjami
- **Główne elementy**: Wrapper z FlashcardCard, obsługa gestów i animacji
- **Obsługiwane interakcje**: Kliknięcie w kartę (odwrócenie), obsługa gestów dotykowych
- **Obsługiwana walidacja**: Sprawdzenie czy istnieje aktualna fiszka
- **Typy**: `FlashcardDto`, `CardFlipState`
- **Propsy**: `flashcard: FlashcardDto`, `isFlipped: boolean`, `onFlip: () => void`

### FlashcardCard

- **Opis**: Interaktywna karta fiszki z animacją 3D odwracania, wyświetlająca treść przedniej i tylnej strony
- **Główne elementy**: Dwa div'y (front/back) z CSS transform 3D, animacje transition
- **Obsługiwane interakcje**: Click event, hover effects, animacje przejść
- **Obsługiwana walidacja**: Sprawdzenie długości treści, sanityzacja HTML
- **Typy**: `FlashcardDto`, `CardDisplayMode`
- **Propsy**: `flashcard: FlashcardDto`, `isFlipped: boolean`, `onClick: () => void`, `className?: string`

### NavigationControls

- **Opis**: Panel z przyciskami nawigacyjnymi umożliwiającymi poruszanie się między fiszkami
- **Główne elementy**: Przyciski poprzedni/następny, licznik pozycji, przyciski pomocnicze
- **Obsługiwane interakcje**: Kliknięcie przycisków, skróty klawiaturowe (strzałki)
- **Obsługiwana walidacja**: Sprawdzenie granic nawigacji (pierwsza/ostatnia fiszka)
- **Typy**: `NavigationState`, `KeyboardShortcut`
- **Propsy**: `currentIndex: number`, `totalCount: number`, `onPrevious: () => void`, `onNext: () => void`, `canGoPrevious: boolean`, `canGoNext: boolean`

### ProgressIndicator

- **Opis**: Wskaźnik postępu sesji nauki pokazujący aktualną pozycję i całkowitą liczbę fiszek
- **Główne elementy**: Progress bar, numery stron, wizualne wskaźniki
- **Obsługiwane interakcje**: Brak bezpośrednich interakcji (tylko wyświetlanie)
- **Obsługiwana walidacja**: Sprawdzenie poprawności indeksów i liczb
- **Typy**: `ProgressDisplayData`
- **Propsy**: `current: number`, `total: number`, `showPercentage?: boolean`

### FullscreenControls

- **Opis**: Kontrolki zarządzania trybem pełnoekranowym z przyciskami wejścia/wyjścia
- **Główne elementy**: Przycisk toggle fullscreen, wskaźnik stanu, instrukcje ESC
- **Obsługiwane interakcje**: Toggle fullscreen, obsługa klawisza ESC
- **Obsługiwana walidacja**: Sprawdzenie wsparcia Fullscreen API w przeglądarce
- **Typy**: `FullscreenState`
- **Propsy**: `isFullscreen: boolean`, `onToggleFullscreen: () => void`, `isSupported: boolean`

## 5. Typy

```typescript
// Stan sesji nauki
interface LearningSessionState {
  flashcards: FlashcardDto[];
  currentIndex: number;
  isCardFlipped: boolean;
  isFullscreen: boolean;
  isLoading: boolean;
  error: string | null;
  totalCount: number;
}

// Parametry inicjalizacji sesji
interface LearningSessionParams {
  limit?: number;
  sourceTextId?: string;
}

// Stan nawigacji
interface NavigationState {
  canGoPrevious: boolean;
  canGoNext: boolean;
  currentPosition: number;
  totalItems: number;
}

// Stan karty fiszki
interface CardFlipState {
  isFlipped: boolean;
  isAnimating: boolean;
  side: "front" | "back";
}

// Dane wskaźnika postępu
interface ProgressDisplayData {
  current: number;
  total: number;
  percentage: number;
  remaining: number;
}

// Stan trybu pełnoekranowego
interface FullscreenState {
  isActive: boolean;
  isSupported: boolean;
  isTransitioning: boolean;
}

// Konfiguracja skrótów klawiaturowych
interface KeyboardShortcut {
  key: string;
  description: string;
  action: () => void;
}

// Tryb wyświetlania karty
type CardDisplayMode = "front" | "back" | "both";
```

## 6. Zarządzanie stanem

Widok wykorzystuje kilka custom hooków do zarządzania stanem:

### useLearningSession

```typescript
const useLearningSession = (params?: LearningSessionParams) => {
  // Stan fiszek, aktualnego indeksu, błędów
  // Funkcje nawigacji, pobierania danych
  // Zarządzanie stanem odwracania karty
};
```

### useKeyboardNavigation

```typescript
const useKeyboardNavigation = (handlers: KeyboardHandlers) => {
  // Obsługa wydarzeń klawiatury
  // Mapowanie klawiszy do akcji
  // Cleanup przy demontowaniu
};
```

### useFullscreen

```typescript
const useFullscreen = () => {
  // Zarządzanie Fullscreen API
  // Stan pełnoekranowy
  // Funkcje toggle
};
```

Stan globalny sesji jest zarządzany w głównym komponencie LearningPage i przekazywany przez props do komponentów potomnych.

## 7. Integracja API

### Endpoint

- **URL**: `GET /api/flashcards/learning`
- **Typ żądania**: `FlashcardLearningQueryParams`

```typescript
interface FlashcardLearningQueryParams {
  limit?: number; // default: 10, max: 100
  source_text_id?: string; // UUID format
}
```

- **Typ odpowiedzi**: `FlashcardLearningResponse`

```typescript
interface FlashcardLearningResponse {
  data: FlashcardDto[];
  total: number;
}
```

### Implementacja

```typescript
const fetchFlashcardsForLearning = async (params: FlashcardLearningQueryParams): Promise<FlashcardLearningResponse> => {
  const searchParams = new URLSearchParams();
  if (params.limit) searchParams.append("limit", params.limit.toString());
  if (params.source_text_id) searchParams.append("source_text_id", params.source_text_id);

  const response = await fetch(`/api/flashcards/learning?${searchParams}`);
  if (!response.ok) throw new Error("Failed to fetch flashcards");
  return response.json();
};
```

## 8. Interakcje użytkownika

### Nawigacja między fiszkami

- **Przyciski**: Poprzednia/Następna fiszka
- **Klawiatura**: Strzałka w lewo/prawo
- **Walidacja**: Sprawdzenie granic (pierwsza/ostatnia fiszka)
- **Feedback**: Dezaktywacja przycisków przy granicach

### Odwracanie fiszki

- **Mysz**: Kliknięcie w kartę
- **Klawiatura**: Spacja lub Enter
- **Animacja**: CSS 3D transform z transition
- **Stan**: Przełączanie między front/back

### Tryb pełnoekranowy

- **Przycisk**: Toggle fullscreen w prawym górnym rogu
- **Klawiatura**: Klawisz F lub F11
- **Wyjście**: ESC lub ponowne kliknięcie przycisku
- **Walidacja**: Sprawdzenie wsparcia Fullscreen API

### Zakończenie sesji

- **Przycisk**: "Zakończ naukę"
- **Klawiatura**: ESC (gdy nie w trybie pełnoekranowym)
- **Akcja**: Przekierowanie do `/fiszki` lub poprzedniej strony

## 9. Warunki i walidacja

### Walidacja dostępu

- **Komponent**: LearningPage
- **Warunek**: Użytkownik musi być zalogowany
- **Działanie**: Przekierowanie do `/login` jeśli nie ma sesji

### Walidacja danych fiszek

- **Komponent**: FlashcardCard
- **Warunki**:
  - `front_content` nie może być pusty
  - `back_content` nie może być pusty
  - Długość tekstu poniżej 2000 znaków
- **Działanie**: Wyświetlenie placeholder jeśli brak treści

### Walidacja nawigacji

- **Komponent**: NavigationControls
- **Warunki**:
  - `currentIndex >= 0`
  - `currentIndex < flashcards.length`
- **Działanie**: Dezaktywacja przycisków przy granicach

### Walidacja API

- **Komponenty**: LearningPage
- **Warunki**:
  - Odpowiedź zawiera `data` i `total`
  - `data` jest tablicą FlashcardDto
- **Działanie**: Wyświetlenie błędu jeśli walidacja nie przejdzie

## 10. Obsługa błędów

### Błędy API

- **401 Unauthorized**: Przekierowanie do strony logowania
- **404 Not Found**: Wyświetlenie komunikatu "Brak fiszek do nauki"
- **500 Server Error**: Wyświetlenie komunikatu "Wystąpił błąd serwera" z przyciskiem ponowienia
- **Błąd sieci**: Wyświetlenie komunikatu "Problemy z połączeniem" z przyciskiem ponowienia

### Błędy stanu

- **Brak fiszek**: Komponent EmptyState z informacją i linkiem do tworzenia fiszek
- **Nieprawidłowy indeks**: Automatyczne przekierowanie do pierwszej fiszki
- **Błąd fullscreen**: Graceful degradation - ukrycie przycisku fullscreen

### Błędy interfejsu

- **Długi tekst**: Automatyczne skracanie z ellipsis i tooltip
- **Brak wsparcia animacji**: Fallback do prostych przejść
- **Problemy z klawiaturą**: Zachowanie podstawowej funkcjonalności przycisków

## 11. Kroki implementacji

### Krok 1: Przygotowanie struktury plików

- Utworzenie `/src/pages/nauka.astro`
- Utworzenie komponentów w `/src/components/learning/`
- Utworzenie hooków w `/src/lib/hooks/learning/`
- Dodanie typów do `/src/types.ts`

### Krok 2: Implementacja podstawowego layoutu

- Stworzenie komponentu LearningPage
- Implementacja stanów loading/error/empty
- Dodanie podstawowego routingu i middleware uwierzytelniania

### Krok 3: Integracja z API

- Implementacja `useLearningSession` hook
- Dodanie funkcji pobierania fiszek
- Obsługa błędów API i stanów ładowania

### Krok 4: Implementacja FlashcardCard

- Stworzenie komponentu karty z animacją 3D
- Dodanie CSS transforms i transitions
- Implementacja przełączania stron front/back

### Krok 5: Dodanie nawigacji

- Implementacja NavigationControls
- Dodanie logiki nawigacji między fiszkami
- Implementacja ProgressIndicator

### Krok 6: Obsługa klawiatury

- Implementacja `useKeyboardNavigation` hook
- Mapowanie klawiszy do akcji
- Dodanie instrukcji skrótów w UI

### Krok 7: Tryb pełnoekranowy

- Implementacja `useFullscreen` hook
- Dodanie FullscreenControls
- Obsługa przejść i stanów fullscreen

### Krok 8: Stylowanie i UX

- Dodanie animacji i przejść
- Implementacja responsywnego designu
- Optymalizacja dla urządzeń dotykowych

### Krok 9: Testowanie

- Testy jednostkowe dla hooków
- Testy komponentów z Testing Library
- Testy e2e z Playwright dla pełnych scenariuszy

### Krok 10: Optymalizacja

- Implementacja lazy loading
- Optymalizacja re-renderów z React.memo
- Dodanie prefetch dla następnych fiszek

### Krok 11: Dokumentacja i finalizacja

- Dodanie komentarzy w kodzie
- Aktualizacja dokumentacji API
- Testowanie accessibility z screen readerami
