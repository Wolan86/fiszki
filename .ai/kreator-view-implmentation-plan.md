# Plan implementacji widoku Kreatora Fiszek

## 1. Przegląd
Widok Kreatora Fiszek umożliwia użytkownikom wprowadzenie tekstu źródłowego i generowanie fiszek edukacyjnych przy pomocy sztucznej inteligencji. Głównym celem jest zapewnienie intuicyjnego interfejsu do tworzenia fiszek z dłuższych tekstów, eliminując czasochłonny proces ręcznego tworzenia materiałów edukacyjnych.

## 2. Routing widoku
- Ścieżka: `/kreator`
- Implementacja w Astro: `src/pages/kreator.astro`

## 3. Struktura komponentów
```
CreatorView
├── PageHeader
├── SourceTextForm
│   ├── SourceTextInput
│   ├── WordCounter
│   └── GenerateButton
├── ProgressIndicator (wyświetlane podczas generowania)
└── GeneratedFlashcards (wyświetlane po wygenerowaniu)
    ├── FlashcardList
    │   ├── FlashcardItem 1
    │   │   ├── FlashcardContent
    │   │   └── FlashcardActions
    │   ├── FlashcardItem 2
    │   │   ├── FlashcardContent
    │   │   └── FlashcardActions
    │   └── ... (więcej fiszek)
    └── GenerationStats
```

## 4. Szczegóły komponentów

### PageHeader
- Opis: Nagłówek strony zawierający tytuł i krótki opis funkcjonalności
- Główne elementy: Tytuł "Kreator fiszek", podtytuł z opisem funkcjonalności
- Obsługiwane interakcje: Brak
- Typy: Brak
- Propsy: `title: string`, `description: string`

### SourceTextForm
- Opis: Formularz do wprowadzania i zapisywania tekstu źródłowego
- Główne elementy: SourceTextInput, WordCounter, GenerateButton
- Obsługiwane interakcje: Wysyłanie formularza, zapis tekstu źródłowego
- Obsługiwana walidacja: Walidacja długości tekstu (1000-10000 słów)
- Typy: `SourceTextFormViewModel`, `CreateSourceTextCommand`
- Propsy: `onTextSaved: (sourceText: SourceTextDto) => void`, `onGenerateRequest: (sourceTextId: string) => void`

### SourceTextInput
- Opis: Pole tekstowe do wprowadzania tekstu źródłowego z funkcją autosave
- Główne elementy: Textarea z możliwością zmiany rozmiaru
- Obsługiwane interakcje: onChange, onBlur
- Obsługiwana walidacja: Minimalna i maksymalna liczba słów
- Typy: Część `SourceTextFormViewModel`
- Propsy: `value: string`, `onChange: (value: string) => void`, `onBlur: () => void`, `isValid: boolean`, `errors: string[]`

### WordCounter
- Opis: Licznik słów pokazujący aktualną liczbę słów oraz limity
- Główne elementy: Wyświetlacz licznika z kolorowym wskaźnikiem
- Obsługiwane interakcje: Brak
- Typy: `{ currentCount: number, minCount: number, maxCount: number }`
- Propsy: `currentCount: number`, `minCount: number`, `maxCount: number`

### GenerateButton
- Opis: Przycisk uruchamiający proces generowania fiszek
- Główne elementy: Button z ikoną i tekstem
- Obsługiwane interakcje: onClick
- Typy: `{ disabled: boolean, isLoading: boolean }`
- Propsy: `onClick: () => void`, `disabled: boolean`, `isLoading: boolean`

### ProgressIndicator
- Opis: Wskaźnik postępu generowania fiszek
- Główne elementy: Pasek postępu, animacja, informacja o czasie oczekiwania
- Obsługiwane interakcje: Brak
- Typy: `{ isGenerating: boolean, progressText: string }`
- Propsy: `isGenerating: boolean`, `progressText: string`

### GeneratedFlashcards
- Opis: Kontener dla wygenerowanych fiszek i statystyk generowania
- Główne elementy: FlashcardList, GenerationStats
- Obsługiwane interakcje: Brak
- Typy: `FlashcardViewModel[]`, `GenerationStatsViewModel`
- Propsy: `flashcards: FlashcardViewModel[]`, `stats: GenerationStatsViewModel`

### FlashcardList
- Opis: Lista wygenerowanych fiszek do akceptacji/odrzucenia
- Główne elementy: Kolekcja FlashcardItem
- Obsługiwane interakcje: Brak
- Typy: `FlashcardViewModel[]`
- Propsy: `flashcards: FlashcardViewModel[]`, `onAccept: (id: string) => void`, `onReject: (id: string) => void`, `onRegenerate: (id: string) => void`

