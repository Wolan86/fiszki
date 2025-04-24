# API Endpoint Implementation Plan: Create a new source text

## 1. Przegląd punktu końcowego
Endpoint umożliwia utworzenie nowego zasobu "source text" (tekstu źródłowego), który będzie podstawą do tworzenia fiszek. Zalogowany użytkownik może przesłać tekst źródłowy o długości 1000-10000 znaków, który zostanie zapisany w bazie danych i przypisany do jego konta.

## 2. Szczegóły żądania
- **Metoda HTTP**: POST
- **Struktura URL**: `/api/source-texts`
- **Parametry**:
  - Wymagane: Brak parametrów URL
  - Opcjonalne: Brak parametrów URL
- **Request Body**:
  ```json
  {
    "content": "string (1000-10000 znaków)"
  }
  ```
- **Nagłówki**:
  - `Authorization`: Bearer token JWT (dostarczany automatycznie przez Supabase)

## 3. Wykorzystywane typy
- `CreateSourceTextCommand` - Model danych wejściowych z klienta
- `SourceTextDto` - Model danych wyjściowych dla klienta
- `SourceText` - Model encji w bazie danych
- `ApiErrorResponse` - Model odpowiedzi z błędem

## 4. Szczegóły odpowiedzi
- **Sukces (201 Created)**:
  ```json
  {
    "id": "uuid",
    "user_id": "uuid",
    "content": "string",
    "created_at": "timestamp"
  }
  ```
- **Błąd walidacji (400 Bad Request)**:
  ```json
  {
    "message": "Validation error",
    "code": "VALIDATION_ERROR",
    "details": {
      "content": "Content must be between 1000 and 10000 characters"
    }
  }
  ```
- **Nieautoryzowany dostęp (401 Unauthorized)**:
  ```json
  {
    "message": "Unauthorized",
    "code": "UNAUTHORIZED"
  }
  ```

## 5. Przepływ danych
1. Żądanie przychodzi do endpointu `/api/source-texts` z metodą POST
2. Middleware Astro weryfikuje token JWT i udostępnia klienta Supabase przez `context.locals.supabase`
3. Dane wejściowe są walidowane przy użyciu Zod
4. Tworzona jest nowa encja w tabeli `source_texts` z ID użytkownika pobranym z kontekstu auth
5. Row Level Security (RLS) Supabase zapewnia automatyczne filtrowanie rekordów w bazie danych
6. Nowo utworzony rekord jest zwracany jako odpowiedź

## 6. Względy bezpieczeństwa
- **Uwierzytelnianie**: JWT token dostarczany przez Supabase Auth
- **Autoryzacja**: 
  - Użytkownik musi być zalogowany
  - Row Level Security (RLS) na poziomie bazy danych zapewnia, że użytkownik ma dostęp tylko do własnych danych
- **Walidacja danych**:
  - Sprawdzenie długości tekstu (min. 1000, max. 10000 znaków)
  - Sanityzacja danych wejściowych przed zapisem do bazy
  - Użycie Zod do walidacji typu i formatu danych

## 7. Obsługa błędów
- **400 Bad Request**: 
  - Brak wymaganego pola `content`
  - Tekst krótszy niż 1000 znaków
  - Tekst dłuższy niż 10000 znaków
- **401 Unauthorized**:
  - Brakujący token JWT
  - Nieprawidłowy token JWT
  - Wygasły token JWT
- **500 Internal Server Error**:
  - Niepowodzenie połączenia z bazą danych
  - Nieoczekiwane błędy serwera

## 8. Etapy wdrożenia

### 1. Utworzenie serwisu do obsługi źródeł tekstowych

### 2. Implementacja endpointu API

### 3. Aktualizacja dokumentacji API
