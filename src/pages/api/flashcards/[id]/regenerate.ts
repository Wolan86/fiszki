import type { APIContext } from 'astro';
import { createSupabaseServerInstance } from '../../../../db/supabase.client';
import { ApiErrorHandler, ApiLogger, RequestTimer } from '../../../../lib/utils';

export const prerender = false;

/**
 * POST /api/flashcards/[id]/regenerate
 * 
 * Regenerates a rejected flashcard using AI.
 * 
 * @description
 * This endpoint allows authenticated users to regenerate rejected flashcards.
 * The flashcard must belong to the user and should be previously rejected.
 * The regeneration creates new content while keeping the same source context.
 * 
 * @authentication Required - Supabase session
 * 
 * @params
 * - id: UUID of the flashcard to regenerate
 * 
 * @responses
 * - 200: Flashcard regenerated successfully
 * - 401: Authentication required (no valid session)
 * - 404: Flashcard not found (doesn't exist or doesn't belong to user)
 * - 422: Flashcard not eligible for regeneration (not rejected)
 * - 500: Internal server error (AI service unavailable or database errors)
 * - 503: AI service temporarily unavailable
 * 
 * @example
 * ```typescript
 * const response = await fetch('/api/flashcards/123e4567-e89b-12d3-a456-426614174000/regenerate', {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json' }
 * });
 * ```
 */
export async function POST({ request, cookies, params }: APIContext) {
  const timer = new RequestTimer(`POST /api/flashcards/${params.id}/regenerate`);
  
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

  ApiLogger.debug('Flashcard regeneration request', { 
    userId: session.user.id,
    flashcardId
  });

  try {
    // Check if flashcard exists and belongs to user
    const { data: existingFlashcard, error: fetchError } = await supabase
      .from("flashcards")
      .select("id, accepted, source_text_id, front_content, back_content")
      .eq("id", flashcardId)
      .eq("user_id", session.user.id)
      .single();

    if (fetchError || !existingFlashcard) {
      timer.end(404);
      return ApiErrorHandler.notFoundError('Flashcard');
    }

    // Check if flashcard is rejected (eligible for regeneration)
    if (existingFlashcard.accepted !== false) {
      timer.end(422);
      return new Response(JSON.stringify({
        message: "Flashcard must be rejected before it can be regenerated",
        code: "NOT_REJECTED"
      }), {
        status: 422,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    ApiLogger.info('Regenerating flashcard', { 
      userId: session.user.id,
      flashcardId,
      sourceTextId: existingFlashcard.source_text_id
    });

    // TODO: Implement AI regeneration logic
    // For now, we'll simulate regeneration by updating the content slightly
    // In a real implementation, this would call an AI service to generate new content
    
    const regeneratedContent = {
      front_content: `[Regenerated] ${existingFlashcard.front_content}`,
      back_content: `[Regenerated] ${existingFlashcard.back_content}`,
      accepted: null, // Reset to pending state
      updated_at: new Date().toISOString()
    };

    // Update the flashcard with regenerated content
    const { data: updatedFlashcard, error: updateError } = await supabase
      .from("flashcards")
      .update(regeneratedContent)
      .eq("id", flashcardId)
      .eq("user_id", session.user.id)
      .select("*")
      .single();

    if (updateError || !updatedFlashcard) {
      timer.end(500);
      return ApiErrorHandler.databaseError(updateError);
    }

    ApiLogger.info('Flashcard regenerated successfully', { 
      flashcardId: updatedFlashcard.id,
      userId: session.user.id 
    });

    timer.end(200);

    // Return success response with regenerated flashcard
    return new Response(JSON.stringify(updatedFlashcard), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    // Handle AI service errors (when implemented)
    if (error instanceof Error && error.message.includes('AI_SERVICE')) {
      timer.end(503);
      return new Response(JSON.stringify({
        message: "AI service is temporarily unavailable. Please try again later.",
        code: "AI_SERVICE_UNAVAILABLE"
      }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      });
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