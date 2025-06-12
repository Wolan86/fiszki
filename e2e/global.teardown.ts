import { createClient } from "@supabase/supabase-js";
import type { FullConfig } from "@playwright/test";

// Load environment variables
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_PUBLIC_KEY!;
const testUserId = process.env.E2E_USERNAME_ID!;
const testUserEmail = process.env.E2E_USERNAME!;
const testUserPassword = process.env.E2E_PASSWORD!;

/**
 * Global teardown to clean up test data after all tests complete
 * This removes all test data created during E2E test runs
 * Authenticates as the test user to respect RLS policies
 */
async function globalTeardown(config: FullConfig) {
  console.log("Starting global teardown...");

  // Create Supabase client with public key
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    console.log(`Authenticating as test user: ${testUserEmail}`);

    // Authenticate as the test user
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: testUserEmail,
      password: testUserPassword,
    });

    if (authError) {
      console.error("Failed to authenticate test user:", authError);
      return;
    }

    console.log(`Cleaning up data for test user: ${testUserId}`);

    // Delete flashcards created by test user
    const { error: flashcardsError, count: flashcardsDeleted } = await supabase
      .from("flashcards")
      .delete({ count: "exact" })
      .eq("user_id", testUserId);

    if (flashcardsError) {
      console.error("Error deleting flashcards:", flashcardsError);
    } else {
      console.log(`Deleted ${flashcardsDeleted || 0} flashcards`);
    }

    // Delete source texts created by test user
    const { error: sourceTextsError, count: sourceTextsDeleted } = await supabase
      .from("source_texts")
      .delete({ count: "exact" })
      .eq("user_id", testUserId);

    if (sourceTextsError) {
      console.error("Error deleting source texts:", sourceTextsError);
    } else {
      console.log(`Deleted ${sourceTextsDeleted || 0} source texts`);
    }

    // Sign out after cleanup
    await supabase.auth.signOut();

    console.log("Global teardown completed successfully");
  } catch (error) {
    console.error("Error during global teardown:", error);
    // Don't throw the error to avoid breaking the test run
    // Just log it for debugging purposes
  }
}

export default globalTeardown; 