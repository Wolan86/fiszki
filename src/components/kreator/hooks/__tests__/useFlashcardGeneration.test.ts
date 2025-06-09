import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useFlashcardGeneration } from "../useFlashcardGeneration";
import * as apiService from "@/lib/services/api-service";
import type { CreateSourceTextResponse, UnsavedFlashcardDto } from "@/types";

// Mock the API service
vi.mock("@/lib/services/api-service", () => ({
  updateFlashcard: vi.fn(),
  regenerateFlashcard: vi.fn(),
  createFlashcard: vi.fn(),
}));

const mockUpdateFlashcard = vi.mocked(apiService.updateFlashcard);
const mockRegenerateFlashcard = vi.mocked(apiService.regenerateFlashcard);
const mockCreateFlashcard = vi.mocked(apiService.createFlashcard);

describe("useFlashcardGeneration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("initialization", () => {
    it("initializes with empty state", () => {
      // Arrange & Act
      const { result } = renderHook(() => useFlashcardGeneration());

      // Assert
      expect(result.current.flashcards).toEqual([]);
      expect(result.current.isGenerating).toBe(false);
      expect(result.current.generationStats).toBeNull();
      expect(result.current.error).toBeNull();
      expect(result.current.savingFlashcardIds).toEqual([]);
    });
  });

  describe("loadFlashcardsFromResponse", () => {
    it("loads flashcards from API response", () => {
      // Arrange
      const { result } = renderHook(() => useFlashcardGeneration());
      
      const mockFlashcard: UnsavedFlashcardDto = {
        id: "temp-1",
        front_content: "Question 1",
        back_content: "Answer 1",
        source_text_id: "source-1",
        accepted: null,
        creation_type: "ai_generated",
        user_id: "user-1", 
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
        generation_time_ms: 1000,
      };

      const mockResponse: CreateSourceTextResponse = {
        source_text: {
          id: "source-1",
          content: "Test content",
          user_id: "user-1",
          created_at: "2024-01-01T00:00:00Z",
        },
        flashcards: [mockFlashcard],
        generation_stats: {
          requested_count: 1,
          generated_count: 1,
          total_time_ms: 1000,
        },
      };

      // Act
      act(() => {
        result.current.loadFlashcardsFromResponse(mockResponse);
      });

      // Assert
      expect(result.current.flashcards).toHaveLength(1);
      expect(result.current.flashcards[0].front_content).toBe("Question 1");
      expect(result.current.flashcards[0].back_content).toBe("Answer 1");
      expect(result.current.generationStats).toEqual({
        requestedCount: 1,
        generatedCount: 1,
        totalTimeMs: 1000,
        formattedTime: "1.0 sekund",
      });
    });

    it("handles empty response", () => {
      // Arrange
      const { result } = renderHook(() => useFlashcardGeneration());
      const emptyResponse = {
        source_text: {
          id: "source-1",
          content: "Test content",
          user_id: "user-1",
          created_at: "2024-01-01T00:00:00Z",
        },
        flashcards: [],
        generation_stats: {
          requested_count: 5,
          generated_count: 0,
          total_time_ms: 500,
        },
      };

      // Act
      act(() => {
        result.current.loadFlashcardsFromResponse(emptyResponse);
      });

      // Assert
      expect(result.current.flashcards).toEqual([]);
      expect(result.current.generationStats).toBeNull();
    });
  });

  describe("editFlashcard", () => {
    it("updates flashcard content locally", () => {
      // Arrange
      const { result } = renderHook(() => useFlashcardGeneration());
      
      const mockFlashcard: UnsavedFlashcardDto = {
        id: "temp-1",
        front_content: "Original Question",
        back_content: "Original Answer",
        source_text_id: "source-1",
        accepted: null,
        creation_type: "ai_generated",
        user_id: "user-1",
        created_at: "2024-01-01T00:00:00Z", 
        updated_at: "2024-01-01T00:00:00Z",
        generation_time_ms: 1000,
      };

      const mockResponse: CreateSourceTextResponse = {
        source_text: {
          id: "source-1",
          content: "Test content",
          user_id: "user-1",
          created_at: "2024-01-01T00:00:00Z",
        },
        flashcards: [mockFlashcard],
        generation_stats: {
          requested_count: 1,
          generated_count: 1,
          total_time_ms: 1000,
        },
      };

      act(() => {
        result.current.loadFlashcardsFromResponse(mockResponse);
      });

      // Act
      act(() => {
        result.current.editFlashcard("temp-1", "Updated Question", "Updated Answer");
      });

      // Assert
      const flashcard = result.current.flashcards.find(f => f.id === "temp-1");
      expect(flashcard?.front_content).toBe("Updated Question");
      expect(flashcard?.back_content).toBe("Updated Answer");
    });
  });

  describe("updateFlashcard", () => {
    it("updates flashcard with acceptance status", async () => {
      // Arrange
      const { result } = renderHook(() => useFlashcardGeneration());
      
      const mockFlashcard: UnsavedFlashcardDto = {
        id: "temp-1",
        front_content: "Question 1",
        back_content: "Answer 1",
        source_text_id: "source-1",
        accepted: null,
        creation_type: "ai_generated",
        user_id: "user-1",
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z", 
        generation_time_ms: 1000,
      };

      const mockResponse: CreateSourceTextResponse = {
        source_text: {
          id: "source-1",
          content: "Test content",
          user_id: "user-1",
          created_at: "2024-01-01T00:00:00Z",
        },
        flashcards: [mockFlashcard],
        generation_stats: {
          requested_count: 1,
          generated_count: 1,
          total_time_ms: 1000,
        },
      };

      act(() => {
        result.current.loadFlashcardsFromResponse(mockResponse);
      });

      // Act - Update temp flashcard (local only)
      await act(async () => {
        await result.current.updateFlashcard("temp-1", { accepted: true });
      });

      // Assert
      const flashcard = result.current.flashcards.find(f => f.id === "temp-1");
      expect(flashcard?.accepted).toBe(true);
    });
  });

  describe("saveFlashcard", () => {
    it("saves accepted flashcard to database", async () => {
      // Arrange
      const { result } = renderHook(() => useFlashcardGeneration());
      
      const mockFlashcard: UnsavedFlashcardDto = {
        id: "temp-1",
        front_content: "Question 1",
        back_content: "Answer 1",
        source_text_id: "source-1",
        accepted: true,
        creation_type: "ai_generated",
        user_id: "user-1",
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
        generation_time_ms: 1000,
      };

      const mockResponse: CreateSourceTextResponse = {
        source_text: {
          id: "source-1",
          content: "Test content",
          user_id: "user-1",
          created_at: "2024-01-01T00:00:00Z",
        },
        flashcards: [mockFlashcard],
        generation_stats: {
          requested_count: 1,
          generated_count: 1,
          total_time_ms: 1000,
        },
      };

      const savedFlashcard = {
        id: "real-1",
        front_content: "Question 1",
        back_content: "Answer 1",
        source_text_id: "source-1",
        user_id: "user-1",
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
        accepted: true,
        creation_type: "ai_generated" as const,
        generation_time_ms: 1000,
      };

      mockCreateFlashcard.mockResolvedValueOnce(savedFlashcard);

      act(() => {
        result.current.loadFlashcardsFromResponse(mockResponse);
      });

      // Act
      await act(async () => {
        await result.current.saveFlashcard("temp-1");
      });

      // Assert
      expect(mockCreateFlashcard).toHaveBeenCalledWith({
        front_content: "Question 1",
        back_content: "Answer 1",
        source_text_id: "source-1",
      });
      
      const flashcard = result.current.flashcards.find(f => f.id === "real-1");
      expect(flashcard).toBeDefined();
    });
  });

  describe("reset", () => {
    it("resets all state to initial values", () => {
      // Arrange
      const { result } = renderHook(() => useFlashcardGeneration());
      
      const mockResponse: CreateSourceTextResponse = {
        source_text: {
          id: "source-1",
          content: "Test content",
          user_id: "user-1",
          created_at: "2024-01-01T00:00:00Z",
        },
        flashcards: [{
          id: "temp-1",
          front_content: "Question 1",
          back_content: "Answer 1",
          source_text_id: "source-1",
          accepted: null,
          creation_type: "ai_generated",
          user_id: "user-1",
          created_at: "2024-01-01T00:00:00Z",
          updated_at: "2024-01-01T00:00:00Z", 
          generation_time_ms: 1000,
        }],
        generation_stats: {
          requested_count: 1,
          generated_count: 1,
          total_time_ms: 1000,
        },
      };

      act(() => {
        result.current.loadFlashcardsFromResponse(mockResponse);
      });

      // Act
      act(() => {
        result.current.reset();
      });

      // Assert
      expect(result.current.flashcards).toEqual([]);
      expect(result.current.isGenerating).toBe(false);
      expect(result.current.generationStats).toBeNull();
      expect(result.current.error).toBeNull();
      expect(result.current.savingFlashcardIds).toEqual([]);
    });
  });
}); 