import type { APIContext } from "astro";
import {
  getFlashcardsForLearning,
  flashcardLearningQuerySchema,
} from "../../../lib/services/flashcard.service";
import type { FlashcardLearningQueryParams } from "../../../types";
import { createSupabaseServerInstance } from "../../../db/supabase.client";
import { ApiErrorHandler, ApiLogger, RequestTimer } from "../../../lib/utils";

export const prerender = false;

/**
 * GET /api/flashcards/learning
 *
 * Gets flashcards for learning in random order, only including accepted flashcards.
 *
 * @description
 * This endpoint provides flashcards specifically for learning sessions. It returns only accepted
 * flashcards in random order to facilitate effective learning. The randomization is handled by
 * the database function `get_random_flashcards` for optimal performance.
 *
 * @authentication Required - Supabase session
 *
 * @queryParameters
 * - `limit`: Maximum number of flashcards to return (default: 10, max: 100)
 * - `source_text_id`: Filter by source text ID (optional)
 *
 * @responses
 * - 200: Flashcards retrieved successfully for learning
 * - 400: Invalid query parameters
 * - 401: Authentication required (no valid session)
 * - 404: Source text not found
 * - 500: Internal server error (database or unexpected errors)
 *
 * @example
 * ```typescript
 * // Get 10 random flashcards for learning
 * const response = await fetch('/api/flashcards/learning');
 *
 * // Get 20 random flashcards for learning
 * const response = await fetch('/api/flashcards/learning?limit=20');
 *
 * // Get random flashcards from specific source text
 * const response = await fetch('/api/flashcards/learning?source_text_id=123e4567-e89b-12d3-a456-426614174000');
 * ```
 */
export async function GET({ request, cookies }: APIContext) {
  const timer = new RequestTimer("GET /api/flashcards/learning");

  // Create server instance with cookie context
  const supabase = createSupabaseServerInstance({
    cookies,
    headers: request.headers,
  });

  // Get authenticated user
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) {
    timer.end(401);
    return ApiErrorHandler.unauthorizedError();
  }

  ApiLogger.debug("Flashcard learning request", { userId: session.user.id });

  try {
    // Parse query parameters from URL
    const url = new URL(request.url);
    const queryParams: Record<string, any> = {};

    // Extract all query parameters
    for (const [key, value] of url.searchParams.entries()) {
      queryParams[key] = value;
    }

    // Validate query parameters with Zod schema
    const validationResult = flashcardLearningQuerySchema.safeParse(queryParams);

    if (!validationResult.success) {
      timer.end(400);
      return ApiErrorHandler.validationError(validationResult.error.format());
    }

    const validatedParams: FlashcardLearningQueryParams = validationResult.data;

    ApiLogger.info("Fetching flashcards for learning", {
      userId: session.user.id,
      params: validatedParams,
    });

    // Get flashcards for learning using service
    const response = await getFlashcardsForLearning(supabase, validatedParams, session.user.id);

    ApiLogger.info("Learning flashcards retrieved successfully", {
      userId: session.user.id,
      count: response.data.length,
      total: response.total,
    });

    timer.end(200);

    // Return success response with flashcards for learning
    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    // Handle source text not found errors
    if (error instanceof Error && error.message === "SOURCE_TEXT_NOT_FOUND") {
      timer.end(404);
      return new Response(
        JSON.stringify({
          message: "Source text not found",
          code: "SOURCE_TEXT_NOT_FOUND",
          details: {},
        }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Handle database errors
    if (error instanceof Error && error.message.startsWith("DATABASE_ERROR:")) {
      timer.end(500);
      return ApiErrorHandler.databaseError(error);
    }

    // Handle unexpected errors
    timer.end(500);
    return ApiErrorHandler.internalServerError(error);
  }
} 