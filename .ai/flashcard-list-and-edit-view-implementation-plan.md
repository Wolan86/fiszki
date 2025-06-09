# Plan implementacji widoku listy fiszek (uproszczony)

## 1. Przegląd

Ten dokument opisuje implementację uproszczonego widoku listy fiszek:
- **Widok listy fiszek** (`/fiszki`) - umożliwia przeglądanie wszystkich fiszek użytkownika z podstawowym wyszukiwaniem i inline edycją

Widok jest kluczowy dla realizacji historyjek użytkownika dotyczących przeglądania i prostej edycji fiszek.

## 2. Routing widoków

- **Widok listy fiszek**: `/fiszki`

Routing będzie implementowany za pomocą Astro pages:
- `src/pages/fiszki/index.astro` - strona listy fiszek

## 3. Struktura komponentów

```
FlashcardListPage (Astro + React)
├── SimpleFlashcardSearch (React) - proste wyszukiwanie
├── FlashcardGrid (React) - siatka fiszek  
│   └── FlashcardViewItem (React) - pojedyncza fiszka z inline edycją
└── FlashcardPreviewModal (React) - opcjonalny podgląd
```

## 4. Szczegóły komponentów

### FlashcardListPage
- **Opis komponentu**: Główny komponent strony listy fiszek z prostym interfejsem
- **Główne elementy**: Container z headerem, wyszukiwaniem i siatką fiszek
- **Obsługiwane interakcje**: ładowanie danych, wyszukiwanie, inline edycja
- **Typy**: FlashcardDto[], SearchQuery
- **Propsy**: brak (komponent strony)

### SimpleFlashcardSearch  
- **Opis komponentu**: Proste pole wyszukiwania po treści fiszek
- **Główne elementy**: Input z ikoną wyszukiwania, przycisk czyszczenia
- **Obsługiwane interakcje**: wpisywanie tekstu, czyszczenie wyszukiwania
- **Typy**: SearchQuery
- **Propsy**: 
  ```typescript
  interface SimpleFlashcardSearchProps {
    searchQuery: string;
    onSearchChange: (query: string) => void;
    loading?: boolean;
  }
  ```

### FlashcardGrid
- **Opis komponentu**: Siatka wyświetlająca fiszki w cards układzie
- **Główne elementy**: Grid layout z fiszkami
- **Obsługiwane interakcje**: edycja inline, przewracanie fiszek
- **Typy**: FlashcardDto[]
- **Propsy**:
  ```typescript
  interface FlashcardGridProps {
    flashcards: FlashcardDto[];
    onEdit: (id: string, frontContent: string, backContent: string) => Promise<void>;
    onDelete: (id: string) => Promise<void>;
    loading?: boolean;
  }
  ```

### FlashcardViewItem
- **Opis komponentu**: Pojedyncza fiszka z możliwością inline edycji (podobnie jak w kreatorze)
- **Główne elementy**: Card z contentem, przyciski Edit/Delete, tryb edycji z textarea
- **Obsługiwane interakcje**: przewracanie, edycja inline, zapisywanie, usuwanie
- **Typy**: FlashcardDto, EditState
- **Propsy**:
  ```typescript
  interface FlashcardViewItemProps {
    flashcard: FlashcardDto;
    onEdit: (id: string, frontContent: string, backContent: string) => Promise<void>;
    onDelete: (id: string) => Promise<void>;
  }
  ```

## 5. Typy (uproszczone)

```typescript
// Search query dla prostego wyszukiwania
interface SearchQuery {
  text: string;
}

// Lista fiszek (bez paginacji)
interface FlashcardListResponse {
  data: FlashcardDto[];
  total: number;
}

// Request dla update fiszki (bez zmiany accepted)
interface UpdateFlashcardRequest {
  front_content: string;
  back_content: string;
}

// Stan edycji dla pojedynczej fiszki
interface EditState {
  isEditing: boolean;
  editableFrontContent: string;
  editableBackContent: string;
  isSaving: boolean;
}
```

## 6. Zarządzanie stanem

### Hook useFlashcardList (uproszczony)
```typescript
interface UseFlashcardListState {
  flashcards: FlashcardDto[];
  searchQuery: string;
  loading: boolean;
  error: string | null;
}

interface UseFlashcardListActions {
  fetchFlashcards: () => Promise<void>;
  updateSearch: (query: string) => void;
  editFlashcard: (id: string, frontContent: string, backContent: string) => Promise<void>;
  deleteFlashcard: (id: string) => Promise<void>;
}
```

## 7. Integracja API

### Lista fiszek (GET /api/flashcards)
- **Request**: Optional query parameter `?search=text` dla wyszukiwania
- **Response**: FlashcardListResponse z wszystkimi fiszkami użytkownika
- **Error handling**: 401 (redirect do logowania), 500 (wyświetl błąd)

### Aktualizacja fiszki (PUT /api/flashcards/{id})  
- **Request**: UpdateFlashcardRequest w body (tylko front_content i back_content)
- **Response**: Zaktualizowana FlashcardDto
- **Error handling**: 400 (błąd walidacji), 404 (nie znaleziono), 401 (brak uprawnień)

### Usuwanie fiszki (DELETE /api/flashcards/{id})
- **Request**: ID fiszki w URL
- **Response**: 204 No Content
- **Error handling**: 404 (nie znaleziono), 401 (brak uprawnień)

## 8. Interakcje użytkownika

### Widok listy fiszek:
1. **Wyszukiwanie**: Wpisanie tekstu → filtrowanie listy fiszek po treści
2. **Przeglądanie**: Kliknięcie fiszki → przewrócenie (przód/tył)
3. **Edycja inline**: Przycisk "Edytuj" → tryb edycji z textarea → "Zapisz"/"Anuluj"
4. **Usuwanie**: Przycisk "Usuń" → confirm dialog → DELETE API call

## 9. Implementacja inline edycji (jak w kreatorze)

Edycja będzie działać podobnie jak w `FlashcardItem` z kreatora:
- Po kliknięciu "Edytuj" fiszka przechodzi w tryb edycji
- Pojawią się textarea dla front_content i back_content
- Przyciski "Zapisz" i "Anuluj"
- Podczas edycji nie można przewracać fiszki

## 10. Kroki implementacji (uproszczone)

### Krok 1: Uproszczenie obecnych komponentów
1. Usunięcie FlashcardFilters - zastąpienie prostym wyszukiwaniem
2. Zastąpienie FlashcardTable prostym FlashcardGrid  
3. Usunięcie masowych operacji z useFlashcardList

### Krok 2: Implementacja FlashcardViewItem z inline edycją
1. Stworzenie komponentu bazującego na FlashcardItem z kreatora
2. Dodanie logiki edycji inline z textarea
3. Integracja z API do zapisywania zmian

### Krok 3: Prostsze wyszukiwanie i UX
1. SimpleFlashcardSearch z debounced input
2. Loading states i error handling
3. Responsywność i accessibility

Taki uproszczony widok będzie o wiele bardziej praktyczny dla przeglądania i prostej edycji fiszek! 