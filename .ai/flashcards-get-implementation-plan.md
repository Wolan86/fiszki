# API Endpoint Implementation Plan: Get All Flashcards

## 1. Przegląd punktu końcowego

Endpoint GET `/api/flashcards` służy do pobierania wszystkich fiszek należących do autoryzowanego użytkownika. Obsługuje zaawansowane funkcje takie jak paginacja, sortowanie oraz filtrowanie według różnych kryteriów (tekst źródłowy, typ tworzenia, status akceptacji).

## 2. Szczegóły żądania

- **Metoda HTTP**: GET
- **Struktura URL**: `/api/flashcards`
- **Parametry**:
  - **Wymagane**: brak
  - **Opcjonalne**:
    - `limit`: Maksymalna liczba elementów do zwrócenia (default: 10, max: 100)
    - `offset`: Liczba elementów do pominięcia (default: 0)
    - `sort`: Pole do sortowania (default: created_at)
    - `order`: Kierunek sortowania 'asc' lub 'desc' (default: desc)
    - `source_text_id`: Filtrowanie po ID tekstu źródłowego
    - `creation_type`: Filtrowanie po typie tworzenia (ai_generated, ai_edited, manual)
    - `accepted`: Filtrowanie po statusie akceptacji (true/false)
- **Request Body**: brak (GET request)
- **Headers**: Authorization przez Supabase session

## 3. Wykorzystywane typy

```typescript
// Input validation
FlashcardListQueryParams

// Response DTOs
FlashcardListResponse
FlashcardDto
ApiErrorResponse

// Enum types
FlashcardCreationType
```

## 4. Szczegóły odpowiedzi

**Status 200 - Success**:
```json
{
  "data": [
    {
      "id": "uuid",
      "user_id": "uuid", 
      "source_text_id": "uuid or null",
      "front_content": "string",
      "back_content": "string",
      "creation_type": "ai_generated | ai_edited | manual",
      "accepted": "boolean",
      "generation_time_ms": "number or null",
      "created_at": "timestamp",
      "updated_at": "timestamp"
    }
  ],
  "pagination": {
    "total": "number",
    "limit": "number", 
    "offset": "number"
  }
}
```

**Status 400 - Bad Request**: Nieprawidłowe parametry query
**Status 401 - Unauthorized**: Brak autoryzacji lub nieprawidłowa sesja
**Status 500 - Internal Server Error**: Błąd serwera lub bazy danych

## 5. Przepływ danych

1. **Walidacja żądania**: Sprawdzenie i walidacja parametrów query za pomocą Zod
2. **Autoryzacja**: Pobranie user_id z context.locals.supabase
3. **Delegacja do Service**: Przekazanie kontroli do FlashcardService
4. **Zapytanie do bazy danych**: Wykonanie zapytania z filtrami, paginacją i sortowaniem
5. **Mapowanie danych**: Konwersja wyników do FlashcardDto
6. **Zwrócenie odpowiedzi**: Format FlashcardListResponse

```
Client Request → API Route → Input Validation → Auth Check → FlashcardService → Supabase → Response
```

## 6. Względy bezpieczeństwa

- **Autoryzacja**: Wymagana aktywna sesja Supabase
- **Row Level Security (RLS)**: Automatyczne filtrowanie po user_id na poziomie bazy danych
- **Walidacja parametrów**: Zod schema zapobiega injection attacks
- **Rate limiting**: Rozważenie implementacji na poziomie middleware
- **Sanityzacja danych**: Automatyczna przez Supabase parametrized queries

```typescript
// Przykład walidacji autoryzacji
const { data: { user } } = await context.locals.supabase.auth.getUser();
if (!user) {
  return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
}
```

## 7. Obsługa błędów

| Błąd | Status | Opis | Przykład Response |
|------|--------|------|-------------------|
| Brak autoryzacji | 401 | Użytkownik nie jest zalogowany | `{"message": "Unauthorized", "code": "AUTH_REQUIRED"}` |
| Nieprawidłowe parametry | 400 | Błędne query parameters | `{"message": "Invalid parameters", "code": "VALIDATION_ERROR", "details": {...}}` |
| Błąd bazy danych | 500 | Problem z połączeniem/zapytaniem | `{"message": "Internal server error", "code": "DATABASE_ERROR"}` |
| Nieprawidłowy enum | 400 | Błędna wartość creation_type | `{"message": "Invalid creation_type", "code": "INVALID_ENUM"}` |

## 8. Rozważania dotyczące wydajności

- **Paginacja**: Ograniczenie maksymalnej wartości limit do 100 elementów
- **Indeksy bazy danych**: Wykorzystanie istniejących indeksów na user_id, source_text_id, creation_type
- **Sortowanie**: Optymalizacja dla domyślnego sortowania po created_at (desc)
- **Caching**: Rozważenie cache'owania dla często używanych zapytań
- **Query optimization**: Użycie select() z określonymi polami zamiast select('*')

## 9. Etapy wdrożenia

### Krok 1: Przygotowanie walidacji
- Utworzenie Zod schema dla FlashcardListQueryParams
- Implementacja helper funkcji do parsowania query parameters

### Krok 2: Implementacja FlashcardService 
- Utworzenie/rozszerzenie FlashcardService w `src/lib/services/`
- Implementacja metody `getFlashcards()` z obsługą filtrów i paginacji
- Dodanie obsługi błędów i logowania

### Krok 3: Utworzenie API route
- Utworzenie pliku `src/pages/api/flashcards.ts`
- Implementacja GET handler
- Dodanie middleware autoryzacji

### Krok 4: Implementacja logiki biznesowej
- Walidacja parametrów wejściowych
- Autoryzacja użytkownika
- Delegacja do FlashcardService
- Mapowanie odpowiedzi

### Krok 5: Obsługa błędów
- Implementacja try-catch blocks
- Dodanie szczegółowego error logging
- Zwracanie odpowiednich HTTP status codes

### Krok 6: Testowanie
- Unit testy dla FlashcardService
- Integration testy dla API endpoint
- E2E testy z różnymi scenariuszami

### Krok 7: Optymalizacja wydajności
- Weryfikacja wykorzystania indeksów
- Testowanie z dużymi zbiorami danych
- Implementacja monitoring wydajności

### Krok 8: Dokumentacja i finalizacja
- Aktualizacja dokumentacji API
- Dodanie przykładów użycia
- Code review i finalne testy

## 10. Struktura plików do utworzenia/modyfikacji

```
src/
├── pages/api/
│   └── flashcards.ts                    # Nowy plik - API endpoint
├── lib/services/
│   └── flashcard.service.ts             # Nowy/modyfikowany - logika biznesowa
├── lib/validation/
│   └── flashcard.schema.ts              # Nowy plik - Zod schemas
└── types.ts                             # Modyfikacja - dodanie brakujących typów
``` 