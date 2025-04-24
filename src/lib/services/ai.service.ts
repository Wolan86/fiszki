import type { FlashcardDto } from "../../types";

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
  await new Promise((resolve) => setTimeout(resolve, 1000));
  const generationTime = Math.round(performance.now() - startTime);
  
  // Check if OpenRouter API key is configured
  if (!import.meta.env.OPENROUTER_API_KEY) {
    throw new Error("AI_SERVICE_UNAVAILABLE: OpenRouter API key not configured");
  }
  
  // Mock implementation that generates simple flashcards based on text length
  // In a real implementation, this would call the OpenRouter API
  try {
    const words = text.split(/\s+/);
    
    // Generate basic mock flashcards
    // Actual implementation would use AI models to generate meaningful flashcards
    const flashcards = Array.from({ length: Math.min(count, 10) }, (_, i) => {
      const startIndex = (i * words.length / count) % words.length;
      const excerpt = words
        .slice(startIndex, startIndex + Math.min(5, words.length))
        .join(" ");
      
      return {
        front_content: `Question about: ${excerpt}...`,
        back_content: `Answer about: ${excerpt}...`,
        accepted: false,
        creation_type: "ai_generated" as const,
        generation_time_ms: generationTime
      };
    });
    
    return flashcards;
  } catch (error) {
    console.error("Error in AI flashcard generation:", error);
    throw new Error(`AI_GENERATION_FAILED: ${error instanceof Error ? error.message : String(error)}`);
  }
} 