import { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  FlashcardDto,
  CreateFlashcardCommand,
  UpdateFlashcardCommand,
  FlashcardListQueryParams,
  FlashcardListResponse,
  FlashcardLearningQueryParams,
  FlashcardLearningResponse,
} from "../../types";
import type { Database } from "../../db/database.types";

type DbClient = SupabaseClient<Database>;
type FlashcardInput = Pick<
  FlashcardDto,
  "front_content" | "back_content" | "accepted" | "creation_type" | "generation_time_ms"
>;

// Validation schema for create flashcard command
export const createFlashcardSchema = z.object({
  front_content: z
    .string()
    .min(1, "Front content is required and cannot be empty")
    .max(2000, "Front content cannot exceed 2000 characters"),
  back_content: z
    .string()
    .min(1, "Back content is required and cannot be empty")
    .max(2000, "Back content cannot exceed 2000 characters"),
  source_text_id: z.string().uuid("Invalid source_text_id format").optional(),
});

// Validation schema for update flashcard command
export const updateFlashcardSchema = z.object({
  front_content: z
    .string()
    .min(1, "Front content is required and cannot be empty")
    .max(2000, "Front content cannot exceed 2000 characters")
    .optional(),
  back_content: z
    .string()
    .min(1, "Back content is required and cannot be empty")
    .max(2000, "Back content cannot exceed 2000 characters")
    .optional(),
  accepted: z.boolean().optional(),
});

// Validation schema for flashcard list query parameters
export const flashcardListQuerySchema = z.object({
  limit: z.coerce
    .number()
    .int("Limit must be an integer")
    .min(1, "Limit must be at least 1")
    .max(100, "Limit cannot exceed 100")
    .default(10),
  offset: z.coerce.number().int("Offset must be an integer").min(0, "Offset must be non-negative").default(0),
  sort: z
    .enum([
      "id",
      "front_content",
      "back_content",
      "creation_type",
      "accepted",
      "generation_time_ms",
      "created_at",
      "updated_at",
      "user_id",
      "source_text_id",
    ])
    .default("created_at"),
  order: z.enum(["asc", "desc"]).default("desc"),
  source_text_id: z.string().uuid("Invalid source_text_id format").optional(),
  creation_type: z.enum(["ai_generated", "ai_edited", "manual"]).optional(),
  accepted: z.coerce.boolean().optional(),
  search: z.string().min(1, "Search query cannot be empty").optional(),
});

// Validation schema for flashcard learning query parameters
export const flashcardLearningQuerySchema = z.object({
  limit: z.coerce
    .number()
    .int("Limit must be an integer")
    .min(1, "Limit must be at least 1")
    .max(50, "Limit cannot exceed 50")
    .default(10),
  source_text_id: z.string().uuid("Invalid source_text_id format").optional(),
});

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
  const flashcardsToInsert = flashcards.map((flashcard) => ({
    ...flashcard,
    source_text_id: sourceTextId,
    user_id: userId,
  }));

  // Insert flashcards into the database
  const { data, error } = await supabase.from("flashcards").insert(flashcardsToInsert).select("*");

  if (error) {
    // Error saving flashcards - handled by throwing
    throw new Error(`Failed to save flashcards: ${error.message}`);
  }

  return data || [];
}

/**
 * Creates a new flashcard manually by the user
 *
 * @param supabase Supabase client instance
 * @param command Command with flashcard data
 * @param userId ID of the user creating the flashcard
 * @returns Created flashcard with complete data
 */
export async function createFlashcard(
  supabase: DbClient,
  command: CreateFlashcardCommand,
  userId: string
): Promise<FlashcardDto> {
  // Validate source_text_id if provided
  if (command.source_text_id) {
    const { data: sourceText, error: sourceTextError } = await supabase
      .from("source_texts")
      .select("id")
      .eq("id", command.source_text_id)
      .eq("user_id", userId)
      .single();

    if (sourceTextError || !sourceText) {
      throw new Error("SOURCE_TEXT_NOT_FOUND");
    }
  }

  // Prepare flashcard for insertion
  const flashcardToInsert = {
    front_content: command.front_content,
    back_content: command.back_content,
    source_text_id: command.source_text_id || null,
    user_id: userId,
    creation_type: "manual" as const,
    accepted: true,
    generation_time_ms: null,
  };

  // Insert flashcard into the database
  const { data, error } = await supabase.from("flashcards").insert([flashcardToInsert]).select("*").single();

  if (error) {
    // Error creating flashcard - handled by throwing
    throw new Error(`DATABASE_ERROR: ${error.message}`);
  }

  if (!data) {
    throw new Error("DATABASE_ERROR: No data returned from insert");
  }

  return data;
}

/**
 * Updates an existing flashcard
 *
 * @param supabase Supabase client instance
 * @param flashcardId ID of the flashcard to update
 * @param command Command with update data
 * @param userId ID of the user updating the flashcard
 * @returns Updated flashcard with complete data
 */
export async function updateFlashcard(
  supabase: DbClient,
  flashcardId: string,
  command: UpdateFlashcardCommand,
  userId: string
): Promise<FlashcardDto> {
  // Check if flashcard exists and belongs to user
  const { data: existingFlashcard, error: fetchError } = await supabase
    .from("flashcards")
    .select("id")
    .eq("id", flashcardId)
    .eq("user_id", userId)
    .single();

  if (fetchError || !existingFlashcard) {
    throw new Error("FLASHCARD_NOT_FOUND");
  }

  // Prepare update object (only include fields that are being updated)
  const updateData: Partial<FlashcardDto> = {};

  if (command.front_content !== undefined) {
    updateData.front_content = command.front_content;
  }
  if (command.back_content !== undefined) {
    updateData.back_content = command.back_content;
  }
  if (command.accepted !== undefined) {
    updateData.accepted = command.accepted;
  }

  // Add updated_at timestamp
  updateData.updated_at = new Date().toISOString();

  // Update flashcard in the database
  const { data, error } = await supabase
    .from("flashcards")
    .update(updateData)
    .eq("id", flashcardId)
    .eq("user_id", userId)
    .select("*")
    .single();

  if (error) {
    console.error("Error updating flashcard:", error);
    throw new Error(`DATABASE_ERROR: ${error.message}`);
  }

  if (!data) {
    throw new Error("DATABASE_ERROR: No data returned from update");
  }

  return data;
}

