import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";
import type { APIContext } from "astro";

/**
 * Creates a Supabase client for server-side usage
 * Uses the context.locals provided by Astro middleware
 * 
 * @param locals Astro context locals containing Supabase client with auth context
 * @returns Supabase client with correct typing
 */
export function createClient(locals: APIContext["locals"]) {
  const supabase = locals.supabase;
  
  if (supabase) {
    return supabase as ReturnType<typeof createSupabaseClient<Database>>;
  }
  
  // Fallback if middleware hasn't set up the client (shouldn't happen in production)
  console.warn("Supabase client not found in locals, creating a new one");
  
  return createSupabaseClient<Database>(
    import.meta.env.PUBLIC_SUPABASE_URL,
    import.meta.env.PUBLIC_SUPABASE_ANON_KEY
  );
} 