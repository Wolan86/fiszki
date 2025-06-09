import { useState, useCallback, useEffect } from 'react';
import type { FlashcardDto } from '../../../types';

// Uproszczone typy
interface FlashcardListResponse {
  data: FlashcardDto[];
  total: number;
}

interface UpdateFlashcardRequest {
  front_content: string;
  back_content: string;
}

// Stan hook'a
interface UseFlashcardListState {
  flashcards: FlashcardDto[];
  searchQuery: string;
  loading: boolean;
  error: string | null;
}

// Akcje hook'a
interface UseFlashcardListActions {
  fetchFlashcards: () => Promise<void>;
  updateSearch: (query: string) => void;
  editFlashcard: (id: string, frontContent: string, backContent: string) => Promise<void>;
  deleteFlashcard: (id: string) => Promise<void>;
}

export const useFlashcardList = (): UseFlashcardListState & UseFlashcardListActions => {
  const [flashcards, setFlashcards] = useState<FlashcardDto[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFlashcards = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const url = new URL('/api/flashcards', window.location.origin);
      
      // Dodaj parametr wyszukiwania jeśli istnieje
      if (searchQuery.trim()) {
        url.searchParams.set('search', searchQuery.trim());
      }

      const response = await fetch(url.toString(), {
        credentials: 'include',
      });

      if (!response.ok) {
        if (response.status === 401) {
          window.location.href = '/logowanie';
          return;
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: FlashcardListResponse = await response.json();
      setFlashcards(data.data);
    } catch (err) {
      console.error('Error fetching flashcards:', err);
      setError(err instanceof Error ? err.message : 'Błąd podczas ładowania fiszek');
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  const updateSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  // Refetch when search query changes with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchFlashcards();
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery, fetchFlashcards]);

  const editFlashcard = useCallback(async (id: string, frontContent: string, backContent: string) => {
    const updateData: UpdateFlashcardRequest = {
      front_content: frontContent.trim(),
      back_content: backContent.trim(),
    };

    try {
      const response = await fetch(`/api/flashcards/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        if (response.status === 401) {
          window.location.href = '/logowanie';
          return;
        }
        if (response.status === 404) {
          throw new Error('Fiszka nie została znaleziona');
        }
        if (response.status === 400) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Błąd walidacji danych');
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const updatedFlashcard: FlashcardDto = await response.json();
      
      // Aktualizuj lokalny stan
      setFlashcards(prev => prev.map(fc => 
        fc.id === id ? updatedFlashcard : fc
      ));

    } catch (err) {
      console.error('Error updating flashcard:', err);
      throw err; // Re-throw to handle in component
    }
  }, []);

  const deleteFlashcard = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/flashcards/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        if (response.status === 401) {
          window.location.href = '/logowanie';
          return;
        }
        if (response.status === 404) {
          throw new Error('Fiszka nie została znaleziona');
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Usuń z lokalnego stanu
      setFlashcards(prev => prev.filter(fc => fc.id !== id));

    } catch (err) {
      console.error('Error deleting flashcard:', err);
      setError(err instanceof Error ? err.message : 'Błąd podczas usuwania fiszki');
    }
  }, []);

  return {
    // State
    flashcards,
    searchQuery,
    loading,
    error,
    // Actions
    fetchFlashcards,
    updateSearch,
    editFlashcard,
    deleteFlashcard,
  };
}; 