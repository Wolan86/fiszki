import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { chromium } from "@playwright/test";
import type { FullConfig } from "@playwright/test";
import { loginAsTestUser } from "./utils/test-helpers";
import { seedTestData } from "./utils/seed-test-data";

// Define storage state path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const storageStatePath = path.join(__dirname, "auth", "storageState.json");

/**
 * Wait for the server to be available
 */
async function waitForServer(url: string, timeout: number = 30000): Promise<void> {
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeout) {
    try {
      const response = await fetch(url);
      if (response.status < 500) {
        console.log(`Server is available at ${url}`);
        return;
      }
    } catch (error) {
      // Server not ready yet, continue waiting
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  throw new Error(`Server at ${url} did not become available within ${timeout}ms`);
}

/**
 * Global setup to authenticate once before all tests and create test data
 * This performs an actual login for E2E testing and seeds the database
 */
async function globalSetup(config: FullConfig) {
  // Wait for the server to be available
  console.log("Waiting for server to be available...");
  await waitForServer("http://localhost:3000");

  // Reset storage state before authentication
  if (fs.existsSync(storageStatePath)) {
    console.log("Resetting existing storage state...");
    fs.writeFileSync(storageStatePath, JSON.stringify({ cookies: [], origins: [] }));
  }

  // Create directory if it doesn't exist
  const dir = path.dirname(storageStatePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  console.log("Starting authentication process...");

  // Launch browser for authentication
  const browser = await chromium.launch();
  const context = await browser.newContext({
    baseURL: "http://localhost:3000"
  });
  const page = await context.newPage();

  try {
    // Use the proven login helper from test-helpers.ts
    await loginAsTestUser(page);

    // Save authentication state to file
    console.log(`Saving authentication state to ${storageStatePath}...`);
    await context.storageState({ path: storageStatePath });

    console.log("Authentication completed successfully!");

    // Create test data after successful authentication
    console.log("Creating test data...");
    await seedTestData();
    console.log("Test data created successfully!");

  } catch (error) {
    console.error("Global setup failed:", error);

    // Take a screenshot to help diagnose the issue
    const screenshotPath = path.join(dir, "auth-failure.png");
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.error(`Screenshot saved to ${screenshotPath}`);

    throw error;
  } finally {
    await browser.close();
  }
}

export default globalSetup;
