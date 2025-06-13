import { createClient } from "@supabase/supabase-js";

// Load environment variables
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_PUBLIC_KEY!;
const testUserId = process.env.E2E_USERNAME_ID!;
const testUserEmail = process.env.E2E_USERNAME!;
const testUserPassword = process.env.E2E_PASSWORD!;

/**
 * Sample flashcards for testing
 */
const sampleFlashcards = [
  {
    front_content: "What is React?",
    back_content: "A JavaScript library for building user interfaces",
    creation_type: "manual",
    accepted: true,
    generation_time_ms: null,
  },
  {
    front_content: "What is TypeScript?",
    back_content: "A typed superset of JavaScript that compiles to plain JavaScript",
    creation_type: "manual",
    accepted: true,
    generation_time_ms: null,
  },
  {
    front_content: "What is Astro?",
    back_content: "A modern static site generator that delivers lightning-fast performance",
    creation_type: "manual",
    accepted: true,
    generation_time_ms: null,
  },
  {
    front_content: "What is Supabase?",
    back_content: "An open source Firebase alternative with a Postgres database",
    creation_type: "manual",
    accepted: true,
    generation_time_ms: null,
  },
  {
    front_content: "What is Playwright?",
    back_content: "A framework for Web Testing and Automation",
    creation_type: "manual",
    accepted: true,
    generation_time_ms: null,
  },
];

/**
 * Seeds test data for E2E tests
 */
export async function seedTestData() {
  console.log("Starting test data seeding...");

  // Create Supabase client
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
      throw authError;
    }

    console.log(`Creating sample flashcards for user: ${testUserId}`);

    // Prepare flashcards for insertion
    const flashcardsToInsert = sampleFlashcards.map((flashcard) => ({
      ...flashcard,
      user_id: testUserId,
      source_text_id: null,
    }));

    // Insert flashcards
    const { data, error: insertError } = await supabase.from("flashcards").insert(flashcardsToInsert).select("*");

    if (insertError) {
      console.error("Error inserting flashcards:", insertError);
      throw insertError;
    }

    console.log(`Successfully created ${data?.length || 0} sample flashcards`);

    // Sign out after seeding
    await supabase.auth.signOut();

    console.log("Test data seeding completed successfully");
    return data;
  } catch (error) {
    console.error("Error during test data seeding:", error);
    throw error;
  }
}

/**
 * Cleans up test data
 */
export async function cleanupTestData() {
  console.log("Starting test data cleanup...");

  // Create Supabase client
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
      throw authError;
    }

    console.log(`Cleaning up data for test user: ${testUserId}`);

    // Delete flashcards created by test user
    const { error: flashcardsError, count: flashcardsDeleted } = await supabase
      .from("flashcards")
      .delete({ count: "exact" })
      .eq("user_id", testUserId);

    if (flashcardsError) {
      console.error("Error deleting flashcards:", flashcardsError);
      throw flashcardsError;
    }

    console.log(`Deleted ${flashcardsDeleted || 0} flashcards`);

    // Delete source texts created by test user
    const { error: sourceTextsError, count: sourceTextsDeleted } = await supabase
      .from("source_texts")
      .delete({ count: "exact" })
      .eq("user_id", testUserId);

    if (sourceTextsError) {
      console.error("Error deleting source texts:", sourceTextsError);
      throw sourceTextsError;
    }

    console.log(`Deleted ${sourceTextsDeleted || 0} source texts`);

    // Sign out after cleanup
    await supabase.auth.signOut();

    console.log("Test data cleanup completed successfully");
  } catch (error) {
    console.error("Error during test data cleanup:", error);
    throw error;
  }
}

// If this script is run directly, seed the data
if (import.meta.url === `file://${process.argv[1]}`) {
  seedTestData().catch((error) => {
    console.error("Failed to seed test data:", error);
    process.exit(1);
  });
}
