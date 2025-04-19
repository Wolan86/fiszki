import type { Database } from "./db/database.types";

// Base entity types derived from database
export type SourceText = Database["public"]["Tables"]["source_texts"]["Row"];
export type Flashcard = Database["public"]["Tables"]["flashcards"]["Row"];

// Enum types
export type FlashcardCreationType = Database["public"]["Enums"]["flashcard_creation_type"];

// ----- SOURCE TEXT DTOs -----

// Create Source Text Command
export type CreateSourceTextCommand = {
  content: string;
};

// Source Text Response DTO
export type SourceTextDto = SourceText;

// Source Text List Query Parameters
export type SourceTextListQueryParams = {
  limit?: number;
  offset?: number;
  sort?: keyof SourceText;
  order?: "asc" | "desc";
};

// Source Text List Response
export type SourceTextListResponse = {
  data: SourceTextDto[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
  };
};

// Generate Flashcards Command
export type GenerateFlashcardsCommand = {
  count?: number;
};

// Generate Flashcards Response
export type GenerateFlashcardsResponse = {
  flashcards: FlashcardDto[];
  generation_stats: {
    requested_count: number;
    generated_count: number;
    total_time_ms: number;
  };
};

// ----- FLASHCARD DTOs -----

// Create Flashcard Command
export type CreateFlashcardCommand = {
  front_content: string;
  back_content: string;
  source_text_id?: string;
};

// Flashcard Response DTO
export type FlashcardDto = Flashcard;

// Update Flashcard Command
export type UpdateFlashcardCommand = {
  front_content?: string;
  back_content?: string;
  accepted?: boolean;
};

// Flashcard List Query Parameters
export type FlashcardListQueryParams = {
  limit?: number;
  offset?: number;
  sort?: keyof Flashcard;
  order?: "asc" | "desc";
  source_text_id?: string;
  creation_type?: FlashcardCreationType;
  accepted?: boolean;
};

// Flashcard List Response
export type FlashcardListResponse = {
  data: FlashcardDto[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
  };
};

// Flashcard Learning Query Parameters
export type FlashcardLearningQueryParams = {
  limit?: number;
  source_text_id?: string;
};

// Flashcard Learning Response
export type FlashcardLearningResponse = {
  data: FlashcardDto[];
  total: number;
};

// API Error Response
export type ApiErrorResponse = {
  message: string;
  code: string;
  details?: Record<string, unknown>;
}; 