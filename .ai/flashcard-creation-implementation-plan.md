# API Endpoint Implementation Plan: Create Flashcard

## 1. Przegląd punktu końcowego

Endpoint służy do ręcznego tworzenia nowych fiszek przez zalogowanych użytkowników. Umożliwia tworzenie fiszek zarówno jako samodzielnych elementów, jak i powiązanych z konkretnym tekstem źródłowym. Wszystkie ręcznie utworzone fiszki mają domyślnie status zaakceptowane i typ tworzenia "manual".

## 2. Szczegóły żądania

- **Metoda HTTP:** POST
- **Struktura URL:** `/api/flashcards`
- **Content-Type:** `application/json`
- **Autoryzacja:** Wymagane uwierzytelnienie Supabase
- **Parametry:**
  - **Wymagane:**
    - `front_content` (string) - treść przedniej strony fiszki, nie może być pusta
    - `back_content` (string) - treść tylnej strony fiszki, nie może być pusta
  - **Opcjonalne:**
    - `source_text_id` (uuid) - identyfikator tekstu źródłowego do powiązania z fiszką

**Request Body:**

```json
{
  "front_content": "string (non-empty)",
  "back_content": "string (non-empty)",
  "source_text_id": "uuid (optional)"
}
```

## 3. Wykorzystywane typy

- **`CreateFlashcardCommand`** - typ wejściowy dla żądania
- **`FlashcardDto`** - typ wyjściowy dla odpowiedzi
- **`ApiErrorResponse`** - typ dla odpowiedzi błędów
- **`SupabaseClient`** - typ klienta bazy danych z kontekstu Astro

## 4. Szczegóły odpowiedzi

**Pomyślna odpowiedź (201 Created):**

```json
{
  "id": "uuid",
  "user_id": "uuid",
  "source_text_id": "uuid or null",
  "front_content": "string",
  "back_content": "string",
  "creation_type": "manual",
  "accepted": true,
  "generation_time_ms": null,
  "created_at": "timestamp",
  "updated_at": "timestamp"
}
```

**Odpowiedzi błędów:**

- **400 Bad Request** - nieprawidłowe dane wejściowe
- **401 Unauthorized** - brak autoryzacji
- **404 Not Found** - tekst źródłowy nie istnieje lub nie należy do użytkownika
- **500 Internal Server Error** - błędy serwera/bazy danych

## 5. Przepływ danych

1. **Odbieranie żądania** - walidacja nagłówków i parsowanie JSON
2. **Walidacja danych** - sprawdzenie schematu Zod i reguł biznesowych
3. **Uwierzytelnianie** - pobranie użytkownika z kontekstu Supabase
4. **Walidacja source_text_id** - sprawdzenie istnienia i własności (jeśli podane)
5. **Tworzenie fiszki** - wywołanie serwisu flashcard
6. **Zapis do bazy** - insert z automatycznymi wartościami domyślnymi
7. **Zwrócenie odpowiedzi** - pełny obiekt fiszki lub błąd

## 6. Względy bezpieczeństwa

- **Uwierzytelnianie:** Wykorzystanie `context.locals.supabase` do weryfikacji sesji
- **Autoryzacja:** Polityki RLS zapewniają izolację danych użytkowników
- **Walidacja własności:** Sprawdzenie czy `source_text_id` należy do uwierzytelnionego użytkownika
- **Walidacja danych:** Zod schema chroni przed nieprawidłowymi typami i formatami
- **SQL Injection:** Supabase client zapewnia parametryzowane zapytania
- **Rate limiting:** Rozważenie implementacji w middleware

## 7. Obsługa błędów

| Scenariusz               | Kod statusu | Odpowiedź                                                                                |
| ------------------------ | ----------- | ---------------------------------------------------------------------------------------- |
| Puste pole content       | 400         | `{"message": "Front content and back content are required", "code": "VALIDATION_ERROR"}` |
| Nieprawidłowy UUID       | 400         | `{"message": "Invalid source_text_id format", "code": "VALIDATION_ERROR"}`               |
| Brak autoryzacji         | 401         | `{"message": "Authentication required", "code": "UNAUTHORIZED"}`                         |
| Source text nie istnieje | 404         | `{"message": "Source text not found", "code": "NOT_FOUND"}`                              |
| Błąd bazy danych         | 500         | `{"message": "Internal server error", "code": "INTERNAL_ERROR"}`                         |

## 8. Rozważania dotyczące wydajności

- **Indeksy bazodanowych:** Wykorzystanie istniejących indeksów na `user_id` i `source_text_id`
- **Walidacja w jednym zapytaniu:** Sprawdzenie source_text w tym samym zapytaniu co insert
- **Minimalne payload:** Zwracanie tylko niezbędnych pól w odpowiedzi
- **Connection pooling:** Wykorzystanie wbudowanego poolingu Supabase
- **Cachowanie:** Rozważenie cache'owania metadanych source_text

## 9. Etapy wdrożenia

1. **Utworzenie serwisu flashcard** w `src/lib/services/flashcard.service.ts`

   - Implementacja funkcji `createFlashcard`
   - Walidacja biznesowa i obsługa błędów

2. **Stworzenie schematu walidacji Zod**

   - Schema dla `CreateFlashcardCommand`
   - Walidacja non-empty strings i UUID format

3. **Implementacja endpointu API** w `src/pages/api/flashcards.ts`

   - Handler POST z `export const prerender = false`
   - Integracja z serwisem i Supabase client

4. **Dodanie obsługi błędów**

   - Centralne przechwytywanie i logowanie błędów
   - Standaryzowane odpowiedzi błędów

5. **Testy jednostkowe**

   - Testy serwisu flashcard
   - Mocki Supabase client

6. **Testy integracyjne**

   - Testy endpointu z rzeczywistą bazą danych
   - Scenariusze pozytywne i negatywne

7. **Dokumentacja API**
   - Aktualizacja dokumentacji OpenAPI/Swagger
   - Przykłady użycia dla frontendu
