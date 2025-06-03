import { useState } from "react";
import type { CreateFlashcardCommand, FlashcardDto } from "@/types";
import type { ApiErrorResponse } from "../types";
import { createFlashcard } from "@/lib/services/api-service";

export interface UseFlashcardCreationOptions {
  onSuccess?: (flashcard: FlashcardDto) => void;
  onError?: (error: ApiErrorResponse) => void;
}

export interface UseFlashcardCreationResult {
  isCreating: boolean;
  error: ApiErrorResponse | null;
  createNewFlashcard: (command: CreateFlashcardCommand) => Promise<FlashcardDto | null>;
  reset: () => void;
}

export const useFlashcardCreation = (
  options?: UseFlashcardCreationOptions
): UseFlashcardCreationResult => {
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [error, setError] = useState<ApiErrorResponse | null>(null);

  const createNewFlashcard = async (
    command: CreateFlashcardCommand
  ): Promise<FlashcardDto | null> => {
    try {
      setIsCreating(true);
      setError(null);

      const createdFlashcard = await createFlashcard(command);

      options?.onSuccess?.(createdFlashcard);
      return createdFlashcard;
    } catch (e) {
      const apiError: ApiErrorResponse = {
        message: e instanceof Error ? e.message : "Nie udało się utworzyć fiszki",
        code: "CREATION_FAILED"
      };
      
      setError(apiError);
      options?.onError?.(apiError);
      return null;
    } finally {
      setIsCreating(false);
    }
  };

  const reset = (): void => {
    setIsCreating(false);
    setError(null);
  };

  return {
    isCreating,
    error,
    createNewFlashcard,
    reset
  };
}; 