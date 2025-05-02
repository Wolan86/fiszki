# Specyfikacja Architektury Systemu Autentykacji

## 1. ARCHITEKTURA INTERFEJSU UŻYTKOWNIKA

### 1.1 Nowe strony oraz zmiany w istniejących stronach

#### Nowe strony
1. **Strona logowania** (`/src/pages/auth/login.astro`)
   - Statyczna strona z formularzem logowania
   - Komponent React do obsługi interaktywnego formularza logowania
   - Link do strony rejestracji
   - Link do strony odzyskiwania hasła
   - Interfejs w języku polskim zgodnie z wymaganiami UI

2. **Strona rejestracji** (`/src/pages/auth/register.astro`)
   - Statyczna strona z formularzem rejestracji
   - Komponent React do obsługi interaktywnego formularza rejestracji
   - Link do strony logowania
   - Interfejs w języku polskim zgodnie z wymaganiami UI

3. **Strona odzyskiwania hasła** (`/src/pages/auth/forgot-password.astro`)
   - Statyczna strona z formularzem do wprowadzenia adresu email
   - Komponent React do obsługi interaktywnego formularza odzyskiwania hasła
   - Link do strony logowania
   - Interfejs w języku polskim zgodnie z wymaganiami UI

4. **Strona resetowania hasła** (`/src/pages/auth/reset-password.astro`)
   - Statyczna strona z formularzem do wprowadzenia nowego hasła
   - Komponent React do obsługi interaktywnego formularza resetowania hasła
   - Walidacja poprawności tokenu resetowania hasła
   - Interfejs w języku polskim zgodnie z wymaganiami UI

#### Zmiany w istniejących stronach
1. **Layout główny** (`/src/layouts/Layout.astro`)
   - Dodanie komponentu nagłówka z przyciskiem logowania/wylogowania w prawym górnym rogu (zgodnie z US-015)
   - Dodanie stanu autentykacji dostępnego dla wszystkich stron
   - Zapewnienie, że elementy nawigacyjne (kreator fiszek, przeglądanie, uczenie się) są widoczne tylko dla zalogowanych użytkowników (zgodnie z US-014)

2. **Strona główna** (`/src/pages/index.astro`)
   - Dodanie zabezpieczenia przed dostępem dla niezalogowanych użytkowników
   - Dodanie przekierowania do strony logowania dla niezalogowanych użytkowników
   - Po zalogowaniu wyświetlenie zapisanych fiszek użytkownika (zgodnie z US-002)

3. **Strona kreatora** (`/src/pages/kreator.astro`)
   - Dodanie zabezpieczenia przed dostępem dla niezalogowanych użytkowników
   - Dodanie przekierowania do strony logowania dla niezalogowanych użytkowników

### 1.2 Nowe komponenty React

1. **Komponent formularza logowania** (`/src/components/auth/LoginForm.tsx`)
   - Interaktywny formularz z polami email i hasło
   - Obsługa walidacji danych wejściowych
   - Obsługa komunikatów błędów
   - Obsługa stanu ładowania
   - Obsługa przekierowania po udanym logowaniu
   - Link do strony odzyskiwania hasła
   - Implementacja zgodna z Shadcn/ui dla spójności wizualnej

2. **Komponent formularza rejestracji** (`/src/components/auth/RegisterForm.tsx`)
   - Interaktywny formularz z polami email, hasło i potwierdzenie hasła
   - Obsługa walidacji danych wejściowych
   - Obsługa komunikatów błędów
   - Obsługa stanu ładowania
   - Obsługa przekierowania po udanej rejestracji
   - Implementacja zgodna z Shadcn/ui dla spójności wizualnej

3. **Komponent formularza odzyskiwania hasła** (`/src/components/auth/ForgotPasswordForm.tsx`)
   - Interaktywny formularz z polem email
   - Obsługa walidacji danych wejściowych
   - Obsługa komunikatów błędów
   - Obsługa stanu ładowania
   - Komunikat o wysłaniu linku resetującego
   - Implementacja zgodna z Shadcn/ui dla spójności wizualnej

4. **Komponent formularza resetowania hasła** (`/src/components/auth/ResetPasswordForm.tsx`)
   - Interaktywny formularz z polami nowe hasło i potwierdzenie nowego hasła
   - Obsługa walidacji danych wejściowych
   - Obsługa komunikatów błędów
   - Obsługa stanu ładowania
   - Obsługa przekierowania po udanym resetowaniu hasła
   - Implementacja zgodna z Shadcn/ui dla spójności wizualnej

