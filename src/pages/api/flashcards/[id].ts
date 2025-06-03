import type { APIContext } from 'astro';
import { updateFlashcard, updateFlashcardSchema } from '../../../lib/services/flashcard.service';
import type { UpdateFlashcardCommand } from '../../../types';
import { createSupabaseServerInstance } from '../../../db/supabase.client';
import { ApiErrorHandler, ApiLogger, RequestTimer } from '../../../lib/utils';

export const prerender = false;

/**
 * PUT /api/flashcards/[id]
 * 
 * Updates an existing flashcard owned by the authenticated user.
 * 
 * @description
 * This endpoint allows authenticated users to update their flashcards.
 * Users can update the content (front/back) and acceptance status of flashcards.
 * Only the flashcard owner can update their flashcards.
 * 
 * @authentication Required - Supabase session
 * 
 * @params
 * - id: UUID of the flashcard to update
 * 
 * @requestBody
 * ```json
 * {
 *   "front_content": "string (1-2000 chars, optional)",
 *   "back_content": "string (1-2000 chars, optional)",
 *   "accepted": "boolean (optional)"
 * }
 * ```
 * 
 * @responses
 * - 200: Flashcard updated successfully
 * - 400: Validation error (invalid input data)
 * - 401: Authentication required (no valid session)
 * - 404: Flashcard not found (doesn't exist or doesn't belong to user)
 * - 500: Internal server error (database or unexpected errors)
 * 
 * @example
 * ```typescript
 * // Accept a flashcard
 * const response = await fetch('/api/flashcards/123e4567-e89b-12d3-a456-426614174000', {
 *   method: 'PUT',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify({
 *     accepted: true
 *   })
 * });
 * 
 * // Update flashcard content
 * const response = await fetch('/api/flashcards/123e4567-e89b-12d3-a456-426614174000', {
 *   method: 'PUT',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify({
 *     front_content: 'Updated question',
 *     back_content: 'Updated answer',
 *     accepted: true
 *   })
 * });
 * ```
 */
export async function PUT({ request, cookies, params }: APIContext) {
  const timer = new RequestTimer(`PUT /api/flashcards/${params.id}`);
  
  // Get flashcard ID from URL params
  const flashcardId = params.id;
  if (!flashcardId || typeof flashcardId !== 'string') {
    timer.end(400);
    return ApiErrorHandler.validationError({ 
      id: { _errors: ['Invalid flashcard ID'] } 
    });
  }

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

  ApiLogger.debug('Flashcard update request', { 
    userId: session.user.id,
    flashcardId
  });

  try {
    // Parse request body
    const body = await request.json().catch(() => ({}));
    
    // Validate input data with Zod schema
    const validationResult = updateFlashcardSchema.safeParse(body);
    
    if (!validationResult.success) {
      timer.end(400);
      return ApiErrorHandler.validationError(validationResult.error.format());
    }

    const command: UpdateFlashcardCommand = validationResult.data;

    ApiLogger.info('Updating flashcard', { 
      userId: session.user.id,
      flashcardId,
      updateFields: Object.keys(command)
    });

    // Update flashcard using service
    const updatedFlashcard = await updateFlashcard(supabase, flashcardId, command, session.user.id);

    ApiLogger.info('Flashcard updated successfully', { 
      flashcardId: updatedFlashcard.id,
      userId: session.user.id 
    });

    timer.end(200);

    // Return success response with updated flashcard
    return new Response(JSON.stringify(updatedFlashcard), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    // Handle flashcard not found error
    if (error instanceof Error && error.message === 'FLASHCARD_NOT_FOUND') {
      timer.end(404);
      return ApiErrorHandler.notFoundError('Flashcard');
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