import { createClient } from "@supabase/supabase-js";
import { createServerClient, type CookieOptionsWithName, type CookieOptions } from "@supabase/ssr";
import type { AstroCookies } from "astro";
import type { Database } from "../db/database.types.ts";

const supabaseUrl = import.meta.env.SUPABASE_URL;
const supabaseAnonKey = import.meta.env.SUPABASE_PUBLIC_KEY;

export const cookieOptions: CookieOptionsWithName = {
  path: "/",
  secure: import.meta.env.PROD,
  httpOnly: import.meta.env.PROD,
  sameSite: "lax",
};

export const supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey);

export type SupabaseClient = typeof supabaseClient;

export const DEFAULT_USER_ID = "90a80b86-8672-4560-aa02-6db9c6934fa5";

function parseCookieHeader(cookieHeader: string): { name: string; value: string }[] {
  console.log(`[parseCookieHeader] Input:`, cookieHeader);
  const cookies = cookieHeader.split(";").map((cookie) => {
    const [name, ...rest] = cookie.trim().split("=");
    let value = rest.join("=");
    
    // Remove "base64-" prefix if present (Playwright storage state adds this prefix)
    if (value.startsWith("base64-")) {
      value = value.substring(7); // Remove "base64-" prefix
      console.log(`[parseCookieHeader] Removed base64- prefix from ${name}`);
    }
    
    const result = { name, value };
    console.log(`[parseCookieHeader] Parsed cookie:`, result);
    return result;
  });
  console.log(`[parseCookieHeader] Total cookies parsed:`, cookies.length);
  return cookies;
}

interface Cookie {
  name: string;
  value: string;
  options?: CookieOptions;
}

export const createSupabaseServerInstance = (context: { headers: Headers; cookies: AstroCookies }) => {
  const cookieHeader = context.headers.get("Cookie");
  console.log(`[createSupabaseServerInstance] Cookie header:`, cookieHeader);
  
  const supabase = createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookieOptions,
    cookies: {
      getAll() {
        const cookies = parseCookieHeader(cookieHeader ?? "");
        console.log(`[createSupabaseServerInstance] getAll() returning:`, cookies);
        return cookies;
      },
      setAll(cookiesToSet: Cookie[]) {
        console.log(`[createSupabaseServerInstance] setAll() called with:`, cookiesToSet);
        console.log(`[createSupabaseServerInstance] setAll() cookies count:`, cookiesToSet.length);
        
        cookiesToSet.forEach(({ name, value, options }: { name: string; value: string; options?: CookieOptions }, index) => {
          console.log(`[createSupabaseServerInstance] Setting cookie ${index + 1}/${cookiesToSet.length}:`, {
            name,
            valueLength: value.length,
            valuePreview: value.substring(0, 50) + (value.length > 50 ? '...' : ''),
            options
          });
          context.cookies.set(name, value, options);
        });
        
        if (cookiesToSet.length === 0) {
          console.log(`[createSupabaseServerInstance] WARNING: setAll() called with empty array - this might clear cookies!`);
        }
      },
    },
  });

  return supabase;
};
