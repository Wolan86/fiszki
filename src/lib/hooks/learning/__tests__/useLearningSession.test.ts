import { renderHook, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, type Mock } from 'vitest';
import { useLearningSession } from '../useLearningSession';
import type { FlashcardLearningResponse, FlashcardDto } from '../../../../types';

// Mock global fetch
const mockFetch = vi.fn() as Mock;
global.fetch = mockFetch;

// Mock window.location
const mockLocation = {
  href: 'http://localhost:3000',
  assign: vi.fn(),
  replace: vi.fn(),
  reload: vi.fn(),
  toString: () => 'http://localhost:3000'
};
Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true
});

describe('useLearningSession', () => {
  const mockFlashcards: FlashcardDto[] = [
    {
      id: '1',
      front_content: 'Test 1',
      back_content: 'Answer 1',
      accepted: true,
      source_text_id: 'source-1',
      creation_type: 'ai_generated',
      user_id: 'user-1',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
      generation_time_ms: 1000,
    },
    {
      id: '2',
      front_content: 'Test 2',
      back_content: 'Answer 2',
      accepted: true,
      source_text_id: 'source-1',
      creation_type: 'ai_generated',
      user_id: 'user-1',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
      generation_time_ms: 1500,
    },
    {
      id: '3',
      front_content: 'Test 3',
      back_content: 'Answer 3',
      accepted: true,
      source_text_id: 'source-1',
      creation_type: 'ai_generated',
      user_id: 'user-1',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
      generation_time_ms: 2000,
    }
  ];

  const successResponse: FlashcardLearningResponse = {
    data: mockFlashcards,
    total: 3
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(successResponse)
    });
  });

  describe('Initialization', () => {
    it('should initialize with loading state and fetch flashcards successfully', async () => {
      // Arrange
      const { result } = renderHook(() => useLearningSession());

      // Assert initial state
      expect(result.current.isLoading).toBe(true);
      expect(result.current.error).toBeNull();
      expect(result.current.flashcards).toEqual([]);
      expect(result.current.currentIndex).toBe(0);
      expect(result.current.isCardFlipped).toBe(false);

      // Wait for the effect to complete
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      // Assert final state
      expect(result.current.isLoading).toBe(false);
      expect(result.current.flashcards).toEqual(mockFlashcards);
      expect(result.current.currentFlashcard).toEqual(mockFlashcards[0]);
      expect(mockFetch).toHaveBeenCalledWith('/api/flashcards/learning?limit=20');
    });

    it('should handle custom parameters correctly', async () => {
      // Arrange
      const { result } = renderHook(() => 
        useLearningSession({ limit: 10, sourceTextId: 'source-123' })
      );

      // Wait for the effect to complete
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      // Assert
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/flashcards/learning?limit=10&source_text_id=source-123'
      );
    });

    it('should use default limit when not provided', async () => {
      // Arrange
      const { result } = renderHook(() => useLearningSession({}));

      // Wait for the effect to complete
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      // Assert
      expect(mockFetch).toHaveBeenCalledWith('/api/flashcards/learning?limit=20');
    });
  });

  describe('Error Handling', () => {
    it('should handle 401 unauthorized error and redirect to login', async () => {
      // Arrange
      mockFetch.mockResolvedValue({ ok: false, status: 401 });
      const { result } = renderHook(() => useLearningSession());

      // Wait for the effect to complete
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      // Assert
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe('Unauthorized');
      expect(mockLocation.href).toBe('/auth/login');
    });

    it('should handle 404 not found error with specific message', async () => {
      // Arrange
      mockFetch.mockResolvedValue({ ok: false, status: 404 });
      const { result } = renderHook(() => useLearningSession());

      // Wait for the effect to complete
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      // Assert
      expect(result.current.error).toBe('Brak fiszek do nauki');
      expect(result.current.isLoading).toBe(false);
    });

    it('should handle general API errors', async () => {
      // Arrange
      mockFetch.mockResolvedValue({ ok: false, status: 500 });
      const { result } = renderHook(() => useLearningSession());

      // Wait for the effect to complete
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      // Assert
      expect(result.current.error).toBe('Wystąpił błąd podczas pobierania fiszek');
      expect(result.current.isLoading).toBe(false);
    });

    it('should handle network errors', async () => {
      // Arrange
      mockFetch.mockRejectedValue(new Error('Network error'));
      const { result } = renderHook(() => useLearningSession());

      // Wait for the effect to complete
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      // Assert
      expect(result.current.error).toBe('Network error');
      expect(result.current.isLoading).toBe(false);
    });

    it('should handle unknown errors gracefully', async () => {
      // Arrange
      mockFetch.mockRejectedValue('Unknown error');
      const { result } = renderHook(() => useLearningSession());

      // Wait for the effect to complete
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      // Assert
      expect(result.current.error).toBe('Wystąpił nieoczekiwany błąd');
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('Navigation Logic', () => {
    it('should navigate to next flashcard correctly', async () => {
      // Arrange
      const { result } = renderHook(() => useLearningSession());
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      // Act
      act(() => {
        result.current.handleNavigation('next');
      });

      // Assert
      expect(result.current.currentIndex).toBe(1);
      expect(result.current.currentFlashcard).toEqual(mockFlashcards[1]);
      expect(result.current.isCardFlipped).toBe(false);
    });

    it('should navigate to previous flashcard correctly', async () => {
      // Arrange
      const { result } = renderHook(() => useLearningSession());
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });
      
      // Move to second card first
      act(() => {
        result.current.handleNavigation('next');
      });

      // Act
      act(() => {
        result.current.handleNavigation('prev');
      });

      // Assert
      expect(result.current.currentIndex).toBe(0);
      expect(result.current.currentFlashcard).toEqual(mockFlashcards[0]);
      expect(result.current.isCardFlipped).toBe(false);
    });

    it('should not navigate beyond boundaries - next', async () => {
      // Arrange
      const { result } = renderHook(() => useLearningSession());
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });
      
      // Move to last card
      act(() => {
        result.current.handleNavigation('next'); // card 1
        result.current.handleNavigation('next'); // card 2
      });

      // Act - Try to go beyond last card
      act(() => {
        result.current.handleNavigation('next');
      });

      // Assert - Should stay at last card
      expect(result.current.currentIndex).toBe(2);
      expect(result.current.currentFlashcard).toEqual(mockFlashcards[2]);
    });

    it('should not navigate beyond boundaries - previous', async () => {
      // Arrange
      const { result } = renderHook(() => useLearningSession());
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      // Act - Try to go before first card
      act(() => {
        result.current.handleNavigation('prev');
      });

      // Assert - Should stay at first card
      expect(result.current.currentIndex).toBe(0);
      expect(result.current.currentFlashcard).toEqual(mockFlashcards[0]);
    });

    it('should compute navigation boundaries correctly', async () => {
      // Arrange
      const { result } = renderHook(() => useLearningSession());
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      // Assert - At first card
      expect(result.current.canGoPrevious).toBe(false);
      expect(result.current.canGoNext).toBe(true);

      // Move to middle
      act(() => {
        result.current.handleNavigation('next');
      });

      // Assert - In middle
      expect(result.current.canGoPrevious).toBe(true);
      expect(result.current.canGoNext).toBe(true);

      // Move to last
      act(() => {
        result.current.handleNavigation('next');
      });

      // Assert - At last card
      expect(result.current.canGoPrevious).toBe(true);
      expect(result.current.canGoNext).toBe(false);
    });
  });

  describe('Card Flipping', () => {
    it('should toggle card flip state correctly', async () => {
      // Arrange
      const { result } = renderHook(() => useLearningSession());
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      // Assert - Initial state
      expect(result.current.isCardFlipped).toBe(false);

      // Act - Flip card
      act(() => {
        result.current.handleCardFlip();
      });

      // Assert - Card flipped
      expect(result.current.isCardFlipped).toBe(true);

      // Act - Flip back
      act(() => {
        result.current.handleCardFlip();
      });

      // Assert - Card flipped back
      expect(result.current.isCardFlipped).toBe(false);
    });

    it('should reset card flip state when navigating', async () => {
      // Arrange
      const { result } = renderHook(() => useLearningSession());
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });
      
      // Flip card first
      act(() => {
        result.current.handleCardFlip();
      });
      expect(result.current.isCardFlipped).toBe(true);

      // Act - Navigate to next card
      act(() => {
        result.current.handleNavigation('next');
      });

      // Assert - Card should be unflipped
      expect(result.current.isCardFlipped).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty flashcard array correctly', async () => {
      // Arrange
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ data: [], total: 0 })
      });

      const { result } = renderHook(() => useLearningSession());

      // Wait for the effect to complete
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      // Assert
      expect(result.current.isLoading).toBe(false);
      expect(result.current.flashcards).toEqual([]);
      expect(result.current.currentFlashcard).toBeNull();
      expect(result.current.canGoNext).toBe(false);
      expect(result.current.canGoPrevious).toBe(false);
    });

    it('should handle single flashcard correctly', async () => {
      // Arrange
      const singleCard = [mockFlashcards[0]];
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ data: singleCard, total: 1 })
      });

      const { result } = renderHook(() => useLearningSession());

      // Wait for the effect to complete
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      // Assert
      expect(result.current.isLoading).toBe(false);
      expect(result.current.flashcards).toHaveLength(1);
      expect(result.current.currentFlashcard).toEqual(singleCard[0]);
      expect(result.current.canGoNext).toBe(false);
      expect(result.current.canGoPrevious).toBe(false);
    });
  });

  describe('Retry Functionality', () => {
    it('should retry initialization on handleRetry call', async () => {
      // Arrange - First call fails
      mockFetch.mockResolvedValueOnce({ ok: false, status: 500 });
      
      const { result } = renderHook(() => useLearningSession());

      // Wait for error state
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });
      
      expect(result.current.error).toBeTruthy();
      expect(result.current.isLoading).toBe(false);

      // Arrange - Second call succeeds
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(successResponse)
      });

      // Act - Retry
      act(() => {
        result.current.handleRetry();
      });

      // Wait for retry to complete
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      // Assert - Should be successful
      expect(result.current.error).toBeNull();
      expect(result.current.isLoading).toBe(false);
      expect(result.current.flashcards).toEqual(mockFlashcards);
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });

  describe('URL Construction', () => {
    it('should construct URL correctly with no parameters', async () => {
      // Arrange
      const { result } = renderHook(() => useLearningSession());

      // Wait for the effect to complete
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      // Assert
      expect(mockFetch).toHaveBeenCalledWith('/api/flashcards/learning?limit=20');
    });

    it('should construct URL correctly with only limit', async () => {
      // Arrange
      const { result } = renderHook(() => useLearningSession({ limit: 5 }));

      // Wait for the effect to complete
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      // Assert
      expect(mockFetch).toHaveBeenCalledWith('/api/flashcards/learning?limit=5');
    });

    it('should construct URL correctly with only sourceTextId', async () => {
      // Arrange
      const { result } = renderHook(() => 
        useLearningSession({ sourceTextId: 'abc-123' })
      );

      // Wait for the effect to complete
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      // Assert
      expect(mockFetch).toHaveBeenCalledWith('/api/flashcards/learning?limit=20&source_text_id=abc-123');
    });

    it('should construct URL correctly with all parameters', async () => {
      // Arrange
      const { result } = renderHook(() => 
        useLearningSession({ limit: 15, sourceTextId: 'xyz-789' })
      );

      // Wait for the effect to complete
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      // Assert
      expect(mockFetch).toHaveBeenCalledWith('/api/flashcards/learning?limit=15&source_text_id=xyz-789');
    });
  });
}); 