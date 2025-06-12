import type { APIRoute } from "astro";
import { createSupabaseServerInstance } from "../../../db/supabase.client";

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const { email, password } = await request.json();

  // Walidacja danych wejściowych
  if (!email || !password) {
    return new Response(
      JSON.stringify({
        success: false,
        error: "Email i hasło są wymagane",
      }),
      { status: 400 }
    );
  }

  const supabase = createSupabaseServerInstance({
    cookies,
    headers: request.headers,
  });

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      { status: 400 }
    );
  }

  // Create response with success data
  const response = new Response(
    JSON.stringify({
      success: true,
      user: data.user,
    }),
    { 
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    }
  );

  // The cookies should already be set by the Supabase client through context.cookies.set()
  // This happens automatically when signInWithPassword is called
  console.log(`[login] Authentication successful for user: ${data.user?.email}`);

  return response;
};
