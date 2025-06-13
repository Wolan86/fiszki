import React from "react";
import type { FlashcardDto } from "../../types";
import { Edit, Trash2 } from "lucide-react";

interface FlashcardViewItemProps {
  flashcard: FlashcardDto;
  onEdit: (id: string, frontContent: string, backContent: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

interface EditState {
  isEditing: boolean;
  editableFrontContent: string;
  editableBackContent: string;
  isSaving: boolean;
}

export const FlashcardViewItem: React.FC<FlashcardViewItemProps> = ({ flashcard, onEdit, onDelete }) => {
  const [editState, setEditState] = React.useState<EditState>({
    isEditing: false,
    editableFrontContent: flashcard.front_content,
    editableBackContent: flashcard.back_content,
    isSaving: false,
  });

  // Flip functionality removed - not currently used in UI

  const handleStartEdit = () => {
    setEditState({
      isEditing: true,
      editableFrontContent: flashcard.front_content,
      editableBackContent: flashcard.back_content,
      isSaving: false,
    });
  };

  const handleSaveEdit = async () => {
    if (editState.editableFrontContent.trim() && editState.editableBackContent.trim()) {
      setEditState((prev) => ({ ...prev, isSaving: true }));
      try {
        await onEdit(flashcard.id, editState.editableFrontContent, editState.editableBackContent);
        setEditState((prev) => ({ ...prev, isEditing: false, isSaving: false }));
      } catch {
        setEditState((prev) => ({ ...prev, isSaving: false }));
      }
    }
  };

  const handleCancelEdit = () => {
    setEditState({
      isEditing: false,
      editableFrontContent: flashcard.front_content,
      editableBackContent: flashcard.back_content,
      isSaving: false,
    });
  };

  const handleDelete = async () => {
    if (window.confirm("Czy na pewno chcesz usunąć tę fiszkę?")) {
      await onDelete(flashcard.id);
    }
  };

  // Content display logic moved inline

  return (
    <div
      className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200"
      data-testid={`flashcard-item-${flashcard.id}`}
    >
      <div className="p-4">
        {editState.isEditing ? (
          <div data-testid={`edit-form-${flashcard.id}`}>
            <div className="space-y-3">
              <div>
                <input
                  type="text"
                  value={editState.editableFrontContent}
                  onChange={(e) =>
                    setEditState((prev) => ({
                      ...prev,
                      editableFrontContent: e.target.value,
                    }))
                  }
                  className="w-full p-2 border border-gray-300 rounded-md text-sm font-medium"
                  placeholder="Termin"
                  data-testid={`edit-term-input-${flashcard.id}`}
                />
              </div>
              <div>
                <textarea
                  value={editState.editableBackContent}
                  onChange={(e) =>
                    setEditState((prev) => ({
                      ...prev,
                      editableBackContent: e.target.value,
                    }))
                  }
                  className="w-full p-2 border border-gray-300 rounded-md text-sm resize-none min-h-[60px]"
                  placeholder="Definicja"
                  data-testid={`edit-definition-input-${flashcard.id}`}
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={handleCancelEdit}
                  className="px-3 py-1 text-xs text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                  data-testid={`cancel-edit-button-${flashcard.id}`}
                >
                  Anuluj
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="px-3 py-1 text-xs text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                  data-testid={`save-edit-button-${flashcard.id}`}
                  disabled={
                    editState.isSaving ||
                    !editState.editableFrontContent.trim() ||
                    !editState.editableBackContent.trim()
                  }
                >
                  {editState.isSaving ? "Zapisywanie..." : "Zapisz"}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div data-testid={`flashcard-content-${flashcard.id}`}>
            <div className="flex items-start justify-between mb-2">
              <h3
                className="text-sm font-medium text-gray-900 line-clamp-2"
                data-testid={`flashcard-term-${flashcard.id}`}
              >
                {flashcard.front_content}
              </h3>
              <div className="flex gap-1 ml-2">
                <button
                  onClick={handleStartEdit}
                  className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                  title="Edytuj fiszkę"
                  data-testid={`edit-button-${flashcard.id}`}
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={handleDelete}
                  className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                  title="Usuń fiszkę"
                  data-testid={`delete-button-${flashcard.id}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            <p className="text-xs text-gray-600 line-clamp-3" data-testid={`flashcard-definition-${flashcard.id}`}>
              {flashcard.back_content}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
