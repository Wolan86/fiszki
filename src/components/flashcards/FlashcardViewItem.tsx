import React from 'react';
import type { FlashcardDto } from '../../types';
import { Edit, Trash2, Save, X } from 'lucide-react';

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

export const FlashcardViewItem: React.FC<FlashcardViewItemProps> = ({
  flashcard,
  onEdit,
  onDelete
}) => {
  const [isFlipped, setIsFlipped] = React.useState(false);
  const [editState, setEditState] = React.useState<EditState>({
    isEditing: false,
    editableFrontContent: flashcard.front_content,
    editableBackContent: flashcard.back_content,
    isSaving: false
  });

  const handleFlip = () => {
    if (!editState.isEditing) {
      setIsFlipped(!isFlipped);
    }
  };

  const handleStartEdit = () => {
    setEditState({
      isEditing: true,
      editableFrontContent: flashcard.front_content,
      editableBackContent: flashcard.back_content,
      isSaving: false
    });
    setIsFlipped(false); // Always start editing from front
  };

  const handleSaveEdit = async () => {
    if (editState.editableFrontContent.trim() && editState.editableBackContent.trim()) {
      setEditState(prev => ({ ...prev, isSaving: true }));
      try {
        await onEdit(flashcard.id, editState.editableFrontContent, editState.editableBackContent);
        setEditState(prev => ({ ...prev, isEditing: false, isSaving: false }));
      } catch (error) {
        setEditState(prev => ({ ...prev, isSaving: false }));
      }
    }
  };

  const handleCancelEdit = () => {
    setEditState({
      isEditing: false,
      editableFrontContent: flashcard.front_content,
      editableBackContent: flashcard.back_content,
      isSaving: false
    });
  };

  const handleDelete = async () => {
    if (window.confirm('Czy na pewno chcesz usunąć tę fiszkę?')) {
      await onDelete(flashcard.id);
    }
  };

  const currentContent = isFlipped ? flashcard.back_content : flashcard.front_content;

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
      {/* Card Content */}
      <div 
        className={`min-h-32 p-4 cursor-pointer ${editState.isEditing ? 'cursor-default' : ''}`}
        onClick={handleFlip}
      >
        {editState.isEditing ? (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Przód
              </label>
              <textarea
                value={editState.editableFrontContent}
                onChange={(e) => setEditState(prev => ({
                  ...prev,
                  editableFrontContent: e.target.value
                }))}
                className="w-full p-2 text-sm border border-gray-300 rounded resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={2}
                placeholder="Treść przodu fiszki..."
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Tył
              </label>
              <textarea
                value={editState.editableBackContent}
                onChange={(e) => setEditState(prev => ({
                  ...prev,
                  editableBackContent: e.target.value
                }))}
                className="w-full p-2 text-sm border border-gray-300 rounded resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={2}
                placeholder="Treść tyłu fiszki..."
              />
            </div>
          </div>
        ) : (
          <div className="flex flex-col justify-center items-center text-center min-h-20">
            <p className="text-sm text-gray-800 mb-2">
              {currentContent}
            </p>
            <div className="text-xs text-gray-400">
              {isFlipped ? 'Tył' : 'Przód'}
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="border-t border-gray-100 px-4 py-3">
        {editState.isEditing ? (
          <div className="flex justify-between">
            <button
              onClick={handleCancelEdit}
              disabled={editState.isSaving}
              className="flex items-center gap-1 px-3 py-1 text-xs text-gray-600 hover:text-gray-800 disabled:opacity-50"
            >
              <X className="w-3 h-3" />
              Anuluj
            </button>
            <button
              onClick={handleSaveEdit}
              disabled={editState.isSaving || !editState.editableFrontContent.trim() || !editState.editableBackContent.trim()}
              className="flex items-center gap-1 px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-3 h-3" />
              {editState.isSaving ? 'Zapisywanie...' : 'Zapisz'}
            </button>
          </div>
        ) : (
          <div className="flex justify-between items-center">
            <div className="text-xs text-gray-400">
              {new Date(flashcard.updated_at).toLocaleDateString('pl-PL')}
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleStartEdit}
                className="flex items-center gap-1 px-2 py-1 text-xs text-gray-600 hover:text-blue-600 transition-colors"
                title="Edytuj"
              >
                <Edit className="w-3 h-3" />
              </button>
              <button
                onClick={handleDelete}
                className="flex items-center gap-1 px-2 py-1 text-xs text-gray-600 hover:text-red-600 transition-colors"
                title="Usuń"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 