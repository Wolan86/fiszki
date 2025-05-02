# Plan testów dla projektu Fiszki

## 1. Wprowadzenie i cele testowania

Niniejszy plan testów definiuje strategię, podejście, zasoby i harmonogram testowania aplikacji Fiszki. Główne cele testowania:

- Weryfikacja poprawności działania funkcjonalności autentykacji użytkowników
- Zapewnienie niezawodności operacji na fiszkach (tworzenie, edycja, usuwanie, przeglądanie)
- Kontrola jakości integracji z usługami zewnętrznymi (Supabase, Openrouter.ai)
- Walidacja doświadczenia użytkownika i dostępności aplikacji
- Zapewnienie wydajności i skalowalności rozwiązania

## 2. Zakres testów

### Obszary objęte testami:

- System autentykacji użytkowników (logowanie, rejestracja, odzyskiwanie hasła)
- CRUD dla fiszek i zestawów fiszek
- Integracja z Supabase
- Funkcjonalności AI (Openrouter.ai)
- Responsywność i dostępność interfejsu użytkownika
- Wydajność aplikacji

### Obszary wyłączone z testów:

- Infrastruktura DigitalOcean
- Testy penetracyjne bezpieczeństwa (zostaną zlecone zewnętrznemu zespołowi)

## 3. Typy testów

### Testy jednostkowe
- Testowanie komponentów React (np. formularzy, przycisków, walidacji)
- Testy dla funkcji pomocniczych i hooka
- Framework: Vitest

### Testy integracyjne
- Testowanie przepływu między komponentami
- Weryfikacja integracji z Supabase
- Weryfikacja integracji z Openrouter.ai
- Framework: Playwright

### Testy E2E (End-to-End)
- Testowanie pełnych ścieżek użytkownika
- Weryfikacja autentykacji
- Testowanie operacji na fiszkach
- Framework: Playwright

## 4. Scenariusze testowe dla kluczowych funkcjonalności

### Autentykacja użytkownika

#### Logowanie
1. Użytkownik może zalogować się poprawnymi danymi
2. System wyświetla błędy przy niepoprawnych danych
3. Walidacja pól formularza działa poprawnie
4. Link "Zapomniałeś hasła" przekierowuje do odpowiedniej strony
5. Przycisk logowania jest nieaktywny podczas ładowania
6. Użytkownik zostaje przekierowany do strony głównej po zalogowaniu

#### Rejestracja
1. Użytkownik może utworzyć nowe konto z poprawnymi danymi
2. System waliduje unikalność adresu email
3. System waliduje złożoność hasła
4. Użytkownik otrzymuje potwierdzenie po rejestracji

#### Odzyskiwanie hasła
1. System wysyła email z linkiem do resetowania hasła
2. Link resetowania hasła działa poprawnie
3. Użytkownik może ustawić nowe hasło

### Zarządzanie fiszkami

#### Tworzenie fiszek
1. Użytkownik może utworzyć nową fiszkę
2. System waliduje pola fiszki
3. Fiszka zapisuje się w bazie danych

#### Przeglądanie fiszek
1. Użytkownik widzi listę swoich fiszek
2. Fiszki wyświetlają się poprawnie
3. Działa filtrowanie i sortowanie fiszek

#### Edycja fiszek
1. Użytkownik może edytować istniejące fiszki
2. Zmiany zapisują się w bazie danych

#### Usuwanie fiszek
1. Użytkownik może usunąć fiszkę
2. System prosi o potwierdzenie przed usunięciem
3. Usunięta fiszka znika z listy

### Funkcjonalności AI
1. System poprawnie komunikuje się z Openrouter.ai
2. Generowanie podpowiedzi działa zgodnie z oczekiwaniami
3. Obsługa błędów komunikacji z API działa poprawnie

## 5. Środowisko testowe

### Środowisko deweloperskie
- Lokalne środowisko deweloperskie z zainstalowanym Node.js
- Lokalna instancja Supabase
- Klucze testowe dla Openrouter.ai

### Środowisko testowe
- Serwer testowy na DigitalOcean
- Testowa instancja Supabase
- Testowe klucze API dla Openrouter.ai

### Środowisko produkcyjne
- Produkcyjny serwer na DigitalOcean
- Produkcyjna instancja Supabase
- Produkcyjne klucze API dla Openrouter.ai

