import { type APIContext } from "astro";
import { z } from "zod";
import { getSourceTextById } from "../../../../lib/services/source-text.service";
import type { ApiErrorResponse, GenerateFlashcardsResponse } from "../../../../types";
import { DEFAULT_USER_ID } from "@/db/supabase.client";
import { saveGeneratedFlashcards } from "@/lib/services/flashcard.service";
import { generateFlashcardsFromText } from "@/lib/services/ai.service";

export const prerender = false;

// Validation schema for request body
const generateFlashcardsSchema = z.object({
  count: z.number().int().positive().optional().default(5)
});

export async function POST({ params, request, locals }: APIContext): Promise<Response> {
  // Start timing for statistics
  const startTime = performance.now();
  const { supabase } = locals;
  
//   // Get authenticated user
//   const { data: { session } } = await supabase.auth.getSession();
//   if (!session?.user) {
//     const errorResponse: ApiErrorResponse = {
//       message: 'Unauthorized',
//       code: 'UNAUTHORIZED'
//     };
//     return new Response(JSON.stringify(errorResponse), {
//       status: 401,
//       headers: { 'Content-Type': 'application/json' }
//     });
//   }
  // Validate source text ID
  const { id } = params;
  if (!id || typeof id !== "string") {
    const errorResponse: ApiErrorResponse = {
      message: "Nieprawidłowy identyfikator tekstu źródłowego",
      code: "INVALID_SOURCE_TEXT_ID"
    };
    return new Response(JSON.stringify(errorResponse), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }
  
  try {
    // Validate request body
    const body = await request.json().catch(() => ({}));
    const validationResult = generateFlashcardsSchema.safeParse(body);
    
    if (!validationResult.success) {
      const errorResponse: ApiErrorResponse = {
        message: "Parametr 'count' musi być liczbą całkowitą większą od zera",
        code: "INVALID_COUNT_PARAMETER",
        details: validationResult.error.format()
      };
      return new Response(JSON.stringify(errorResponse), {
        status: 422,
        headers: { "Content-Type": "application/json" }
      });
    }
    
    const { count } = validationResult.data;
    
    // Get source text
    const sourceText = await getSourceTextById(supabase, id);
    
    if (!sourceText) {
      const errorResponse: ApiErrorResponse = {
        message: "Tekst źródłowy o podanym identyfikatorze nie został znaleziony",
        code: "SOURCE_TEXT_NOT_FOUND"
      };
      return new Response(JSON.stringify(errorResponse), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }
    
    // Check if source text belongs to the user
    if (sourceText.user_id !== DEFAULT_USER_ID) {
      const errorResponse: ApiErrorResponse = {
        message: "Nie masz dostępu do tego tekstu źródłowego",
        code: "ACCESS_DENIED"
      };
      return new Response(JSON.stringify(errorResponse), {
        status: 404, // Using 404 as specified in the plan to avoid leaking information
        headers: { "Content-Type": "application/json" }
      });
    }
    
    // Generate flashcards using AI
    const generatedFlashcards = await generateFlashcardsFromText(sourceText.content, count);
    
    // Save generated flashcards to database
    const savedFlashcards = await saveGeneratedFlashcards(
      supabase,
      generatedFlashcards,
      sourceText.id,
      DEFAULT_USER_ID
    );
    
    // Calculate total processing time
    const endTime = performance.now();
    const totalTimeMs = Math.round(endTime - startTime);
    
    // Prepare response
    const response: GenerateFlashcardsResponse = {
      flashcards: savedFlashcards,
      generation_stats: {
        requested_count: count,
        generated_count: savedFlashcards.length,
        total_time_ms: totalTimeMs
      }
    };
    
    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
    
  } catch (error) {
    console.error("Error generating flashcards:", error);
    
    // Handle AI service errors
    if (error instanceof Error && error.message.includes("AI_SERVICE_UNAVAILABLE")) {
      const errorResponse: ApiErrorResponse = {
        message: "Usługa generowania fiszek jest obecnie niedostępna, spróbuj ponownie później",
        code: "AI_SERVICE_UNAVAILABLE"
      };
      return new Response(JSON.stringify(errorResponse), {
        status: 503,
        headers: { "Content-Type": "application/json" }
      });
    }
    
    // Handle AI generation errors
    if (error instanceof Error && error.message.includes("AI_GENERATION_FAILED")) {
      const errorResponse: ApiErrorResponse = {
        message: "Nie udało się wygenerować fiszek z podanego tekstu",
        code: "AI_GENERATION_FAILED",
        details: { error: error.message }
      };
      return new Response(JSON.stringify(errorResponse), {
        status: 422,
        headers: { "Content-Type": "application/json" }
      });
    }
    
    // Generic error handler
    const errorResponse: ApiErrorResponse = {
      message: "Wystąpił nieoczekiwany błąd podczas generowania fiszek",
      code: "INTERNAL_SERVER_ERROR"
    };
    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
} 