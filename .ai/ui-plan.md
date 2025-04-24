# Architektura UI dla Fiszki AI

## 1. Przegląd struktury UI

Architektura UI aplikacji Fiszki AI składa się z trzech głównych sekcji funkcjonalnych: Kreator fiszek, Przeglądanie i Uczenie się, dostępnych po zalogowaniu. Przed zalogowaniem użytkownik ma dostęp do strony głównej oraz widoków autentykacji. Interfejs jest minimalistyczny, ciepły i neutralny, z naciskiem na prostotę obsługi i efektywność. Struktura aplikacji jest zorganizowana wokół zarządzania tekstami źródłowymi i fiszkami, umożliwiając użytkownikom szybkie generowanie fiszek za pomocą AI, ich przeglądanie, edycję oraz naukę.

## 2. Lista widoków

### 2.1. Strona główna (Landing Page)
- **Ścieżka widoku**: `/`
- **Główny cel**: Wprowadzenie do aplikacji i zachęcenie użytkownika do rejestracji/logowania
- **Kluczowe informacje**: Opis aplikacji, korzyści, przykłady zastosowania
- **Kluczowe komponenty**:
  - Sekcja powitalna z nagłówkiem i podtytułem
  - Przyciski CTA do rejestracji i logowania
  - Sekcja prezentująca korzyści z używania aplikacji
  - Przykłady zastosowania
- **UX, dostępność i bezpieczeństwo**:
  - Responsywny design dla różnych urządzeń
  - Czytelne teksty i kontrastowe kolory
  - Intuicyjne przyciski CTA

### 2.2. Rejestracja
- **Ścieżka widoku**: `/rejestracja`
- **Główny cel**: Umożliwienie utworzenia nowego konta
- **Kluczowe informacje**: Formularz rejestracji
- **Kluczowe komponenty**:
  - Formularz z polami: email, hasło, potwierdzenie hasła
  - Przycisk "Zarejestruj się"
  - Link do logowania
- **UX, dostępność i bezpieczeństwo**:
  - Walidacja formularza w czasie rzeczywistym
  - Wskaźnik siły hasła
  - Komunikaty błędów przy polach formularza
  - Zabezpieczenie przed atakami typu CSRF

### 2.3. Logowanie
- **Ścieżka widoku**: `/logowanie`
- **Główny cel**: Umożliwienie zalogowania się do aplikacji
- **Kluczowe informacje**: Formularz logowania
- **Kluczowe komponenty**:
  - Formularz z polami: email, hasło
  - Przycisk "Zaloguj się"
  - Link do resetowania hasła
  - Link do rejestracji
- **UX, dostępność i bezpieczeństwo**:
  - Możliwość zapamiętania użytkownika
  - Czytelne komunikaty błędów
  - Limity prób logowania (zabezpieczenie przed atakami brute force)

### 2.4. Odzyskiwanie hasła
- **Ścieżka widoku**: `/reset-hasla`
- **Główny cel**: Umożliwienie resetowania zapomnianego hasła
- **Kluczowe informacje**: Instrukcje resetowania hasła
- **Kluczowe komponenty**:
  - Formularz z polem na adres email
  - Przycisk "Wyślij link resetujący"
  - Potwierdzenie wysłania linku
- **UX, dostępność i bezpieczeństwo**:
  - Proste instrukcje krok po kroku
  - Zabezpieczenie przed wyciekiem informacji (brak informacji czy email istnieje w bazie)

### 2.5. Dashboard
- **Ścieżka widoku**: `/dashboard`
- **Główny cel**: Zapewnienie szybkiego dostępu do głównych funkcji aplikacji
- **Kluczowe informacje**: Podsumowanie aktywności użytkownika
- **Kluczowe komponenty**:
  - Podsumowanie statystyk (liczba fiszek, tekstów źródłowych)
  - Karty z szybkim dostępem do głównych funkcji
  - Ostatnie aktywności
- **UX, dostępność i bezpieczeństwo**:
  - Przejrzysty układ z wizualizacją danych
  - Szybki dostęp do najczęściej używanych funkcji

