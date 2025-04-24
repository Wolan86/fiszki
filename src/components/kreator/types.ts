import type { CreateSourceTextCommand, FlashcardDto, SourceTextDto, UpdateFlashcardCommand } from "@/types";

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

export interface FlashcardViewModel extends FlashcardDto {
  isFlipped: boolean;
  isRegenerating: boolean;
  showActions: boolean;
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
  reset: () => void;
}

export interface UseFlashcardGenerationOptions {
  count?: number;
}

export interface UseFlashcardGenerationResult {
  flashcards: FlashcardViewModel[];
  isGenerating: boolean;
  generationStats: GenerationStatsViewModel | null;
  error: ApiErrorResponse | null;
  generateFlashcards: (sourceTextId: string, options?: UseFlashcardGenerationOptions) => Promise<void>;
  updateFlashcard: (id: string, update: UpdateFlashcardCommand) => Promise<void>;
  regenerateFlashcard: (id: string) => Promise<void>;
  reset: () => void;
}

export interface ApiErrorResponse {
  message: string;
  code: string;
  details?: Record<string, unknown>;
} 