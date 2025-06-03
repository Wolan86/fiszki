import type { 
  CreateSourceTextCommand,
  CreateSourceTextResponse,
  CreateFlashcardCommand,
  FlashcardDto,
  GenerateFlashcardsCommand,
  GenerateFlashcardsResponse,
  SourceTextDto,
  UpdateFlashcardCommand
} from "@/types";
import type { ApiErrorResponse } from "@/components/kreator/types";

export const saveSourceText = async (
  content: string, 
  generateFlashcards?: boolean, 
  flashcardCount?: number
): Promise<CreateSourceTextResponse> => {
  console.log("=== API saveSourceText called ===", {
    contentLength: content.length,
    generateFlashcards,
    flashcardCount
  });
  
  const command: CreateSourceTextCommand = { 
    content,
    generate_flashcards: generateFlashcards,
    flashcard_count: flashcardCount
  };
  const response = await fetch('/api/source-texts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(command)
  });
  
  if (!response.ok) {
    const errorData: ApiErrorResponse = await response.json();
    throw new Error(errorData.message);
  }
  
  const result = await response.json();
  console.log("=== API saveSourceText response ===", {
    hasSourceText: !!result.source_text,
    hasFlashcards: !!result.flashcards,
    flashcardCount: result.flashcards?.length || 0
  });
  
  return result;
};

export const generateFlashcards = async (
  sourceTextId: string, 
  count?: number
): Promise<GenerateFlashcardsResponse> => {
  const command: GenerateFlashcardsCommand = { count: count ?? 5 };
  const response = await fetch(`/api/source-texts/${sourceTextId}/generate-flashcards`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(command)
  });
  
  if (!response.ok) {
    const errorData: ApiErrorResponse = await response.json();
    throw new Error(errorData.message);
  }
  
  return await response.json();
};

export const updateFlashcard = async (
  id: string, 
  update: UpdateFlashcardCommand
): Promise<FlashcardDto> => {
  const response = await fetch(`/api/flashcards/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(update)
  });
  
  if (!response.ok) {
    const errorData: ApiErrorResponse = await response.json();
    throw new Error(errorData.message);
  }
  
  return await response.json();
};

export const regenerateFlashcard = async (id: string): Promise<FlashcardDto> => {
  const response = await fetch(`/api/flashcards/${id}/regenerate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });
  
  if (!response.ok) {
    const errorData: ApiErrorResponse = await response.json();
    throw new Error(errorData.message);
  }
  
  return await response.json();
};

export const createFlashcard = async (command: CreateFlashcardCommand): Promise<FlashcardDto> => {
  const response = await fetch('/api/flashcards', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(command)
  });
  
  if (!response.ok) {
    const errorData: ApiErrorResponse = await response.json();
    throw new Error(errorData.message);
  }
  
  return await response.json();
}; 