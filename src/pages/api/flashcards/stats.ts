import type { APIContext } from "astro";
import { createSupabaseServerInstance } from "../../../db/supabase.client";
import { ApiErrorHandler, ApiLogger, RequestTimer } from "../../../lib/utils";

export const prerender = false;

/**
 * Flashcard Statistics Response
 */
interface FlashcardStatsResponse {
  total_flashcards: number;
  accepted_flashcards: number;
  ai_generated_flashcards: number;
  manual_flashcards: number;
  avg_generation_time_ms: number | null;
  acceptance_rate_percent: number;
}

/**
 * Database function result type for get_flashcard_stats
 */
interface FlashcardStatsDbResult {
  total_flashcards: string | number;
  accepted_flashcards: string | number;
  ai_generated_flashcards: string | number;
  manual_flashcards: string | number;
  avg_generation_time_ms: string | number | null;
}

/**
 * GET /api/flashcards/stats
 *
 * Gets comprehensive statistics about user's flashcards for monitoring and analytics.
 *
 * @description
 * This endpoint provides detailed statistics about the user's flashcard collection,
 * including counts by creation type, acceptance rates, and performance metrics.
 * Useful for dashboard analytics and performance monitoring.
 *
 * @authentication Required - Supabase session
 *
 * @responses
 * - 200: Statistics retrieved successfully
 * - 401: Authentication required (no valid session)
 * - 500: Internal server error (database or unexpected errors)
 *
 * @example
 * ```typescript
 * // Get user flashcard statistics
 * const response = await fetch('/api/flashcards/stats');
 * const stats = await response.json();
 * console.log(`Total flashcards: ${stats.total_flashcards}`);
 * console.log(`Acceptance rate: ${stats.acceptance_rate_percent}%`);
 * ```
 */
export async function GET({ request, cookies }: APIContext) {
  const timer = new RequestTimer("GET /api/flashcards/stats");

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

  ApiLogger.debug("Flashcard stats request", { userId: session.user.id });

  try {
    // Get flashcard statistics using the database function
    // Note: Using any type because the function is not yet in generated types
    const { data, error } = await (supabase as any).rpc("get_flashcard_stats", {
      p_user_id: session.user.id,
    });

    if (error) {
      console.error("Error fetching flashcard stats:", error);
      throw new Error(`DATABASE_ERROR: ${error.message}`);
    }

    if (!data || data.length === 0) {
      // Return zero stats if no data found
      const emptyStats: FlashcardStatsResponse = {
        total_flashcards: 0,
        accepted_flashcards: 0,
        ai_generated_flashcards: 0,
        manual_flashcards: 0,
        avg_generation_time_ms: null,
        acceptance_rate_percent: 0,
      };

      timer.end(200);
      return new Response(JSON.stringify(emptyStats), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Process the statistics data
    const stats = data[0] as FlashcardStatsDbResult;
    const response: FlashcardStatsResponse = {
      total_flashcards: Number(stats.total_flashcards),
      accepted_flashcards: Number(stats.accepted_flashcards),
      ai_generated_flashcards: Number(stats.ai_generated_flashcards),
      manual_flashcards: Number(stats.manual_flashcards),
      avg_generation_time_ms: stats.avg_generation_time_ms ? Number(stats.avg_generation_time_ms) : null,
      acceptance_rate_percent: Number(stats.total_flashcards) > 0 
        ? Math.round((Number(stats.accepted_flashcards) / Number(stats.total_flashcards)) * 100 * 100) / 100
        : 0,
    };

    ApiLogger.info("Flashcard stats retrieved successfully", {
      userId: session.user.id,
      totalFlashcards: response.total_flashcards,
      acceptanceRate: response.acceptance_rate_percent,
    });

    timer.end(200);

    // Return success response with statistics
    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
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