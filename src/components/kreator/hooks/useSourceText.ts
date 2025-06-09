import { useCallback, useEffect, useState } from "react";
import type { SourceTextDto, CreateSourceTextResponse } from "@/types";
import type { UseSourceTextOptions, UseSourceTextResult } from "../types";
import { saveSourceText } from "@/lib/services/api-service";

export const useSourceText = ({
  initialContent = "",
  minWordCount,
  maxWordCount,
  autosaveDelay = 2000,
}: UseSourceTextOptions): UseSourceTextResult => {
  const [content, setContent] = useState<string>(initialContent);
  const [wordCount, setWordCount] = useState<number>(0);
  const [isValid, setIsValid] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [saveTimer, setSaveTimer] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [lastSavedContent, setLastSavedContent] = useState<string>(initialContent);
  const [isGeneratingFlashcards, setIsGeneratingFlashcards] = useState<boolean>(false);

  // Funkcja do liczenia słów
  const countWords = useCallback((text: string): number => {
    return text.trim() ? text.trim().split(/\s+/).length : 0;
  }, []);

  // Walidacja tekstu
  const validateContent = useCallback(
    (text: string, count: number): string[] => {
      const newErrors: string[] = [];

      if (count < minWordCount) {
        newErrors.push(`Wprowadź co najmniej ${minWordCount} słów`);
      }

      if (count > maxWordCount) {
        newErrors.push(`Przekroczono limit ${maxWordCount} słów`);
      }

      return newErrors;
    },
    [minWordCount, maxWordCount]
  );

  // Efekt do aktualizacji licznika słów i walidacji przy zmianie contentu
  useEffect(() => {
    const count = countWords(content);
    setWordCount(count);

    const newErrors = validateContent(content, count);
    setErrors(newErrors);
    setIsValid(newErrors.length === 0 && count >= minWordCount && count <= maxWordCount);

    // Autosave z lepszą logiką - tylko gdy nie generujemy fiszek
    if (content !== lastSavedContent && content.trim() !== "" && !isGeneratingFlashcards && !isSaving) {
      // Resetujemy poprzedni timer jeśli istnieje
      if (saveTimer) {
        clearTimeout(saveTimer);
      }

      // Ustawiamy nowy timer do autosave z dłuższym opóźnieniem
      const timer = setTimeout(() => {
        if (content.trim() !== "" && content !== lastSavedContent && !isGeneratingFlashcards && !isSaving) {
          handleSaveSourceText();
        }
      }, autosaveDelay);

      setSaveTimer(timer);
    }

    // Cleanup
    return () => {
      if (saveTimer) {
        clearTimeout(saveTimer);
      }
    };
  }, [content, lastSavedContent, minWordCount, maxWordCount, autosaveDelay, isGeneratingFlashcards, isSaving]);

  // Funkcja do zapisywania tekstu źródłowego (bez generowania fiszek)
  const handleSaveSourceText = async (): Promise<SourceTextDto | null> => {
    try {
      // Nie zapisujemy jeśli generujemy fiszki
      if (isGeneratingFlashcards) {
        return null;
      }

      setIsSaving(true);

      // Jeśli tekst jest pusty lub taki sam, nie zapisujemy
      if (content.trim() === "" || content === lastSavedContent) {
        setIsSaving(false);
        return null;
      }

      // Waliduj treść bezpośrednio zamiast polegać na stanie errors
      const currentWordCount = countWords(content);
      const currentErrors = validateContent(content, currentWordCount);

      // Jeśli tekst nie jest poprawny, nie zapisujemy
      if (currentErrors.length > 0) {
        setIsSaving(false);
        return null;
      }

      const response = await saveSourceText(content, false); // No flashcard generation in autosave
      setLastSaved(new Date());
      setLastSavedContent(content);

      // Zapisujemy również kopię w localStorage jako backup
      try {
        localStorage.setItem("source_text_backup", content);
      } catch (error) {
        console.error("Failed to save backup to localStorage", error);
      }

      return response.source_text;
    } catch (error) {
      console.error("Failed to save source text", error);
      return null;
    } finally {
      setIsSaving(false);
    }
  };

  // Funkcja do zapisywania tekstu i generowania fiszek w jednym calu
  const saveSourceTextAndGenerateFlashcards = async (
    flashcardCount?: number
  ): Promise<CreateSourceTextResponse | null> => {
    try {
      // Zatrzymujemy autosave podczas generowania
      setIsGeneratingFlashcards(true);
      setIsSaving(true);

      // Jeśli tekst jest pusty, nie zapisujemy
      if (content.trim() === "") {
        setIsSaving(false);
        setIsGeneratingFlashcards(false);
        return null;
      }

      // Waliduj treść bezpośrednio zamiast polegać na stanie errors
      const currentWordCount = countWords(content);
      const currentErrors = validateContent(content, currentWordCount);

      // Jeśli tekst nie jest poprawny, nie zapisujemy
      if (currentErrors.length > 0) {
        setIsSaving(false);
        setIsGeneratingFlashcards(false);
        return null;
      }

      const response = await saveSourceText(content, true, flashcardCount); // Generate flashcards

      setLastSaved(new Date());
      setLastSavedContent(content);

      // Zapisujemy również kopię w localStorage jako backup
      try {
        localStorage.setItem("source_text_backup", content);
      } catch (error) {
        console.error("Failed to save backup to localStorage", error);
      }

      return response;
    } catch (error) {
      console.error("Failed to save source text and generate flashcards", error);
      throw error; // Re-throw error so calling component can handle it
    } finally {
      setIsSaving(false);
      setIsGeneratingFlashcards(false);
    }
  };

  // Reset stanu
  const reset = (): void => {
    setContent("");
    setWordCount(0);
    setIsValid(false);
    setIsSaving(false);
    setLastSaved(null);
    setErrors([]);
    setLastSavedContent("");

    // Usuwamy również kopię z localStorage
    try {
      localStorage.removeItem("source_text_backup");
    } catch (error) {
      console.error("Failed to remove backup from localStorage", error);
    }
  };

  return {
    content,
    setContent,
    wordCount,
    isValid,
    isSaving,
    lastSaved,
    errors,
    saveSourceText: handleSaveSourceText,
    saveSourceTextAndGenerateFlashcards,
    reset,
  };
};