### 2.6. Kreator fiszek
- **Ścieżka widoku**: `/kreator`
- **Główny cel**: Umożliwienie wprowadzenia tekstu źródłowego i generowania fiszek
- **Kluczowe informacje**: Pole tekstowe, informacje o limitach
- **Kluczowe komponenty**:
  - Pole tekstowe na tekst źródłowy
  - Licznik słów/znaków
  - Przycisk "Generuj fiszki"
  - Wskaźnik postępu podczas generowania
- **UX, dostępność i bezpieczeństwo**:
  - Autosave wprowadzanego tekstu
  - Wyraźne informacje o limitach
  - Informacja o czasie oczekiwania na generowanie

### 2.7. Przegląd wygenerowanych fiszek
- **Ścieżka widoku**: `/kreator/przeglad`
- **Główny cel**: Umożliwienie akceptacji/odrzucania wygenerowanych fiszek
- **Kluczowe informacje**: Wygenerowane fiszki, przyciski akcji
- **Kluczowe komponenty**:
  - Karty reprezentujące fiszki (z możliwością odwracania)
  - Przyciski akcji dla każdej fiszki (akceptuj/odrzuć/regeneruj)
  - Postęp (np. "3 z 10 fiszek zaakceptowanych")
  - Przycisk "Zapisz zaakceptowane fiszki"
- **UX, dostępność i bezpieczeństwo**:
  - Animacja odwracania fiszki
  - Wyraźne rozróżnienie między zaakceptowanymi i odrzuconymi fiszkami
  - Możliwość cofnięcia decyzji przed finalnym zapisaniem

### 2.8. Manualne tworzenie fiszek
- **Ścieżka widoku**: `/fiszki/nowa`
- **Główny cel**: Umożliwienie ręcznego tworzenia fiszek
- **Kluczowe informacje**: Formularz tworzenia fiszki
- **Kluczowe komponenty**:
  - Formularz z polami na przednią i tylną stronę fiszki
  - Dropdown do wyboru tekstu źródłowego (opcjonalnie)
  - Przycisk "Zapisz fiszkę"
  - Podgląd fiszki
- **UX, dostępność i bezpieczeństwo**:
  - Walidacja niepustych pól
  - Autosave formularza
  - Możliwość podglądu fiszki przed zapisaniem

### 2.9. Lista tekstów źródłowych
- **Ścieżka widoku**: `/teksty`
- **Główny cel**: Wyświetlenie wszystkich tekstów źródłowych użytkownika
- **Kluczowe informacje**: Lista tekstów, opcje zarządzania
- **Kluczowe komponenty**:
  - Tabela/lista tekstów źródłowych
  - Przyciski akcji (podgląd, edytuj, usuń, generuj fiszki)
  - Wyszukiwarka i filtry
  - Paginacja
- **UX, dostępność i bezpieczeństwo**:
  - Sortowanie według różnych kryteriów
  - Potwierdzenie przed usunięciem
  - Wskaźnik liczby fiszek powiązanych z tekstem

### 2.10. Szczegóły tekstu źródłowego
- **Ścieżka widoku**: `/teksty/{id}`
- **Główny cel**: Wyświetlenie konkretnego tekstu źródłowego i powiązanych fiszek
- **Kluczowe informacje**: Pełna treść tekstu, lista powiązanych fiszek
- **Kluczowe komponenty**:
  - Wyświetlenie pełnej treści tekstu
  - Lista powiązanych fiszek
  - Przyciski akcji (edytuj, usuń, generuj fiszki)
- **UX, dostępność i bezpieczeństwo**:
  - Możliwość zaznaczania fragmentów tekstu
  - Responsywne wyświetlanie długiego tekstu

### 2.11. Lista fiszek
- **Ścieżka widoku**: `/fiszki`
- **Główny cel**: Wyświetlenie wszystkich fiszek użytkownika
- **Kluczowe informacje**: Lista fiszek, opcje zarządzania
- **Kluczowe komponenty**:
  - Tabela/lista fiszek (przód, tył, źródło)
  - Przyciski akcji (podgląd, edytuj, usuń)
  - Filtry (według tekstu źródłowego, daty utworzenia, typu)
  - Paginacja
