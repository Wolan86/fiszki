import React from "react";

interface FlashcardEditViewProps {
  flashcardId: string;
}

const FlashcardEditView: React.FC<FlashcardEditViewProps> = ({ flashcardId }) => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Edycja Fiszki</h1>
        <p className="text-gray-600">ID: {flashcardId}</p>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-yellow-700">Komponent edycji fiszki będzie zaimplementowany w następnych krokach.</p>
      </div>
    </div>
  );
};

export default FlashcardEditView;
