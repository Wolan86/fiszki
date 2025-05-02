# Dokument wymagań produktu (PRD) - Fiszki AI

## 1. Przegląd produktu

Fiszki AI to aplikacja webowa umożliwiająca szybkie i efektywne tworzenie fiszek edukacyjnych przy pomocy sztucznej inteligencji. Aplikacja adresuje problem czasochłonności manualnego tworzenia fiszek, co zniechęca wielu uczących się do korzystania z efektywnej metody nauki jaką jest spaced repetition.

Aplikacja pozwala użytkownikom generować fiszki na podstawie wprowadzonego tekstu, przeglądać je, edytować oraz usuwać. Kierowana jest do każdej osoby chcącej uczyć się na podstawie własnych materiałów tekstowych. MVP aplikacji obsługuje teksty o długości od 1000 do 10000 słów.

Fiszki AI korzysta z modelu AI OpenAI o3-mini do generowania wysokiej jakości fiszek edukacyjnych oraz z Supabase do zarządzania kontami użytkowników i przechowywania danych.

## 2. Problem użytkownika

Manualne tworzenie wysokiej jakości fiszek edukacyjnych jest czasochłonne, co zniechęca wiele osób do korzystania z efektywnej metody nauki jaką jest spaced repetition. 

Użytkownicy napotykają następujące trudności:
- Spędzają zbyt dużo czasu na ręcznym tworzeniu fiszek zamiast na faktycznej nauce
- Mają problem z wybraniem najważniejszych informacji z obszernych materiałów źródłowych
- Brakuje im narzędzi do szybkiego generowania wysokiej jakości fiszek
- Potrzebują prostego systemu do organizacji i przeglądania stworzonych fiszek

Fiszki AI rozwiązuje te problemy, umożliwiając użytkownikom szybkie generowanie fiszek na podstawie wprowadzonego tekstu. Dzięki wykorzystaniu AI, proces tworzenia fiszek staje się znacznie bardziej efektywny, pozwalając użytkownikom skupić się na faktycznej nauce.

## 3. Wymagania funkcjonalne

### 3.1 Generowanie fiszek przez AI
- System umożliwia użytkownikowi wprowadzenie tekstu źródłowego o długości 1000-10000 słów
- Z każdego tekstu źródłowego generowane jest minimum 5 fiszek
- Czas generowania fiszek nie przekracza 30 sekund
- Użytkownik może zaakceptować lub odrzucić każdą wygenerowaną fiszkę
- Użytkownik może wygenerować nową fiszkę w miejsce odrzuconej

### 3.2 Manualne tworzenie fiszek
- System umożliwia użytkownikowi ręczne tworzenie fiszek
- Użytkownik może wprowadzić tekst na przedniej i tylnej stronie fiszki

### 3.3 Przeglądanie, edycja i usuwanie fiszek
- System wyświetla listę wszystkich fiszek użytkownika
- Użytkownik może przeglądać zapisane fiszki
- Użytkownik może edytować istniejące fiszki
- Użytkownik może usuwać fiszki

### 3.4 System kont użytkowników
- System umożliwia rejestrację i logowanie użytkowników
- Dane użytkowników i fiszki są przechowywane w bazie danych Supabase
- Konto użytkownika przechowuje wszystkie wygenerowane i zaakceptowane fiszki

### 3.5 Proces uczenia się
- System umożliwia przeglądanie fiszek w trybie nauki
- Użytkownik może przeglądać zapisane fiszki w uporządkowany sposób
- Interfejs prezentuje fiszki w sposób przypominający fizyczną talię kart

## 4. Granice produktu

Poniższe funkcjonalności NIE wchodzą w zakres MVP:

### 4.1 Funkcjonalności poza zakresem
- Własny, zaawansowany algorytm powtórek (jak SuperMemo, Anki)
- Import wielu formatów (PDF, DOCX, itp.)
- Współdzielenie zestawów fiszek między użytkownikami
- Integracje z innymi platformami edukacyjnymi
- Aplikacje mobilne (na początek tylko web)
- Kategoryzacja/tagowanie fiszek
- Eksport fiszek
- Konfiguracja parametrów generowania fiszek
- Integracja z algorytmem powtórek

