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
    <div className="space-y-6">
      <GenerationStats stats={stats} />
      
      <FlashcardList
        flashcards={flashcards}
        onAccept={onAccept}
        onReject={onReject}
        onRegenerate={onRegenerate}
      />
    </div>
  );
}; 