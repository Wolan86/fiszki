import React from "react";
import { FlashcardList } from "./FlashcardList";
import { GenerationStats } from "./GenerationStats";
import type { FlashcardViewModel, GenerationStatsViewModel, ApiErrorResponse } from "./types";

interface GeneratedFlashcardsProps {
  flashcards: FlashcardViewModel[];
  isGenerating: boolean;
  generationStats: GenerationStatsViewModel | null;
  error: ApiErrorResponse | null;
  savingFlashcardIds: string[];
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
  onRegenerate: (id: string) => void;
  onSave?: (id: string) => void;
  onEdit?: (id: string, frontContent: string, backContent: string) => void;
}

export const GeneratedFlashcards: React.FC<GeneratedFlashcardsProps> = ({
  flashcards,
  isGenerating,
  generationStats,
  error,
  savingFlashcardIds,
  onAccept,
  onReject,
  onRegenerate,
  onSave,
  onEdit
}) => {
  if (flashcards.length === 0 && !isGenerating) {
    return null;
  }

  return (
    <div className="space-y-6" data-testid="generated-flashcards-result">
      {generationStats && (
        <div className="flex justify-between items-center">
          <GenerationStats stats={generationStats} />
          <div className="flex space-x-2">
            {/* Buttons for saving, downloading, etc. could go here */}
          </div>
        </div>
      )}
      
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 font-medium">Błąd generowania fiszek</p>
          <p className="text-red-600 text-sm">{error.message}</p>
        </div>
      )}
      
      <FlashcardList
        flashcards={flashcards}
        onAccept={onAccept}
        onReject={onReject}
        onRegenerate={onRegenerate}
        onSave={onSave}
        onEdit={onEdit}
        showSaveButtons={true}
        savingFlashcardIds={savingFlashcardIds}
        data-testid="flashcard-list"
      />
    </div>
  );
}; 