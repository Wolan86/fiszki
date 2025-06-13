import type { APIContext } from "astro";
import { SourceTextService } from "../../lib/services/source-text.service";
import type { CreateSourceTextCommand, CreateSourceTextResponse, ApiErrorResponse } from "../../types";
import { createSupabaseServerInstance } from "../../db/supabase.client";
import { generateFlashcardsFromText } from "../../lib/services/ai.service";

export const prerender = false;

// POST handler for creating a new source text
export async function POST({ request, cookies }: APIContext) {
  const startTime = performance.now();

  // Create server instance with cookie context
  const supabase = createSupabaseServerInstance({
    cookies,
    headers: request.headers,
  });

  // Get authenticated user
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Debug authentication - removed console.log to fix ESLint no-console warning

  if (!session?.user) {
    const errorResponse: ApiErrorResponse = {
      message: "Unauthorized",
      code: "UNAUTHORIZED",
    };
    return new Response(JSON.stringify(errorResponse), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    // Parse request body
    const command: CreateSourceTextCommand = await request.json();

    // Create service instance and create the source text
    const sourceTextService = new SourceTextService(supabase);
    const sourceText = await sourceTextService.createSourceText(command, session.user.id);

    // Prepare response
    const response: CreateSourceTextResponse = {
      source_text: sourceText,
    };

    // Jeśli żądano generowania fiszek, wygeneruj je
    if (command.generate_flashcards && command.flashcard_count) {
      const generationStartTime = performance.now();

      try {
        const generatedFlashcards = await generateFlashcardsFromText(command.content, command.flashcard_count);

        const generationEndTime = performance.now();
        const generationTime = generationEndTime - generationStartTime;

        // Przygotuj UnsavedFlashcardDto objects (nie zapisuj do bazy)
        const unsavedFlashcards = generatedFlashcards.map((card, index) => ({
          id: `temp-${Date.now()}-${index}`,
          front_content: card.front_content,
          back_content: card.back_content,
          accepted: null,
          source_text_id: sourceText.id,
          creation_type: "ai_generated" as const,
          user_id: session.user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          generation_time_ms: Math.round(generationTime / generatedFlashcards.length),
        }));

        const totalTime = performance.now() - startTime;

        const response: CreateSourceTextResponse = {
          source_text: sourceText,
          flashcards: unsavedFlashcards,
          generation_stats: {
            requested_count: command.flashcard_count,
            generated_count: unsavedFlashcards.length,
            total_time_ms: Math.round(totalTime),
          },
        };

        return new Response(JSON.stringify(response), {
          status: 201,
          headers: { "Content-Type": "application/json" },
        });
      } catch {
        // Error generating flashcards - removed console.error to fix ESLint no-console warning

        // Zwróć source text bez fiszek w przypadku błędu generowania
        const response: CreateSourceTextResponse = {
          source_text: sourceText,
        };

        return new Response(JSON.stringify(response), {
          status: 201,
          headers: { "Content-Type": "application/json" },
        });
      }
    }

    // Return success response
    return new Response(JSON.stringify(response), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    // Handle validation errors
    if (error instanceof Error && error.message.startsWith("VALIDATION_ERROR:")) {
      const errorDetails = JSON.parse(error.message.replace("VALIDATION_ERROR:", ""));
      const errorResponse: ApiErrorResponse = {
        message: "Validation error",
        code: "VALIDATION_ERROR",
        details: errorDetails,
      };
      return new Response(JSON.stringify(errorResponse), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Handle database errors
    if (error instanceof Error && error.message.startsWith("DATABASE_ERROR:")) {
      const errorResponse: ApiErrorResponse = {
        message: "Database error",
        code: "DATABASE_ERROR",
      };
      // Database error - removed console.error to fix ESLint no-console warning
      return new Response(JSON.stringify(errorResponse), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Handle AI service errors for flashcard generation
    if (error instanceof Error && error.message.includes("AI_SERVICE_UNAVAILABLE")) {
      const errorResponse: ApiErrorResponse = {
        message: "Usługa generowania fiszek jest obecnie niedostępna, ale tekst źródłowy został zapisany",
        code: "AI_SERVICE_UNAVAILABLE",
      };
      return new Response(JSON.stringify(errorResponse), {
        status: 503,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Handle unexpected errors - removed console.error to fix ESLint no-console warning
    const errorResponse: ApiErrorResponse = {
      message: "Internal server error",
      code: "INTERNAL_SERVER_ERROR",
    };
    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