### 4.2 Ograniczenia techniczne
- Obsługa jedynie danych tekstowych
- Czas generowania fiszek: do 30 sekund
- Czas ładowania fiszek: do 2 sekund
- Model AI: o3-mini od OpenAI
- Minimalistyczny, ciepły i neutralny design interfejsu
- UI w języku polskim, fiszki mogą być w dowolnym języku

### 4.3 Ograniczenia projektowe
- Czas rozwoju: 4 tygodnie przy pracy po godzinach (około 14 godzin rzeczywistej pracy)
- Preferowane rozwiązania open-source

## 5. Historyjki użytkowników

### US-001: Rejestracja użytkownika
**Tytuł:** Rejestracja nowego użytkownika
**Opis:** Jako nowy użytkownik, chcę móc zarejestrować się w systemie, aby mieć dostęp do funkcjonalności aplikacji i przechowywać moje fiszki.
**Kryteria akceptacji:**
- Użytkownik może otworzyć formularz rejestracji
- Użytkownik może wprowadzić adres email i hasło
- System weryfikuje poprawność danych (format email, złożoność hasła)
- System informuje o błędach walidacji
- Po poprawnej rejestracji, użytkownik jest przekierowywany na stronę główną
- System wyświetla komunikat powitalny dla nowego użytkownika

### US-002: Logowanie użytkownika
**Tytuł:** Logowanie istniejącego użytkownika
**Opis:** Jako zarejestrowany użytkownik, chcę móc zalogować się do systemu, aby uzyskać dostęp do moich zapisanych fiszek.
**Kryteria akceptacji:**
- Użytkownik może otworzyć formularz logowania
- Użytkownik może wprowadzić adres email i hasło
- System weryfikuje poprawność danych
- System informuje o błędach logowania
- Po poprawnym logowaniu, użytkownik jest przekierowywany na stronę główną
- System wyświetla zapisane fiszki użytkownika

### US-003: Wylogowanie użytkownika
**Tytuł:** Wylogowanie z systemu
**Opis:** Jako zalogowany użytkownik, chcę móc wylogować się z systemu, aby zakończyć sesję.
**Kryteria akceptacji:**
- Użytkownik może kliknąć przycisk wylogowania
- System wylogowuje użytkownika
- Użytkownik jest przekierowywany na stronę logowania
- Dostęp do zasobów wymagających uwierzytelnienia jest blokowany

### US-004: Generowanie fiszek z tekstu
**Tytuł:** Generowanie fiszek z wprowadzonego tekstu
**Opis:** Jako zalogowany użytkownik, chcę móc wkleić tekst źródłowy i wygenerować fiszki przy pomocy AI, aby zaoszczędzić czas na manualnym tworzeniu.
**Kryteria akceptacji:**
- Użytkownik może wprowadzić tekst źródłowy o długości 1000-10000 słów
- System informuje o przekroczeniu limitów długości tekstu
- Użytkownik może uruchomić proces generowania fiszek
- System wyświetla informację o trwającym procesie generowania
- System generuje minimum 5 fiszek z wprowadzonego tekstu
- Czas generowania fiszek nie przekracza 30 sekund
- Wygenerowane fiszki są wyświetlane użytkownikowi

### US-005: Akceptacja i odrzucanie wygenerowanych fiszek
**Tytuł:** Akceptacja lub odrzucenie wygenerowanych fiszek
**Opis:** Jako użytkownik, chcę móc zaakceptować lub odrzucić każdą wygenerowaną fiszkę, aby mieć kontrolę nad jakością moich materiałów edukacyjnych.
**Kryteria akceptacji:**
- Użytkownik może przeglądać wygenerowane fiszki
- Dla każdej fiszki użytkownik może wybrać opcję akceptacji
- Dla każdej fiszki użytkownik może wybrać opcję odrzucenia
- Zaakceptowane fiszki są zapisywane w koncie użytkownika
- Odrzucone fiszki nie są zapisywane

