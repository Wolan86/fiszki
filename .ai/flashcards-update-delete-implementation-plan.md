# API Endpoint Implementation Plan: Update and Delete Flashcard

## 1. Przegląd punktów końcowych

### PUT /api/flashcards/{id} - Update Flashcard
Endpoint służy do aktualizacji istniejącej fiszki należącej do zalogowanego użytkownika. Pozwala na modyfikację treści przedniej i tylnej strony fiszki oraz statusu zaakceptowania. Tylko właściciel fiszki może ją aktualizować.

### DELETE /api/flashcards/{id} - Delete Flashcard  
Endpoint służy do usuwania konkretnej fiszki należącej do zalogowanego użytkownika. Po pomyślnym usunięciu zwraca status 204 bez treści. Tylko właściciel fiszki może ją usunąć.

## 2. Szczegóły żądań

### PUT /api/flashcards/{id}
- **Metoda HTTP:** PUT
- **Struktura URL:** `/api/flashcards/{id}`
- **Content-Type:** `application/json`
- **Autoryzacja:** Wymagane uwierzytelnienie Supabase
- **Parametry:**
  - **Wymagane:** `id` (UUID fiszki w ścieżce URL)
  - **Opcjonalne w body:**
    - `front_content` (string, 1-2000 znaków) - treść przedniej strony fiszki
    - `back_content` (string, 1-2000 znaków) - treść tylnej strony fiszki  
    - `accepted` (boolean) - status zaakceptowania fiszki

**Request Body:**
```json
{
  "front_content": "string (1-2000 chars, optional)",
  "back_content": "string (1-2000 chars, optional)",
  "accepted": "boolean (optional)"
}
```

### DELETE /api/flashcards/{id}
- **Metoda HTTP:** DELETE
- **Struktura URL:** `/api/flashcards/{id}`
- **Autoryzacja:** Wymagane uwierzytelnienie Supabase
- **Parametry:**
  - **Wymagane:** `id` (UUID fiszki w ścieżce URL)
- **Request Body:** Brak

## 3. Wykorzystywane typy

### Dla PUT endpoint:
- **`UpdateFlashcardCommand`** - typ wejściowy dla żądania aktualizacji (już istnieje w types.ts)
- **`FlashcardDto`** - typ wyjściowy dla odpowiedzi (już istnieje w types.ts)
- **`updateFlashcardSchema`** - schema walidacji Zod (już istnieje w flashcard.service.ts)

### Dla DELETE endpoint:
- **`FlashcardDto`** - typ dla sprawdzania właściciela (już istnieje w types.ts)

### Wspólne typy:
- **`ApiErrorResponse`** - typ dla odpowiedzi błędów (już istnieje w types.ts)
- **`SupabaseClient`** - typ klienta bazy danych z kontekstu Astro

## 4. Szczegóły odpowiedzi

### PUT /api/flashcards/{id}

