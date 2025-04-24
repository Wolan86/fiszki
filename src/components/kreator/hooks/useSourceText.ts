import { useCallback, useEffect, useState } from "react";
import type { SourceTextDto } from "@/types";
import type { UseSourceTextOptions, UseSourceTextResult } from "../types";
import { saveSourceText } from "@/lib/services/api-service";

export const useSourceText = ({
  initialContent = "",
  minWordCount,
  maxWordCount,
  autosaveDelay = 2000
}: UseSourceTextOptions): UseSourceTextResult => {
  const [content, setContent] = useState<string>(initialContent);
  const [wordCount, setWordCount] = useState<number>(0);
  const [isValid, setIsValid] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [saveTimer, setSaveTimer] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [lastSavedContent, setLastSavedContent] = useState<string>(initialContent);
  
  // Funkcja do liczenia słów
  const countWords = useCallback((text: string): number => {
    return text.trim() ? text.trim().split(/\s+/).length : 0;
  }, []);
  
  // Walidacja tekstu
  const validateContent = useCallback((text: string, count: number): string[] => {
    const newErrors: string[] = [];
    
    if (count < minWordCount) {
      newErrors.push(`Wprowadź co najmniej ${minWordCount} słów`);
    }
    
    if (count > maxWordCount) {
      newErrors.push(`Przekroczono limit ${maxWordCount} słów`);
    }
    
    return newErrors;
  }, [minWordCount, maxWordCount]);
  
  // Efekt do aktualizacji licznika słów i walidacji przy zmianie contentu
  useEffect(() => {
    const count = countWords(content);
    setWordCount(count);
    
    const newErrors = validateContent(content, count);
    setErrors(newErrors);
    setIsValid(newErrors.length === 0 && count >= minWordCount && count <= maxWordCount);
    
    // Zapisujemy stan tylko jeśli tekst się zmienił
    if (content !== lastSavedContent && content.trim() !== "") {
      // Resetujemy poprzedni timer jeśli istnieje
      if (saveTimer) {
        clearTimeout(saveTimer);
      }
      
      // Ustawiamy nowy timer do autosave
      const timer = setTimeout(() => {
        if (content.trim() !== "" && content !== lastSavedContent) {
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
  }, [content, lastSavedContent, minWordCount, maxWordCount, autosaveDelay]);
  
  // Funkcja do zapisywania tekstu źródłowego
  const handleSaveSourceText = async (): Promise<SourceTextDto | null> => {
    try {
      setIsSaving(true);
      
      // Jeśli tekst jest pusty lub taki sam, nie zapisujemy
      if (content.trim() === "" || content === lastSavedContent) {
        setIsSaving(false);
        return null;
      }
      
      // Jeśli tekst nie jest poprawny, nie zapisujemy
      if (errors.length > 0) {
        setIsSaving(false);
        return null;
      }
      
      const savedSourceText = await saveSourceText(content);
      setLastSaved(new Date());
      setLastSavedContent(content);
      
      // Zapisujemy również kopię w localStorage jako backup
      try {
        localStorage.setItem("source_text_backup", content);
      } catch (error) {
        console.error("Failed to save backup to localStorage", error);
      }
      
      return savedSourceText;
    } catch (error) {
      console.error("Failed to save source text", error);
      return null;
    } finally {
      setIsSaving(false);
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
    reset
  };
}; 