import { useState } from "react";
import type {
  FlashcardDto,
  UpdateFlashcardCommand,
  CreateFlashcardCommand,
  CreateSourceTextResponse,
  UnsavedFlashcardDto,
} from "@/types";
import type {
  ApiErrorResponse,
  FlashcardViewModel,
  GenerationStatsViewModel,
  UseFlashcardGenerationOptions,
  UseFlashcardGenerationResult,
} from "../types";
import { generateFlashcards, regenerateFlashcard, updateFlashcard, createFlashcard } from "@/lib/services/api-service";

export const useFlashcardGeneration = (): UseFlashcardGenerationResult => {
  const [flashcards, setFlashcards] = useState<FlashcardViewModel[]>([]);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationStats, setGenerationStats] = useState<GenerationStatsViewModel | null>(null);
  const [error, setError] = useState<ApiErrorResponse | null>(null);
  const [savingFlashcardIds, setSavingFlashcardIds] = useState<string[]>([]);

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
      const flashcardViewModels: FlashcardViewModel[] = response.flashcards.map((card) => ({
        ...card,
        isFlipped: false,
        isRegenerating: false,
        showActions: true,
        isEditing: false,
        editableFrontContent: card.front_content,
        editableBackContent: card.back_content,
      }));

      setFlashcards(flashcardViewModels);

      // Przygotowujemy statystyki generowania
      setGenerationStats({
        requestedCount: response.generation_stats.requested_count,
        generatedCount: response.generation_stats.generated_count,
        totalTimeMs: response.generation_stats.total_time_ms,
        formattedTime: formatTime(response.generation_stats.total_time_ms),
      });
    } catch (e) {
      const error = e as Error;
      setError({
        message: error.message || "Nie udało się wygenerować fiszek",
        code: "GENERATION_FAILED",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Funkcja do ładowania fiszek z odpowiedzi CreateSourceTextResponse
  const loadFlashcardsFromResponse = (response: CreateSourceTextResponse): void => {
    if (response.flashcards && response.flashcards.length > 0) {
      // Mapujemy UnsavedFlashcardDto na FlashcardViewModel
      const flashcardViewModels: FlashcardViewModel[] = response.flashcards.map((card: UnsavedFlashcardDto) => ({
        ...card,
        isFlipped: false,
        isRegenerating: false,
        showActions: true,
        isEditing: false,
        editableFrontContent: card.front_content,
        editableBackContent: card.back_content,
      }));

      setFlashcards(flashcardViewModels);

      // Przygotowujemy statystyki generowania
      if (response.generation_stats) {
        setGenerationStats({
          requestedCount: response.generation_stats.requested_count,
          generatedCount: response.generation_stats.generated_count,
          totalTimeMs: response.generation_stats.total_time_ms,
          formattedTime: formatTime(response.generation_stats.total_time_ms),
        });
      }
    }
  };

  // Funkcja aktualizująca fiszkę (tylko zaakceptowane fiszki są zapisywane w bazie)
  const handleUpdateFlashcard = async (id: string, update: UpdateFlashcardCommand): Promise<void> => {
    try {
      setError(null);

      // Jeśli fiszka ma temporary ID (zaczyna się od "temp-"), to jest to tylko lokalny stan
      if (id.startsWith("temp-")) {
        // Aktualizujemy lokalny stan
        setFlashcards((prev) =>
          prev.map((card) =>
            card.id === id
              ? {
                  ...card,
                  ...update,
                }
              : card
          )
        );
        return;
      }

      // Jeśli fiszka ma prawdziwy ID, wykonujemy aktualizację w API
      const updatedFlashcard = await updateFlashcard(id, update);

      // Aktualizujemy lokalny stan na podstawie odpowiedzi z API
      setFlashcards((prev) =>
        prev.map((card) =>
          card.id === id
            ? {
                ...card,
                ...updatedFlashcard,
                isFlipped: card.isFlipped, // Zachowujemy lokalny stan UI
                isRegenerating: card.isRegenerating,
                showActions: card.showActions,
                isEditing: card.isEditing,
                editableFrontContent: card.editableFrontContent,
                editableBackContent: card.editableBackContent,
              }
            : card
        )
      );
    } catch (e) {
      const error = e as Error;
      setError({
        message: error.message || "Nie udało się zaktualizować fiszki",
        code: "UPDATE_FAILED",
      });

      // W przypadku błędu nie robimy nic - stan pozostaje bez zmian
      console.error("Błąd aktualizacji fiszki:", error);
    }
  };

  // Funkcja regenerująca fiszkę
  const handleRegenerateFlashcard = async (id: string): Promise<void> => {
    try {
      // Ustawiamy stan ładowania dla konkretnej fiszki
      setFlashcards((prev) => prev.map((card) => (card.id === id ? { ...card, isRegenerating: true } : card)));

      setError(null);

      // Wywołujemy API regeneracji
      const regeneratedCard = await regenerateFlashcard(id);

      // Aktualizujemy stan po udanej regeneracji
      setFlashcards((prev) =>
        prev.map((card) =>
          card.id === id
            ? {
                ...regeneratedCard,
                isFlipped: false,
                isRegenerating: false,
                showActions: true,
                isEditing: false,
                editableFrontContent: regeneratedCard.front_content,
                editableBackContent: regeneratedCard.back_content,
              }
            : card
        )
      );
    } catch (e) {
      const error = e as Error;
      setError({
        message: error.message || "Nie udało się zregenerować fiszki",
        code: "REGENERATION_FAILED",
      });

      // Przywracamy stan bez ładowania
      setFlashcards((prev) => prev.map((card) => (card.id === id ? { ...card, isRegenerating: false } : card)));
    }
  };

  // Funkcja zapisująca zaakceptowaną fiszkę do bazy danych
  const handleSaveFlashcard = async (id: string): Promise<void> => {
    try {
      // Znajdź fiszkę do zapisania
      const flashcardToSave = flashcards.find((card) => card.id === id);
      if (!flashcardToSave) {
        throw new Error("Nie znaleziono fiszki do zapisania");
      }

      // Sprawdź czy fiszka została zaakceptowana
      if (flashcardToSave.accepted !== true) {
        throw new Error("Można zapisać tylko zaakceptowane fiszki");
      }

      // Dodaj do listy zapisywanych
      setSavingFlashcardIds((prev) => [...prev, id]);
      setError(null);

      // Przygotuj komendę tworzenia nowej fiszki
      const command: CreateFlashcardCommand = {
        front_content: flashcardToSave.front_content,
        back_content: flashcardToSave.back_content,
        source_text_id: flashcardToSave.source_text_id || undefined,
      };

      // Utwórz nową fiszkę w bazie danych
      const savedFlashcard = await createFlashcard(command);

      // Zamień temporary flashcard na zapisaną fiszkę
      setFlashcards((prev) =>
        prev.map((card: FlashcardViewModel) =>
          card.id === id
            ? {
                ...savedFlashcard,
                isFlipped: card.isFlipped,
                isRegenerating: false,
                showActions: card.showActions,
                isEditing: false,
                editableFrontContent: savedFlashcard.front_content,
                editableBackContent: savedFlashcard.back_content,
              }
            : card
        )
      );

      // Usuń z listy zapisywanych po udanym zapisie
      setSavingFlashcardIds((prev) => prev.filter((cardId) => cardId !== id));
    } catch (e) {
      const error = e as Error;
      setError({
        message: error.message || "Nie udało się zapisać fiszki",
        code: "SAVE_FAILED",
      });

      // Usuń z listy zapisywanych w przypadku błędu
      setSavingFlashcardIds((prev) => prev.filter((cardId) => cardId !== id));
    }
  };

  // Funkcja edytująca fiszkę
  const handleEditFlashcard = (id: string, frontContent: string, backContent: string): void => {
    setFlashcards((prev) =>
      prev.map((card) =>
        card.id === id
          ? {
              ...card,
              front_content: frontContent,
              back_content: backContent,
              editableFrontContent: frontContent,
              editableBackContent: backContent,
            }
          : card
      )
    );
  };

  // Reset stanu
  const reset = (): void => {
    setFlashcards([]);
    setIsGenerating(false);
    setGenerationStats(null);
    setError(null);
    setSavingFlashcardIds([]);
  };

  return {
    flashcards,
    isGenerating,
    generationStats,
    error,
    savingFlashcardIds,
    loadFlashcardsFromResponse,
    updateFlashcard: handleUpdateFlashcard,
    regenerateFlashcard: handleRegenerateFlashcard,
    saveFlashcard: handleSaveFlashcard,
    editFlashcard: handleEditFlashcard,
    reset,
  };
};
