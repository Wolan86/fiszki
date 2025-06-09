import React from 'react';
import { useFlashcardList } from './hooks/useFlashcardList';
import { SimpleFlashcardSearch } from './SimpleFlashcardSearch';
import { FlashcardGrid } from './FlashcardGrid';

export const FlashcardListView: React.FC = () => {
  const {
    flashcards,
    searchQuery,
    loading,
    error,
    fetchFlashcards,
    updateSearch,
    editFlashcard,
    deleteFlashcard
  } = useFlashcardList();

  React.useEffect(() => {
    fetchFlashcards();
  }, []);

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Moje Fiszki
        </h1>
        <p className="text-gray-600">
          Przeglądaj i edytuj swoje fiszki
        </p>
      </div>

      <div className="mb-6">
        <SimpleFlashcardSearch
          searchQuery={searchQuery}
          onSearchChange={updateSearch}
          loading={loading}
        />
      </div>

      <FlashcardGrid
        flashcards={flashcards}
        onEdit={editFlashcard}
        onDelete={deleteFlashcard}
        loading={loading}
      />
    </div>
  );
};

export default FlashcardListView; 