5. **Komponent przycisku wylogowania** (`/src/components/auth/LogoutButton.tsx`)
   - Przycisk wylogowania w nagłówku aplikacji (w prawym górnym rogu zgodnie z US-015)
   - Obsługa akcji wylogowania
   - Obsługa przekierowania po wylogowaniu
   - Implementacja zgodna z Shadcn/ui dla spójności wizualnej

6. **Komponent statusu uwierzytelnienia** (`/src/components/auth/AuthStatus.tsx`)
   - Wyświetlanie informacji o zalogowanym użytkowniku lub przycisku logowania
   - Zmiana wyglądu w zależności od stanu uwierzytelnienia
   - Implementacja zgodna z Shadcn/ui dla spójności wizualnej

### 1.3 Walidacja i komunikaty błędów

#### Walidacja formularzy
1. **Logowanie**
   - Email: Wymagany, poprawny format email
   - Hasło: Wymagane, minimalna długość 8 znaków

2. **Rejestracja**
   - Email: Wymagany, poprawny format email, unikalny w systemie
   - Hasło: Wymagane, minimalna długość 8 znaków, zawiera przynajmniej jedną cyfrę i jeden znak specjalny
   - Potwierdzenie hasła: Wymagane, identyczne z hasłem

3. **Odzyskiwanie hasła**
   - Email: Wymagany, poprawny format email, musi istnieć w systemie

4. **Resetowanie hasła**
   - Nowe hasło: Wymagane, minimalna długość 8 znaków, zawiera przynajmniej jedną cyfrę i jeden znak specjalny
   - Potwierdzenie nowego hasła: Wymagane, identyczne z nowym hasłem

#### Komunikaty błędów
1. **Logowanie**
   - Niepoprawny email lub hasło: "Niepoprawny email lub hasło. Spróbuj ponownie."
   - Konto zablokowane: "Zbyt wiele nieudanych prób logowania. Spróbuj ponownie później lub zresetuj hasło."

2. **Rejestracja**
   - Email już istnieje: "Użytkownik o podanym adresie email już istnieje. Zaloguj się lub zresetuj hasło."
   - Hasło za słabe: "Hasło powinno zawierać minimum 8 znaków, w tym przynajmniej jedną cyfrę i jeden znak specjalny."
   - Hasła nie pasują: "Podane hasła nie są identyczne. Spróbuj ponownie."

3. **Odzyskiwanie hasła**
   - Email nie istnieje: "Nie znaleziono użytkownika o podanym adresie email. Sprawdź poprawność danych."

4. **Resetowanie hasła**
   - Nieprawidłowy token: "Link do resetowania hasła wygasł lub jest nieprawidłowy. Spróbuj ponownie zresetować hasło."
   - Hasło za słabe: "Hasło powinno zawierać minimum 8 znaków, w tym przynajmniej jedną cyfrę i jeden znak specjalny."
   - Hasła nie pasują: "Podane hasła nie są identyczne. Spróbuj ponownie."

### 1.4 Obsługa najważniejszych scenariuszy

1. **Rejestracja nowego użytkownika** (US-001)
   - Użytkownik wypełnia formularz rejestracji z adresem email i hasłem
   - System waliduje dane (format email, złożoność hasła)
   - W przypadku błędów walidacji, wyświetlane są odpowiednie komunikaty
   - Po pomyślnej rejestracji, użytkownik jest automatycznie logowany
   - System przekierowuje użytkownika na stronę główną
   - Wyświetlany jest komunikat powitalny dla nowego użytkownika

2. **Logowanie istniejącego użytkownika** (US-002)
   - Użytkownik wypełnia formularz logowania z adresem email i hasłem
   - System waliduje dane
   - W przypadku błędów walidacji lub niepoprawnych danych, wyświetlane są odpowiednie komunikaty
   - Po pomyślnym logowaniu, system przekierowuje użytkownika na stronę główną
   - System wyświetla zapisane fiszki użytkownika

3. **Wylogowanie** (US-003)
   - Użytkownik klika przycisk wylogowania w nagłówku (w prawym górnym rogu)
   - System wylogowuje użytkownika
   - System przekierowuje użytkownika na stronę logowania
   - Dostęp do zasobów wymagających uwierzytelnienia jest blokowany

4. **Odzyskiwanie hasła** (US-012)
   - Użytkownik klika link "Zapomniałem hasła" na stronie logowania
   - Użytkownik wprowadza swój adres email
   - System wysyła link do resetowania hasła na podany adres
   - System wyświetla komunikat o wysłaniu linku
   - Użytkownik otwiera link z wiadomości email
   - Użytkownik wprowadza nowe hasło
   - System waliduje złożoność nowego hasła
   - Po pomyślnym zresetowaniu hasła, użytkownik jest przekierowywany na stronę logowania
   - Użytkownik może zalogować się z nowym hasłem