### US-006: Regeneracja odrzuconych fiszek
**Tytuł:** Regeneracja fiszki w miejsce odrzuconej
**Opis:** Jako użytkownik, chcę móc wygenerować nową fiszkę w miejsce odrzuconej, aby uzyskać lepszą alternatywę.
**Kryteria akceptacji:**
- Użytkownik może wybrać opcję regeneracji dla odrzuconej fiszki
- System generuje nową fiszkę w miejsce odrzuconej
- Proces regeneracji trwa nie dłużej niż 30 sekund
- Nowa fiszka jest wyświetlana użytkownikowi do akceptacji lub odrzucenia

### US-007: Manualne tworzenie fiszek
**Tytuł:** Manualne tworzenie fiszek
**Opis:** Jako użytkownik, chcę móc ręcznie tworzyć fiszki, aby mieć możliwość uzupełnienia kolekcji o własne materiały.
**Kryteria akceptacji:**
- Użytkownik może otworzyć formularz tworzenia nowej fiszki
- Użytkownik może wprowadzić tekst na przedniej stronie fiszki
- Użytkownik może wprowadzić tekst na tylnej stronie fiszki
- System waliduje wprowadzone dane (nie puste)
- Użytkownik może zapisać stworzoną fiszkę
- Nowa fiszka jest dodawana do kolekcji użytkownika

### US-008: Przeglądanie zapisanych fiszek
**Tytuł:** Przeglądanie zapisanych fiszek
**Opis:** Jako użytkownik, chcę móc przeglądać moje zapisane fiszki, aby mieć wgląd w swoją kolekcję materiałów.
**Kryteria akceptacji:**
- Użytkownik może otworzyć widok listy fiszek
- System wyświetla wszystkie zapisane fiszki użytkownika
- Fiszki są ładowane w czasie nie dłuższym niż 2 sekundy
- Użytkownik może przewijać listę fiszek
- Dla każdej fiszki wyświetlana jest przednia strona jako podgląd

### US-009: Edycja istniejącej fiszki
**Tytuł:** Edycja istniejącej fiszki
**Opis:** Jako użytkownik, chcę móc edytować moje istniejące fiszki, aby poprawić ich treść lub zaktualizować informacje.
**Kryteria akceptacji:**
- Użytkownik może wybrać fiszkę do edycji z listy
- System wyświetla formularz edycji z aktualną treścią fiszki
- Użytkownik może modyfikować tekst na przedniej stronie fiszki
- Użytkownik może modyfikować tekst na tylnej stronie fiszki
- System waliduje wprowadzone zmiany
- Użytkownik może zapisać zmiany
- Zaktualizowana fiszka jest zapisywana w kolekcji użytkownika

### US-010: Usuwanie fiszki
**Tytuł:** Usuwanie fiszki
**Opis:** Jako użytkownik, chcę móc usuwać fiszki z mojej kolekcji, aby pozbyć się niepotrzebnych materiałów.
**Kryteria akceptacji:**
- Użytkownik może wybrać fiszkę do usunięcia z listy
- System wyświetla okno potwierdzenia usunięcia
- Użytkownik może potwierdzić lub anulować usunięcie
- Po potwierdzeniu, fiszka jest trwale usuwana z kolekcji
- System wyświetla komunikat o pomyślnym usunięciu fiszki

### US-011: Tryb nauki
**Tytuł:** Przeglądanie fiszek w trybie nauki
**Opis:** Jako użytkownik, chcę móc przeglądać moje fiszki w trybie nauki, aby efektywnie przyswajać wiedzę.
**Kryteria akceptacji:**
- Użytkownik może uruchomić tryb nauki
- System wyświetla fiszki w formie przypominającej fizyczną talię kart
- Użytkownik może przełączać między przednią a tylną stroną fiszki
- Użytkownik może przechodzić do następnej fiszki
- Użytkownik może wrócić do poprzedniej fiszki
- Użytkownik może zakończyć sesję nauki w dowolnym momencie

