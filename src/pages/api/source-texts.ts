import type { APIContext } from 'astro';
import { SourceTextService } from '../../lib/services/source-text.service';
import type { CreateSourceTextCommand, ApiErrorResponse } from '../../types';
import { DEFAULT_USER_ID } from '../../db/supabase.client';

export const prerender = false;

// POST handler for creating a new source text
export async function POST({ request, locals }: APIContext) {
  // Check if user is authenticated
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
  
  try {
    // Parse request body
    const command: CreateSourceTextCommand = await request.json();
    
    // Create service instance and process the request
    const sourceTextService = new SourceTextService(supabase);
    const result = await sourceTextService.createSourceText(command, DEFAULT_USER_ID);
    
    // Return success response
    return new Response(JSON.stringify(result), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    // Handle validation errors
    if (error instanceof Error && error.message.startsWith('VALIDATION_ERROR:')) {
      const errorDetails = JSON.parse(error.message.replace('VALIDATION_ERROR:', ''));
      const errorResponse: ApiErrorResponse = {
        message: 'Validation error',
        code: 'VALIDATION_ERROR',
        details: errorDetails
      };
      return new Response(JSON.stringify(errorResponse), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Handle database errors
    if (error instanceof Error && error.message.startsWith('DATABASE_ERROR:')) {
      const errorResponse: ApiErrorResponse = {
        message: 'Database error',
        code: 'DATABASE_ERROR'
      };
      console.error('Database error:', error.message);
      return new Response(JSON.stringify(errorResponse), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Handle unexpected errors
    console.error('Unexpected error:', error);
    const errorResponse: ApiErrorResponse = {
      message: 'Internal server error',
      code: 'INTERNAL_SERVER_ERROR'
    };
    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
} 