## 6. Narzędzia do testowania

- **Vitest/Jest**: testy jednostkowe
- **Testing Library**: testowanie komponentów React
- **Cypress/Playwright**: testy E2E i integracyjne
- **Storybook**: testowanie komponentów UI
- **Percy**: testy wizualne i regresyjne
- **axe-core**: testy dostępności
- **Lighthouse**: testy wydajności
- **ESLint/TypeScript**: statyczna analiza kodu
- **GitHub Actions**: automatyzacja testów CI/CD

## 7. Harmonogram testów

| Faza | Czas trwania | Zakres testów |
|------|--------------|--------------|
| Alfa | 2 tygodnie | Testy jednostkowe, podstawowe testy integracyjne |
| Beta | 3 tygodnie | Testy E2E, testy wydajnościowe, testy dostępności |
| RC | 1 tydzień | Testy regresyjne, testy akceptacyjne |
| Produkcja | Ciągłe | Testy monitorujące, testy regresyjne |

## 8. Kryteria akceptacji testów

- Wszystkie testy jednostkowe przechodzą (pokrycie kodu >80%)
- Wszystkie testy integracyjne przechodzą
- Testy E2E dla kluczowych ścieżek użytkownika przechodzą
- Brak krytycznych błędów w testach dostępności (zgodność z WCAG 2.1 AA)
- Wynik Lighthouse >90 dla wydajności, dostępności, najlepszych praktyk i SEO
- Czas ładowania aplikacji <3s na standardowym łączu
- Aplikacja działa poprawnie na głównych przeglądarkach (Chrome, Firefox, Safari, Edge)
- Aplikacja jest responsywna na urządzeniach mobilnych, tabletach i desktopach

## 9. Role i odpowiedzialności

| Rola | Odpowiedzialność |
|------|------------------|
| Kierownik QA | Nadzór nad procesem testowania, raportowanie do zespołu zarządzającego |
| Tester Frontend | Testowanie komponentów UI, testy dostępności, testy wizualne |
| Tester Backend | Testowanie integracji z Supabase, testy API |
| Tester Automatyczny | Tworzenie i utrzymanie testów automatycznych, CI/CD |
| Deweloperzy | Tworzenie testów jednostkowych, naprawianie błędów |

## 10. Procedury raportowania błędów

1. **Rejestracja błędu**: Wszystkie błędy są rejestrowane w systemie śledzenia błędów (GitHub Issues)
2. **Klasyfikacja**: Błędy są klasyfikowane według priorytetów:
   - Krytyczny: Blokuje kluczowe funkcjonalności
   - Wysoki: Znacząco utrudnia korzystanie z aplikacji
   - Średni: Powoduje problemy, ale istnieje obejście
   - Niski: Drobne błędy kosmetyczne
3. **Przypisanie**: Błędy są przypisywane do odpowiednich deweloperów
4. **Weryfikacja naprawy**: Po naprawie, tester weryfikuje poprawność rozwiązania
5. **Zamknięcie**: Błąd zostaje zamknięty po weryfikacji

## 11. Zarządzanie ryzykiem

| Ryzyko | Prawdopodobieństwo | Wpływ | Strategia mitygacji |
|--------|-------------------|-------|---------------------|
| Problemy z integracją Supabase | Średnie | Wysoki | Testy integracyjne, mocks dla środowiska testowego |
| Wydajność przy dużej liczbie fiszek | Wysokie | Średni | Testy wydajnościowe, paginacja, wirtualizacja list |
| Problemy z dostępnością | Średnie | Wysoki | Automatyczne testy a11y, regularne audyty |
| Awarie usługi Openrouter.ai | Niskie | Wysoki | Obsługa trybu offline, failover mechanizmy |
| Responsywność na różnych urządzeniach | Średnie | Średni | Testy wizualne na różnych wymiarach ekranu |

## 12. Metryki jakości

- Pokrycie kodu testami: >80%
- Liczba otwartych defektów: <10 niskiego priorytetu, 0 średniego/wysokiego/krytycznego przed wydaniem
- Średni czas naprawy defektu: <2 dni dla wysokiego priorytetu, <5 dni dla średniego
- Wynik Lighthouse: >90 dla wszystkich kategorii
- Czas ładowania strony: <3s 