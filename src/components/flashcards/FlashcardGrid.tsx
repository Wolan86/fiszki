import React from 'react';
import type { FlashcardDto } from '../../types';
import { FlashcardViewItem } from './FlashcardViewItem';

interface FlashcardGridProps {
  flashcards: FlashcardDto[];
  onEdit: (id: string, frontContent: string, backContent: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  loading?: boolean;
}

export const FlashcardGrid: React.FC<FlashcardGridProps> = ({
  flashcards,
  onEdit,
  onDelete,
  loading = false
}) => {
  if (loading && flashcards.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" data-testid="flashcard-grid-loading">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="animate-pulse" data-testid={`loading-skeleton-${index}`}>
            <div className="bg-gray-200 rounded-lg h-32"></div>
          </div>
        ))}
      </div>
    );
  }

  if (flashcards.length === 0) {
    return (
      <div className="text-center py-12" data-testid="flashcard-grid-empty">
        <div className="text-gray-500 text-lg mb-2">
          Brak fiszek do wyświetlenia
        </div>
        <p className="text-gray-400">
          Rozpocznij naukę tworząc swoje pierwsze fiszki
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" data-testid="flashcard-grid">
        {flashcards.map((flashcard) => (
          <FlashcardViewItem
            key={flashcard.id}
            flashcard={flashcard}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
      
      {loading && flashcards.length > 0 && (
        <div className="flex justify-center mt-6" data-testid="flashcard-grid-loading-more">
          <div className="text-gray-500">Ładowanie...</div>
        </div>
      )}
    </>
  );
}; 