5. **Próba dostępu do zabezpieczonej strony bez logowania** (US-015)
   - Użytkownik próbuje otworzyć stronę wymagającą uwierzytelnienia
   - System sprawdza, czy użytkownik jest zalogowany
   - W przypadku braku uwierzytelnienia, system przekierowuje użytkownika na stronę logowania
   - Wyświetlany jest komunikat informujący o konieczności zalogowania się

## 2. LOGIKA BACKENDOWA

### 2.1 Struktura endpointów API

1. **Rejestracja** (`POST /api/auth/register`)
   - Parametry wejściowe:
     - email: string
     - password: string
     - confirmPassword: string
   - Odpowiedź:
     - status: 201 (Created)
     - body: { success: true, user: { id, email, createdAt } }
   - Błędy:
     - 400: Błędne dane wejściowe (walidacja)
     - 409: Konflikt (email już istnieje)
     - 500: Błąd serwera

2. **Logowanie** (`POST /api/auth/login`)
   - Parametry wejściowe:
     - email: string
     - password: string
   - Odpowiedź:
     - status: 200 (OK)
     - body: { success: true, user: { id, email } }
     - cookies: session cookie (HttpOnly, Secure, SameSite=Strict)
   - Błędy:
     - 400: Błędne dane wejściowe (walidacja)
     - 401: Niepoprawne dane logowania
     - 500: Błąd serwera

3. **Wylogowanie** (`POST /api/auth/logout`)
   - Parametry wejściowe: brak
   - Odpowiedź:
     - status: 200 (OK)
     - body: { success: true }
     - cookies: usunięcie session cookie
   - Błędy:
     - 500: Błąd serwera

4. **Odzyskiwanie hasła** (`POST /api/auth/forgot-password`)
   - Parametry wejściowe:
     - email: string
   - Odpowiedź:
     - status: 200 (OK)
     - body: { success: true }
   - Błędy:
     - 400: Błędne dane wejściowe (walidacja)
     - 500: Błąd serwera

5. **Resetowanie hasła** (`POST /api/auth/reset-password`)
   - Parametry wejściowe:
     - token: string
     - password: string
     - confirmPassword: string
   - Odpowiedź:
     - status: 200 (OK)
     - body: { success: true }
   - Błędy:
     - 400: Błędne dane wejściowe (walidacja)
     - 401: Nieprawidłowy token
     - 500: Błąd serwera

6. **Sprawdzenie stanu sesji** (`GET /api/auth/session`)
   - Parametry wejściowe: brak
   - Odpowiedź:
     - status: 200 (OK)
     - body: { authenticated: boolean, user?: { id, email } }
   - Błędy:
     - 500: Błąd serwera

### 2.2 Mechanizm walidacji danych wejściowych

1. **Serwisy walidacji** (`/src/lib/validation/auth.ts`)
   - Implementacja walidacji danych dla wszystkich formularzy uwierzytelniania
   - Funkcje walidacji dla poszczególnych pól i formularzy
   - Zwracanie błędów walidacji w ustrukturyzowanym formacie
   - Sprawdzanie złożoności hasła (minimum 8 znaków, przynajmniej jedna cyfra i jeden znak specjalny)

2. **Middleware walidacji** (`/src/pages/api/auth/[...].ts`)
   - Walidacja danych wejściowych przed przetwarzaniem żądania
   - W przypadku błędów walidacji, zwracanie odpowiednich komunikatów błędów
   - Konwersja danych wejściowych do odpowiednich typów

### 2.3 Obsługa wyjątków

1. **Klasy błędów** (`/src/lib/errors/auth-errors.ts`)
   - Definicja specyficznych klas błędów dla modułu uwierzytelniania
   - Obsługa szczegółowych przypadków błędów
   - Implementacja błędów dopasowanych do komunikatów w języku polskim

2. **Middleware obsługi błędów** (`/src/pages/api/auth/[...].ts`)
   - Przechwytywanie i logowanie błędów
   - Konwersja błędów wewnętrznych na odpowiednie odpowiedzi HTTP
   - Ukrywanie wrażliwych szczegółów błędów przed użytkownikiem
   - Dostarczanie przyjaznych dla użytkownika komunikatów błędów w języku polskim

### 2.4 Aktualizacja sposobu renderowania stron server-side

1. **Middleware Astro** (`/src/middleware/index.ts`)
   - Rozszerzenie istniejącego middleware o obsługę sesji
   - Dodanie autoryzacji do każdego żądania
   - Przechowywanie informacji o sesji w kontekście Astro
   - Zapewnienie, że użytkownicy niezalogowani nie mają dostępu do funkcjonalności systemu (zgodnie z US-015)

