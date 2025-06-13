import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useFlashcardList } from "../useFlashcardList";
import type { FlashcardDto } from "../../../../types";

// Mock fetch globally
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

// Mock window.location
const mockLocation = {
  origin: "http://localhost:3000",
  href: "http://localhost:3000",
};
Object.defineProperty(window, "location", {
  value: mockLocation,
  writable: true,
});

// Sample flashcard data for tests
const mockFlashcard: FlashcardDto = {
  id: "test-id-1",
  front_content: "Test front content",
  back_content: "Test back content",
  accepted: true,
  source_text_id: "source-1",
  creation_type: "manual",
  user_id: "user-1",
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
  generation_time_ms: null,
};

const mockFlashcardList = [
  mockFlashcard,
  {
    ...mockFlashcard,
    id: "test-id-2",
    front_content: "Second flashcard",
    back_content: "Second answer",
  },
];

describe("useFlashcardList", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  describe("initial state", () => {
    it("should initialize with correct default state", () => {
      // Arrange & Act
      const { result } = renderHook(() => useFlashcardList());

      // Assert
      expect(result.current.flashcards).toEqual([]);
      expect(result.current.searchQuery).toBe("");
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(null);
      expect(typeof result.current.fetchFlashcards).toBe("function");
      expect(typeof result.current.updateSearch).toBe("function");
      expect(typeof result.current.editFlashcard).toBe("function");
      expect(typeof result.current.deleteFlashcard).toBe("function");
    });
  });

  describe("fetchFlashcards", () => {
    it("should fetch flashcards successfully", async () => {
      // Arrange
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockFlashcardList, total: 2 }),
      });

      const { result } = renderHook(() => useFlashcardList());

      // Act
      await act(async () => {
        await result.current.fetchFlashcards();
      });

      // Assert
      expect(result.current.flashcards).toEqual(mockFlashcardList);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(null);
      expect(mockFetch).toHaveBeenCalledWith(
        "http://localhost:3000/api/flashcards",
        expect.objectContaining({
          credentials: "include",
        })
      );
    });

    it("should handle loading states correctly", async () => {
      // Arrange
      let resolvePromise: ((value: Response | PromiseLike<Response>) => void) | undefined;
      const mockPromise = new Promise<Response>((resolve) => {
        resolvePromise = resolve;
      });

      mockFetch.mockReturnValueOnce(mockPromise);
      const { result } = renderHook(() => useFlashcardList());

      // Act - start fetch
      act(() => {
        result.current.fetchFlashcards();
      });

      // Assert - loading state
      expect(result.current.loading).toBe(true);
      expect(result.current.error).toBe(null);

      // Act - resolve fetch
      await act(async () => {
        if (resolvePromise) {
          resolvePromise({
            ok: true,
            json: async () => ({ data: [], total: 0 }),
          } as Response);
        }
        await mockPromise;
      });

      // Assert - completed state
      expect(result.current.loading).toBe(false);
    });

    it("should handle 401 unauthorized error by redirecting", async () => {
      // Arrange
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: "Unauthorized",
      });

      const { result } = renderHook(() => useFlashcardList());

      // Act
      await act(async () => {
        await result.current.fetchFlashcards();
      });

      // Assert
      expect(window.location.href).toBe("/logowanie");
      expect(result.current.loading).toBe(false);
    });

    it("should handle HTTP errors correctly", async () => {
      // Arrange
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
      });

      const { result } = renderHook(() => useFlashcardList());

      // Act
      await act(async () => {
        await result.current.fetchFlashcards();
      });

      // Assert
      expect(result.current.error).toBe("HTTP 500: Internal Server Error");
      expect(result.current.flashcards).toEqual([]);
      expect(result.current.loading).toBe(false);
    });

    it("should handle network errors", async () => {
      // Arrange
      const networkError = new Error("Network failure");
      mockFetch.mockRejectedValueOnce(networkError);

      const { result } = renderHook(() => useFlashcardList());

      // Act
      await act(async () => {
        await result.current.fetchFlashcards();
      });

      // Assert
      expect(result.current.error).toBe("Network failure");
      expect(result.current.loading).toBe(false);
    });

    it("should handle non-Error exceptions", async () => {
      // Arrange
      mockFetch.mockRejectedValueOnce("String error");

      const { result } = renderHook(() => useFlashcardList());

      // Act
      await act(async () => {
        await result.current.fetchFlashcards();
      });

      // Assert
      expect(result.current.error).toBe("Błąd podczas ładowania fiszek");
    });
  });

  describe("search functionality", () => {
    it("should update search query", () => {
      // Arrange
      const { result } = renderHook(() => useFlashcardList());

      // Act
      act(() => {
        result.current.updateSearch("test query");
      });

      // Assert
      expect(result.current.searchQuery).toBe("test query");
    });

    it("should include search parameter in API call", async () => {
      // Arrange
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [], total: 0 }),
      });

      const { result } = renderHook(() => useFlashcardList());

      // Act
      act(() => {
        result.current.updateSearch("search term");
      });

      // Fast-forward timers to trigger debounced search
      await act(async () => {
        vi.advanceTimersByTime(300);
        await Promise.resolve(); // Allow promises to resolve
      });

      // Assert
      expect(mockFetch).toHaveBeenCalledWith(
        "http://localhost:3000/api/flashcards?search=search+term",
        expect.objectContaining({
          credentials: "include",
        })
      );
    });

    it("should debounce search requests", async () => {
      // Arrange
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ data: [], total: 0 }),
      });

      const { result } = renderHook(() => useFlashcardList());

      // Act - multiple rapid search updates
      act(() => {
        result.current.updateSearch("a");
      });
      act(() => {
        result.current.updateSearch("ab");
      });
      act(() => {
        result.current.updateSearch("abc");
      });

      // Fast-forward only 299ms (less than debounce delay)
      act(() => {
        vi.advanceTimersByTime(299);
      });

      // Assert - no API call yet
      expect(mockFetch).not.toHaveBeenCalled();

      // Act - complete debounce delay
      await act(async () => {
        vi.advanceTimersByTime(1);
        await Promise.resolve();
      });

      // Assert - only one API call with final search term
      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining("search=abc"), expect.any(Object));
    });

    it("should not include search parameter for empty query", async () => {
      // Arrange
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [], total: 0 }),
      });

      const { result } = renderHook(() => useFlashcardList());

      // Act
      await act(async () => {
        await result.current.fetchFlashcards();
      });

      // Assert
      expect(mockFetch).toHaveBeenCalledWith(
        "http://localhost:3000/api/flashcards",
        expect.objectContaining({
          credentials: "include",
        })
      );
    });

    it("should trim whitespace from search query", async () => {
      // Arrange
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [], total: 0 }),
      });

      const { result } = renderHook(() => useFlashcardList());

      // Act
      act(() => {
        result.current.updateSearch("  search term  ");
      });

      await act(async () => {
        vi.advanceTimersByTime(300);
        await Promise.resolve();
      });

      // Assert
      expect(mockFetch).toHaveBeenCalledWith(
        "http://localhost:3000/api/flashcards?search=search+term",
        expect.any(Object)
      );
    });
  });

  describe("editFlashcard", () => {
    it("should edit flashcard successfully", async () => {
      // Arrange
      const updatedFlashcard = { ...mockFlashcard, front_content: "Updated front", back_content: "Updated back" };

      // Mock initial fetch
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [mockFlashcard], total: 1 }),
      });

      const { result } = renderHook(() => useFlashcardList());

      // Initialize with data
      await act(async () => {
        await result.current.fetchFlashcards();
      });

      // Clear previous calls and mock edit
      mockFetch.mockClear();
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => updatedFlashcard,
      });

      // Act
      await act(async () => {
        await result.current.editFlashcard(mockFlashcard.id, "Updated front", "Updated back");
      });

      // Assert
      expect(mockFetch).toHaveBeenCalledWith(
        `/api/flashcards/${mockFlashcard.id}`,
        expect.objectContaining({
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            front_content: "Updated front",
            back_content: "Updated back",
          }),
        })
      );
    });

    it("should trim content before sending", async () => {
      // Arrange
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockFlashcard,
      });

      const { result } = renderHook(() => useFlashcardList());

      // Act
      await act(async () => {
        await result.current.editFlashcard("test-id", "  front content  ", "  back content  ");
      });

      // Assert
      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: JSON.stringify({
            front_content: "front content",
            back_content: "back content",
          }),
        })
      );
    });

    it("should handle 401 error by redirecting", async () => {
      // Arrange
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
      });

      const { result } = renderHook(() => useFlashcardList());

      // Act
      await act(async () => {
        await result.current.editFlashcard("test-id", "front", "back");
      });

      // Assert
      expect(window.location.href).toBe("/logowanie");
    });

    it("should handle 404 error correctly", async () => {
      // Arrange
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      const { result } = renderHook(() => useFlashcardList());

      // Act & Assert
      await act(async () => {
        await expect(result.current.editFlashcard("non-existent", "front", "back")).rejects.toThrow(
          "Fiszka nie została znaleziona"
        );
      });
    });

    it("should handle 400 validation error", async () => {
      // Arrange
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ message: "Invalid content" }),
      });

      const { result } = renderHook(() => useFlashcardList());

      // Act & Assert
      await act(async () => {
        await expect(result.current.editFlashcard("test-id", "", "back")).rejects.toThrow("Invalid content");
      });
    });

    it("should handle 400 error without message", async () => {
      // Arrange
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({}),
      });

      const { result } = renderHook(() => useFlashcardList());

      // Act & Assert
      await act(async () => {
        await expect(result.current.editFlashcard("test-id", "front", "back")).rejects.toThrow("Błąd walidacji danych");
      });
    });

    it("should handle other HTTP errors", async () => {
      // Arrange
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
      });

      const { result } = renderHook(() => useFlashcardList());

      // Act & Assert
      await act(async () => {
        await expect(result.current.editFlashcard("test-id", "front", "back")).rejects.toThrow(
          "HTTP 500: Internal Server Error"
        );
      });
    });

    it("should update local state after successful edit", async () => {
      // Arrange
      const updatedFlashcard = { ...mockFlashcard, front_content: "Updated", back_content: "Updated back" };

      // Initialize hook with mock data first
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [mockFlashcard], total: 1 }),
      });

      const { result } = renderHook(() => useFlashcardList());

      // Initial fetch to populate flashcards
      await act(async () => {
        await result.current.fetchFlashcards();
      });

      // Verify initial state
      expect(result.current.flashcards).toHaveLength(1);
      expect(result.current.flashcards[0].id).toBe(mockFlashcard.id);

      // Clear previous calls and mock successful update
      mockFetch.mockClear();
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => updatedFlashcard,
      });

      // Act
      await act(async () => {
        await result.current.editFlashcard(mockFlashcard.id, "Updated", "Updated back");
      });

      // Assert
      const updatedCard = result.current.flashcards.find((fc) => fc.id === mockFlashcard.id);
      expect(updatedCard?.front_content).toBe("Updated");
      expect(updatedCard?.back_content).toBe("Updated back");
    });
  });

  describe("deleteFlashcard", () => {
    it("should delete flashcard successfully", async () => {
      // Arrange
      mockFetch.mockResolvedValueOnce({
        ok: true,
      });

      const { result } = renderHook(() => useFlashcardList());

      // Set initial flashcards
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [mockFlashcard], total: 1 }),
      });

      await act(async () => {
        await result.current.fetchFlashcards();
      });

      // Act
      await act(async () => {
        await result.current.deleteFlashcard(mockFlashcard.id);
      });

      // Assert
      expect(mockFetch).toHaveBeenCalledWith(
        `/api/flashcards/${mockFlashcard.id}`,
        expect.objectContaining({
          method: "DELETE",
          credentials: "include",
        })
      );
      expect(result.current.flashcards).toHaveLength(0);
    });

    it("should handle 401 error by redirecting", async () => {
      // Arrange
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
      });

      const { result } = renderHook(() => useFlashcardList());

      // Act
      await act(async () => {
        await result.current.deleteFlashcard("test-id");
      });

      // Assert
      expect(window.location.href).toBe("/logowanie");
    });

    it("should handle 404 error and set error state", async () => {
      // Arrange
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      const { result } = renderHook(() => useFlashcardList());

      // Act
      await act(async () => {
        await result.current.deleteFlashcard("non-existent");
      });

      // Assert
      expect(result.current.error).toBe("Fiszka nie została znaleziona");
    });

    it("should handle other HTTP errors", async () => {
      // Arrange
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
      });

      const { result } = renderHook(() => useFlashcardList());

      // Act
      await act(async () => {
        await result.current.deleteFlashcard("test-id");
      });

      // Assert
      expect(result.current.error).toBe("HTTP 500: Internal Server Error");
    });

    it("should handle network errors gracefully", async () => {
      // Arrange
      const networkError = new Error("Network error");
      mockFetch.mockRejectedValueOnce(networkError);

      const { result } = renderHook(() => useFlashcardList());

      // Act
      await act(async () => {
        await result.current.deleteFlashcard("test-id");
      });

      // Assert
      expect(result.current.error).toBe("Network error");
    });

    it("should handle non-Error exceptions", async () => {
      // Arrange
      mockFetch.mockRejectedValueOnce("String error");

      const { result } = renderHook(() => useFlashcardList());

      // Act
      await act(async () => {
        await result.current.deleteFlashcard("test-id");
      });

      // Assert
      expect(result.current.error).toBe("Błąd podczas usuwania fiszki");
    });

    it("should remove flashcard from local state after successful deletion", async () => {
      // Arrange
      const flashcard1 = { ...mockFlashcard, id: "id-1" };
      const flashcard2 = { ...mockFlashcard, id: "id-2" };

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: [flashcard1, flashcard2], total: 2 }),
        })
        .mockResolvedValueOnce({
          ok: true,
        });

      const { result } = renderHook(() => useFlashcardList());

      // Set initial state
      await act(async () => {
        await result.current.fetchFlashcards();
      });

      expect(result.current.flashcards).toHaveLength(2);

      // Act
      await act(async () => {
        await result.current.deleteFlashcard("id-1");
      });

      // Assert
      expect(result.current.flashcards).toHaveLength(1);
      expect(result.current.flashcards[0].id).toBe("id-2");
    });
  });

  describe("cleanup and memory management", () => {
    it("should cleanup timers on unmount", () => {
      // Arrange
      const { result, unmount } = renderHook(() => useFlashcardList());

      // Act - trigger search to create timer
      act(() => {
        result.current.updateSearch("test");
      });

      // Act - unmount component
      unmount();

      // Assert - no pending timers should remain
      expect(vi.getTimerCount()).toBe(0);
    });

    it("should cancel previous search when new search is triggered", async () => {
      // Arrange
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ data: [], total: 0 }),
      });

      const { result } = renderHook(() => useFlashcardList());

      // Act - trigger first search
      act(() => {
        result.current.updateSearch("first");
      });

      // Act - trigger second search before first completes
      act(() => {
        result.current.updateSearch("second");
      });

      // Fast-forward timers
      await act(async () => {
        vi.advanceTimersByTime(300);
        await Promise.resolve();
      });

      // Assert - only one API call with latest search term
      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining("search=second"), expect.any(Object));
    });
  });

  describe("edge cases and boundary conditions", () => {
    it("should handle empty response data", async () => {
      // Arrange
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [], total: 0 }),
      });

      const { result } = renderHook(() => useFlashcardList());

      // Act
      await act(async () => {
        await result.current.fetchFlashcards();
      });

      // Assert
      expect(result.current.flashcards).toEqual([]);
      expect(result.current.error).toBe(null);
    });

    it("should handle malformed JSON response", async () => {
      // Arrange
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => {
          throw new Error("Invalid JSON");
        },
      });

      const { result } = renderHook(() => useFlashcardList());

      // Act
      await act(async () => {
        await result.current.fetchFlashcards();
      });

      // Assert
      expect(result.current.error).toBe("Invalid JSON");
    });

    it("should handle very long search queries", async () => {
      // Arrange
      const longQuery = "a".repeat(1000);
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [], total: 0 }),
      });

      const { result } = renderHook(() => useFlashcardList());

      // Act
      act(() => {
        result.current.updateSearch(longQuery);
      });

      await act(async () => {
        vi.advanceTimersByTime(300);
        await Promise.resolve();
      });

      // Assert - should handle long queries gracefully
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("search=" + encodeURIComponent(longQuery)),
        expect.any(Object)
      );
    });

    it("should handle special characters in search query", async () => {
      // Arrange
      const specialQuery = 'test & query with "quotes" and <html>';
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [], total: 0 }),
      });

      const { result } = renderHook(() => useFlashcardList());

      // Act
      act(() => {
        result.current.updateSearch(specialQuery);
      });

      await act(async () => {
        vi.advanceTimersByTime(300);
        await Promise.resolve();
      });

      // Assert - should properly encode special characters
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("search=" + encodeURIComponent(specialQuery).replace(/%20/g, "+")),
        expect.any(Object)
      );
    });
  });
});
