import React from "react";
import { Button } from "@/components/ui/button";
import { Check, X, RefreshCw, Save, Edit, Ban } from "lucide-react";

interface FlashcardActionsProps {
  onAccept: () => void;
  onReject: () => void;
  onRegenerate: () => void;
  onSave?: () => void;
  onEdit?: () => void;
  onSaveEdit?: () => void;
  onCancelEdit?: () => void;
  isRegenerating: boolean;
  isSaving?: boolean;
  isAccepted?: boolean;
  isRejected?: boolean;
  isEditing?: boolean;
  showSaveButton?: boolean;
  "data-testid"?: string;
}

export const FlashcardActions: React.FC<FlashcardActionsProps> = ({
  onAccept,
  onReject,
  onRegenerate,
  onSave,
  onEdit,
  onSaveEdit,
  onCancelEdit,
  isRegenerating,
  isSaving = false,
  isAccepted = false,
  isRejected = false,
  isEditing = false,
  showSaveButton = false,
  "data-testid": dataTestId = "flashcard-actions",
}) => {
  // Jeśli jest w trybie edycji, pokazuj przyciski zapisz/anuluj edycję
  if (isEditing) {
    return (
      <div
        className="flex justify-center space-x-2 p-3 bg-neutral-50 border-t border-neutral-200"
        data-testid={dataTestId}
      >
        <Button
          variant="ghost"
          size="sm"
          className="text-green-700 hover:text-green-800 hover:bg-green-50"
          onClick={onSaveEdit}
          disabled={isSaving}
          data-testid="save-edit-button"
        >
          <Check className="w-4 h-4 mr-1" />
          <span>Zapisz zmiany</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="text-neutral-700 hover:text-neutral-800 hover:bg-neutral-100"
          onClick={onCancelEdit}
          disabled={isSaving}
          data-testid="cancel-edit-button"
        >
          <Ban className="w-4 h-4 mr-1" />
          <span>Anuluj</span>
        </Button>
      </div>
    );
  }

  // Jeśli fiszka jest zaakceptowana (accepted === true), pokazuj tylko przycisk Zapisz i status
  if (isAccepted) {
    return (
      <div
        className="flex justify-center space-x-2 p-3 bg-neutral-50 border-t border-neutral-200"
        data-testid={dataTestId}
      >
        {onEdit && (
          <Button
            variant="ghost"
            size="sm"
            className="text-blue-700 hover:text-blue-800 hover:bg-blue-50"
            onClick={onEdit}
            disabled={isSaving}
            data-testid="edit-flashcard-button"
          >
            <Edit className="w-4 h-4 mr-1" />
            <span>Edytuj</span>
          </Button>
        )}
        {showSaveButton && onSave && (
          <Button
            variant="ghost"
            size="sm"
            className="text-purple-700 hover:text-purple-800 hover:bg-purple-50"
            onClick={onSave}
            disabled={isSaving}
            data-testid="save-flashcard-button"
          >
            {isSaving ? (
              <>
                <Save className="w-4 h-4 mr-1 animate-spin" />
                <span>Zapisuję...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-1" />
                <span>Zapisz</span>
              </>
            )}
          </Button>
        )}
        <div className="text-sm text-green-600 flex items-center">
          <Check className="w-4 h-4 mr-1" />
          <span>Zaakceptowana</span>
        </div>
      </div>
    );
  }

  // Jeśli fiszka jest odrzucona (accepted === false), pokazuj tylko przycisk Regeneruj i status
  if (isRejected) {
    return (
      <div
        className="flex justify-center space-x-2 p-3 bg-neutral-50 border-t border-neutral-200"
        data-testid={dataTestId}
      >
        <Button
          variant="ghost"
          size="sm"
          className="text-blue-700 hover:text-blue-800 hover:bg-blue-50"
          onClick={onRegenerate}
          disabled={isRegenerating}
          data-testid="regenerate-flashcard-button"
        >
          {isRegenerating ? (
            <>
              <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
              <span>Regeneruję...</span>
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4 mr-1" />
              <span>Regeneruj</span>
            </>
          )}
        </Button>
        <div className="text-sm text-red-600 flex items-center">
          <X className="w-4 h-4 mr-1" />
          <span>Odrzucona</span>
        </div>
      </div>
    );
  }

  // Domyślnie (accepted === null) pokazuj przyciski akceptuj/odrzuć/edytuj dla nowych fiszek
  return (
    <div
      className="flex justify-center space-x-2 p-3 bg-neutral-50 border-t border-neutral-200"
      data-testid={dataTestId}
    >
      <Button
        variant="ghost"
        size="sm"
        className="text-green-700 hover:text-green-800 hover:bg-green-50"
        onClick={onAccept}
        disabled={isRegenerating || isSaving}
        data-testid="accept-flashcard-button"
      >
        <Check className="w-4 h-4 mr-1" />
        <span>Akceptuj</span>
      </Button>

      <Button
        variant="ghost"
        size="sm"
        className="text-red-700 hover:text-red-800 hover:bg-red-50"
        onClick={onReject}
        disabled={isRegenerating || isSaving}
        data-testid="reject-flashcard-button"
      >
        <X className="w-4 h-4 mr-1" />
        <span>Odrzuć</span>
      </Button>

      {onEdit && (
        <Button
          variant="ghost"
          size="sm"
          className="text-blue-700 hover:text-blue-800 hover:bg-blue-50"
          onClick={onEdit}
          disabled={isRegenerating || isSaving}
          data-testid="edit-flashcard-button"
        >
          <Edit className="w-4 h-4 mr-1" />
          <span>Edytuj</span>
        </Button>
      )}
    </div>
  );
};
