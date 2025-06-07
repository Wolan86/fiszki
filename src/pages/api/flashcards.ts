import type { APIContext } from "astro";
import {
  createFlashcard,
  createFlashcardSchema,
  getFlashcards,
  flashcardListQuerySchema,
} from "../../lib/services/flashcard.service";
import type { CreateFlashcardCommand, FlashcardListQueryParams } from "../../types";
import { createSupabaseServerInstance } from "../../db/supabase.client";
import { ApiErrorHandler, ApiLogger, RequestTimer } from "../../lib/utils";

export const prerender = false;

/**
 * GET /api/flashcards
 *
 * Gets all flashcards belonging to the authenticated user with optional filtering, sorting and pagination.
 *
 * @description
 * This endpoint allows authenticated users to retrieve their flashcards with advanced filtering options.
 * Supports pagination, sorting by various fields, and filtering by source text, creation type, and acceptance status.
 * All flashcards are automatically filtered by user_id through Row Level Security (RLS).
 *
 * @authentication Required - Supabase session
 *
 * @queryParameters
 * - `limit`: Maximum number of items to return (default: 10, max: 100)
 * - `offset`: Number of items to skip (default: 0)
 * - `sort`: Field to sort by (default: created_at)
 * - `order`: Sort direction 'asc' or 'desc' (default: desc)
 * - `source_text_id`: Filter by source text ID (optional)
 * - `creation_type`: Filter by creation type (ai_generated, ai_edited, manual)
 * - `accepted`: Filter by acceptance status (true/false)
 *
 * @responses
 * - 200: Flashcards retrieved successfully
 * - 400: Invalid query parameters
 * - 401: Authentication required (no valid session)
 * - 500: Internal server error (database or unexpected errors)
 *
 * @example
 * ```typescript
 * // Get first 20 flashcards
 * const response = await fetch('/api/flashcards?limit=20');
 *
 * // Get accepted AI-generated flashcards
 * const response = await fetch('/api/flashcards?creation_type=ai_generated&accepted=true');
 *
 * // Get flashcards for specific source text with pagination
 * const response = await fetch('/api/flashcards?source_text_id=123e4567-e89b-12d3-a456-426614174000&offset=10&limit=10');
 * ```
 */
export async function GET({ request, cookies }: APIContext) {
  const timer = new RequestTimer("GET /api/flashcards");

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

  ApiLogger.debug("Flashcard list request", { userId: session.user.id });

  try {
    // Parse query parameters from URL
    const url = new URL(request.url);
    const queryParams: Record<string, any> = {};

    // Extract all query parameters
    for (const [key, value] of url.searchParams.entries()) {
      queryParams[key] = value;
    }

    // Validate query parameters with Zod schema
    const validationResult = flashcardListQuerySchema.safeParse(queryParams);

    if (!validationResult.success) {
      timer.end(400);
      return ApiErrorHandler.validationError(validationResult.error.format());
    }

    const validatedParams: FlashcardListQueryParams = validationResult.data;

    ApiLogger.info("Fetching flashcards", {
      userId: session.user.id,
      params: validatedParams,
    });

    // Get flashcards using service
    const response = await getFlashcards(supabase, validatedParams, session.user.id);

    ApiLogger.info("Flashcards retrieved successfully", {
      userId: session.user.id,
      count: response.data.length,
      total: response.pagination.total,
    });

    timer.end(200);

    // Return success response with flashcards and pagination
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

/**
 * POST /api/flashcards
 *
 * Creates a new flashcard manually by the authenticated user.
 *
 * @description
 * This endpoint allows authenticated users to create flashcards manually.
 * Flashcards can be created as standalone items or linked to a specific source text.
 * All manually created flashcards have creation_type 'manual' and are automatically accepted.
 *
 * @authentication Required - Supabase session
 *
 * @requestBody
 * ```json
 * {
 *   "front_content": "string (1-2000 chars, required)",
 *   "back_content": "string (1-2000 chars, required)",
 *   "source_text_id": "uuid (optional)"
 * }
 * ```
 *
 * @responses
 * - 201: Flashcard created successfully
 * - 400: Validation error (invalid input data)
 * - 401: Authentication required (no valid session)
 * - 404: Source text not found (when source_text_id provided but doesn't exist)
 * - 500: Internal server error (database or unexpected errors)
 *
 * @example
 * ```typescript
 * // Create standalone flashcard
 * const response = await fetch('/api/flashcards', {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify({
 *     front_content: 'What is React?',
 *     back_content: 'A JavaScript library for building user interfaces'
 *   })
 * });
 *
 * // Create flashcard linked to source text
 * const response = await fetch('/api/flashcards', {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify({
 *     front_content: 'What is React?',
 *     back_content: 'A JavaScript library for building user interfaces',
 *     source_text_id: '123e4567-e89b-12d3-a456-426614174000'
 *   })
 * });
 * ```
 */
export async function POST({ request, cookies }: APIContext) {
  const timer = new RequestTimer("POST /api/flashcards");

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

  ApiLogger.debug("Flashcard creation request", { userId: session.user.id });

  try {
    // Parse request body
    const body = await request.json().catch(() => ({}));

    // Validate input data with Zod schema
    const validationResult = createFlashcardSchema.safeParse(body);

    if (!validationResult.success) {
      timer.end(400);
      return ApiErrorHandler.validationError(validationResult.error.format());
    }

    const command: CreateFlashcardCommand = validationResult.data;

    ApiLogger.info("Creating flashcard", {
      userId: session.user.id,
      hasSourceText: !!command.source_text_id,
      frontContentLength: command.front_content.length,
      backContentLength: command.back_content.length,
    });

    // Create flashcard using service
    const createdFlashcard = await createFlashcard(supabase, command, session.user.id);

    ApiLogger.info("Flashcard created successfully", {
      flashcardId: createdFlashcard.id,
      userId: session.user.id,
    });

    timer.end(201);

    // Return success response with created flashcard
    return new Response(JSON.stringify(createdFlashcard), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    // Handle source text not found error
    if (error instanceof Error && error.message === "SOURCE_TEXT_NOT_FOUND") {
      timer.end(404);
      return ApiErrorHandler.notFoundError("Source text");
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