### FlashcardItem
- Opis: Pojedyncza fiszka z opcjami akceptacji/odrzucenia
- Główne elementy: FlashcardContent, FlashcardActions, interaktywna karta
- Obsługiwane interakcje: Odwracanie fiszki (kliknięcie/dotknięcie), akcje (akceptuj/odrzuć/regeneruj)
- Typy: `FlashcardViewModel`
- Propsy: `flashcard: FlashcardViewModel`, `onAccept: () => void`, `onReject: () => void`, `onRegenerate: () => void`

### FlashcardContent
- Opis: Treść fiszki (przód i tył)
- Główne elementy: Przód fiszki (pytanie), tył fiszki (odpowiedź)
- Obsługiwane interakcje: Kliknięcie do odwrócenia
- Typy: `{ frontContent: string, backContent: string, isFlipped: boolean }`
- Propsy: `frontContent: string`, `backContent: string`, `isFlipped: boolean`, `onFlip: () => void`

### FlashcardActions
- Opis: Przyciski akcji dla fiszki (akceptuj, odrzuć, regeneruj)
- Główne elementy: Buttony z ikonami
- Obsługiwane interakcje: onClick dla każdego przycisku
- Typy: `{ onAccept: () => void, onReject: () => void, onRegenerate: () => void, isRegenerating: boolean }`
- Propsy: `onAccept: () => void`, `onReject: () => void`, `onRegenerate: () => void`, `isRegenerating: boolean`

### GenerationStats
- Opis: Statystyki generowania fiszek
- Główne elementy: Liczba wygenerowanych fiszek, czas generowania
- Obsługiwane interakcje: Brak
- Typy: `GenerationStatsViewModel`
- Propsy: `stats: GenerationStatsViewModel`

## 5. Typy

### SourceTextFormViewModel
```typescript
interface SourceTextFormViewModel {
  content: string;
  wordCount: number;
  minWordCount: number; // Stała: 1000
  maxWordCount: number; // Stała: 10000
  isValid: boolean;
  isSaving: boolean;
  lastSaved: Date | null;
  errors: string[];
}
```

### FlashcardViewModel
```typescript
interface FlashcardViewModel extends FlashcardDto {
  isFlipped: boolean; // Czy fiszka jest odwrócona (pokazuje tył)
  isRegenerating: boolean; // Czy trwa regeneracja fiszki
  showActions: boolean; // Czy pokazywać przyciski akcji
}
```

### GenerationStatsViewModel
```typescript
interface GenerationStatsViewModel {
  requestedCount: number; // Ile fiszek użytkownik chciał wygenerować
  generatedCount: number; // Ile fiszek faktycznie wygenerowano
  totalTimeMs: number; // Całkowity czas generowania w ms
  formattedTime: string; // Sformatowany czas w formacie "X.X sekund"
}
```

## 6. Zarządzanie stanem

### useSourceText
Hook zarządzający tekstem źródłowym z funkcją autosave.

```typescript
interface UseSourceTextOptions {
  initialContent?: string;
  minWordCount: number;
  maxWordCount: number;
  autosaveDelay?: number; // w ms, domyślnie 2000
}

interface UseSourceTextResult {
  content: string; // Aktualny tekst 
  setContent: (value: string) => void; // Aktualizacja tekstu
  wordCount: number; // Aktualna liczba słów
  isValid: boolean; // Czy tekst spełnia wymagania
  isSaving: boolean; // Czy trwa zapis
  lastSaved: Date | null; // Kiedy ostatnio zapisano
  errors: string[]; // Błędy walidacji
  saveSourceText: () => Promise<SourceTextDto | null>; // Ręczny zapis
  reset: () => void; // Reset stanu
}

// Użycie:
const {
  content, setContent, wordCount, isValid, isSaving, lastSaved, errors, saveSourceText
} = useSourceText({
  minWordCount: 1000,
  maxWordCount: 10000,
  autosaveDelay: 2000
});
```

### useFlashcardGeneration
Hook zarządzający generowaniem i aktualizacją fiszek.

