import { useState } from "react";
import type { FlashcardDto, UpdateFlashcardCommand } from "@/types";
import type { 
  ApiErrorResponse, 
  FlashcardViewModel, 
  GenerationStatsViewModel, 
  UseFlashcardGenerationOptions, 
  UseFlashcardGenerationResult 
} from "../types";
import { generateFlashcards, regenerateFlashcard, updateFlashcard } from "@/lib/services/api-service";

export const useFlashcardGeneration = (): UseFlashcardGenerationResult => {
  const [flashcards, setFlashcards] = useState<FlashcardViewModel[]>([]);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationStats, setGenerationStats] = useState<GenerationStatsViewModel | null>(null);
  const [error, setError] = useState<ApiErrorResponse | null>(null);
  
  // Funkcja formatująca czas w milisekundach na czytelny format
  const formatTime = (timeInMs: number): string => {
    const seconds = timeInMs / 1000;
    return `${seconds.toFixed(1)} sekund`;
  };
  
  // Funkcja generująca fiszki
  const handleGenerateFlashcards = async (
    sourceTextId: string,
    options?: UseFlashcardGenerationOptions
  ): Promise<void> => {
    try {
      setIsGenerating(true);
      setError(null);
      
      // Czyścimy poprzednie wyniki
      setFlashcards([]);
      setGenerationStats(null);
      
      const response = await generateFlashcards(sourceTextId, options?.count);
      
      // Mapujemy na FlashcardViewModel
      const flashcardViewModels: FlashcardViewModel[] = response.flashcards.map(card => ({
        ...card,
        isFlipped: false,
        isRegenerating: false,
        showActions: true
      }));
      
      setFlashcards(flashcardViewModels);
      
      // Przygotowujemy statystyki generowania
      setGenerationStats({
        requestedCount: response.generation_stats.requested_count,
        generatedCount: response.generation_stats.generated_count,
        totalTimeMs: response.generation_stats.total_time_ms,
        formattedTime: formatTime(response.generation_stats.total_time_ms)
      });
    } catch (e) {
      const error = e as Error;
      setError({
        message: error.message || "Nie udało się wygenerować fiszek",
        code: "GENERATION_FAILED"
      });
    } finally {
      setIsGenerating(false);
    }
  };
  
  // Funkcja aktualizująca fiszkę
  const handleUpdateFlashcard = async (
    id: string,
    update: UpdateFlashcardCommand
  ): Promise<void> => {
    try {
      // Aktualizujemy lokalny stan przed rozpoczęciem zapisu (optymistyczna aktualizacja)
      setFlashcards(prev => prev.map(card => 
        card.id === id 
          ? { 
              ...card, 
              ...(update.front_content !== undefined ? { front_content: update.front_content } : {}),
              ...(update.back_content !== undefined ? { back_content: update.back_content } : {}),
              ...(update.accepted !== undefined ? { accepted: update.accepted } : {})
            } 
          : card
      ));
      
      // Wykonujemy faktyczną aktualizację w API
      await updateFlashcard(id, update);
    } catch (e) {
      const error = e as Error;
      setError({
        message: error.message || "Nie udało się zaktualizować fiszki",
        code: "UPDATE_FAILED"
      });
      
      // W przypadku błędu przywracamy poprzedni stan
      // To wymaga przechowywania oryginalnych danych, ale dla uproszczenia MVP
      // możemy po prostu odświeżyć wszystkie fiszki lub poinformować użytkownika o błędzie
    }
  };
  
  // Funkcja regenerująca fiszkę
  const handleRegenerateFlashcard = async (id: string): Promise<void> => {
    try {
      // Ustawiamy stan ładowania dla konkretnej fiszki
      setFlashcards(prev => prev.map(card => 
        card.id === id ? { ...card, isRegenerating: true } : card
      ));
      
      setError(null);
      
      // Wywołujemy API regeneracji
      const regeneratedCard = await regenerateFlashcard(id);
      
      // Aktualizujemy stan po udanej regeneracji
      setFlashcards(prev => prev.map(card => 
        card.id === id 
          ? { 
              ...regeneratedCard, 
              isFlipped: false, 
              isRegenerating: false, 
              showActions: true 
            } 
          : card
      ));
    } catch (e) {
      const error = e as Error;
      setError({
        message: error.message || "Nie udało się zregenerować fiszki",
        code: "REGENERATION_FAILED"
      });
      
      // Przywracamy stan bez ładowania
      setFlashcards(prev => prev.map(card => 
        card.id === id ? { ...card, isRegenerating: false } : card
      ));
    }
  };
  
  // Reset stanu
  const reset = (): void => {
    setFlashcards([]);
    setIsGenerating(false);
    setGenerationStats(null);
    setError(null);
  };
  
  return {
    flashcards,
    isGenerating,
    generationStats,
    error,
    generateFlashcards: handleGenerateFlashcards,
    updateFlashcard: handleUpdateFlashcard,
    regenerateFlashcard: handleRegenerateFlashcard,
    reset
  };
}; 