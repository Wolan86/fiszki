import { describe, it, expect, vi, beforeEach } from "vitest";
import type { MockedFunction } from "vitest";
import {
  createFlashcard,
  createFlashcardSchema,
  getFlashcards,
  flashcardListQuerySchema,
  getFlashcardsForLearning,
  flashcardLearningQuerySchema,
  deleteFlashcard,
} from "../flashcard.service";
import type {
  CreateFlashcardCommand,
  FlashcardDto,
  FlashcardListQueryParams,
  FlashcardLearningQueryParams,
} from "../../../types";
import type { SupabaseClient } from "@supabase/supabase-js";

// Mock Supabase client type
interface MockSupabaseClient {
  from: MockedFunction<any>;
  rpc: MockedFunction<any>;
}

describe("flashcard.service", () => {
  let mockSupabase: MockSupabaseClient;
  const mockUserId = "user-123";
  const mockSourceTextId = "source-123";

  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();

    // Create mock Supabase client
    mockSupabase = {
      from: vi.fn(),
      rpc: vi.fn(),
    };
  });

  describe("createFlashcardSchema", () => {
    it("validates valid flashcard data", () => {
      // Arrange
      const validData: CreateFlashcardCommand = {
        front_content: "What is React?",
        back_content: "A JavaScript library for building user interfaces",
        source_text_id: "123e4567-e89b-12d3-a456-426614174000",
      };

      // Act
      const result = createFlashcardSchema.safeParse(validData);

      // Assert
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validData);
      }
    });

    it("validates flashcard data without source_text_id", () => {
      // Arrange
      const validData: CreateFlashcardCommand = {
        front_content: "What is React?",
        back_content: "A JavaScript library for building user interfaces",
      };

      // Act
      const result = createFlashcardSchema.safeParse(validData);

      // Assert
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validData);
      }
    });

    it("rejects empty front_content", () => {
      // Arrange
      const invalidData = {
        front_content: "",
        back_content: "A JavaScript library for building user interfaces",
      };

      // Act
      const result = createFlashcardSchema.safeParse(invalidData);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("Front content is required");
      }
    });

    it("rejects empty back_content", () => {
      // Arrange
      const invalidData = {
        front_content: "What is React?",
        back_content: "",
      };

      // Act
      const result = createFlashcardSchema.safeParse(invalidData);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("Back content is required");
      }
    });

    it("rejects content that exceeds maximum length", () => {
      // Arrange
      const longContent = "A".repeat(2001);
      const invalidData = {
        front_content: longContent,
        back_content: "Valid back content",
      };

      // Act
      const result = createFlashcardSchema.safeParse(invalidData);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("cannot exceed 2000 characters");
      }
    });

    it("rejects invalid UUID format for source_text_id", () => {
      // Arrange
      const invalidData = {
        front_content: "What is React?",
        back_content: "A JavaScript library",
        source_text_id: "invalid-uuid",
      };

      // Act
      const result = createFlashcardSchema.safeParse(invalidData);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("Invalid source_text_id format");
      }
    });
  });

  describe("createFlashcard", () => {
    const mockFlashcard: FlashcardDto = {
      id: "flashcard-123",
      front_content: "What is React?",
      back_content: "A JavaScript library for building user interfaces",
      source_text_id: mockSourceTextId,
      user_id: mockUserId,
      creation_type: "manual",
      accepted: true,
      generation_time_ms: null,
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
    };

    it("creates flashcard successfully without source_text_id", async () => {
      // Arrange
      const command: CreateFlashcardCommand = {
        front_content: "What is React?",
        back_content: "A JavaScript library for building user interfaces",
      };

      const mockFlashcardResponse = {
        ...mockFlashcard,
        source_text_id: null,
      };

      const mockInsert = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: mockFlashcardResponse,
            error: null,
          }),
        }),
      });

      mockSupabase.from.mockReturnValue({
        insert: mockInsert,
      });

      // Act
      const result = await createFlashcard(mockSupabase as unknown as SupabaseClient, command, mockUserId);

      // Assert
      expect(result).toEqual(mockFlashcardResponse);
      expect(mockSupabase.from).toHaveBeenCalledWith("flashcards");
      expect(mockInsert).toHaveBeenCalledWith([
        {
          front_content: command.front_content,
          back_content: command.back_content,
          source_text_id: null,
          user_id: mockUserId,
          creation_type: "manual",
          accepted: true,
          generation_time_ms: null,
        },
      ]);
    });

    it("creates flashcard successfully with valid source_text_id", async () => {
      // Arrange
      const command: CreateFlashcardCommand = {
        front_content: "What is React?",
        back_content: "A JavaScript library for building user interfaces",
        source_text_id: mockSourceTextId,
      };

      // Mock source text validation
      const mockSourceTextSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { id: mockSourceTextId },
              error: null,
            }),
          }),
        }),
      });

      // Mock flashcard insertion
      const mockInsert = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: mockFlashcard,
            error: null,
          }),
        }),
      });

      mockSupabase.from
        .mockReturnValueOnce({
          select: mockSourceTextSelect,
        })
        .mockReturnValueOnce({
          insert: mockInsert,
        });

      // Act
      const result = await createFlashcard(mockSupabase as unknown as SupabaseClient, command, mockUserId);

      // Assert
      expect(result).toEqual(mockFlashcard);
      expect(mockSupabase.from).toHaveBeenCalledWith("source_texts");
      expect(mockSupabase.from).toHaveBeenCalledWith("flashcards");
    });

    it("throws error when source_text_id does not exist", async () => {
      // Arrange
      const command: CreateFlashcardCommand = {
        front_content: "What is React?",
        back_content: "A JavaScript library for building user interfaces",
        source_text_id: mockSourceTextId,
      };

      const mockSourceTextSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { code: "PGRST116" },
            }),
          }),
        }),
      });

      mockSupabase.from.mockReturnValue({
        select: mockSourceTextSelect,
      });

      // Act & Assert
      await expect(createFlashcard(mockSupabase as unknown as SupabaseClient, command, mockUserId)).rejects.toThrow(
        "SOURCE_TEXT_NOT_FOUND"
      );
    });

    it("throws error when source_text belongs to different user", async () => {
      // Arrange
      const command: CreateFlashcardCommand = {
        front_content: "What is React?",
        back_content: "A JavaScript library for building user interfaces",
        source_text_id: mockSourceTextId,
      };

      const mockSourceTextSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: null,
            }),
          }),
        }),
      });

      mockSupabase.from.mockReturnValue({
        select: mockSourceTextSelect,
      });

      // Act & Assert
      await expect(createFlashcard(mockSupabase as unknown as SupabaseClient, command, mockUserId)).rejects.toThrow(
        "SOURCE_TEXT_NOT_FOUND"
      );
    });

    it("throws database error when insertion fails", async () => {
      // Arrange
      const command: CreateFlashcardCommand = {
        front_content: "What is React?",
        back_content: "A JavaScript library for building user interfaces",
      };

      const mockInsert = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: null,
            error: { message: "Database connection failed" },
          }),
        }),
      });

      mockSupabase.from.mockReturnValue({
        insert: mockInsert,
      });

      // Act & Assert
      await expect(createFlashcard(mockSupabase as unknown as SupabaseClient, command, mockUserId)).rejects.toThrow(
        "DATABASE_ERROR: Database connection failed"
      );
    });

    it("throws error when no data is returned from successful insertion", async () => {
      // Arrange
      const command: CreateFlashcardCommand = {
        front_content: "What is React?",
        back_content: "A JavaScript library for building user interfaces",
      };

      const mockInsert = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: null,
            error: null,
          }),
        }),
      });

      mockSupabase.from.mockReturnValue({
        insert: mockInsert,
      });

      // Act & Assert
      await expect(createFlashcard(mockSupabase as unknown as SupabaseClient, command, mockUserId)).rejects.toThrow(
        "DATABASE_ERROR: No data returned from insert"
      );
    });
  });

  describe("getFlashcards", () => {
    const mockFlashcards: FlashcardDto[] = [
      {
        id: "flashcard-1",
        front_content: "What is React?",
        back_content: "A JavaScript library for building user interfaces",
        source_text_id: "source-123",
        user_id: mockUserId,
        creation_type: "ai_generated",
        accepted: true,
        generation_time_ms: 150,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
      },
      {
        id: "flashcard-2",
        front_content: "What is Vue?",
        back_content: "A progressive framework for building user interfaces",
        source_text_id: null,
        user_id: mockUserId,
        creation_type: "manual",
        accepted: true,
        generation_time_ms: null,
        created_at: "2024-01-02T00:00:00Z",
        updated_at: "2024-01-02T00:00:00Z",
      },
    ];

    it("gets flashcards with default parameters", async () => {
      // Arrange
      const queryParams: FlashcardListQueryParams = {};
      
      const mockQuery = {
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        range: vi.fn().mockResolvedValue({
          data: mockFlashcards,
          error: null,
          count: 2,
        }),
      };

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue(mockQuery),
      });

      // Act
      const result = await getFlashcards(mockSupabase as unknown as SupabaseClient, queryParams, mockUserId);

      // Assert
      expect(result).toEqual({
        data: mockFlashcards,
        pagination: {
          total: 2,
          limit: 10,
          offset: 0,
        },
      });
      expect(mockSupabase.from).toHaveBeenCalledWith("flashcards");
      expect(mockQuery.eq).toHaveBeenCalledWith("user_id", mockUserId);
      expect(mockQuery.order).toHaveBeenCalledWith("created_at", { ascending: false });
      expect(mockQuery.range).toHaveBeenCalledWith(0, 9);
    });

    it("gets flashcards with filtering parameters", async () => {
      // Arrange
      const queryParams: FlashcardListQueryParams = {
        source_text_id: "source-123",
        creation_type: "ai_generated",
        accepted: true,
        limit: 5,
        offset: 10,
        sort: "front_content",
        order: "asc",
      };
      
      const mockQuery = {
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        range: vi.fn().mockResolvedValue({
          data: [mockFlashcards[0]],
          error: null,
          count: 1,
        }),
      };

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue(mockQuery),
      });

      // Act
      const result = await getFlashcards(mockSupabase as unknown as SupabaseClient, queryParams, mockUserId);

      // Assert
      expect(result.pagination).toEqual({
        total: 1,
        limit: 5,
        offset: 10,
      });
      expect(mockQuery.eq).toHaveBeenCalledWith("user_id", mockUserId);
      expect(mockQuery.eq).toHaveBeenCalledWith("source_text_id", "source-123");
      expect(mockQuery.eq).toHaveBeenCalledWith("creation_type", "ai_generated");
      expect(mockQuery.eq).toHaveBeenCalledWith("accepted", true);
      expect(mockQuery.order).toHaveBeenCalledWith("front_content", { ascending: true });
      expect(mockQuery.range).toHaveBeenCalledWith(10, 14);
    });

    it("handles database errors", async () => {
      // Arrange
      const queryParams: FlashcardListQueryParams = {};
      
      const mockQuery = {
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        range: vi.fn().mockResolvedValue({
          data: null,
          error: { message: "Database connection failed" },
          count: null,
        }),
      };

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue(mockQuery),
      });

      // Act & Assert
      await expect(getFlashcards(mockSupabase as unknown as SupabaseClient, queryParams, mockUserId))
        .rejects.toThrow("DATABASE_ERROR: Database connection failed");
    });
  });

  describe("flashcardListQuerySchema", () => {
    it("validates default parameters", () => {
      // Arrange
      const queryParams = {};

      // Act
      const result = flashcardListQuerySchema.safeParse(queryParams);

      // Assert
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual({
          limit: 10,
          offset: 0,
          sort: "created_at",
          order: "desc",
        });
      }
    });

    it("validates all valid parameters", () => {
      // Arrange
      const queryParams = {
        limit: "20",
        offset: "5",
        sort: "front_content",
        order: "asc",
        source_text_id: "123e4567-e89b-12d3-a456-426614174000",
        creation_type: "ai_generated",
        accepted: "true",
      };

      // Act
      const result = flashcardListQuerySchema.safeParse(queryParams);

      // Assert
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual({
          limit: 20,
          offset: 5,
          sort: "front_content",
          order: "asc",
          source_text_id: "123e4567-e89b-12d3-a456-426614174000",
          creation_type: "ai_generated",
          accepted: true,
        });
      }
    });

    it("rejects invalid limit values", () => {
      // Arrange
      const queryParams = { limit: "101" };

      // Act
      const result = flashcardListQuerySchema.safeParse(queryParams);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("cannot exceed 100");
      }
    });

    it("rejects invalid sort field", () => {
      // Arrange
      const queryParams = { sort: "invalid_field" };

      // Act
      const result = flashcardListQuerySchema.safeParse(queryParams);

      // Assert
      expect(result.success).toBe(false);
    });

    it("rejects invalid UUID for source_text_id", () => {
      // Arrange
      const queryParams = { source_text_id: "invalid-uuid" };

      // Act
      const result = flashcardListQuerySchema.safeParse(queryParams);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("Invalid source_text_id format");
      }
    });
  });

  describe("getFlashcardsForLearning", () => {
    const mockLearningFlashcards: FlashcardDto[] = [
      {
        id: "flashcard-1",
        front_content: "What is React?",
        back_content: "A JavaScript library for building user interfaces",
        source_text_id: "source-123",
        user_id: mockUserId,
        creation_type: "ai_generated",
        accepted: true,
        generation_time_ms: 150,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
      },
      {
        id: "flashcard-2",
        front_content: "What is Vue?",
        back_content: "A progressive framework for building user interfaces",
        source_text_id: null,
        user_id: mockUserId,
        creation_type: "manual",
        accepted: true,
        generation_time_ms: null,
        created_at: "2024-01-02T00:00:00Z",
        updated_at: "2024-01-02T00:00:00Z",
      },
    ];

    it("gets random flashcards for learning with default parameters", async () => {
      // Arrange
      const queryParams: FlashcardLearningQueryParams = {};
      
      const mockCountQuery = {
        eq: vi.fn().mockReturnThis(),
        count: 5,
        error: null,
      };

      mockSupabase.rpc = vi.fn().mockResolvedValue({
        data: mockLearningFlashcards,
        error: null,
      });

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue(mockCountQuery),
      });

      // Act
      const result = await getFlashcardsForLearning(mockSupabase as unknown as SupabaseClient, queryParams, mockUserId);

      // Assert
      expect(result).toEqual({
        data: mockLearningFlashcards,
        total: 5,
      });
      expect(mockSupabase.rpc).toHaveBeenCalledWith("get_random_flashcards", {
        p_user_id: mockUserId,
        p_limit: 10,
      });
    });

    it("gets random flashcards with custom limit", async () => {
      // Arrange
      const queryParams: FlashcardLearningQueryParams = { limit: 20 };
      
      const mockCountQuery = {
        eq: vi.fn().mockReturnThis(),
        count: 15,
        error: null,
      };

      mockSupabase.rpc = vi.fn().mockResolvedValue({
        data: mockLearningFlashcards,
        error: null,
      });

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue(mockCountQuery),
      });

      // Act
      const result = await getFlashcardsForLearning(mockSupabase as unknown as SupabaseClient, queryParams, mockUserId);

      // Assert
      expect(mockSupabase.rpc).toHaveBeenCalledWith("get_random_flashcards", {
        p_user_id: mockUserId,
        p_limit: 20,
      });
      expect(result.total).toBe(15);
    });

    it("filters flashcards by source_text_id", async () => {
      // Arrange
      const queryParams: FlashcardLearningQueryParams = { source_text_id: "source-123" };
      
      // Mock source text validation query
      const mockSourceTextQuery = {
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { id: "source-123" },
          error: null,
        }),
      };

      const mockCountQuery = {
        eq: vi.fn().mockReturnThis(),
        count: 1,
        error: null,
      };

      mockSupabase.rpc = vi.fn().mockResolvedValue({
        data: mockLearningFlashcards,
        error: null,
      });

      // First call to from() is for source text validation, second for count query
      mockSupabase.from
        .mockReturnValueOnce({
          select: vi.fn().mockReturnValue(mockSourceTextQuery),
        })
        .mockReturnValueOnce({
          select: vi.fn().mockReturnValue(mockCountQuery),
        });

      // Act
      const result = await getFlashcardsForLearning(mockSupabase as unknown as SupabaseClient, queryParams, mockUserId);

      // Assert
      expect(result.data).toEqual([mockLearningFlashcards[0]]); // Only the one with matching source_text_id
      expect(mockCountQuery.eq).toHaveBeenCalledWith("source_text_id", "source-123");
      expect(mockSourceTextQuery.eq).toHaveBeenCalledWith("id", "source-123");
      expect(mockSourceTextQuery.eq).toHaveBeenCalledWith("user_id", mockUserId);
    });

    it("throws error when source_text_id does not belong to user", async () => {
      // Arrange
      const queryParams: FlashcardLearningQueryParams = { source_text_id: "source-123" };
      
      // Mock source text validation query to return error (not found)
      const mockSourceTextQuery = {
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { message: "Row not found" },
        }),
      };

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue(mockSourceTextQuery),
      });

      // Act & Assert
      await expect(getFlashcardsForLearning(mockSupabase as unknown as SupabaseClient, queryParams, mockUserId))
        .rejects.toThrow("SOURCE_TEXT_NOT_FOUND");
    });

    it("handles database RPC errors", async () => {
      // Arrange
      const queryParams: FlashcardLearningQueryParams = {};
      
      mockSupabase.rpc = vi.fn().mockResolvedValue({
        data: null,
        error: { message: "RPC function failed" },
      });

      // Act & Assert
      await expect(getFlashcardsForLearning(mockSupabase as unknown as SupabaseClient, queryParams, mockUserId))
        .rejects.toThrow("DATABASE_ERROR: RPC function failed");
    });

    it("handles count query errors", async () => {
      // Arrange
      const queryParams: FlashcardLearningQueryParams = {};
      
      const mockCountQuery = {
        eq: vi.fn().mockReturnThis(),
        count: null,
        error: { message: "Count query failed" },
      };

      mockSupabase.rpc = vi.fn().mockResolvedValue({
        data: mockLearningFlashcards,
        error: null,
      });

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue(mockCountQuery),
      });

      // Act & Assert
      await expect(getFlashcardsForLearning(mockSupabase as unknown as SupabaseClient, queryParams, mockUserId))
        .rejects.toThrow("DATABASE_ERROR: Count query failed");
    });
  });

  describe("flashcardLearningQuerySchema", () => {
    it("validates default parameters", () => {
      // Arrange
      const queryParams = {};

      // Act
      const result = flashcardLearningQuerySchema.safeParse(queryParams);

      // Assert
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual({
          limit: 10,
        });
      }
    });

    it("validates custom limit", () => {
      // Arrange
      const queryParams = { limit: "25" };

      // Act
      const result = flashcardLearningQuerySchema.safeParse(queryParams);

      // Assert
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.limit).toBe(25);
      }
    });

    it("validates source_text_id", () => {
      // Arrange
      const queryParams = { 
        limit: "15",
        source_text_id: "123e4567-e89b-12d3-a456-426614174000" 
      };

      // Act
      const result = flashcardLearningQuerySchema.safeParse(queryParams);

      // Assert
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual({
          limit: 15,
          source_text_id: "123e4567-e89b-12d3-a456-426614174000",
        });
      }
    });

    it("rejects invalid limit values", () => {
      // Arrange
      const queryParams = { limit: "51" };

      // Act
      const result = flashcardLearningQuerySchema.safeParse(queryParams);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("cannot exceed 50");
      }
    });

    it("rejects invalid UUID for source_text_id", () => {
      // Arrange
      const queryParams = { source_text_id: "invalid-uuid" };

      // Act
      const result = flashcardLearningQuerySchema.safeParse(queryParams);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("Invalid source_text_id format");
      }
    });
  });

  describe("deleteFlashcard", () => {
    it("deletes flashcard successfully", async () => {
      // Arrange
      const flashcardId = "flashcard-123";

      // Mock successful check if flashcard exists
      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { id: flashcardId },
              error: null,
            }),
          }),
        }),
      });

      // Mock successful deletion
      const mockDelete = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            error: null,
          }),
        }),
      });

      mockSupabase.from.mockReturnValueOnce({
        select: mockSelect,
      }).mockReturnValueOnce({
        delete: mockDelete,
      });

      // Act
      await deleteFlashcard(mockSupabase as unknown as SupabaseClient, flashcardId, mockUserId);

      // Assert
      expect(mockSupabase.from).toHaveBeenCalledWith("flashcards");
      expect(mockSupabase.from).toHaveBeenCalledTimes(2);
    });

    it("throws FLASHCARD_NOT_FOUND when flashcard doesn't exist", async () => {
      // Arrange
      const flashcardId = "flashcard-123";

      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { message: "No rows found" },
            }),
          }),
        }),
      });

      mockSupabase.from.mockReturnValue({
        select: mockSelect,
      });

      // Act & Assert
      await expect(deleteFlashcard(mockSupabase as unknown as SupabaseClient, flashcardId, mockUserId))
        .rejects.toThrow("FLASHCARD_NOT_FOUND");
    });

    it("throws DATABASE_ERROR when deletion fails", async () => {
      // Arrange
      const flashcardId = "flashcard-123";

      // Mock successful check
      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { id: flashcardId },
              error: null,
            }),
          }),
        }),
      });

      // Mock failed deletion
      const mockDelete = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            error: { message: "Database connection failed" },
          }),
        }),
      });

      mockSupabase.from.mockReturnValueOnce({
        select: mockSelect,
      }).mockReturnValueOnce({
        delete: mockDelete,
      });

      // Act & Assert
      await expect(deleteFlashcard(mockSupabase as unknown as SupabaseClient, flashcardId, mockUserId))
        .rejects.toThrow("DATABASE_ERROR: Database connection failed");
    });
  });
});
