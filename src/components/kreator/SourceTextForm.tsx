import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { SourceTextInput } from "./SourceTextInput";
import { WordCounter } from "./WordCounter";
import { GenerateButton } from "./GenerateButton";
import { useSourceText } from "./hooks/useSourceText";
import type { SourceTextDto, CreateSourceTextResponse } from "@/types";

interface SourceTextFormProps {
  onTextSaved: (sourceText: SourceTextDto) => void;
  onFlashcardsGenerated: (response: CreateSourceTextResponse) => void;
  isGenerating?: boolean;
  onGenerationStart?: () => void;
  onGenerationEnd?: () => void;
}

export const SourceTextForm: React.FC<SourceTextFormProps> = ({ 
  onTextSaved, 
  onFlashcardsGenerated,
  isGenerating = false,
  onGenerationStart,
  onGenerationEnd
}) => {
  const MIN_WORD_COUNT = 1000;
  const MAX_WORD_COUNT = 10000;

  const [sourceTextId, setSourceTextId] = useState<string | null>(null);

  const {
    content,
    setContent,
    wordCount,
    isValid,
    isSaving,
    lastSaved,
    errors,
    saveSourceText,
    saveSourceTextAndGenerateFlashcards,
  } = useSourceText({
    minWordCount: MIN_WORD_COUNT,
    maxWordCount: MAX_WORD_COUNT,
    autosaveDelay: 2000,
  });

  // Obsługa ręcznego zapisu tekstu
  const handleSave = async () => {
    // Nie zapisujemy podczas generowania fiszek
    if (isGenerating) {
      console.log("Skipping manual save during flashcard generation");
      return;
    }

    const savedText = await saveSourceText();
    if (savedText) {
      setSourceTextId(savedText.id);
      onTextSaved(savedText);
    }
  };

  // Obsługa żądania generowania fiszek - teraz wszystko w jednym calu
  const handleGenerateRequest = async () => {
    // Check validation directly instead of relying on isValid state
    const currentWordCount = content.trim().split(/\s+/).length;
    const hasValidLength = currentWordCount >= MIN_WORD_COUNT && currentWordCount <= MAX_WORD_COUNT;
    const hasContent = content.trim().length > 0;

    if (!hasValidLength || !hasContent) {
      return;
    }

    try {
      onGenerationStart?.();
      const response = await saveSourceTextAndGenerateFlashcards(5); // Default 5 flashcards

      if (response) {
        setSourceTextId(response.source_text.id);
        onTextSaved(response.source_text);
        onFlashcardsGenerated(response);
      }
    } catch (error) {
      console.error("Error generating flashcards:", error);
    } finally {
      onGenerationEnd?.();
    }
  };

  // Informacja o statusie zapisywania
  const getSaveStatus = () => {
    if (isSaving || isGenerating) return isGenerating ? "Generowanie fiszek..." : "Zapisywanie...";
    if (lastSaved) return `Ostatnio zapisano: ${lastSaved.toLocaleTimeString()}`;
    return "Niezapisany";
  };

  return (
    <Card className="p-6" data-testid="source-text-card">
      <div className="space-y-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Tekst źródłowy</h2>
          <span className="text-sm text-neutral-500" data-testid="save-status">
            {getSaveStatus()}
          </span>
        </div>

        <WordCounter
          currentCount={wordCount}
          minCount={MIN_WORD_COUNT}
          maxCount={MAX_WORD_COUNT}
          data-testid="word-counter"
        />

        <SourceTextInput
          value={content}
          onChange={setContent}
          onBlur={() => {}}
          isValid={isValid}
          errors={errors}
          data-testid="source-text-input"
        />

        <div className="pt-4 flex justify-end">
          <GenerateButton
            onClick={handleGenerateRequest}
            disabled={!isValid || isSaving || isGenerating}
            isLoading={isGenerating}
            data-testid="generate-button"
          />
        </div>
      </div>
    </Card>
  );
};
