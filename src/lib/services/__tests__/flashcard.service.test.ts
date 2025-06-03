import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { MockedFunction } from 'vitest';
import { createFlashcard, createFlashcardSchema } from '../flashcard.service';
import type { CreateFlashcardCommand, FlashcardDto } from '../../../types';
import type { SupabaseClient } from '@supabase/supabase-js';

// Mock Supabase client type
type MockSupabaseClient = {
  from: MockedFunction<any>;
};

describe('flashcard.service', () => {
  let mockSupabase: MockSupabaseClient;
  const mockUserId = 'user-123';
  const mockSourceTextId = 'source-123';

  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();

    // Create mock Supabase client
    mockSupabase = {
      from: vi.fn()
    };
  });

  describe('createFlashcardSchema', () => {
    it('validates valid flashcard data', () => {
      // Arrange
      const validData: CreateFlashcardCommand = {
        front_content: 'What is React?',
        back_content: 'A JavaScript library for building user interfaces',
        source_text_id: '123e4567-e89b-12d3-a456-426614174000'
      };

      // Act
      const result = createFlashcardSchema.safeParse(validData);

      // Assert
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validData);
      }
    });

    it('validates flashcard data without source_text_id', () => {
      // Arrange
      const validData: CreateFlashcardCommand = {
        front_content: 'What is React?',
        back_content: 'A JavaScript library for building user interfaces'
      };

      // Act
      const result = createFlashcardSchema.safeParse(validData);

      // Assert
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validData);
      }
    });

    it('rejects empty front_content', () => {
      // Arrange
      const invalidData = {
        front_content: '',
        back_content: 'A JavaScript library for building user interfaces'
      };

      // Act
      const result = createFlashcardSchema.safeParse(invalidData);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Front content is required');
      }
    });

    it('rejects empty back_content', () => {
      // Arrange
      const invalidData = {
        front_content: 'What is React?',
        back_content: ''
      };

      // Act
      const result = createFlashcardSchema.safeParse(invalidData);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Back content is required');
      }
    });

    it('rejects content that exceeds maximum length', () => {
      // Arrange
      const longContent = 'A'.repeat(2001);
      const invalidData = {
        front_content: longContent,
        back_content: 'Valid back content'
      };

      // Act
      const result = createFlashcardSchema.safeParse(invalidData);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('cannot exceed 2000 characters');
      }
    });

    it('rejects invalid UUID format for source_text_id', () => {
      // Arrange
      const invalidData = {
        front_content: 'What is React?',
        back_content: 'A JavaScript library',
        source_text_id: 'invalid-uuid'
      };

      // Act
      const result = createFlashcardSchema.safeParse(invalidData);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Invalid source_text_id format');
      }
    });
  });

  describe('createFlashcard', () => {
    const mockFlashcard: FlashcardDto = {
      id: 'flashcard-123',
      front_content: 'What is React?',
      back_content: 'A JavaScript library for building user interfaces',
      source_text_id: mockSourceTextId,
      user_id: mockUserId,
      creation_type: 'manual',
      accepted: true,
      generation_time_ms: null,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    };

    it('creates flashcard successfully without source_text_id', async () => {
      // Arrange
      const command: CreateFlashcardCommand = {
        front_content: 'What is React?',
        back_content: 'A JavaScript library for building user interfaces'
      };

      const mockFlashcardResponse = {
        ...mockFlashcard,
        source_text_id: null
      };

      const mockInsert = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: mockFlashcardResponse,
            error: null
          })
        })
      });

      mockSupabase.from.mockReturnValue({
        insert: mockInsert
      });

      // Act
      const result = await createFlashcard(
        mockSupabase as unknown as SupabaseClient,
        command,
        mockUserId
      );

      // Assert
      expect(result).toEqual(mockFlashcardResponse);
      expect(mockSupabase.from).toHaveBeenCalledWith('flashcards');
      expect(mockInsert).toHaveBeenCalledWith([{
        front_content: command.front_content,
        back_content: command.back_content,
        source_text_id: null,
        user_id: mockUserId,
        creation_type: 'manual',
        accepted: true,
        generation_time_ms: null
      }]);
    });

    it('creates flashcard successfully with valid source_text_id', async () => {
      // Arrange
      const command: CreateFlashcardCommand = {
        front_content: 'What is React?',
        back_content: 'A JavaScript library for building user interfaces',
        source_text_id: mockSourceTextId
      };

      // Mock source text validation
      const mockSourceTextSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { id: mockSourceTextId },
              error: null
            })
          })
        })
      });

      // Mock flashcard insertion
      const mockInsert = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: mockFlashcard,
            error: null
          })
        })
      });

      mockSupabase.from
        .mockReturnValueOnce({
          select: mockSourceTextSelect
        })
        .mockReturnValueOnce({
          insert: mockInsert
        });

      // Act
      const result = await createFlashcard(
        mockSupabase as unknown as SupabaseClient,
        command,
        mockUserId
      );

      // Assert
      expect(result).toEqual(mockFlashcard);
      expect(mockSupabase.from).toHaveBeenCalledWith('source_texts');
      expect(mockSupabase.from).toHaveBeenCalledWith('flashcards');
    });

    it('throws error when source_text_id does not exist', async () => {
      // Arrange
      const command: CreateFlashcardCommand = {
        front_content: 'What is React?',
        back_content: 'A JavaScript library for building user interfaces',
        source_text_id: mockSourceTextId
      };

      const mockSourceTextSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { code: 'PGRST116' }
            })
          })
        })
      });

      mockSupabase.from.mockReturnValue({
        select: mockSourceTextSelect
      });

      // Act & Assert
      await expect(
        createFlashcard(
          mockSupabase as unknown as SupabaseClient,
          command,
          mockUserId
        )
      ).rejects.toThrow('SOURCE_TEXT_NOT_FOUND');
    });

    it('throws error when source_text belongs to different user', async () => {
      // Arrange
      const command: CreateFlashcardCommand = {
        front_content: 'What is React?',
        back_content: 'A JavaScript library for building user interfaces',
        source_text_id: mockSourceTextId
      };

      const mockSourceTextSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: null
            })
          })
        })
      });

      mockSupabase.from.mockReturnValue({
        select: mockSourceTextSelect
      });

      // Act & Assert
      await expect(
        createFlashcard(
          mockSupabase as unknown as SupabaseClient,
          command,
          mockUserId
        )
      ).rejects.toThrow('SOURCE_TEXT_NOT_FOUND');
    });

    it('throws database error when insertion fails', async () => {
      // Arrange
      const command: CreateFlashcardCommand = {
        front_content: 'What is React?',
        back_content: 'A JavaScript library for building user interfaces'
      };

      const mockInsert = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: null,
            error: { message: 'Database connection failed' }
          })
        })
      });

      mockSupabase.from.mockReturnValue({
        insert: mockInsert
      });

      // Act & Assert
      await expect(
        createFlashcard(
          mockSupabase as unknown as SupabaseClient,
          command,
          mockUserId
        )
      ).rejects.toThrow('DATABASE_ERROR: Database connection failed');
    });

    it('throws error when no data is returned from successful insertion', async () => {
      // Arrange
      const command: CreateFlashcardCommand = {
        front_content: 'What is React?',
        back_content: 'A JavaScript library for building user interfaces'
      };

      const mockInsert = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: null,
            error: null
          })
        })
      });

      mockSupabase.from.mockReturnValue({
        insert: mockInsert
      });

      // Act & Assert
      await expect(
        createFlashcard(
          mockSupabase as unknown as SupabaseClient,
          command,
          mockUserId
        )
      ).rejects.toThrow('DATABASE_ERROR: No data returned from insert');
    });
  });
}); 