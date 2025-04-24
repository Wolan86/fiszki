import React, { useState } from "react";
import { PageHeader } from "./PageHeader";
import { SourceTextForm } from "./SourceTextForm";
import { ProgressIndicator } from "./ProgressIndicator";
import { GeneratedFlashcards } from "./GeneratedFlashcards";
import { ErrorMessage } from "./ErrorMessage";
import { useFlashcardGeneration } from "./hooks/useFlashcardGeneration";
import type { SourceTextDto, UpdateFlashcardCommand } from "@/types";
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
    generateFlashcards,
    updateFlashcard,
    regenerateFlashcard,
    reset: resetFlashcards
  } = useFlashcardGeneration();
  
  // Obsługa zapisania tekstu źródłowego
  const handleTextSaved = (text: SourceTextDto) => {
    setSourceText(text);
  };
  
  // Obsługa żądania generowania fiszek
  const handleGenerateRequest = (sourceTextId: string, options?: UseFlashcardGenerationOptions) => {
    generateFlashcards(sourceTextId, options);
  };
  
  // Obsługa akceptacji fiszki
  const handleAcceptFlashcard = (id: string) => {
    const update: UpdateFlashcardCommand = { accepted: true };
    updateFlashcard(id, update);
  };
  
  // Obsługa odrzucenia fiszki
  const handleRejectFlashcard = (id: string) => {
    const update: UpdateFlashcardCommand = { accepted: false };
    updateFlashcard(id, update);
  };
  
  // Obsługa regeneracji fiszki
  const handleRegenerateFlashcard = (id: string) => {
    regenerateFlashcard(id);
  };
  
  // Ponowienie próby generowania fiszek
  const handleRetryGeneration = () => {
    if (sourceText) {
      generateFlashcards(sourceText.id);
    }
  };
  
  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      <PageHeader
        title="Kreator fiszek"
        description="Wprowadź tekst źródłowy i wygeneruj fiszki edukacyjne przy pomocy sztucznej inteligencji."
      />
      
      <SourceTextForm
        onTextSaved={handleTextSaved}
        onGenerateRequest={handleGenerateRequest}
      />
      
      {error && (
        <div className="mt-6">
          <ErrorMessage
            error={error}
            onRetry={handleRetryGeneration}
          />
        </div>
      )}
      
      <ProgressIndicator
        isGenerating={isGenerating}
        progressText="Trwa generowanie fiszek edukacyjnych na podstawie tekstu źródłowego..."
      />
      
      {generationStats && flashcards.length > 0 && (
        <GeneratedFlashcards
          flashcards={flashcards}
          stats={generationStats}
          onAccept={handleAcceptFlashcard}
          onReject={handleRejectFlashcard}
          onRegenerate={handleRegenerateFlashcard}
        />
      )}
    </div>
  );
}; 