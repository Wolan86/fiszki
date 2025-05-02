import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CreatorView } from '../CreatorView';
import { useFlashcardGeneration } from '../hooks/useFlashcardGeneration';
import type { FlashcardDto, SourceTextDto } from '@/types';

// Mock the custom hook
vi.mock('../hooks/useFlashcardGeneration', () => ({
  useFlashcardGeneration: vi.fn()
}));

// Mock child components
vi.mock('../PageHeader', () => ({
  PageHeader: ({ title, description }: any) => (
    <div data-testid="page-header">
      <h1>{title}</h1>
      <p>{description}</p>
    </div>
  )
}));

vi.mock('../SourceTextForm', () => ({
  SourceTextForm: ({ onTextSaved, onGenerateRequest }: any) => (
    <div data-testid="source-text-form">
      <button 
        onClick={() => onTextSaved && onTextSaved(mockSourceText)}
        data-testid="save-text"
      >
        Save Text
      </button>
      <button 
        onClick={() => onGenerateRequest && onGenerateRequest(mockSourceText.id)}
        data-testid="generate-button"
      >
        Generate
      </button>
    </div>
  )
}));

vi.mock('../ProgressIndicator', () => ({
  ProgressIndicator: ({ isGenerating, progressText }: any) => (
    isGenerating ? (
      <div data-testid="progress-indicator">{progressText}</div>
    ) : null
  )
}));

vi.mock('../GeneratedFlashcards', () => ({
  GeneratedFlashcards: ({ flashcards, stats, onAccept, onReject, onRegenerate }: any) => (
    <div data-testid="generated-flashcards">
      {flashcards.map((card: any) => (
        <div key={card.id} data-testid={`flashcard-${card.id}`}>
          {card.front_content} - {card.back_content}
          <button 
            onClick={() => onAccept(card.id)}
            data-testid={`accept-${card.id}`}
          >
            Accept
          </button>
          <button 
            onClick={() => onReject(card.id)}
            data-testid={`reject-${card.id}`}
          >
            Reject
          </button>
          <button 
            onClick={() => onRegenerate(card.id)}
            data-testid={`regenerate-${card.id}`}
          >
            Regenerate
          </button>
        </div>
      ))}
    </div>
  )
}));

vi.mock('../ErrorMessage', () => ({
  ErrorMessage: ({ error, onRetry }: any) => (
    <div data-testid="error-message">
      {error.message}
      <button 
        onClick={onRetry}
        data-testid="retry-button"
      >
        Retry
      </button>
    </div>
  )
}));

// Need to define mockSourceText before using in mocks
const mockSourceText: SourceTextDto = {
  id: 'test-id',
  content: 'Test content',
  created_at: new Date().toISOString(),
  user_id: 'user-1'
};

