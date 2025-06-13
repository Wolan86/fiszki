import { test as base } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";

// Load environment variables
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_PUBLIC_KEY!;
const testUserId = process.env.E2E_USERNAME_ID!;
const testUserEmail = process.env.E2E_USERNAME!;
const testUserPassword = process.env.E2E_PASSWORD!;

// Extend the base test with cleanup fixture
export const test = base.extend<{}, { cleanupTestData: void }>({
  // Worker-level fixture for cleaning up test data
  cleanupTestData: [
    async ({}, use) => {
      // Setup code (runs before tests)
      console.log("Test cleanup fixture initialized");

      // Pass control to the test
      await use();

      // Teardown code (runs after tests)
      console.log("Cleaning up test data after test completion...");

      const supabase = createClient(supabaseUrl, supabaseKey);

      try {
        // Authenticate as the test user
        const { error: authError } = await supabase.auth.signInWithPassword({
          email: testUserEmail,
          password: testUserPassword,
        });

        if (authError) {
          console.error("Failed to authenticate test user for cleanup:", authError);
          return;
        }

        // Delete flashcards created during this test
        const { error: flashcardsError, count: flashcardsDeleted } = await supabase
          .from("flashcards")
          .delete({ count: "exact" })
          .eq("user_id", testUserId);

        if (flashcardsError) {
          console.error("Error cleaning flashcards:", flashcardsError);
        } else {
          console.log(`Cleaned ${flashcardsDeleted || 0} flashcards`);
        }

        // Delete source texts created during this test
        const { error: sourceTextsError, count: sourceTextsDeleted } = await supabase
          .from("source_texts")
          .delete({ count: "exact" })
          .eq("user_id", testUserId);

        if (sourceTextsError) {
          console.error("Error cleaning source texts:", sourceTextsError);
        } else {
          console.log(`Cleaned ${sourceTextsDeleted || 0} source texts`);
        }

        // Sign out after cleanup
        await supabase.auth.signOut();

        console.log("Test cleanup completed");
      } catch (error) {
        console.error("Error during test cleanup:", error);
        // Don't throw to avoid breaking test results
      }
    },
    { scope: "worker" }, // Run cleanup after each worker completes
  ],
});

export { expect } from "@playwright/test";
