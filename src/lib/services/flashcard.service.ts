import type { SupabaseClient } from "@supabase/supabase-js";
import type { FlashcardDto } from "../../types";
import type { Database } from "../../db/database.types";

type DbClient = SupabaseClient<Database>;
type FlashcardInput = Pick<FlashcardDto, "front_content" | "back_content" | "accepted" | "creation_type" | "generation_time_ms">;

/**
 * Saves AI-generated flashcards to the database
 * 
 * @param supabase Supabase client instance
 * @param flashcards Array of flashcards to save
 * @param sourceTextId ID of the source text the flashcards were generated from
 * @param userId ID of the user who owns the flashcards
 * @returns Array of saved flashcards with complete data
 */
export async function saveGeneratedFlashcards(
  supabase: DbClient,
  flashcards: FlashcardInput[],
  sourceTextId: string,
  userId: string
): Promise<FlashcardDto[]> {
  // Prepare flashcards for insertion
  const flashcardsToInsert = flashcards.map(flashcard => ({
    ...flashcard,
    source_text_id: sourceTextId,
    user_id: userId
  }));
  
  // Insert flashcards into the database
  const { data, error } = await supabase
    .from("flashcards")
    .insert(flashcardsToInsert)
    .select("*");
  
  if (error) {
    console.error("Error saving flashcards:", error);
    throw new Error(`Failed to save flashcards: ${error.message}`);
  }
  
  return data || [];
} 