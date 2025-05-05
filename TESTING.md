# Testing Strategy

This document outlines the testing strategy for the Fiszki application.

## Testing Levels

### E2E Testing with Playwright

End-to-End tests verify the application from a user's perspective, ensuring that all parts of the system work together correctly.

#### Directory Structure

```
e2e/
├── page-objects/        # Page Object Models for all pages
│   ├── BasePage.ts      # Base page with common methods
│   ├── CreatorPage.ts   # Flashcard creator page
│   └── FlashcardComponent.ts  # Flashcard component 
├── tests/               # Test files
│   └── flashcard-creator.spec.ts # Tests for flashcard creator
├── utils/               # Utilities for testing
│   └── test-helpers.ts  # Helper functions
└── global.setup.ts      # Authentication setup for tests
```

#### Running E2E Tests

```bash
# Run all tests headlessly
npm run test:e2e

# Run tests with UI
npm run test:e2e:ui

# Run tests with debugging
npm run test:e2e:debug
```

#### Authentication in Tests

Tests requiring authentication use a global setup to login once and reuse the authentication state:

1. **Global Setup** - `e2e/global.setup.ts` performs the login once before tests run
2. **Storage State** - Playwright stores the authentication state in `e2e/storageState.json`
3. **Test Configuration** - `playwright.config.ts` configures tests to use the stored auth state

To set up test user credentials:

1. Create a `.env.test` file with test user credentials:
```
TEST_USER_EMAIL=test@example.com
TEST_USER_PASSWORD=test123456
```

2. Tests will automatically use these credentials for authentication.

#### Page Object Model

We follow the Page Object Model (POM) pattern to make our tests more maintainable:

1. `BasePage` - Common methods for all pages, including authentication helpers
2. `CreatorPage` - Methods for interacting with the flashcard creator
3. `FlashcardComponent` - Methods for interacting with individual flashcards

#### Test Data Attributes

For stable element selection, we use `data-test-id` attributes:

```html
<button data-test-id="generate-button">Generate Flashcards</button>
```

```typescript
// In Playwright test
await page.getByTestId('generate-button').click();
```

#### Test Case Structure

We follow the AAA (Arrange-Act-Assert) pattern:

```typescript
test('should generate flashcards', async ({ page }) => {
  // Arrange
  const creatorPage = new CreatorPage(page);
  const sampleText = generateSampleText(1000);
  
  // Act
  await creatorPage.goto();
  await creatorPage.generateFlashcards(sampleText);
  
  // Assert
  const flashcards = await creatorPage.getAllFlashcards();
  expect(flashcards.length).toBeGreaterThan(0);
});
```

### Unit Testing (Future)

Unit tests will be implemented using Vitest and React Testing Library for testing React components and utility functions.

### Component Testing (Future)

Component tests will focus on testing individual components in isolation.

## Best Practices

1. **Don't rely on text content** - Use data-test-id attributes instead
2. **Keep tests isolated** - Each test should be independent of others
3. **Use Page Object Models** - For better maintainability
4. **Minimize waits** - Use explicit waiting mechanisms instead of timeouts
5. **Test real user flows** - Focus on testing complete user journeys
6. **Keep the test data clear** - Use helper functions to generate test data
7. **Handle authentication properly** - Use global setup for login to avoid repetitive login steps 