- **UX, dostępność i bezpieczeństwo**:
  - Możliwość masowego zaznaczania i usuwania
  - Podgląd fiszki bez przechodzenia do osobnego widoku
  - Wyraźne oznaczenie typu fiszki (AI vs. manualna)

### 2.12. Edycja fiszki
- **Ścieżka widoku**: `/fiszki/{id}/edycja`
- **Główny cel**: Umożliwienie edycji istniejącej fiszki
- **Kluczowe informacje**: Formularz edycji fiszki
- **Kluczowe komponenty**:
  - Formularz z obecną treścią fiszki (przód/tył)
  - Przycisk "Zapisz zmiany"
  - Przycisk "Anuluj"
  - Podgląd fiszki
- **UX, dostępność i bezpieczeństwo**:
  - Historia zmian
  - Autosave formularza
  - Możliwość przywrócenia poprzedniej wersji

### 2.13. Tryb nauki
- **Ścieżka widoku**: `/nauka`
- **Główny cel**: Umożliwienie nauki z wykorzystaniem fiszek
- **Kluczowe informacje**: Fiszka, opcje nawigacji
- **Kluczowe komponenty**:
  - Interaktywna karta fiszki (przód/tył)
  - Przyciski nawigacji (następna, poprzednia)
  - Przycisk odwrócenia fiszki
  - Wskaźnik postępu
- **UX, dostępność i bezpieczeństwo**:
  - Animacja odwracania fiszki
  - Skróty klawiaturowe (strzałki, spacja)
  - Tryb pełnoekranowy
  - Zapamiętywanie postępu sesji

### 2.14. Ustawienia konta
- **Ścieżka widoku**: `/ustawienia`
- **Główny cel**: Umożliwienie zarządzania kontem użytkownika
- **Kluczowe informacje**: Dane konta, opcje zarządzania
- **Kluczowe komponenty**:
  - Formularz zmiany hasła
  - Opcja usunięcia konta
  - Preferencje użytkownika
- **UX, dostępność i bezpieczeństwo**:
  - Potwierdzenie przed usunięciem konta
  - Wymaganie hasła przy ważnych zmianach

## 3. Mapa podróży użytkownika

### 3.1. Główny przepływ: Generowanie i nauka z fiszek

1. **Rejestracja i logowanie**
   - Użytkownik wchodzi na stronę główną
   - Użytkownik rejestruje się (lub loguje, jeśli ma już konto)
   - System przekierowuje użytkownika do dashboardu

2. **Generowanie fiszek**
   - Użytkownik wybiera "Kreator fiszek" z głównej nawigacji
   - Użytkownik wprowadza tekst źródłowy
   - Użytkownik klika "Generuj fiszki"
   - System generuje fiszki i pokazuje wskaźnik postępu
   - System przekierowuje użytkownika do przeglądu wygenerowanych fiszek

3. **Przegląd i akceptacja fiszek**
   - Użytkownik przegląda wygenerowane fiszki
   - Użytkownik akceptuje przydatne fiszki i odrzuca nieprzydatne
   - Użytkownik może wygenerować nowe fiszki w miejsce odrzuconych
   - Użytkownik klika "Zapisz zaakceptowane fiszki"
   - System zapisuje fiszki i przekierowuje do dashboardu lub listy fiszek

4. **Nauka z fiszek**
   - Użytkownik wybiera "Uczenie się" z głównej nawigacji
   - System wyświetla fiszki w trybie nauki
   - Użytkownik przegląda fiszki, odwracając je i przechodząc między nimi
   - Użytkownik kończy sesję nauki i wraca do dashboardu

### 3.2. Alternatywny przepływ: Manualne tworzenie fiszek

