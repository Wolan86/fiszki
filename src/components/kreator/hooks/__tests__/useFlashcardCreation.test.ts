import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useFlashcardCreation } from "../useFlashcardCreation";
import type { CreateFlashcardCommand, FlashcardDto } from "@/types";

// Mock the API service
vi.mock("@/lib/services/api-service", () => ({
  createFlashcard: vi.fn(),
}));

import { createFlashcard } from "@/lib/services/api-service";

const mockCreateFlashcard = vi.mocked(createFlashcard);

describe("useFlashcardCreation", () => {
  const mockFlashcardCommand: CreateFlashcardCommand = {
    front_content: "What is React?",
    back_content: "A JavaScript library for building user interfaces",
    source_text_id: "source-123",
  };

  const mockFlashcardResponse: FlashcardDto = {
    id: "flashcard-123",
    front_content: "What is React?",
    back_content: "A JavaScript library for building user interfaces",
    source_text_id: "source-123",
    creation_type: "manual",
    user_id: "user-123",
    accepted: null,
    created_at: "2024-01-01T00:00:00.000Z",
    updated_at: "2024-01-01T00:00:00.000Z",
    generation_time_ms: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("initialization", () => {
    it("initializes with default state", () => {
      // Arrange & Act
      const { result } = renderHook(() => useFlashcardCreation());

      // Assert
      expect(result.current.isCreating).toBe(false);
      expect(result.current.error).toBeNull();
      expect(typeof result.current.createNewFlashcard).toBe("function");
      expect(typeof result.current.reset).toBe("function");
    });

    it("accepts optional callbacks", () => {
      // Arrange
      const onSuccess = vi.fn();
      const onError = vi.fn();

      // Act
      const { result } = renderHook(() => useFlashcardCreation({ onSuccess, onError }));

      // Assert
      expect(result.current.isCreating).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });

  describe("successful flashcard creation", () => {
    it("creates flashcard successfully", async () => {
      // Arrange
      mockCreateFlashcard.mockResolvedValue(mockFlashcardResponse);
      const { result } = renderHook(() => useFlashcardCreation());

      // Act
      let createdFlashcard: FlashcardDto | null = null;
      await act(async () => {
        createdFlashcard = await result.current.createNewFlashcard(mockFlashcardCommand);
      });

      // Assert
      expect(mockCreateFlashcard).toHaveBeenCalledWith(mockFlashcardCommand);
      expect(createdFlashcard).toEqual(mockFlashcardResponse);
      expect(result.current.isCreating).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it("calls onSuccess callback when provided", async () => {
      // Arrange
      mockCreateFlashcard.mockResolvedValue(mockFlashcardResponse);
      const onSuccess = vi.fn();
      const { result } = renderHook(() => useFlashcardCreation({ onSuccess }));

      // Act
      await act(async () => {
        await result.current.createNewFlashcard(mockFlashcardCommand);
      });

      // Assert
      expect(onSuccess).toHaveBeenCalledWith(mockFlashcardResponse);
    });

    it("clears previous errors on successful creation", async () => {
      // Arrange
      mockCreateFlashcard.mockRejectedValueOnce(new Error("First error")).mockResolvedValueOnce(mockFlashcardResponse);

      const { result } = renderHook(() => useFlashcardCreation());

      // First call fails
      await act(async () => {
        await result.current.createNewFlashcard(mockFlashcardCommand);
      });
      expect(result.current.error).not.toBeNull();

      // Second call succeeds
      await act(async () => {
        await result.current.createNewFlashcard(mockFlashcardCommand);
      });

      // Assert
      expect(result.current.error).toBeNull();
    });
  });

  describe("loading state management", () => {
    it("sets isCreating to true during API call", async () => {
      // Arrange
      let resolveApiCall: (value: FlashcardDto) => void;
      const apiPromise = new Promise<FlashcardDto>((resolve) => {
        resolveApiCall = resolve;
      });
      mockCreateFlashcard.mockReturnValue(apiPromise);

      const { result } = renderHook(() => useFlashcardCreation());

      // Act - Start API call
      act(() => {
        result.current.createNewFlashcard(mockFlashcardCommand);
      });

      // Assert - Should be creating
      expect(result.current.isCreating).toBe(true);

      // Complete API call
      await act(async () => {
        resolveApiCall(mockFlashcardResponse);
        await apiPromise;
      });

      // Assert - Should not be creating anymore
      expect(result.current.isCreating).toBe(false);
    });

    it("resets isCreating even when API call fails", async () => {
      // Arrange
      mockCreateFlashcard.mockRejectedValue(new Error("API Error"));
      const { result } = renderHook(() => useFlashcardCreation());

      // Act
      await act(async () => {
        await result.current.createNewFlashcard(mockFlashcardCommand);
      });

      // Assert
      expect(result.current.isCreating).toBe(false);
    });

    it("handles concurrent API calls properly", async () => {
      // Arrange
      const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
      mockCreateFlashcard
        .mockImplementationOnce(async () => {
          await delay(50);
          return { ...mockFlashcardResponse, id: "flashcard-1" };
        })
        .mockImplementationOnce(async () => {
          await delay(25);
          return { ...mockFlashcardResponse, id: "flashcard-2" };
        });

      const { result } = renderHook(() => useFlashcardCreation());

      // Act - Start two concurrent calls
      const promise1 = act(async () => {
        return result.current.createNewFlashcard(mockFlashcardCommand);
      });

      const promise2 = act(async () => {
        return result.current.createNewFlashcard({
          ...mockFlashcardCommand,
          front_content: "Different question",
        });
      });

      // Wait for both to complete
      const [result1, result2] = await Promise.all([promise1, promise2]);

      // Assert
      expect(result1?.id).toBe("flashcard-1");
      expect(result2?.id).toBe("flashcard-2");
      expect(result.current.isCreating).toBe(false);
    });
  });

  describe("error handling", () => {
    it("handles API errors with Error objects", async () => {
      // Arrange
      const errorMessage = "Network error occurred";
      mockCreateFlashcard.mockRejectedValue(new Error(errorMessage));
      const { result } = renderHook(() => useFlashcardCreation());

      // Act
      let createdFlashcard: FlashcardDto | null = null;
      await act(async () => {
        createdFlashcard = await result.current.createNewFlashcard(mockFlashcardCommand);
      });

      // Assert
      expect(createdFlashcard).toBeNull();
      expect(result.current.error).toEqual({
        message: errorMessage,
        code: "CREATION_FAILED",
      });
      expect(result.current.isCreating).toBe(false);
    });

    it("handles non-Error exceptions", async () => {
      // Arrange
      mockCreateFlashcard.mockRejectedValue("String error");
      const { result } = renderHook(() => useFlashcardCreation());

      // Act
      await act(async () => {
        await result.current.createNewFlashcard(mockFlashcardCommand);
      });

      // Assert
      expect(result.current.error).toEqual({
        message: "Nie udało się utworzyć fiszki",
        code: "CREATION_FAILED",
      });
    });

    it("calls onError callback when provided", async () => {
      // Arrange
      const errorMessage = "API Error";
      mockCreateFlashcard.mockRejectedValue(new Error(errorMessage));
      const onError = vi.fn();
      const { result } = renderHook(() => useFlashcardCreation({ onError }));

      // Act
      await act(async () => {
        await result.current.createNewFlashcard(mockFlashcardCommand);
      });

      // Assert
      expect(onError).toHaveBeenCalledWith({
        message: errorMessage,
        code: "CREATION_FAILED",
      });
    });

    it("handles validation errors from API", async () => {
      // Arrange
      const validationError = new Error("Front content is required");
      mockCreateFlashcard.mockRejectedValue(validationError);
      const { result } = renderHook(() => useFlashcardCreation());

      // Act
      await act(async () => {
        await result.current.createNewFlashcard({
          front_content: "",
          back_content: "Answer",
        });
      });

      // Assert
      expect(result.current.error?.message).toBe("Front content is required");
      expect(result.current.error?.code).toBe("CREATION_FAILED");
    });
  });

  describe("reset functionality", () => {
    it("resets state to initial values", async () => {
      // Arrange
      mockCreateFlashcard.mockRejectedValue(new Error("Test error"));
      const { result } = renderHook(() => useFlashcardCreation());

      // Create an error state
      await act(async () => {
        await result.current.createNewFlashcard(mockFlashcardCommand);
      });
      expect(result.current.error).not.toBeNull();

      // Act
      act(() => {
        result.current.reset();
      });

      // Assert
      expect(result.current.isCreating).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it("can be called multiple times safely", () => {
      // Arrange
      const { result } = renderHook(() => useFlashcardCreation());

      // Act
      act(() => {
        result.current.reset();
        result.current.reset();
        result.current.reset();
      });

      // Assert
      expect(result.current.isCreating).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it("maintains functionality after reset", async () => {
      // Arrange
      mockCreateFlashcard.mockResolvedValue(mockFlashcardResponse);
      const { result } = renderHook(() => useFlashcardCreation());

      // Reset then use
      act(() => {
        result.current.reset();
      });

      // Act
      let createdFlashcard: FlashcardDto | null = null;
      await act(async () => {
        createdFlashcard = await result.current.createNewFlashcard(mockFlashcardCommand);
      });

      // Assert
      expect(createdFlashcard).toEqual(mockFlashcardResponse);
      expect(result.current.error).toBeNull();
    });
  });

  describe("edge cases and boundary conditions", () => {
    it("handles flashcard creation with minimal data", async () => {
      // Arrange
      const minimalCommand: CreateFlashcardCommand = {
        front_content: "Q",
        back_content: "A",
      };
      const minimalResponse: FlashcardDto = {
        ...mockFlashcardResponse,
        front_content: "Q",
        back_content: "A",
        source_text_id: null,
      };
      mockCreateFlashcard.mockResolvedValue(minimalResponse);
      const { result } = renderHook(() => useFlashcardCreation());

      // Act
      let createdFlashcard: FlashcardDto | null = null;
      await act(async () => {
        createdFlashcard = await result.current.createNewFlashcard(minimalCommand);
      });

      // Assert
      expect(createdFlashcard).toEqual(minimalResponse);
      expect(mockCreateFlashcard).toHaveBeenCalledWith(minimalCommand);
    });

    it("handles flashcard creation with special characters", async () => {
      // Arrange
      const specialCommand: CreateFlashcardCommand = {
        front_content: "What is 数学？ émojis: 🧮 ⚡",
        back_content: "Mathematics with symbols: ∑ ∫ ∂",
        source_text_id: "source-123",
      };
      const specialResponse: FlashcardDto = {
        ...mockFlashcardResponse,
        front_content: specialCommand.front_content,
        back_content: specialCommand.back_content,
      };
      mockCreateFlashcard.mockResolvedValue(specialResponse);
      const { result } = renderHook(() => useFlashcardCreation());

      // Act
      let createdFlashcard: FlashcardDto | null = null;
      await act(async () => {
        createdFlashcard = await result.current.createNewFlashcard(specialCommand);
      });

      // Assert
      expect(createdFlashcard).toEqual(specialResponse);
    });

    it("handles very long content", async () => {
      // Arrange
      const longContent = "A".repeat(2000);
      const longCommand: CreateFlashcardCommand = {
        front_content: longContent,
        back_content: longContent,
      };
      const longResponse: FlashcardDto = {
        ...mockFlashcardResponse,
        front_content: longContent,
        back_content: longContent,
      };
      mockCreateFlashcard.mockResolvedValue(longResponse);
      const { result } = renderHook(() => useFlashcardCreation());

      // Act
      let createdFlashcard: FlashcardDto | null = null;
      await act(async () => {
        createdFlashcard = await result.current.createNewFlashcard(longCommand);
      });

      // Assert
      expect(createdFlashcard).toEqual(longResponse);
    });

    it("preserves hook state during component re-renders", async () => {
      // Arrange
      mockCreateFlashcard.mockRejectedValue(new Error("Persistent error"));
      const { result, rerender } = renderHook(() => useFlashcardCreation());

      // Create error state
      await act(async () => {
        await result.current.createNewFlashcard(mockFlashcardCommand);
      });
      expect(result.current.error).not.toBeNull();

      // Act - Force re-render
      rerender();

      // Assert - State should be preserved
      expect(result.current.error).not.toBeNull();
      expect(result.current.error?.message).toBe("Persistent error");
    });

    it("handles undefined source_text_id correctly", async () => {
      // Arrange
      const commandWithoutSource: CreateFlashcardCommand = {
        front_content: "Question",
        back_content: "Answer",
        // source_text_id intentionally undefined
      };
      const responseWithoutSource: FlashcardDto = {
        ...mockFlashcardResponse,
        source_text_id: null,
      };
      mockCreateFlashcard.mockResolvedValue(responseWithoutSource);
      const { result } = renderHook(() => useFlashcardCreation());

      // Act
      let createdFlashcard: FlashcardDto | null = null;
      await act(async () => {
        createdFlashcard = await result.current.createNewFlashcard(commandWithoutSource);
      });

      // Assert
      expect(createdFlashcard).not.toBeNull();
      expect(createdFlashcard).toHaveProperty("source_text_id", null);
      expect(mockCreateFlashcard).toHaveBeenCalledWith(commandWithoutSource);
    });
  });
});
