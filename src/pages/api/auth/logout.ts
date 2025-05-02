import type { APIRoute } from 'astro';
import { createSupabaseServerInstance } from '../../../db/supabase.client';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  const supabase = createSupabaseServerInstance({
    cookies,
    headers: request.headers,
  });

  const { error } = await supabase.auth.signOut();

  if (error) {
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }), 
      { status: 400 }
    );
  }

  return new Response(
    JSON.stringify({ 
      success: true 
    }), 
    { status: 200 }
  );
}; 