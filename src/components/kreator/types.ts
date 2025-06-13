import type { CreateSourceTextResponse, SourceTextDto, UpdateFlashcardCommand, FlashcardCreationType } from "@/types";

export interface SourceTextFormViewModel {
  content: string;
  wordCount: number;
  minWordCount: number;
  maxWordCount: number;
  isValid: boolean;
  isSaving: boolean;
  lastSaved: Date | null;
  errors: string[];
}

export interface FlashcardViewModel {
  id: string;
  front_content: string;
  back_content: string;
  accepted: boolean | null;
  source_text_id: string | null;
  creation_type: FlashcardCreationType | null;
  user_id: string;
  created_at: string;
  updated_at: string;
  generation_time_ms: number | null;
  isFlipped: boolean;
  isRegenerating: boolean;
  showActions: boolean;
  isEditing: boolean;
  editableFrontContent: string;
  editableBackContent: string;
}

export interface GenerationStatsViewModel {
  requestedCount: number;
  generatedCount: number;
  totalTimeMs: number;
  formattedTime: string;
}

export interface UseSourceTextOptions {
  initialContent?: string;
  minWordCount: number;
  maxWordCount: number;
  autosaveDelay?: number;
}

export interface UseSourceTextResult {
  content: string;
  setContent: (value: string) => void;
  wordCount: number;
  isValid: boolean;
  isSaving: boolean;
  lastSaved: Date | null;
  errors: string[];
  saveSourceText: () => Promise<SourceTextDto | null>;
  saveSourceTextAndGenerateFlashcards: (flashcardCount?: number) => Promise<CreateSourceTextResponse | null>;
  reset: () => void;
}

export interface UseFlashcardGenerationOptions {
  count?: number;
}

export interface UseFlashcardGenerationResult {
  flashcards: FlashcardViewModel[];
  generationStats: GenerationStatsViewModel | null;
  error: ApiErrorResponse | null;
  isGenerating: boolean;
  savingFlashcardIds: string[];
  loadFlashcardsFromResponse: (response: CreateSourceTextResponse) => void;
  updateFlashcard: (id: string, update: UpdateFlashcardCommand) => Promise<void>;
  regenerateFlashcard: (id: string) => Promise<void>;
  saveFlashcard: (id: string) => Promise<void>;
  editFlashcard: (id: string, frontContent: string, backContent: string) => void;
  reset: () => void;
}

export interface ApiErrorResponse {
  message: string;
  code: string;
  details?: Record<string, unknown>;
}
