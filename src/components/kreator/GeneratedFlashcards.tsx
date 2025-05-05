import React from "react";
import { FlashcardList } from "./FlashcardList";
import { GenerationStats } from "./GenerationStats";
import type { FlashcardViewModel, GenerationStatsViewModel } from "./types";

interface GeneratedFlashcardsProps {
  flashcards: FlashcardViewModel[];
  stats: GenerationStatsViewModel;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
  onRegenerate: (id: string) => void;
}

export const GeneratedFlashcards: React.FC<GeneratedFlashcardsProps> = ({
  flashcards,
  stats,
  onAccept,
  onReject,
  onRegenerate
}) => {
  if (flashcards.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6" data-testid="generated-flashcards-result">
      <div className="flex justify-between items-center">
        <GenerationStats stats={stats} />
        <div className="flex space-x-2">
          {/* Buttons for saving, downloading, etc. could go here */}
        </div>
      </div>
      
      <FlashcardList
        flashcards={flashcards}
        onAccept={onAccept}
        onReject={onReject}
        onRegenerate={onRegenerate}
        data-testid="flashcard-list"
      />
    </div>
  );
}; 