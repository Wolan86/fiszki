import React, { useState } from "react";
import { PageHeader } from "./PageHeader";
import { SourceTextForm } from "./SourceTextForm";
import { ProgressIndicator } from "./ProgressIndicator";
import { GeneratedFlashcards } from "./GeneratedFlashcards";
import { FlashcardCreationForm } from "./FlashcardCreationForm";
import { ErrorMessage } from "./ErrorMessage";
import { useFlashcardGeneration } from "./hooks/useFlashcardGeneration";
import type { SourceTextDto, UpdateFlashcardCommand, CreateSourceTextResponse } from "@/types";
import type { UseFlashcardGenerationOptions } from "./types";

export const CreatorView: React.FC = () => {
  // Stan tekstu źródłowego
  const [sourceText, setSourceText] = useState<SourceTextDto | null>(null);
  
  // Hook do generowania fiszek
  const {
    flashcards,
    isGenerating,
    generationStats,
    error,
    savingFlashcardIds,
    loadFlashcardsFromResponse,
    updateFlashcard,
    regenerateFlashcard,
    saveFlashcard,
    editFlashcard,
    reset
  } = useFlashcardGeneration();
  
  // Obsługa zapisania tekstu źródłowego
  const handleTextSaved = (savedText: SourceTextDto) => {
    setSourceText(savedText);
  };
  
  // Obsługa wygenerowania fiszek - nowy flow
  const handleFlashcardsGenerated = (response: CreateSourceTextResponse) => {
    loadFlashcardsFromResponse(response);
  };
  
  // Obsługa akceptacji fiszki
  const handleAcceptFlashcard = async (id: string) => {
    await updateFlashcard(id, { accepted: true });
  };
  
  // Obsługa odrzucenia fiszki
  const handleRejectFlashcard = async (id: string) => {
    await updateFlashcard(id, { accepted: false });
  };
  
  // Obsługa regeneracji fiszki
  const handleRegenerateFlashcard = async (id: string) => {
    await regenerateFlashcard(id);
  };
  
  // Obsługa zapisania fiszki do bazy danych
  const handleSaveFlashcard = async (id: string) => {
    await saveFlashcard(id);
  };

  // Obsługa edycji fiszki
  const handleEditFlashcard = (id: string, frontContent: string, backContent: string) => {
    editFlashcard(id, frontContent, backContent);
  };
  
  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl" data-testid="flashcard-creator-view">
      <PageHeader
        title="Kreator fiszek"
        description="Wprowadź tekst źródłowy i wygeneruj fiszki edukacyjne przy pomocy sztucznej inteligencji."
        
      />
      
      <SourceTextForm
        onTextSaved={handleTextSaved}
        onFlashcardsGenerated={handleFlashcardsGenerated}
        data-testid="source-text-form"
      />

      <FlashcardCreationForm
        sourceTextId={sourceText?.id}
        onFlashcardCreated={() => {
          // Możemy dodać jakąś notyfikację o sukcesie
          console.log("Fiszka została utworzona pomyślnie");
        }}
        data-testid="flashcard-creation-form"
      />
      
      {error && (
        <div className="mt-6" data-testid="flashcard-generation-error">
          <ErrorMessage
            error={error}
            onRetry={() => {
              if (sourceText) {
                // Implement the retry logic here
              }
            }}
            data-testid="generation-error-message"
          />
        </div>
      )}
      
      <ProgressIndicator
        isGenerating={isGenerating}
        progressText="Trwa generowanie fiszek edukacyjnych na podstawie tekstu źródłowego..."
        data-testid="flashcard-generation-progress"
      />
      
      {generationStats && flashcards.length > 0 && (
        <GeneratedFlashcards
          flashcards={flashcards}
          isGenerating={isGenerating}
          generationStats={generationStats}
          error={error}
          savingFlashcardIds={savingFlashcardIds}
          onAccept={handleAcceptFlashcard}
          onReject={handleRejectFlashcard}
          onRegenerate={handleRegenerateFlashcard}
          onSave={handleSaveFlashcard}
          onEdit={handleEditFlashcard}
          data-testid="generated-flashcards-container"
        />
      )}
    </div>
  );
}; 