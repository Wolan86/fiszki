import { test as base } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";

// Load environment variables with validation
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_PUBLIC_KEY;
const testUserId = process.env.E2E_USERNAME_ID;
const testUserEmail = process.env.E2E_USERNAME;
const testUserPassword = process.env.E2E_PASSWORD;

if (!supabaseUrl || !supabaseKey || !testUserId || !testUserEmail || !testUserPassword) {
  throw new Error("Missing required environment variables for test fixtures");
}

// TypeScript now knows these are defined strings
const validatedEnv = {
  supabaseUrl,
  supabaseKey,
  testUserId,
  testUserEmail,
  testUserPassword,
} as const;

// Extend the base test with cleanup fixture
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export const test = base.extend<{}, { cleanupTestData: undefined }>({
  // Worker-level fixture for cleaning up test data
  cleanupTestData: [
    // eslint-disable-next-line no-empty-pattern
    async ({}, use) => {
      // Setup code (runs before tests)
      // eslint-disable-next-line no-console
      console.log("Test cleanup fixture initialized");

      // Pass control to the test
      await use(undefined);

      // Teardown code (runs after tests)
      // eslint-disable-next-line no-console
      console.log("Cleaning up test data after test completion...");

      const supabase = createClient(validatedEnv.supabaseUrl, validatedEnv.supabaseKey);

      try {
        // Authenticate as the test user
        const { error: authError } = await supabase.auth.signInWithPassword({
          email: validatedEnv.testUserEmail,
          password: validatedEnv.testUserPassword,
        });

        if (authError) {
          // eslint-disable-next-line no-console
          console.error("Failed to authenticate test user for cleanup:", authError);
          return;
        }

        // Delete flashcards created during this test
        const { error: flashcardsError, count: flashcardsDeleted } = await supabase
          .from("flashcards")
          .delete({ count: "exact" })
          .eq("user_id", validatedEnv.testUserId);

        if (flashcardsError) {
          // eslint-disable-next-line no-console
          console.error("Error cleaning flashcards:", flashcardsError);
        } else {
          // eslint-disable-next-line no-console
          console.log(`Cleaned ${flashcardsDeleted || 0} flashcards`);
        }

        // Delete source texts created during this test
        const { error: sourceTextsError, count: sourceTextsDeleted } = await supabase
          .from("source_texts")
          .delete({ count: "exact" })
          .eq("user_id", validatedEnv.testUserId);

        if (sourceTextsError) {
          // eslint-disable-next-line no-console
          console.error("Error cleaning source texts:", sourceTextsError);
        } else {
          // eslint-disable-next-line no-console
          console.log(`Cleaned ${sourceTextsDeleted || 0} source texts`);
        }

        // Sign out after cleanup
        await supabase.auth.signOut();

        // eslint-disable-next-line no-console
        console.log("Test cleanup completed");
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Error during test cleanup:", error);
        // Don't throw to avoid breaking test results
      }
    },
    { scope: "worker" }, // Run cleanup after each worker completes
  ],
});

export { expect } from "@playwright/test";
