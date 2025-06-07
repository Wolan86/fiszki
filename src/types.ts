import type { Database } from "./db/database.types";

// Base entity types derived from database
export type SourceText = Database["public"]["Tables"]["source_texts"]["Row"];
export type Flashcard = Database["public"]["Tables"]["flashcards"]["Row"];

// Enum types
export type FlashcardCreationType = Database["public"]["Enums"]["flashcard_creation_type"];

// ----- SOURCE TEXT DTOs -----

// Create Source Text Command
export interface CreateSourceTextCommand {
  content: string;
  generate_flashcards?: boolean;
  flashcard_count?: number;
}

// Create Source Text Response (when flashcards are generated)
export interface CreateSourceTextResponse {
  source_text: SourceTextDto;
  flashcards?: UnsavedFlashcardDto[];
  generation_stats?: {
    requested_count: number;
    generated_count: number;
    total_time_ms: number;
  };
}

// Source Text Response DTO
export type SourceTextDto = SourceText;

// Source Text List Query Parameters
export interface SourceTextListQueryParams {
  limit?: number;
  offset?: number;
  sort?: keyof SourceText;
  order?: "asc" | "desc";
}

// Source Text List Response
export interface SourceTextListResponse {
  data: SourceTextDto[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
  };
}

// Generate Flashcards Command
export interface GenerateFlashcardsCommand {
  count?: number;
}

// Generate Flashcards Response
export interface GenerateFlashcardsResponse {
  flashcards: FlashcardDto[];
  generation_stats: {
    requested_count: number;
    generated_count: number;
    total_time_ms: number;
  };
}

// ----- FLASHCARD DTOs -----

// Create Flashcard Command
export interface CreateFlashcardCommand {
  front_content: string;
  back_content: string;
  source_text_id?: string;
}

// Flashcard Response DTO
export type FlashcardDto = Flashcard;

// Unsaved Flashcard DTO (for generated but not yet saved flashcards)
export interface UnsavedFlashcardDto {
  id: string; // temporary ID
  front_content: string;
  back_content: string;
  accepted: boolean | null;
  source_text_id: string | null;
  creation_type: FlashcardCreationType | null;
  user_id: string;
  created_at: string;
  updated_at: string;
  generation_time_ms: number | null;
}

// Update Flashcard Command
export interface UpdateFlashcardCommand {
  front_content?: string;
  back_content?: string;
  accepted?: boolean;
}

// Flashcard List Query Parameters
export interface FlashcardListQueryParams {
  limit?: number;
  offset?: number;
  sort?: keyof Flashcard;
  order?: "asc" | "desc";
  source_text_id?: string;
  creation_type?: FlashcardCreationType;
  accepted?: boolean;
}

// Flashcard List Response
export interface FlashcardListResponse {
  data: FlashcardDto[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
  };
}

// Flashcard Learning Query Parameters
export interface FlashcardLearningQueryParams {
  limit?: number;
  source_text_id?: string;
}

// Flashcard Learning Response
export interface FlashcardLearningResponse {
  data: FlashcardDto[];
  total: number;
}

// API Error Response
export interface ApiErrorResponse {
  message: string;
  code: string;
  details?: Record<string, unknown>;
}
