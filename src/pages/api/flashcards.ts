import type { APIContext } from 'astro';
import { createFlashcard, createFlashcardSchema } from '../../lib/services/flashcard.service';
import type { CreateFlashcardCommand } from '../../types';
import { createSupabaseServerInstance } from '../../db/supabase.client';
import { ApiErrorHandler, ApiLogger, RequestTimer } from '../../lib/utils';

export const prerender = false;

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
  const timer = new RequestTimer('POST /api/flashcards');
  
  // Create server instance with cookie context
  const supabase = createSupabaseServerInstance({
    cookies,
    headers: request.headers,
  });
  
  // Get authenticated user
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.user) {
    timer.end(401);
    return ApiErrorHandler.unauthorizedError();
  }

  ApiLogger.debug('Flashcard creation request', { userId: session.user.id });

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

    ApiLogger.info('Creating flashcard', { 
      userId: session.user.id,
      hasSourceText: !!command.source_text_id,
      frontContentLength: command.front_content.length,
      backContentLength: command.back_content.length
    });

    // Create flashcard using service
    const createdFlashcard = await createFlashcard(supabase, command, session.user.id);

    ApiLogger.info('Flashcard created successfully', { 
      flashcardId: createdFlashcard.id,
      userId: session.user.id 
    });

    timer.end(201);

    // Return success response with created flashcard
    return new Response(JSON.stringify(createdFlashcard), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    // Handle source text not found error
    if (error instanceof Error && error.message === 'SOURCE_TEXT_NOT_FOUND') {
      timer.end(404);
      return ApiErrorHandler.notFoundError('Source text');
    }

    // Handle database errors
    if (error instanceof Error && error.message.startsWith('DATABASE_ERROR:')) {
      timer.end(500);
      return ApiErrorHandler.databaseError(error);
    }

    // Handle unexpected errors
    timer.end(500);
    return ApiErrorHandler.internalServerError(error);
  }
} 