**Pomyślna odpowiedź (200 OK):**
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "source_text_id": "uuid or null", 
  "front_content": "string",
  "back_content": "string",
  "creation_type": "string",
  "accepted": "boolean",
  "generation_time_ms": "number or null",
  "created_at": "timestamp", 
  "updated_at": "timestamp"
}
```

### DELETE /api/flashcards/{id}

**Pomyślna odpowiedź (204 No Content):**
- Brak treści w odpowiedzi

### Wspólne odpowiedzi błędów:
- **400 Bad Request** - nieprawidłowe dane wejściowe (tylko PUT)
- **401 Unauthorized** - brak autoryzacji  
- **404 Not Found** - fiszka nie istnieje lub nie należy do użytkownika
- **500 Internal Server Error** - błędy serwera/bazy danych

## 5. Przepływ danych

### PUT /api/flashcards/{id}
1. Walidacja parametru `id` w URL (format UUID)
2. Uwierzytelnienie użytkownika przez Supabase Auth
3. Parsowanie i walidacja body żądania z użyciem `updateFlashcardSchema`
4. Sprawdzenie, czy co najmniej jedno pole zostało podane do aktualizacji
5. Wywołanie `updateFlashcard` service z walidowanymi danymi
6. Service sprawdza istnienie fiszki i przynależność do użytkownika
7. Aktualizacja fiszki w bazie danych z nowym timestampem `updated_at`
8. Zwrócenie zaktualizowanej fiszki

### DELETE /api/flashcards/{id}
1. Walidacja parametru `id` w URL (format UUID)
2. Uwierzytelnienie użytkownika przez Supabase Auth
3. Wywołanie `deleteFlashcard` service (do utworzenia)
4. Service sprawdza istnienie fiszki i przynależność do użytkownika  
5. Usunięcie fiszki z bazy danych
6. Zwrócenie statusu 204 bez treści

## 6. Względy bezpieczeństwa

### Uwierzytelnienie
- Oba endpointy wymagają ważnej sesji Supabase
- Sprawdzanie JWT token w middleware
- Brak sesji skutkuje błędem 401 Unauthorized

### Autoryzacja  
- Row Level Security (RLS) w Supabase zapewnia dostęp tylko do własnych zasobów
- Dodatkowa walidacja `user_id` w service layer
- Sprawdzanie właściciela przed operacjami

### Walidacja danych
- **PUT:** Walidacja body przez `updateFlashcardSchema` (Zod)
- **Oba:** Walidacja formatu UUID dla parametru `id`
- **PUT:** Sprawdzenie, czy podano co najmniej jedno pole do aktualizacji
- Sanitizacja danych wejściowych przez Supabase client

### Zabezpieczenia przed atakami
- Parametryzowane zapytania w Supabase (ochrona przed SQL injection)
- Walidacja długości treści (max 2000 znaków)
- Rate limiting przez infrastructure

## 7. Obsługa błędów

### Scenariusze błędów PUT:

**400 Bad Request:**
- Nieprawidłowy format UUID dla `id`
- Błędy walidacji body (puste stringi, zbyt długie treści) 
- Brak jakichkolwiek pól do aktualizacji
- Nieprawidłowy format JSON

**401 Unauthorized:**
- Brak sesji użytkownika
- Nieprawidłowy lub wygasły token

**404 Not Found:**
- Fiszka o podanym ID nie istnieje
- Fiszka istnieje ale nie należy do użytkownika

**500 Internal Server Error:**
- Błędy bazy danych
- Nieoczekiwane błędy aplikacji

### Scenariusze błędów DELETE:

**400 Bad Request:**
- Nieprawidłowy format UUID dla `id`

**401 Unauthorized:** 
- Brak sesji użytkownika
- Nieprawidłowy lub wygasły token

**404 Not Found:**
- Fiszka o podanym ID nie istnieje  
- Fiszka istnieje ale nie należy do użytkownika

**500 Internal Server Error:**
- Błędy bazy danych
- Nieoczekiwane błędy aplikacji

### Logowanie błędów
- Wszystkie błędy logowane przez `ApiLogger.error()`
- Błędy bazy danych z pełnymi szczegółami  
- Błędy bezpieczeństwa z ograniczonymi informacjami
- Request timers dla monitorowania wydajności

## 8. Rozważania dotyczące wydajności

### Wydajność zapytań
- Indeksy na `user_id` i `id` w tabeli `flashcards` (już istnieją)
- Single query sprawdzający istnienie i przynależność
- Optymalne zapytania UPDATE/DELETE z filtrem na `user_id`

### Optymalizacje
- Używanie `.single()` dla pojedynczych rekordów
- Minimal select w sprawdzeniu właściciela  
- Early return przy błędach walidacji
- Reuse connection pool przez Supabase client

### Monitoring
- `RequestTimer` do mierzenia czasu odpowiedzi
- Logging statistics dla operacji bazy danych
- Error rate monitoring przez `ApiLogger`

## 9. Etapy wdrożenia

### Etap 1: Weryfikacja implementacji PUT endpoint
1. **Sprawdzenie obecnej implementacji PUT w `src/pages/api/flashcards/[id].ts`**
   - Endpoint już istnieje i jest funkcjonalny
   - Wykorzystuje istniejący `updateFlashcard` service
   - Implementuje proper error handling i validation

### Etap 2: Implementacja deleteFlashcard service  
1. **Dodanie funkcji `deleteFlashcard` do `src/lib/services/flashcard.service.ts`**
   - Sprawdzenie istnienia i przynależności fiszki
   - Usunięcie z bazy danych  
   - Proper error handling

### Etap 3: Implementacja DELETE endpoint
1. **Dodanie funkcji DELETE do `src/pages/api/flashcards/[id].ts`**
   - Validation parametru ID
   - Authentication check
   - Wywołanie `deleteFlashcard` service
   - Return 204 status z pustą odpowiedzią

### Etap 4: Dodanie deleteFlashcard do API service  
1. **Rozszerzenie `src/lib/services/api-service.ts`**
   - Dodanie `deleteFlashcard` function dla frontend
   - Proper error handling i typing

### Etap 5: Testowanie
1. **Test endpoints z różnymi scenariuszami:**
   - Poprawna aktualizacja wszystkich pól
   - Poprawna aktualizacja pojedynczych pól
   - Poprawne usuwanie fiszki
   - Error scenarios (404, 401, 400, 500)
   - Edge cases (empty updates, invalid UUIDs)

### Etap 6: Dokumentacja
1. **Update dokumentacji API jeśli potrzebne**
   - Sprawdzenie `docs/api-flashcards.md`
   - Dodanie przykładów użycia
   - Update error codes documentation

## 10. Szczegóły implementacji

### Struktura plików do modyfikacji:

1. **`src/lib/services/flashcard.service.ts`** - dodanie `deleteFlashcard` function
2. **`src/pages/api/flashcards/[id].ts`** - dodanie DELETE method (PUT już istnieje)  
3. **`src/lib/services/api-service.ts`** - dodanie `deleteFlashcard` client function

### Nowe funkcje do implementacji:

```typescript
// W flashcard.service.ts
export async function deleteFlashcard(
  supabase: DbClient,
  flashcardId: string, 
  userId: string
): Promise<void>

// W api-service.ts  
export const deleteFlashcard = async (id: string): Promise<void>
```

### Existing functions do weryfikacji:
- `updateFlashcard` service ✅ (już istnieje)
- `updateFlashcardSchema` ✅ (już istnieje) 
- PUT endpoint ✅ (już istnieje w [id].ts)
- `updateFlashcard` API client ✅ (już istnieje)

Implementacja będzie się koncentrować głównie na dodaniu DELETE funkcjonalności, podczas gdy PUT endpoint jest już w pełni funkcjonalny i zgodny ze specyfikacją. 