```typescript
interface UseFlashcardGenerationOptions {
  count?: number; // Domyślnie 5
}

interface UseFlashcardGenerationResult {
  flashcards: FlashcardViewModel[]; // Wygenerowane fiszki
  isGenerating: boolean; // Czy trwa generowanie
  generationStats: GenerationStatsViewModel | null; // Statystyki
  error: ApiErrorResponse | null; // Błąd API
  generateFlashcards: (sourceTextId: string, options?: UseFlashcardGenerationOptions) => Promise<void>; // Generowanie fiszek
  updateFlashcard: (id: string, update: UpdateFlashcardCommand) => Promise<void>; // Aktualizacja fiszki
  regenerateFlashcard: (id: string) => Promise<void>; // Regeneracja fiszki
  reset: () => void; // Reset stanu
}

// Użycie:
const {
  flashcards, isGenerating, generationStats, error, generateFlashcards, updateFlashcard, regenerateFlashcard
} = useFlashcardGeneration();
```

## 7. Integracja API

### Tworzenie tekstu źródłowego
- Endpoint: `POST /api/source-texts`
- Request body: `CreateSourceTextCommand` (`{ content: string }`)
- Response: `SourceTextDto`
- Implementacja:
```typescript
const saveSourceText = async (content: string): Promise<SourceTextDto> => {
  const response = await fetch('/api/source-texts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content })
  });
  
  if (!response.ok) {
    const errorData: ApiErrorResponse = await response.json();
    throw new Error(errorData.message);
  }
  
  return await response.json();
};
```

### Generowanie fiszek
- Endpoint: `POST /api/source-texts/{id}/generate-flashcards`
- Request body: `GenerateFlashcardsCommand` (`{ count?: number }`)
- Response: `GenerateFlashcardsResponse`
- Implementacja:
```typescript
const generateFlashcards = async (sourceTextId: string, count?: number): Promise<GenerateFlashcardsResponse> => {
  const response = await fetch(`/api/source-texts/${sourceTextId}/generate-flashcards`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ count: count ?? 5 })
  });
  
  if (!response.ok) {
    const errorData: ApiErrorResponse = await response.json();
    throw new Error(errorData.message);
  }
  
  return await response.json();
};
```

