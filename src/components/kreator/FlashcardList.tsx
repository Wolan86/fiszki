import React from "react";
import { FlashcardItem } from "./FlashcardItem";
import type { FlashcardViewModel } from "./types";

interface FlashcardListProps {
  flashcards: FlashcardViewModel[];
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
  onRegenerate: (id: string) => void;
  onSave?: (id: string) => void;
  onEdit?: (id: string, frontContent: string, backContent: string) => void;
  showSaveButtons?: boolean;
  savingFlashcardIds?: string[];
}

export const FlashcardList: React.FC<FlashcardListProps> = ({
  flashcards,
  onAccept,
  onReject,
  onRegenerate,
  onSave,
  onEdit,
  showSaveButtons = false,
  savingFlashcardIds = []
}) => {
  if (flashcards.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4 my-6" data-testid="flashcard-list-container">
      <h2 className="text-xl font-semibold">Wygenerowane fiszki</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6" data-testid="flashcard-grid">
        {flashcards.map(flashcard => (
          <FlashcardItem
            key={flashcard.id}
            flashcard={flashcard}
            onAccept={() => onAccept(flashcard.id)}
            onReject={() => onReject(flashcard.id)}
            onRegenerate={() => onRegenerate(flashcard.id)}
            onSave={onSave ? () => onSave(flashcard.id) : undefined}
            onEdit={onEdit ? (id, frontContent, backContent) => onEdit(id, frontContent, backContent) : undefined}
            showSaveButton={showSaveButtons && flashcard.accepted === true}
            isSaving={savingFlashcardIds.includes(flashcard.id)}
            data-testid={`flashcard-item-${flashcard.id}`}
          />
        ))}
      </div>
    </div>
  );
}; 