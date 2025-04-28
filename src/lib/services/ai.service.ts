import type { FlashcardDto } from "../../types";
import { OpenRouterService } from "../openrouter.services";

type GeneratedFlashcard = Pick<FlashcardDto, "front_content" | "back_content" | "accepted" | "creation_type" | "generation_time_ms">;

/**
 * Generates flashcards from a source text using AI
 * Currently a mock implementation that returns predefined flashcards
 * 
 * @param text The source text content to generate flashcards from
 * @param count The number of flashcards to generate
 * @returns Array of generated flashcards
 * @throws Error if AI service is unavailable or generation fails
 */
export async function generateFlashcardsFromText(
  text: string,
  count: number = 5
): Promise<GeneratedFlashcard[]> {
  // Simulate API delay
  const startTime = performance.now();
  
  try {
    // Initialize OpenRouter service - it will handle API key validation
    const openRouter = new OpenRouterService();
    
    // Use the service's flashcard generation feature
    // If API key is missing, the service constructor will throw an appropriate error
    const generatedFlashcards = await openRouter.generateFlashcards(text, count);
    
    const generationTime = Math.round(performance.now() - startTime);
    
    // Map the generated flashcards to our expected format
    return generatedFlashcards.map(card => ({
      front_content: card.front_content,
      back_content: card.back_content,
      accepted: false,
      creation_type: "ai_generated" as const,
      generation_time_ms: generationTime
    }));
  } catch (error) {
    console.error("Error in AI flashcard generation:", error);
    throw new Error(`AI_SERVICE_UNAVAILABLE: ${error instanceof Error ? error.message : String(error)}`);
  }
} 