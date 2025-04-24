import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { SourceTextInput } from "./SourceTextInput";
import { WordCounter } from "./WordCounter";
import { GenerateButton } from "./GenerateButton";
import { useSourceText } from "./hooks/useSourceText";
import type { SourceTextDto } from "@/types";

interface SourceTextFormProps {
  onTextSaved: (sourceText: SourceTextDto) => void;
  onGenerateRequest: (sourceTextId: string) => void;
}

export const SourceTextForm: React.FC<SourceTextFormProps> = ({
  onTextSaved,
  onGenerateRequest
}) => {
  const MIN_WORD_COUNT = 1000;
  const MAX_WORD_COUNT = 10000;
  
  const [sourceTextId, setSourceTextId] = useState<string | null>(null);
  const [canGenerate, setCanGenerate] = useState<boolean>(false);
  
  const {
    content,
    setContent,
    wordCount,
    isValid,
    isSaving,
    lastSaved,
    errors,
    saveSourceText
  } = useSourceText({
    minWordCount: MIN_WORD_COUNT,
    maxWordCount: MAX_WORD_COUNT,
    autosaveDelay: 2000
  });
  
  // Sprawdzenie, czy możemy generować fiszki (tekst jest zapisany i poprawny)
  useEffect(() => {
    setCanGenerate(isValid && sourceTextId !== null && !isSaving);
  }, [isValid, sourceTextId, isSaving]);
  
  // Obsługa ręcznego zapisu tekstu
  const handleSave = async () => {
    const savedText = await saveSourceText();
    if (savedText) {
      setSourceTextId(savedText.id);
      onTextSaved(savedText);
    }
  };
  
  // Obsługa żądania generowania fiszek
  const handleGenerateRequest = () => {
    if (sourceTextId && canGenerate) {
      onGenerateRequest(sourceTextId);
    } else if (isValid && !sourceTextId) {
      // Jeśli tekst jest poprawny, ale nie został jeszcze zapisany, zapisz go najpierw
      handleSave().then(() => {
        if (sourceTextId) {
          onGenerateRequest(sourceTextId);
        }
      });
    }
  };
  
  // Informacja o statusie zapisywania
  const getSaveStatus = () => {
    if (isSaving) return "Zapisywanie...";
    if (lastSaved) return `Ostatnio zapisano: ${lastSaved.toLocaleTimeString()}`;
    return "Niezapisany";
  };
  
  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-semibold">Tekst źródłowy</h2>
          <span className="text-sm text-neutral-500">{getSaveStatus()}</span>
        </div>
        
        <WordCounter
          currentCount={wordCount}
          minCount={MIN_WORD_COUNT}
          maxCount={MAX_WORD_COUNT}
        />
        
        <SourceTextInput
          value={content}
          onChange={setContent}
          onBlur={handleSave}
          isValid={isValid}
          errors={errors}
        />
        
        <div className="pt-4 flex justify-end">
          <GenerateButton
            onClick={handleGenerateRequest}
            disabled={!canGenerate && !isValid}
            isLoading={isSaving}
          />
        </div>
      </div>
    </Card>
  );
}; 