### Aktualizacja fiszki (akceptacja/odrzucenie)
- Endpoint: `PUT /api/flashcards/{id}` (zakładana implementacja)
- Request body: `UpdateFlashcardCommand` (`{ accepted: boolean }`)
- Response: `FlashcardDto`
- Implementacja:
```typescript
const updateFlashcard = async (id: string, update: UpdateFlashcardCommand): Promise<FlashcardDto> => {
  const response = await fetch(`/api/flashcards/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(update)
  });
  
  if (!response.ok) {
    const errorData: ApiErrorResponse = await response.json();
    throw new Error(errorData.message);
  }
  
  return await response.json();
};
```

### Regeneracja fiszki
- Endpoint: `POST /api/flashcards/{id}/regenerate` (zakładana implementacja)
- Response: `FlashcardDto`
- Implementacja:
```typescript
const regenerateFlashcard = async (id: string): Promise<FlashcardDto> => {
  const response = await fetch(`/api/flashcards/${id}/regenerate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });
  
  if (!response.ok) {
    const errorData: ApiErrorResponse = await response.json();
    throw new Error(errorData.message);
  }
  
  return await response.json();
};
```

## 8. Interakcje użytkownika

### Wprowadzanie tekstu źródłowego
1. Użytkownik wpisuje tekst w pole tekstowe (SourceTextInput)
2. System automatycznie zlicza słowa i wyświetla licznik (WordCounter)
3. Jeśli liczba słów jest poza zakresem (1000-10000), wyświetlany jest komunikat błędu
4. System automatycznie zapisuje tekst po czasie bezczynności (autosave)
5. Stan zapisu jest wizualizowany (ikonka, status)

### Generowanie fiszek
1. Po wprowadzeniu prawidłowego tekstu, przycisk "Generuj fiszki" staje się aktywny
2. Użytkownik klika przycisk "Generuj fiszki" (GenerateButton)
3. System wysyła żądanie do API
4. Podczas generowania wyświetlany jest wskaźnik postępu (ProgressIndicator)
5. Po zakończeniu generowania wyświetlane są wygenerowane fiszki (FlashcardList)

### Przeglądanie fiszek
1. Użytkownik może kliknąć fiszkę, aby zobaczyć jej drugą stronę
2. Kliknięcie odwraca fiszkę (efekt flip)
3. Ponowne kliknięcie przywraca przód fiszki

### Akceptacja/odrzucenie fiszki
1. Użytkownik może zaakceptować fiszkę (przycisk z ikoną "✓")
2. Użytkownik może odrzucić fiszkę (przycisk z ikoną "✗")
3. Po akcji, system wizualnie oznacza stan fiszki

### Regeneracja fiszki
1. Użytkownik może zregenerować odrzuconą fiszkę (przycisk z ikoną odświeżania)
2. Podczas regeneracji wyświetlany jest wskaźnik postępu
3. Po zakończeniu wyświetlana jest nowa fiszka

## 9. Warunki i walidacja

### Walidacja tekstu źródłowego
- Warunek: Tekst musi zawierać od 1000 do 10000 słów
- Komponenty: SourceTextInput, WordCounter
- Wpływ na interfejs: 
  - Niewystarczająca liczba słów: komunikat "Wprowadź co najmniej 1000 słów"
  - Zbyt duża liczba słów: komunikat "Przekroczono limit 10000 słów"
  - Przycisk "Generuj fiszki" jest nieaktywny, gdy tekst nie spełnia warunków

### Walidacja generowania fiszek
- Warunek: Tekst źródłowy musi być zapisany w bazie przed generowaniem
- Komponenty: GenerateButton
- Wpływ na interfejs:
  - Przycisk "Generuj fiszki" jest nieaktywny, gdy tekst nie jest zapisany

### Walidacja regeneracji fiszki
- Warunek: Może być regenerowana tylko odrzucona fiszka
- Komponenty: FlashcardActions
- Wpływ na interfejs:
  - Przycisk "Regeneruj" jest widoczny tylko dla odrzuconych fiszek

## 10. Obsługa błędów

### Błędy zapisu tekstu źródłowego
- Typ błędu: Błąd API podczas zapisywania tekstu
- Obsługa: 
  - Wyświetlenie komunikatu o błędzie
  - Automatyczne ponowienie próby zapisu po czasie
  - Przechowywanie tekstu lokalnie (localStorage)

### Błędy generowania fiszek
- Typ błędu: AI_SERVICE_UNAVAILABLE
- Obsługa:
  - Wyświetlenie komunikatu "Usługa generowania fiszek jest obecnie niedostępna, spróbuj ponownie później"
  - Przycisk do ponowienia próby

- Typ błędu: AI_GENERATION_FAILED
- Obsługa:
  - Wyświetlenie komunikatu "Nie udało się wygenerować fiszek z podanego tekstu"
  - Sugestia modyfikacji tekstu

### Błędy aktualizacji fiszki
- Typ błędu: Błąd API podczas aktualizacji
- Obsługa:
  - Wyświetlenie komunikatu o błędzie
  - Przywrócenie poprzedniego stanu
  - Automatyczne ponowienie próby

### Błędy regeneracji fiszki
- Typ błędu: Błędy podobne do generowania fiszek
- Obsługa:
  - Indywidualne komunikaty dla każdej fiszki
  - Przycisk do ponowienia próby
  - Stan ładowania tylko dla konkretnej fiszki

## 11. Kroki implementacji

1. **Przygotowanie typów i modeli:**
   - Implementacja typów ViewModel dla formularza i fiszek
   - Implementacja typów dla hooków zarządzania stanem

2. **Implementacja hooków zarządzania stanem:**
   - Implementacja `useSourceText` dla zarządzania tekstem i autosave
   - Implementacja `useFlashcardGeneration` dla generowania i zarządzania fiszkami

3. **Implementacja API Service:**
   - Implementacja funkcji do komunikacji z API
   - Implementacja obsługi błędów API

4. **Implementacja komponentów UI:**
   - Implementacja komponentów podstawowych (PageHeader, SourceTextForm)
   - Implementacja komponentów formularza (SourceTextInput, WordCounter, GenerateButton)
   - Implementacja komponentu wskaźnika postępu (ProgressIndicator)
   - Implementacja komponentów fiszek (FlashcardList, FlashcardItem, FlashcardContent, FlashcardActions)
   - Implementacja komponentów statystyk (GenerationStats)

5. **Integracja komponentów i stanu:**
   - Połączenie komponentów z hookami zarządzania stanem
   - Implementacja interakcji między komponentami

6. **Implementacja widoku głównego:**
   - Stworzenie strony Astro z zintegrowanymi komponentami React
   - Implementacja routingu dla widoku

7. **Implementacja obsługi błędów:**
   - Implementacja komponentów wyświetlania błędów
   - Integracja obsługi błędów z komponentami UI

8. **Implementacja autosave:**
   - Implementacja mechanizmu automatycznego zapisywania tekstu
   - Integracja z localStorage dla backup'u danych

9. **Testowanie i debugowanie:**
   - Testowanie funkcjonalności generowania fiszek
   - Testowanie obsługi błędów i scenariuszy brzegowych
   - Testowanie responsywności i dostępności interfejsu

10. **Optymalizacja wydajności:**
    - Optymalizacja renderowania komponentów
    - Implementacja memoizacji dla ciężkich obliczeń
    - Optymalizacja autosave (debouncing/throttling)