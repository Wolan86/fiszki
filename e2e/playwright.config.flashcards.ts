import { defineConfig, devices } from "@playwright/test";
import { config } from "dotenv";
import path from "path";

// Load environment variables from .env.test file
config({ path: path.resolve(process.cwd(), ".env.test") });

// Define storage state file path
const storageStatePath = "e2e/auth/storageState.json";

/**
 * Dedicated Playwright configuration for Flashcard component E2E tests
 * This configuration focuses on the "Moje fiszki" component testing
 */
export default defineConfig({
  testDir: "./tests",

  /* Run tests in files in parallel */
  fullyParallel: true,

  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,

  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,

  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,

  /* Reporter configuration for flashcard tests */
  reporter: [
    ["html", { outputFolder: "test-results/flashcard-report" }],
    ["json", { outputFile: "test-results/flashcard-results.json" }],
    ["list"],
  ],

  /* Shared settings for all the projects below. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: "http://localhost:3000",

    /* Collect trace when retrying the failed test. */
    trace: "on-first-retry",

    /* Take screenshot on failure */
    screenshot: "only-on-failure",

    /* Record video on failure */
    video: "retain-on-failure",

    /* Use authentication state from global setup */
    storageState: storageStatePath,
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: "flashcard-creator",
      testMatch: "**/flashcard-creator.spec.ts",
      use: {
        ...devices["Desktop Chrome"],
        storageState: storageStatePath,
      },
      timeout: 120000, // 2 minutes for creator tests (including generation time)
      retries: process.env.CI ? 3 : 1, // More retries for creator tests
    },

    {
      name: "flashcard-basic-scenarios",
      testMatch: "**/flashcard-list-scenarios.spec.ts",
      use: {
        ...devices["Desktop Chrome"],
        storageState: storageStatePath,
      },
    },

    {
      name: "flashcard-advanced-scenarios",
      testMatch: "**/flashcard-advanced-scenarios.spec.ts",
      use: {
        ...devices["Desktop Chrome"],
        storageState: storageStatePath,
      },
      timeout: 60000, // Longer timeout for advanced scenarios
    },

    {
      name: "flashcard-integration-tests",
      testMatch: "**/flashcard-integration-tests.spec.ts",
      use: {
        ...devices["Desktop Chrome"],
        storageState: storageStatePath,
      },
      timeout: 45000,
    },

    {
      name: "flashcard-cross-browser",
      testMatch: ["**/flashcard-list-scenarios.spec.ts", "**/flashcard-integration-tests.spec.ts"],
      use: {
        ...devices["Desktop Firefox"],
        storageState: storageStatePath,
      },
    },

    {
      name: "flashcard-mobile",
      testMatch: "**/flashcard-list-scenarios.spec.ts",
      use: {
        ...devices["Pixel 5"],
        storageState: storageStatePath,
      },
    },

    {
      name: "flashcard-tablet",
      testMatch: "**/flashcard-list-scenarios.spec.ts",
      use: {
        ...devices["iPad"],
        storageState: storageStatePath,
      },
    },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
    env: {
      NODE_ENV: "test",
      // Pass environment variables from .env.test to the dev server
      OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY || "",
      VITE_OPENROUTER_API_KEY: process.env.VITE_OPENROUTER_API_KEY || "",
      // Pass other relevant environment variables
      SUPABASE_URL: process.env.SUPABASE_URL || "",
      SUPABASE_PUBLIC_KEY: process.env.SUPABASE_PUBLIC_KEY || "",
    },
  },

  /* Global setup and teardown */
  globalSetup: "./global.setup.ts",
  globalTeardown: "./global.teardown.ts",

  /* Test timeout */
  timeout: process.env.CI ? 90000 : 30000, // Longer timeout in CI
  expect: {
    timeout: process.env.CI ? 15000 : 10000, // Longer expect timeout in CI
  },
});
