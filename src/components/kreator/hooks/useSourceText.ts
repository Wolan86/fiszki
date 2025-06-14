import { useCallback, useEffect, useState, useRef } from "react";
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
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
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

  // Funkcja do zapisywania tekstu źródłowego (bez generowania fiszek)
  const handleSaveSourceText = useCallback(async (): Promise<SourceTextDto | null> => {
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
      } catch {
        // Failed to save backup to localStorage - handled silently
      }

      return response.source_text;
    } catch {
      // Failed to save source text - handled silently
      return null;
    } finally {
      setIsSaving(false);
    }
  }, [
    content,
    lastSavedContent,
    isGeneratingFlashcards,
    countWords,
    validateContent,
    setIsSaving,
    setLastSaved,
    setLastSavedContent,
  ]);

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
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }

      // Ustawiamy nowy timer do autosave z opóźnieniem określonym w opcjach
      saveTimerRef.current = setTimeout(() => {
        if (content.trim() !== "" && content !== lastSavedContent && !isGeneratingFlashcards && !isSaving) {
          handleSaveSourceText();
        }
      }, autosaveDelay);
    }

    // Cleanup – wykonuje się przy odmontowaniu lub gdy któryś z zależności się zmieni.
    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
        saveTimerRef.current = null;
      }
    };
  }, [
    content,
    lastSavedContent,
    minWordCount,
    maxWordCount,
    autosaveDelay,
    isGeneratingFlashcards,
    isSaving,
    countWords,
    validateContent,
    handleSaveSourceText,
  ]);

  // Funkcja do zapisywania tekstu i generowania fiszek w jednym calu
  const saveSourceTextAndGenerateFlashcards = async (
    flashcardCount?: number
  ): Promise<CreateSourceTextResponse | null> => {
    // Zatrzymujemy autosave podczas generowania
    setIsGeneratingFlashcards(true);
    setIsSaving(true);

    try {
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
      } catch {
        // Failed to save backup to localStorage - handled silently
      }

      return response;
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
    } catch {
      // Failed to remove backup from localStorage - handled silently
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