### US-012: Odzyskiwanie hasła
**Tytuł:** Odzyskiwanie zapomnianego hasła
**Opis:** Jako użytkownik, chcę móc zresetować moje hasło, gdy je zapomnę, aby odzyskać dostęp do mojego konta.
**Kryteria akceptacji:**
- Użytkownik może wybrać opcję "Zapomniałem hasła" na stronie logowania
- Użytkownik może wprowadzić swój adres email
- System wysyła link do resetowania hasła na podany adres
- Użytkownik może otworzyć link i wprowadzić nowe hasło
- System waliduje złożoność nowego hasła
- Po zapisaniu nowego hasła, użytkownik może zalogować się z nowymi danymi

### US-013: Obsługa błędów podczas generowania fiszek
**Tytuł:** Obsługa błędów podczas generowania fiszek
**Opis:** Jako użytkownik, chcę być informowany o błędach podczas generowania fiszek, aby wiedzieć, co poszło nie tak i jak to naprawić.
**Kryteria akceptacji:**
- System wykrywa błędy podczas generowania fiszek (np. problem z usługą AI)
- System wyświetla czytelny komunikat o błędzie w formie popupu
- Komunikat zawiera informację o możliwych przyczynach i rozwiązaniach
- Użytkownik może zamknąć komunikat
- Użytkownik może spróbować ponownie wygenerować fiszki

### US-014: Nawigacja po aplikacji
**Tytuł:** Nawigacja między głównymi funkcjami aplikacji
**Opis:** Jako użytkownik, chcę móc łatwo nawigować między głównymi funkcjami aplikacji, aby efektywnie korzystać z różnych możliwości systemu.
**Kryteria akceptacji:**
- Interfejs zawiera trzy główne przyciski: kreator fiszek, przeglądanie, uczenie się
- Przyciski są zawsze widoczne i dostępne dla zalogowanego użytkownika
- Kliknięcie przycisku przenosi użytkownika do odpowiedniej sekcji
- Aktualnie wybrana sekcja jest wyraźnie oznaczona
- Nawigacja działa płynnie i bez opóźnień

## US-015: Bezpieczny dostęp i uwierzytelnianie
**Tytuł:** Bezpieczny dostęp
**Opis:** Jako użytkownik chcę mieć możliwość rejestracji i logowania się do systemu w sposób zapewniający bezpieczeństwo moich danych.
**Kryteria akceptacji:**
  - Logowanie i rejestracja odbywają się na dedykowanych stronach.
  - Logowanie wymaga podania adresu email i hasła.
  - Rejestracja wymaga podania adresu email, hasła i potwierdzenia hasła.
  - Użytkownik NIE MOŻE korzystać z zadnej funcjonalnosci bez logowania się do systemu.
  - Użytkownik może logować się do systemu poprzez przycisk w prawym górnym rogu.
  - Użytkownik może się wylogować z systemu poprzez przycisk w prawym górnym rogu w głównym @Layout.astro.
  - Nie korzystamy z zewnętrznych serwisów logowania (np. Google, GitHub).
  - Odzyskiwanie hasła powinno być możliwe.

## 6. Metryki sukcesu

### 6.1 Metryki ilościowe
- 75% fiszek wygenerowanych przez AI jest akceptowane przez użytkownika (bezpośrednia akceptacja fiszki)
- Użytkownicy tworzą 75% fiszek z wykorzystaniem AI (a tylko 25% manualnie)
- Czas generowania fiszek nie przekracza 30 sekund
- Czas ładowania fiszek nie przekracza 2 sekund
- Minimum 5 fiszek generowanych z jednego tekstu źródłowego

### 6.2 Metryki jakościowe
- Użytkownicy mogą łatwo i intuicyjnie obsługiwać wszystkie funkcje aplikacji
- Komunikaty o błędach są zrozumiałe i pomocne
- Generowane fiszki są wysokiej jakości i przydatne w nauce
- Interfejs użytkownika jest estetyczny i przyjazny
- Użytkownicy są zadowoleni z procesu tworzenia fiszek przy pomocy AI 