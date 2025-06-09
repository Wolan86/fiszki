import { useState, useEffect, useCallback } from "react";
import type { FlashcardDto, FlashcardLearningResponse, FlashcardLearningQueryParams } from "../../../types";

// Stan sesji nauki
interface LearningSessionState {
  flashcards: FlashcardDto[];
  currentIndex: number;
  isCardFlipped: boolean;
  isLoading: boolean;
  error: string | null;
  totalCount: number;
}

// Parametry inicjalizacji sesji
interface LearningSessionParams {
  limit?: number;
  sourceTextId?: string;
}

export const useLearningSession = (params: LearningSessionParams = {}) => {
  const [sessionState, setSessionState] = useState<LearningSessionState>({
    flashcards: [],
    currentIndex: 0,
    isCardFlipped: false,
    isLoading: true,
    error: null,
    totalCount: 0,
  });

  // Funkcja pobierania fiszek
  const fetchFlashcardsForLearning = useCallback(async (queryParams: FlashcardLearningQueryParams = {}): Promise<FlashcardLearningResponse> => {
    const searchParams = new URLSearchParams();
    if (queryParams.limit) searchParams.append('limit', queryParams.limit.toString());
    if (queryParams.source_text_id) searchParams.append('source_text_id', queryParams.source_text_id);
    
    const response = await fetch(`/api/flashcards/learning?${searchParams}`);
    if (!response.ok) {
      if (response.status === 401) {
        window.location.href = '/auth/login';
        throw new Error('Unauthorized');
      }
      if (response.status === 404) {
        throw new Error('Brak fiszek do nauki');
      }
      throw new Error('Wystąpił błąd podczas pobierania fiszek');
    }
    return response.json();
  }, []);

  // Inicjalizacja sesji nauki
  const initializeLearningSession = useCallback(async () => {
    try {
      setSessionState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const response = await fetchFlashcardsForLearning({ 
        limit: params.limit || 20,
        source_text_id: params.sourceTextId 
      });
      
      setSessionState(prev => ({
        ...prev,
        flashcards: response.data,
        totalCount: response.total,
        isLoading: false,
        currentIndex: 0,
        isCardFlipped: false,
      }));
    } catch (error) {
      setSessionState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Wystąpił nieoczekiwany błąd',
      }));
    }
  }, [fetchFlashcardsForLearning, params.limit, params.sourceTextId]);

  // Efekt inicjalizujący sesję
  useEffect(() => {
    initializeLearningSession();
  }, [initializeLearningSession]);

  // Obsługa nawigacji
  const handleNavigation = useCallback((direction: 'prev' | 'next') => {
    setSessionState(prev => {
      const newIndex = direction === 'next' 
        ? Math.min(prev.currentIndex + 1, prev.flashcards.length - 1)
        : Math.max(prev.currentIndex - 1, 0);
      
      return {
        ...prev,
        currentIndex: newIndex,
        isCardFlipped: false, // Reset karty przy zmianie
      };
    });
  }, []);

  // Obsługa odwracania karty
  const handleCardFlip = useCallback(() => {
    setSessionState(prev => ({
      ...prev,
      isCardFlipped: !prev.isCardFlipped,
    }));
  }, []);

  // Sprawdzenie granic nawigacji
  const canGoPrevious = sessionState.currentIndex > 0;
  const canGoNext = sessionState.currentIndex < sessionState.flashcards.length - 1;
  
  // Aktualna fiszka
  const currentFlashcard = sessionState.flashcards[sessionState.currentIndex] || null;

  // Ponowne pobieranie w przypadku błędu
  const handleRetry = useCallback(() => {
    initializeLearningSession();
  }, [initializeLearningSession]);

  return {
    // Stan
    ...sessionState,
    canGoPrevious,
    canGoNext,
    currentFlashcard,
    
    // Akcje
    handleNavigation,
    handleCardFlip,
    handleRetry,
    initializeLearningSession,
  };
}; 