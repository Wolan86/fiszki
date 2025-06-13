# CI/CD Pipeline

Minimalny setup CI/CD dla projektu Astro z kompletnym przepływem testowania i buildowania.

## Uruchamianie Pipeline

### Automatyczne uruchamianie

- **Po push do main**: Pipeline uruchamia się automatycznie
- **Na pull request do main**: Pipeline weryfikuje zmiany przed merge

### Manualne uruchamianie

1. Idź do zakładki "Actions" w repozytorium GitHub
2. Wybierz workflow "CI/CD Pipeline"
3. Kliknij "Run workflow"
4. Wybierz branch i uruchom

## Struktura Pipeline

Pipeline składa się z 5 jobów uruchamianych w następującej kolejności:

### 1. Code Quality & Linting

- Sprawdza jakość kodu z ESLint
- Weryfikuje formatowanie z Prettier
- **Wymagania**: Wszystkie pliki muszą przejść linting bez errors

### 2. Unit Tests (Vitest)

- Uruchamia testy jednostkowe z Vitest
- Generuje raport pokrycia kodu
- **Zależności**: Code Quality
- **Wymagania**: Wszystkie testy muszą przejść

### 3. Production Build

- Buduje aplikację w wersji produkcyjnej
- Weryfikuje poprawność buildu
- **Zależności**: Code Quality
- **Wymagania**: Build musi się zakończyć sukcesem

### 4. E2E Tests (Playwright)

- Uruchamia testy end-to-end z Playwright
- Testuje tylko na przeglądarce Chromium (zgodnie z konfiguracją)
- **Zależności**: Build + Unit Tests
- **Wymagania**: Wszystkie testy E2E muszą przejść

### 5. Pipeline Summary

- Podsumowuje wyniki wszystkich jobów
- **Status**: Pokazuje czy cały pipeline przeszedł pomyślnie

## Artefakty

Pipeline generuje następujące artefakty:

- **coverage-report**: Raport pokrycia testów jednostkowych
- **build-files**: Zbudowane pliki produkcyjne (katalog `dist/`)
- **playwright-report**: Raport z testów E2E
- **test-results**: Szczegółowe wyniki testów Playwright

## Najlepsze praktyki zastosowane

### GitHub Actions Standards

- ✅ **Deterministic dependencies**: Używa `npm ci` zamiast `npm install`
- ✅ **Node version from file**: Pobiera wersję z `.nvmrc` zamiast hardkodowania
- ✅ **Job-level env variables**: Zmienne środowiskowe na poziomie jobów
- ✅ **Latest action versions**: Używa najnowszych wersji akcji (v4)
- ✅ **Precise branch targeting**: Workflow tylko dla `main` branch
- ✅ **Caching enabled**: npm cache dla szybszych buildów
- ✅ **Parallel job execution**: Zoptymalizowane zależności między jobami

## Konfiguracja środowiska

- **Node.js**: 22.14.0 (automatycznie pobierana z `.nvmrc`)
- **OS**: Ubuntu Latest
- **Cache**: npm cache dla szybszych buildów
- **Zależności**: Używa `npm ci` dla deterministycznej instalacji
- **Branch**: Workflow uruchamia się tylko na `main` branch

## Rozwiązywanie problemów

### Pipeline nie przechodzi

1. Sprawdź logi konkretnego joba w GitHub Actions
2. Uruchom testy lokalnie: `npm run test` i `npm run test:e2e`
3. Sprawdź linting: `npm run lint`
4. Zweryfikuj build: `npm run build`

### Playwright testy nie działają

- Upewnij się, że masz plik `.env.test` z odpowiednimi zmiennymi
- Sprawdź czy aplikacja startuje poprawnie na porcie 3000
- Zweryfikuj konfigurację w `playwright.config.ts`

### Build zawodzi

- Sprawdź błędy TypeScript: `npx astro check`
- Zweryfikuj czy wszystkie zależności są zainstalowane
- Sprawdź konfigurację Astro w `astro.config.mjs`