describe('CreatorView', () => {
  // Prepare mock data  
  const mockFlashcards: FlashcardDto[] = [
    {
      id: 'card-1',
      front_content: 'Front 1',
      back_content: 'Back 1',
      source_text_id: 'test-id',
      accepted: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      user_id: 'user-1',
      creation_type: 'ai_generated',
      generation_time_ms: 100
    },
    {
      id: 'card-2',
      front_content: 'Front 2',
      back_content: 'Back 2',
      source_text_id: 'test-id',
      accepted: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      user_id: 'user-1',
      creation_type: 'ai_generated',
      generation_time_ms: 120
    }
  ];

  const mockGenerationStats = {
    totalCards: 2,
    acceptedCards: 0,
    rejectedCards: 0,
    pendingCards: 2
  };

  // Mock implementation
  const mockGenerateFlashcards = vi.fn();
  const mockUpdateFlashcard = vi.fn();
  const mockRegenerateFlashcard = vi.fn();
  const mockReset = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default mock implementation
    (useFlashcardGeneration as any).mockReturnValue({
      flashcards: [],
      isGenerating: false,
      generationStats: null,
      error: null,
      generateFlashcards: mockGenerateFlashcards,
      updateFlashcard: mockUpdateFlashcard,
      regenerateFlashcard: mockRegenerateFlashcard,
      reset: mockReset
    });
  });

  it('renders the page header correctly', () => {
    // Arrange
    render(<CreatorView />);
    
    // Assert
    expect(screen.getByText('Kreator fiszek')).toBeInTheDocument();
    expect(screen.getByText(/Wprowadź tekst źródłowy i wygeneruj fiszki/)).toBeInTheDocument();
  });

  it('calls generateFlashcards when source text is saved and generation requested', () => {
    // Arrange
    (useFlashcardGeneration as any).mockReturnValue({
      flashcards: [],
      isGenerating: false,
      generationStats: null,
      error: null,
      generateFlashcards: mockGenerateFlashcards,
      updateFlashcard: mockUpdateFlashcard,
      regenerateFlashcard: mockRegenerateFlashcard,
      reset: mockReset
    });
    
    render(<CreatorView />);
    
    // Act - save text first
    fireEvent.click(screen.getByTestId('save-text'));
    
    // Then request generation
    fireEvent.click(screen.getByTestId('generate-button'));
    
    // Assert
    expect(mockGenerateFlashcards).toHaveBeenCalledWith(mockSourceText.id, undefined);
  });

  it('displays progress indicator when generating flashcards', () => {
    // Arrange
    (useFlashcardGeneration as any).mockReturnValue({
      flashcards: [],
      isGenerating: true,
      generationStats: null,
      error: null,
      generateFlashcards: mockGenerateFlashcards,
      updateFlashcard: mockUpdateFlashcard,
      regenerateFlashcard: mockRegenerateFlashcard,
      reset: mockReset
    });
    
    // Act
    render(<CreatorView />);
    
    // Assert
    expect(screen.getByTestId('progress-indicator')).toBeInTheDocument();
    expect(screen.getByText(/Trwa generowanie fiszek/)).toBeInTheDocument();
  });

  it('displays generated flashcards when available', () => {
    // Arrange
    (useFlashcardGeneration as any).mockReturnValue({
      flashcards: mockFlashcards,
      isGenerating: false,
      generationStats: mockGenerationStats,
      error: null,
      generateFlashcards: mockGenerateFlashcards,
      updateFlashcard: mockUpdateFlashcard,
      regenerateFlashcard: mockRegenerateFlashcard,
      reset: mockReset
    });
    
    // Act
    render(<CreatorView />);
    
    // Assert
    expect(screen.getByTestId('generated-flashcards')).toBeInTheDocument();
    expect(screen.getByTestId('flashcard-card-1')).toBeInTheDocument();
    expect(screen.getByTestId('flashcard-card-2')).toBeInTheDocument();
  });

  it('handles flashcard acceptance correctly', () => {
    // Arrange
    (useFlashcardGeneration as any).mockReturnValue({
      flashcards: mockFlashcards,
      isGenerating: false,
      generationStats: mockGenerationStats,
      error: null,
      generateFlashcards: mockGenerateFlashcards,
      updateFlashcard: mockUpdateFlashcard,
      regenerateFlashcard: mockRegenerateFlashcard,
      reset: mockReset
    });
    
    // Act
    render(<CreatorView />);
    fireEvent.click(screen.getByTestId('accept-card-1'));
    
    // Assert
    expect(mockUpdateFlashcard).toHaveBeenCalledWith('card-1', { accepted: true });
  });

  it('handles flashcard rejection correctly', () => {
    // Arrange
    (useFlashcardGeneration as any).mockReturnValue({
      flashcards: mockFlashcards,
      isGenerating: false,
      generationStats: mockGenerationStats,
      error: null,
      generateFlashcards: mockGenerateFlashcards,
      updateFlashcard: mockUpdateFlashcard,
      regenerateFlashcard: mockRegenerateFlashcard,
      reset: mockReset
    });
    
    // Act
    render(<CreatorView />);
    fireEvent.click(screen.getByTestId('reject-card-1'));
    
    // Assert
    expect(mockUpdateFlashcard).toHaveBeenCalledWith('card-1', { accepted: false });
  });

  it('handles flashcard regeneration correctly', () => {
    // Arrange
    (useFlashcardGeneration as any).mockReturnValue({
      flashcards: mockFlashcards,
      isGenerating: false,
      generationStats: mockGenerationStats,
      error: null,
      generateFlashcards: mockGenerateFlashcards,
      updateFlashcard: mockUpdateFlashcard,
      regenerateFlashcard: mockRegenerateFlashcard,
      reset: mockReset
    });
    
    // Act
    render(<CreatorView />);
    fireEvent.click(screen.getByTestId('regenerate-card-1'));
    
    // Assert
    expect(mockRegenerateFlashcard).toHaveBeenCalledWith('card-1');
  });

  it('displays error message when generation fails', () => {
    // Arrange
    const mockError = new Error('Generation failed');
    (useFlashcardGeneration as any).mockReturnValue({
      flashcards: [],
      isGenerating: false,
      generationStats: null,
      error: mockError,
      generateFlashcards: mockGenerateFlashcards,
      updateFlashcard: mockUpdateFlashcard,
      regenerateFlashcard: mockRegenerateFlashcard,
      reset: mockReset
    });
    
    // Act
    render(<CreatorView />);
    
    // Assert
    expect(screen.getByTestId('error-message')).toBeInTheDocument();
    expect(screen.getByText('Generation failed')).toBeInTheDocument();
    
    // Act - retry
    fireEvent.click(screen.getByTestId('retry-button'));
    
    // Assert - should not call generateFlashcards without sourceText
    expect(mockGenerateFlashcards).not.toHaveBeenCalled();
  });

  it('retries generation when source text is available', () => {
    // Arrange
    const mockError = new Error('Generation failed');
    (useFlashcardGeneration as any).mockReturnValue({
      flashcards: [],
      isGenerating: false,
      generationStats: null,
      error: mockError,
      generateFlashcards: mockGenerateFlashcards,
      updateFlashcard: mockUpdateFlashcard,
      regenerateFlashcard: mockRegenerateFlashcard,
      reset: mockReset
    });
    
    // Act
    render(<CreatorView />);
    
    // Save the source text first
    fireEvent.click(screen.getByTestId('save-text'));
    
    // Retry generation
    fireEvent.click(screen.getByTestId('retry-button'));
    
    // Assert
    expect(mockGenerateFlashcards).toHaveBeenCalledWith(mockSourceText.id);
  });
}); 