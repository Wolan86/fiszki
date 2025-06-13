import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useSourceText } from "../useSourceText";
import type { UseSourceTextOptions } from "../../types";
import { saveSourceText } from "@/lib/services/api-service";
import type { SourceTextDto, CreateSourceTextResponse } from "@/types";

// Mock the API service
vi.mock("@/lib/services/api-service", () => ({
  saveSourceText: vi.fn(),
}));

const mockSaveSourceText = vi.mocked(saveSourceText);

// Mock localStorage
const mockLocalStorage = {
  setItem: vi.fn(),
  removeItem: vi.fn(),
  getItem: vi.fn(),
};

Object.defineProperty(window, "localStorage", {
  value: mockLocalStorage,
});

describe("useSourceText", () => {
  const defaultOptions: UseSourceTextOptions = {
    minWordCount: 10,
    maxWordCount: 500,
    autosaveDelay: 100, // Shorter delay for testing
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.setItem.mockClear();
    mockLocalStorage.removeItem.mockClear();
    mockSaveSourceText.mockClear();
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  describe("initialization", () => {
    it("initializes with default empty state", () => {
      // Arrange
      const { result } = renderHook(() => useSourceText(defaultOptions));

      // Assert
      expect(result.current.content).toBe("");
      expect(result.current.wordCount).toBe(0);
      expect(result.current.isValid).toBe(false);
      expect(result.current.isSaving).toBe(false);
      expect(result.current.lastSaved).toBeNull();
      // Fix: Empty content triggers validation error immediately in the real implementation
      expect(result.current.errors).toEqual(["Wprowadź co najmniej 10 słów"]);
    });

    it("initializes with provided initial content", () => {
      // Arrange
      const initialContent = "This is a sample text for testing word count";
      const { result } = renderHook(() => useSourceText({ ...defaultOptions, initialContent }));

      // Assert
      expect(result.current.content).toBe(initialContent);
      // Fix: Counting "This is a sample text for testing word count" = 9 words
      expect(result.current.wordCount).toBe(9);
    });
  });

  describe("word counting logic", () => {
    it("counts words correctly for normal text", () => {
      // Arrange
      const { result } = renderHook(() => useSourceText(defaultOptions));

      // Act
      act(() => {
        result.current.setContent("This is a test with seven words");
      });

      // Assert
      // Fix: Counting "This is a test with seven words" = 7 words
      expect(result.current.wordCount).toBe(7);
    });

    it("handles empty string", () => {
      // Arrange
      const { result } = renderHook(() => useSourceText(defaultOptions));

      // Act
      act(() => {
        result.current.setContent("");
      });

      // Assert
      expect(result.current.wordCount).toBe(0);
    });

    it("handles only whitespace", () => {
      // Arrange
      const { result } = renderHook(() => useSourceText(defaultOptions));

      // Act
      act(() => {
        result.current.setContent("   \n\t   ");
      });

      // Assert
      expect(result.current.wordCount).toBe(0);
    });

    it("handles multiple consecutive spaces", () => {
      // Arrange
      const { result } = renderHook(() => useSourceText(defaultOptions));

      // Act
      act(() => {
        result.current.setContent("word1    word2     word3");
      });

      // Assert
      expect(result.current.wordCount).toBe(3);
    });

    it("handles special characters and punctuation", () => {
      // Arrange
      const { result } = renderHook(() => useSourceText(defaultOptions));

      // Act
      act(() => {
        result.current.setContent("Hello, world! How are you? I'm fine.");
      });

      // Assert
      // Fix: Counting "Hello, world! How are you? I'm fine." = 7 words
      expect(result.current.wordCount).toBe(7);
    });
  });

  describe("validation logic", () => {
    it("shows error when below minimum word count", () => {
      // Arrange
      const { result } = renderHook(() => useSourceText(defaultOptions));

      // Act
      act(() => {
        result.current.setContent("Short text");
      });

      // Assert
      expect(result.current.isValid).toBe(false);
      expect(result.current.errors).toContain("Wprowadź co najmniej 10 słów");
    });

    it("shows error when above maximum word count", () => {
      // Arrange
      const { result } = renderHook(() => useSourceText({ ...defaultOptions, maxWordCount: 5 }));

      // Act
      act(() => {
        result.current.setContent("This text has more than five words definitely");
      });

      // Assert
      expect(result.current.isValid).toBe(false);
      // Fix: Error message format matches implementation
      expect(result.current.errors).toContain("Przekroczono limit 5 słów");
    });

    it("validates successfully within word count limits", () => {
      // Arrange
      const { result } = renderHook(() => useSourceText(defaultOptions));

      // Act
      act(() => {
        result.current.setContent("This is a valid text with exactly ten words here");
      });

      // Assert
      expect(result.current.isValid).toBe(true);
      expect(result.current.errors).toEqual([]);
    });

    it("validates at minimum boundary", () => {
      // Arrange
      const { result } = renderHook(() => useSourceText(defaultOptions));

      // Act
      act(() => {
        result.current.setContent("One two three four five six seven eight nine ten");
      });

      // Assert
      // Fix: This text has exactly 10 words, so it should be valid
      expect(result.current.wordCount).toBe(10);
      expect(result.current.isValid).toBe(true);
      expect(result.current.errors).toEqual([]);
    });

    it("validates at maximum boundary", () => {
      // Arrange
      const { result } = renderHook(() => useSourceText({ ...defaultOptions, minWordCount: 5, maxWordCount: 5 }));

      // Act
      act(() => {
        result.current.setContent("Exactly five words here now");
      });

      // Assert
      expect(result.current.isValid).toBe(true);
      expect(result.current.errors).toEqual([]);
    });
  });

  describe("manual save operation", () => {
    it("saves valid content successfully", async () => {
      // Arrange
      const mockResponse = {
        source_text: {
          id: "test-id",
          content: "Valid content with enough words for testing save operation properly",
          user_id: "user-1",
          created_at: "2024-01-01T00:00:00Z",
        },
      };

      // Fix: Mock should return the response directly, not wrapped in another object
      mockSaveSourceText.mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() => useSourceText(defaultOptions));

      // Act
      act(() => {
        // Fix: Use text with 10+ words to pass validation
        result.current.setContent("Valid content with enough words for testing save operation properly");
      });

      let saveResult: SourceTextDto | null = null;
      await act(async () => {
        saveResult = await result.current.saveSourceText();
      });

      // Assert
      expect(saveResult).toEqual(mockResponse.source_text);
      expect(result.current.lastSaved).toBeInstanceOf(Date);
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        "source_text_backup",
        "Valid content with enough words for testing save operation properly"
      );
    });

    it("handles save failure gracefully", async () => {
      // Arrange
      mockSaveSourceText.mockRejectedValueOnce(new Error("API Error"));
      const { result } = renderHook(() => useSourceText(defaultOptions));

      // Act
      act(() => {
        result.current.setContent("Valid content with enough words for testing save failure");
      });

      let saveResult: SourceTextDto | null = null;
      await act(async () => {
        saveResult = await result.current.saveSourceText();
      });

      // Assert
      expect(saveResult).toBeNull();
      expect(result.current.isSaving).toBe(false);
    });

    it("prevents save during flashcard generation", async () => {
      // Arrange
      const { result } = renderHook(() => useSourceText(defaultOptions));

      // Act
      act(() => {
        result.current.setContent("Valid content with enough words for testing save prevention");
      });

      // Simulate flashcard generation in progress by calling saveSourceTextAndGenerateFlashcards
      const mockGenerationResponse = {
        source_text: {
          id: "test-id",
          content: "Valid content with enough words for testing save prevention",
          user_id: "user-1",
          created_at: "2024-01-01T00:00:00Z",
        },
        flashcards: [],
        generation_stats: {
          requested_count: 5,
          generated_count: 0,
          total_time_ms: 1000,
        },
      };

      mockSaveSourceText.mockResolvedValueOnce(mockGenerationResponse);

      let saveResult: SourceTextDto | null = null;
      let generationPromise: Promise<CreateSourceTextResponse | null>;

      await act(async () => {
        generationPromise = result.current.saveSourceTextAndGenerateFlashcards(5);
        saveResult = await result.current.saveSourceText();
      });

      await act(async () => {
        await generationPromise;
      });

      // Assert
      expect(saveResult).toBeNull(); // Should prevent save during generation
    });
  });

  describe("saveSourceTextAndGenerateFlashcards", () => {
    it("saves and generates flashcards successfully", async () => {
      // Arrange
      mockSaveSourceText.mockReset(); // Clear any previous mock setup
      const mockResponse = {
        source_text: {
          id: "test-id",
          content: "Valid content with enough words for flashcard generation testing properly",
          user_id: "user-1",
          created_at: "2024-01-01T00:00:00Z",
        },
        flashcards: [],
        generation_stats: {
          requested_count: 5,
          generated_count: 5,
          total_time_ms: 1000,
        },
      };

      mockSaveSourceText.mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() => useSourceText(defaultOptions));

      // Act
      act(() => {
        // Fix: Use text with 10+ words to pass validation
        result.current.setContent("Valid content with enough words for flashcard generation testing properly");
      });

      let generationResult: CreateSourceTextResponse | null = null;
      await act(async () => {
        generationResult = await result.current.saveSourceTextAndGenerateFlashcards(5);
      });

      // Assert
      expect(generationResult).toEqual(mockResponse);
      expect(mockSaveSourceText).toHaveBeenCalledWith(
        "Valid content with enough words for flashcard generation testing properly",
        true,
        5
      );
      expect(result.current.lastSaved).toBeInstanceOf(Date);
    });

    it("validates content before generation", async () => {
      // Arrange
      const { result } = renderHook(() => useSourceText(defaultOptions));

      // Act - Set invalid content (too short)
      act(() => {
        result.current.setContent("Too short");
      });

      let generationResult: CreateSourceTextResponse | null = null;
      await act(async () => {
        generationResult = await result.current.saveSourceTextAndGenerateFlashcards(5);
      });

      // Assert
      expect(generationResult).toBeNull();
      expect(mockSaveSourceText).not.toHaveBeenCalled();
    });

    it("re-throws API errors for calling component to handle", async () => {
      // Arrange
      mockSaveSourceText.mockReset(); // Clear any previous mock setup
      const apiError = new Error("API Error");
      mockSaveSourceText.mockRejectedValueOnce(apiError);

      const { result } = renderHook(() => useSourceText(defaultOptions));

      // Act
      act(() => {
        // Fix: Use text with 10+ words to pass validation
        result.current.setContent("Valid content with enough words for error testing scenario properly");
      });

      // Act & Assert
      await act(async () => {
        await expect(result.current.saveSourceTextAndGenerateFlashcards(5)).rejects.toThrow("API Error");
      });
    });
  });

  describe("localStorage backup", () => {
    it("saves backup to localStorage on successful save", async () => {
      // Arrange
      mockSaveSourceText.mockReset(); // Clear any previous mock setup
      const mockResponse = {
        source_text: {
          id: "test-id",
          content: "Content for localStorage backup testing with enough words properly and successfully",
          user_id: "user-1",
          created_at: "2024-01-01T00:00:00Z",
        },
      };

      mockSaveSourceText.mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() => useSourceText(defaultOptions));

      // Act
      act(() => {
        result.current.setContent(
          "Content for localStorage backup testing with enough words properly and successfully"
        );
      });

      // Wait for validation to complete
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      let saveResult: SourceTextDto | null = null;
      await act(async () => {
        saveResult = await result.current.saveSourceText();
      });

      // Assert
      expect(saveResult).toEqual(mockResponse.source_text);
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        "source_text_backup",
        "Content for localStorage backup testing with enough words properly and successfully"
      );
    });

    it("handles localStorage errors gracefully", async () => {
      // Arrange
      mockSaveSourceText.mockReset(); // Clear any previous mock setup
      const mockResponse = {
        source_text: {
          id: "test-id",
          content: "Content for localStorage error testing with enough words properly and successfully",
          user_id: "user-1",
          created_at: "2024-01-01T00:00:00Z",
        },
      };

      mockSaveSourceText.mockResolvedValueOnce(mockResponse);
      mockLocalStorage.setItem.mockImplementationOnce(() => {
        throw new Error("Cannot access localStorage");
      });

      const { result } = renderHook(() => useSourceText(defaultOptions));

      // Act
      act(() => {
        result.current.setContent("Content for localStorage error testing with enough words properly and successfully");
      });

      // Wait for validation to complete
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      await act(async () => {
        const saveResult = await result.current.saveSourceText();
        expect(saveResult).toEqual(mockResponse.source_text);
      });
    });
  });

  describe("reset functionality", () => {
    it("resets all state to initial values", () => {
      // Arrange
      const { result } = renderHook(() => useSourceText(defaultOptions));

      // Set some state first
      act(() => {
        result.current.setContent("Some content for testing reset functionality");
      });

      // Act
      act(() => {
        result.current.reset();
      });

      // Assert
      expect(result.current.content).toBe("");
      expect(result.current.wordCount).toBe(0);
      expect(result.current.isValid).toBe(false);
      expect(result.current.isSaving).toBe(false);
      expect(result.current.lastSaved).toBeNull();
      // Fix: Reset state also shows validation error for empty content
      expect(result.current.errors).toEqual(["Wprowadź co najmniej 10 słów"]);
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith("source_text_backup");
    });

    it("handles localStorage removal errors gracefully", () => {
      // Arrange
      mockLocalStorage.removeItem.mockImplementationOnce(() => {
        throw new Error("Cannot access localStorage");
      });

      const { result } = renderHook(() => useSourceText(defaultOptions));

      // Act & Assert - Should not throw
      act(() => {
        result.current.reset();
      });

      expect(result.current.content).toBe("");
    });
  });
});
