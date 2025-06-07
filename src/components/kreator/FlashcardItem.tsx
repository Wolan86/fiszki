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
  onSave?: () => void;
  onEdit?: (id: string, frontContent: string, backContent: string) => void;
  showSaveButton?: boolean;
  isSaving?: boolean;
  "data-testid"?: string;
}

export const FlashcardItem: React.FC<FlashcardItemProps> = ({
  flashcard,
  onAccept,
  onReject,
  onRegenerate,
  onSave,
  onEdit,
  showSaveButton = false,
  isSaving = false,
  "data-testid": dataTestId,
}) => {
  const [isFlipped, setIsFlipped] = useState<boolean>(flashcard.isFlipped);
  const [isEditing, setIsEditing] = useState<boolean>(flashcard.isEditing);
  const [editableFrontContent, setEditableFrontContent] = useState<string>(flashcard.editableFrontContent);
  const [editableBackContent, setEditableBackContent] = useState<string>(flashcard.editableBackContent);

  const handleFlip = () => {
    setIsFlipped((prev) => !prev);
  };

  const handleStartEdit = () => {
    setIsEditing(true);
    // Reset editable content to current content when starting edit
    setEditableFrontContent(flashcard.front_content);
    setEditableBackContent(flashcard.back_content);
  };

  const handleSaveEdit = () => {
    if (onEdit) {
      onEdit(flashcard.id, editableFrontContent, editableBackContent);
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    // Reset editable content to original values
    setEditableFrontContent(flashcard.front_content);
    setEditableBackContent(flashcard.back_content);
  };

  // Use the provided testId if available, otherwise fall back to the standard format
  const testId = dataTestId || `flashcard-${flashcard.id}`;

  // Properly determine acceptance status
  const isAccepted = flashcard.accepted === true;
  const isRejected = flashcard.accepted === false;

  return (
    <Card className="overflow-hidden mb-6 transform transition-all duration-300 hover:shadow-md" data-testid={testId}>
      <FlashcardContent
        frontContent={flashcard.front_content}
        backContent={flashcard.back_content}
        isFlipped={isFlipped}
        isEditing={isEditing}
        editableFrontContent={editableFrontContent}
        editableBackContent={editableBackContent}
        onFlip={handleFlip}
        onEditFrontContent={setEditableFrontContent}
        onEditBackContent={setEditableBackContent}
        data-testid={`flashcard-content-${flashcard.id}`}
      />

      {flashcard.showActions && (
        <FlashcardActions
          onAccept={onAccept}
          onReject={onReject}
          onRegenerate={onRegenerate}
          onSave={onSave}
          onEdit={handleStartEdit}
          onSaveEdit={handleSaveEdit}
          onCancelEdit={handleCancelEdit}
          isRegenerating={flashcard.isRegenerating}
          isSaving={isSaving}
          isAccepted={isAccepted}
          isRejected={isRejected}
          isEditing={isEditing}
          showSaveButton={showSaveButton}
          data-testid={`flashcard-actions-${flashcard.id}`}
        />
      )}
    </Card>
  );
};