1. **Manualne tworzenie**
   - Użytkownik wybiera "Fiszki" > "Nowa fiszka" z nawigacji
   - Użytkownik wypełnia formularz (przód i tył fiszki)
   - Użytkownik zapisuje fiszkę
   - System zapisuje fiszkę i przekierowuje do listy fiszek

### 3.3. Alternatywny przepływ: Zarządzanie tekstami źródłowymi

1. **Przeglądanie tekstów**
   - Użytkownik wybiera "Teksty" z głównej nawigacji
   - System wyświetla listę tekstów źródłowych
   - Użytkownik może przeglądać, edytować lub usuwać teksty
   - Użytkownik może generować fiszki z wybranego tekstu

## 4. Układ i struktura nawigacji

### 4.1. Główna nawigacja (po zalogowaniu)

Główny pasek nawigacyjny zawiera trzy główne sekcje zgodnie z PRD:

- **Kreator fiszek** (dropdown):
  - Nowy tekst źródłowy
  - Manualne tworzenie fiszki

- **Przeglądanie** (dropdown):
  - Teksty źródłowe
  - Fiszki

- **Uczenie się**

Dodatkowo, w prawym górnym rogu znajdują się:
- Avatar użytkownika (dropdown):
  - Profil
  - Ustawienia
  - Wyloguj

### 4.2. Nawigacja kontekstowa

W zależności od aktualnego widoku, pojawia się dodatkowa nawigacja kontekstowa:

- **W widoku tekstu źródłowego**:
  - Przyciski: Edytuj, Usuń, Generuj fiszki
  - Zakładki: Szczegóły, Powiązane fiszki

- **W widoku listy fiszek**:
  - Przyciski: Nowa fiszka, Usuń zaznaczone, Rozpocznij naukę
  - Filtry i opcje sortowania

- **W trybie nauki**:
  - Przyciski: Poprzednia, Następna, Odwróć, Zakończ sesję
  - Wskaźnik postępu

### 4.3. Nawigacja mobilna

Na urządzeniach mobilnych główna nawigacja jest zwijana do przycisku "hamburger", który po kliknięciu rozwija menu z tymi samymi opcjami.

## 5. Kluczowe komponenty

### 5.1. Flashcard (Fiszka)
- Interaktywny komponent reprezentujący fiszkę
- Możliwość odwracania (front/back)
- Używany w widokach: przegląd wygenerowanych fiszek, lista fiszek, tryb nauki

### 5.2. TextEditor (Edytor tekstu)
- Komponent do wprowadzania i edycji tekstu źródłowego
- Zawiera licznik słów/znaków i walidację limitów
- Używany w widokach: kreator fiszek, edycja tekstu źródłowego

### 5.3. FlashcardForm (Formularz fiszki)
- Formularz do tworzenia/edycji fiszki
- Pola dla przedniej i tylnej strony
- Używany w widokach: manualne tworzenie fiszek, edycja fiszki

### 5.4. FlashcardList (Lista fiszek)
- Komponent wyświetlający listę fiszek z opcjami filtrowania i sortowania
- Używany w widokach: lista fiszek, szczegóły tekstu źródłowego

### 5.5. SourceTextList (Lista tekstów źródłowych)
- Komponent wyświetlający listę tekstów źródłowych
- Używany w widoku: lista tekstów źródłowych

### 5.6. LoadingIndicator (Wskaźnik ładowania)
- Wskaźnik postępu podczas operacji takich jak generowanie fiszek
- Używany w widokach: kreator fiszek, przegląd wygenerowanych fiszek

### 5.7. ConfirmationDialog (Dialog potwierdzenia)
- Modal do potwierdzenia ważnych akcji (np. usunięcie)
- Używany w wielu widokach

### 5.8. ErrorMessage (Komunikat błędu)
- Komponent wyświetlający informacje o błędach
- Używany w wielu widokach

### 5.9. NavigationBar (Pasek nawigacji)
- Główny komponent nawigacyjny
- Używany na wszystkich stronach po zalogowaniu

### 5.10. StudyModeCotroller (Kontroler trybu nauki)
- Komponent zarządzający nawigacją w trybie nauki
- Używany w widoku: tryb nauki 