# API Endpoint Implementation Plan: Get Flashcards for Learning

## 1. Przegląd punktu końcowego

Endpoint `GET /api/flashcards/learning` służy do pobierania fiszek w losowej kolejności dla celów nauki. Jest to specjalistyczny endpoint zoptymalizowany pod kątem sesji nauki, który zwraca fiszki w losowym porządku, umożliwiając opcjonalne filtrowanie według tekstu źródłowego oraz ograniczanie liczby wyników.

**Kluczowe funkcjonalności:**

- Pobieranie fiszek należących do uwierzytelnionego użytkownika
- Losowe uporządkowanie wyników dla lepszego doświadczenia nauki
- Opcjonalne filtrowanie według source_text_id
- Ograniczanie liczby wyników (domyślnie 10, maksymalnie 50)
- Zwracanie tylko zaakceptowanych fiszek (accepted = true)

## 2. Szczegóły żądania

- **Metoda HTTP**: GET
- **Struktura URL**: `/api/flashcards/learning`
- **Parametry zapytania**:
  - **Opcjonalne**:
    - `limit` (number): Maksymalna liczba fiszek do zwrócenia (domyślnie: 10, maksymalnie: 50)
    - `source_text_id` (UUID): Identyfikator tekstu źródłowego do filtrowania
- **Request Body**: Brak (metoda GET)
- **Headers wymagane**:
  - Cookie z sesją Supabase (automatycznie obsługiwane przez middleware)

## 3. Wykorzystywane typy

### Istniejące typy (z src/types.ts):

- `FlashcardLearningQueryParams` - parametry zapytania
- `FlashcardLearningResponse` - struktura odpowiedzi
- `FlashcardDto` - pojedyncza fiszka w odpowiedzi

### Nowe schematy walidacji (do dodania w flashcard.service.ts):

```typescript
export const flashcardLearningQuerySchema = z.object({
  limit: z.coerce
    .number()
    .int("Limit must be an integer")
    .min(1, "Limit must be at least 1")
    .max(50, "Limit cannot exceed 50")
    .default(10),
  source_text_id: z.string().uuid("Invalid source_text_id format").optional(),
});
```

## 4. Szczegóły odpowiedzi

### Struktura odpowiedzi sukces (200 OK):

```json
{
  "data": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "source_text_id": "uuid or null",
      "front_content": "string",
      "back_content": "string",
      "creation_type": "ai_generated|ai_edited|manual",
      "accepted": true,
      "generation_time_ms": "number or null",
      "created_at": "timestamp",
      "updated_at": "timestamp"
    }
  ],
  "total": "number"
}
```

### Struktura odpowiedzi błąd:

```json
{
  "message": "string",
  "code": "string",
  "details": {}
}
```

### Kody statusu:

- **200 OK**: Fiszki pobrane pomyślnie
- **400 Bad Request**: Nieprawidłowe parametry zapytania
- **401 Unauthorized**: Brak autoryzacji
- **500 Internal Server Error**: Błąd serwera/bazy danych

## 5. Przepływ danych

1. **Uwierzytelnianie**: Middleware Astro sprawdza sesję Supabase z cookies
2. **Walidacja parametrów**: Zod schema waliduje query parameters
3. **Autoryzacja**: Sprawdzenie, czy użytkownik ma sesję
4. **Opcjonalna walidacja source_text_id**: Jeśli podano, sprawdzenie czy tekst należy do użytkownika
5. **Query do bazy danych**:
   - Filter: `user_id = current_user` AND `accepted = true`
   - Optional filter: `source_text_id = provided_id`
   - Random order: `ORDER BY RANDOM()`
   - Limit: `LIMIT provided_limit`
6. **Count query**: Osobne zapytanie dla total count (bez LIMIT)
7. **Zwracanie odpowiedzi**: JSON z data array i total count

### Interakcje z bazą danych:

- **Tabela główna**: `flashcards`
- **Opcjonalna walidacja**: `source_texts` (jeśli podano source_text_id)
- **RLS (Row Level Security)**: Automatyczne filtrowanie według user_id
- **Indeksy wykorzystywane**:
  - `idx_flashcards_user_id` (dla filtrowania użytkownika)
  - `idx_flashcards_source_text_id` (dla opcjonalnego filtra)

## 6. Względy bezpieczeństwa

### Uwierzytelnianie:

- **Metoda**: Supabase session cookies
- **Middleware**: Astro middleware sprawdza `supabase.auth.getSession()`
- **Kod błędu**: 401 Unauthorized dla niezalogowanych użytkowników

### Autoryzacja:

- **Row Level Security (RLS)**: Automatyczne filtrowanie rekordów według user_id
- **Source text validation**: Sprawdzenie czy podany source_text_id należy do użytkownika
- **Zasada**: Użytkownik może pobierać tylko swoje fiszki

### Walidacja danych:

- **Query parameters**: Walidacja przez Zod schema
- **UUID validation**: source_text_id musi być prawidłowym UUID
- **Range validation**: limit w zakresie 1-50
- **Type coercion**: Automatyczna konwersja stringów na liczby

### Ochrona przed atakami:

- **SQL Injection**: Supabase ORM automatycznie zabezpiecza przed SQL injection
- **Rate limiting**: Brak specjalnej implementacji (można dodać w przyszłości)
- **CORS**: Konfiguracja przez Astro

## 7. Obsługa błędów

### Scenariusze błędów i kody odpowiedzi:

1. **401 Unauthorized**:

   - **Przyczyna**: Brak sesji użytkownika
   - **Wiadomość**: "Authentication required"
   - **Obsługa**: `ApiErrorHandler.unauthorizedError()`

2. **400 Bad Request**:

   - **Przyczyna**: Nieprawidłowe parametry zapytania
   - **Przykłady**:
     - limit < 1 lub > 50
     - source_text_id nie jest prawidłowym UUID
   - **Wiadomość**: Szczegóły z Zod validation
   - **Obsługa**: `ApiErrorHandler.validationError(validationError)`

3. **404 Not Found**:

   - **Przyczyna**: Podany source_text_id nie istnieje lub nie należy do użytkownika
   - **Wiadomość**: "Source text not found"
   - **Obsługa**: Custom error handler

4. **500 Internal Server Error**:
   - **Przyczyna**: Błędy bazy danych lub nieoczekiwane błędy
   - **Obsługa**: `ApiErrorHandler.databaseError()` lub `ApiErrorHandler.internalServerError()`
   - **Logging**: Szczegółowe logowanie błędów dla debugowania

### Strategia logowania:

- **Info level**: Udane żądania z podstawowymi statystykami
- **Debug level**: Szczegóły żądań dla deweloperów
- **Error level**: Wszystkie błędy z pełnym stacktrace
- **Performance**: RequestTimer dla monitorowania wydajności

## 8. Rozważania dotyczące wydajności

### Optymalizacje bazy danych:

- **Indeksy**: Wykorzystanie istniejących indeksów na user_id i source_text_id
- **Random ordering**: Użycie `ORDER BY RANDOM()` w PostgreSQL
- **Limit results**: Ograniczenie maksymalnego limitu do 50 fiszek
- **Separate count query**: Osobne zapytanie dla total count bez RANDOM() ordering

### Potencjalne wąskie gardła:

- **Random ordering**: `ORDER BY RANDOM()` może być kosztowne dla dużych tabel
- **Count query**: Dodatkowe zapytanie dla total count

### Strategie optymalizacji:

- **Caching**: Możliwość dodania cache'owania dla popularnych zapytań
- **Connection pooling**: Supabase automatycznie zarządza pool'em połączeń
- **Pagination**: Ograniczenie maksymalnego limitu zapobiega przeciążeniu

### Monitoring:

- **RequestTimer**: Pomiar czasu odpowiedzi endpointu
- **Query performance**: Logowanie długich zapytań
- **Error tracking**: Monitorowanie częstotliwości błędów

## 9. Etapy wdrożenia

### Krok 1: Rozszerzenie flashcard.service.ts

- Dodanie schematu walidacji `flashcardLearningQuerySchema`
- Implementacja funkcji `getFlashcardsForLearning()` z random ordering
- Dodanie obsługi opcjonalnej walidacji source_text_id

### Krok 2: Stworzenie endpointu /api/flashcards/learning.ts

- Implementacja handler'a GET z uwierzytelnianiem
- Walidacja parametrów zapytania
- Integracja z flashcard service
- Obsługa błędów zgodnie z wzorcem

### Krok 3: Testowanie funkcjonalności

- Unit testy dla service layer
- Integration testy dla endpointu
- Testy walidacji parametrów
- Testy bezpieczeństwa (autoryzacja)

### Krok 4: Optymalizacja wydajności

- Testowanie wydajności z różnymi rozmiarami danych
- Analiza wykonania zapytań SQL
- Ewentualne dostrojenie indeksów

### Krok 5: Dokumentacja i monitorowanie

- Aktualizacja dokumentacji API
- Dodanie logowania i monitorowania
- Deployment na środowisko testowe

### Szczegółowe zadania implementacyjne:

#### Zadanie 1.1: Rozszerzenie flashcard.service.ts

```typescript
// Dodać nowy schema walidacji
export const flashcardLearningQuerySchema = z.object({...});

// Dodać nową funkcję service
export async function getFlashcardsForLearning(
  supabase: DbClient,
  queryParams: FlashcardLearningQueryParams,
  userId: string
): Promise<FlashcardLearningResponse>
```

#### Zadanie 2.1: Stworzenie learning.ts endpoint

```typescript
// Struktura: src/pages/api/flashcards/learning.ts
export const prerender = false;
export async function GET({ request, cookies }: APIContext) {
  // Implementacja zgodna z wzorcem z flashcards.ts
}
```

#### Zadanie 3.1: Testy jednostkowe

- Test dla `flashcardLearningQuerySchema`
- Test dla `getFlashcardsForLearning` service
- Test scenarios: empty results, filtered results, random ordering

#### Zadanie 3.2: Testy integracyjne

- Test complete API flow
- Test authentication/authorization
- Test error scenarios
- Test performance with large datasets