2. **Definicja kontekstu uwierzytelnienia** (`/src/middleware/auth.ts`)
   - Odczytywanie sesji z ciasteczek
   - Weryfikacja ważności sesji
   - Dodawanie informacji o uwierzytelnieniu do kontekstu lokalnego Astro

3. **Zabezpieczenie dostępu do stron** (`/src/pages/*.astro`)
   - Implementacja weryfikacji uwierzytelnienia na poziomie stron
   - Przekierowanie niezalogowanych użytkowników do strony logowania
   - Udostępnianie informacji o użytkowniku dla komponentów na stronie
   - Wyświetlanie komunikatu o konieczności zalogowania się

## 3. SYSTEM AUTENTYKACJI

### 3.1 Wykorzystanie Supabase Auth

1. **Konfiguracja Supabase Auth** (`/src/db/supabase.server.ts`)
   - Rozszerzenie istniejącego klienta Supabase o obsługę autentykacji
   - Konfiguracja opcji sesji i cookies
   - Wykorzystanie wbudowanej autentykacji Supabase zgodnie z tech-stack.md

2. **Serwisy autentykacji** (`/src/lib/auth/auth-service.ts`)
   - Implementacja usługi zarządzającej uwierzytelnianiem
   - Interfejs dla operacji uwierzytelniania (rejestracja, logowanie, wylogowanie)
   - Obsługa zarządzania sesją
   - Brak zewnętrznych serwisów logowania (Google, GitHub) zgodnie z US-015

3. **Implementacja obsługi sesji** (`/src/lib/auth/session.ts`)
   - Wykorzystanie Astro session API do zarządzania sesją (astro.config.mjs ma włączoną obsługę sesji)
   - Przechowywanie informacji o sesji w kontekście Astro
   - Generowanie i weryfikacja tokenów sesji

### 3.2 Implementacja funkcji uwierzytelniania

1. **Rejestracja użytkownika** (`/src/lib/auth/auth-service.ts`)
   - Weryfikacja unikalności adresu email
   - Hashowanie hasła
   - Tworzenie nowego użytkownika w Supabase Auth
   - Ustanowienie sesji po pomyślnej rejestracji
   - Wyświetlanie komunikatu powitalnego po rejestracji (zgodnie z US-001)

2. **Logowanie użytkownika** (`/src/lib/auth/auth-service.ts`)
   - Weryfikacja poprawności danych logowania
   - Obsługa limitów prób logowania
   - Ustanowienie sesji po pomyślnym logowaniu
   - Przekierowanie na stronę główną z listą fiszek (zgodnie z US-002)

3. **Wylogowanie użytkownika** (`/src/lib/auth/auth-service.ts`)
   - Unieważnienie sesji
   - Usunięcie cookies sesji
   - Przekierowanie na stronę logowania (zgodnie z US-003)

4. **Odzyskiwanie hasła** (`/src/lib/auth/auth-service.ts`)
   - Weryfikacja istnienia użytkownika o podanym adresie email
   - Generowanie tokenu resetowania hasła
   - Wysyłanie emaila z linkiem do resetowania hasła
   - Obsługa ograniczeń czasowych dla tokenów
   - Implementacja zgodna z US-012

5. **Resetowanie hasła** (`/src/lib/auth/auth-service.ts`)
   - Weryfikacja ważności tokenu resetowania hasła
   - Aktualizacja hasła użytkownika
   - Unieważnienie wszystkich aktywnych sesji użytkownika
   - Walidacja złożoności nowego hasła (zgodnie z US-012)

### 3.3 Zabezpieczenia i najlepsze praktyki

1. **Bezpieczeństwo sesji**
   - Wykorzystanie bezpiecznych cookies (HttpOnly, Secure, SameSite=Strict)
   - Rotacja identyfikatorów sesji po pomyślnym logowaniu
   - Wygasanie sesji po określonym czasie nieaktywności

2. **Ochrona przed atakami**
   - Implementacja limitu prób logowania (rate limiting)
   - Ochrona przed atakami brute force
   - Generowanie silnych, losowych tokenów dla operacji resetowania hasła
   - Walidacja danych wejściowych na wszystkich poziomach

3. **Monitorowanie i audyt**
   - Logowanie zdarzeń związanych z uwierzytelnianiem (logowanie, wylogowanie, resetowanie hasła)
   - Przechowywanie logów bezpieczeństwa
   - Możliwość wykrywania nieautoryzowanych prób dostępu 