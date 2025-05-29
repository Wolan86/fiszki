import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { FlashcardContent } from "./FlashcardContent";
import { FlashcardActions } from "./FlashcardActions";
import type { FlashcardViewModel } from "./types";

interface FlashcardItemProps {
  flashcard: FlashcardViewModel;
  onAccept: () => void;
  onReject: () => void;
  onRegenerate: () => void;
  "data-testid"?: string;
}

export const FlashcardItem: React.FC<FlashcardItemProps> = ({
  flashcard,
  onAccept,
  onReject,
  onRegenerate,
  "data-testid": dataTestId
}) => {
  const [isFlipped, setIsFlipped] = useState<boolean>(flashcard.isFlipped);
  
  const handleFlip = () => {
    setIsFlipped(prev => !prev);
  };
  
  // Use the provided testId if available, otherwise fall back to the standard format
  const testId = dataTestId || `flashcard-${flashcard.id}`;
  
  return (
    <Card className="overflow-hidden mb-6 transform transition-all duration-300 hover:shadow-md" data-testid={testId}>
      <FlashcardContent
        frontContent={flashcard.front_content}
        backContent={flashcard.back_content}
        isFlipped={isFlipped}
        onFlip={handleFlip}
        data-testid={`flashcard-content-${flashcard.id}`}
      />
      
      {flashcard.showActions && (
        <FlashcardActions
          onAccept={onAccept}
          onReject={onReject}
          onRegenerate={onRegenerate}
          isRegenerating={flashcard.isRegenerating}
          isAccepted={flashcard.accepted === true}
          isRejected={flashcard.accepted === false}
          data-testid={`flashcard-actions-${flashcard.id}`}
        />
      )}
    </Card>
  );
}; 