/**
 * Gets flashcards with filtering, pagination and sorting
 *
 * @param supabase Supabase client instance
 * @param queryParams Query parameters for filtering, sorting and pagination
 * @param userId ID of the user requesting flashcards
 * @returns Response with flashcards data and pagination info
 */
export async function getFlashcards(
  supabase: DbClient,
  queryParams: FlashcardListQueryParams,
  userId: string
): Promise<FlashcardListResponse> {
  try {
    // Start building the query
    let query = supabase.from("flashcards").select("*", { count: "exact" }).eq("user_id", userId);

    // Apply filters
    if (queryParams.source_text_id) {
      query = query.eq("source_text_id", queryParams.source_text_id);
    }

    if (queryParams.creation_type) {
      query = query.eq("creation_type", queryParams.creation_type);
    }

    if (queryParams.accepted !== undefined) {
      query = query.eq("accepted", queryParams.accepted);
    }

    // Apply search filter (search in both front_content and back_content)
    if (queryParams.search) {
      query = query.or(`front_content.ilike.%${queryParams.search}%,back_content.ilike.%${queryParams.search}%`);
    }

    // Apply sorting
    const sortField = queryParams.sort || "created_at";
    const sortOrder = queryParams.order || "desc";
    query = query.order(sortField, { ascending: sortOrder === "asc" });

    // Apply pagination
    const limit = queryParams.limit || 10;
    const offset = queryParams.offset || 0;
    query = query.range(offset, offset + limit - 1);

    // Execute query
    const { data, error, count } = await query;

    if (error) {
      console.error("Error fetching flashcards:", error);
      throw new Error(`DATABASE_ERROR: ${error.message}`);
    }

    // Return response with data and pagination info
    return {
      data: data || [],
      pagination: {
        total: count || 0,
        limit: limit,
        offset: offset,
      },
    };
  } catch (error) {
    console.error("Error in getFlashcards:", error);
    throw error;
  }
}

/**
 * Gets flashcards for learning in random order
 *
 * @param supabase Supabase client instance
 * @param queryParams Query parameters for learning
 * @param userId ID of the user requesting flashcards
 * @returns Random flashcards for learning with total count
 */
export async function getFlashcardsForLearning(
  supabase: DbClient,
  queryParams: FlashcardLearningQueryParams,
  userId: string
): Promise<FlashcardLearningResponse> {
  try {
    // Validate source_text_id if provided - check if it belongs to the user
    if (queryParams.source_text_id) {
      const { data: sourceText, error: sourceTextError } = await supabase
        .from("source_texts")
        .select("id")
        .eq("id", queryParams.source_text_id)
        .eq("user_id", userId)
        .single();

      if (sourceTextError || !sourceText) {
        throw new Error("SOURCE_TEXT_NOT_FOUND");
      }
    }

    const limit = queryParams.limit || 10;

    // Use the database function for random flashcards
    const { data, error } = await supabase.rpc("get_random_flashcards", {
      p_user_id: userId,
      p_limit: limit,
    });

    if (error) {
      console.error("Error fetching random flashcards:", error);
      throw new Error(`DATABASE_ERROR: ${error.message}`);
    }

    let flashcards = data || [];

    // Apply source_text_id filter if provided (client-side filtering since RPC doesn't support it)
    if (queryParams.source_text_id) {
      flashcards = flashcards.filter((flashcard) => flashcard.source_text_id === queryParams.source_text_id);
    }

    // Get total count of accepted flashcards for the user
    let countQuery = supabase
      .from("flashcards")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("accepted", true);

    if (queryParams.source_text_id) {
      countQuery = countQuery.eq("source_text_id", queryParams.source_text_id);
    }

    const { count, error: countError } = await countQuery;

    if (countError) {
      console.error("Error counting flashcards:", countError);
      throw new Error(`DATABASE_ERROR: ${countError.message}`);
    }

    return {
      data: flashcards,
      total: count || 0,
    };
  } catch (error) {
    console.error("Error in getFlashcardsForLearning:", error);
    throw error;
  }
}

/**
 * Deletes an existing flashcard owned by the user
 *
 * @param supabase Supabase client instance
 * @param flashcardId ID of the flashcard to delete
 * @param userId ID of the user deleting the flashcard
 * @throws {Error} FLASHCARD_NOT_FOUND if flashcard doesn't exist or doesn't belong to user
 * @throws {Error} DATABASE_ERROR if database operation fails
 */
export async function deleteFlashcard(supabase: DbClient, flashcardId: string, userId: string): Promise<void> {
  // Check if flashcard exists and belongs to user
  const { data: existingFlashcard, error: fetchError } = await supabase
    .from("flashcards")
    .select("id")
    .eq("id", flashcardId)
    .eq("user_id", userId)
    .single();

  if (fetchError || !existingFlashcard) {
    throw new Error("FLASHCARD_NOT_FOUND");
  }

  // Delete flashcard from the database
  const { error } = await supabase.from("flashcards").delete().eq("id", flashcardId).eq("user_id", userId);

  if (error) {
    console.error("Error deleting flashcard:", error);
    throw new Error(`DATABASE_ERROR: ${error.message}`);
  }
}
