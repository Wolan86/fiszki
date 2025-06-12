import { defineMiddleware } from 'astro:middleware';
import { createSupabaseServerInstance, supabaseClient } from '../db/supabase.client.ts';
import { writeFileSync, appendFileSync } from 'fs';

// Function to log to file for debugging
function logToFile(message: string) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  try {
    appendFileSync('middleware-debug.log', logMessage);
  } catch (e) {
    // Ignore file write errors
  }
}

// Ścieżki publiczne które nie wymagają uwierzytelnienia
const PUBLIC_PATHS = [
  // Strony Astro renderowane po stronie serwera
  "/auth/login",
  "/auth/register",
  "/auth/reset-password",
  "/auth/forgot-password",
  // Endpointy API Auth
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/reset-password",
  "/api/auth/forgot-password",
  "/api/auth/logout",
];

export const onRequest = defineMiddleware(
  async ({ locals, cookies, url, request, redirect }, next) => {
    logToFile(`[MIDDLEWARE] Request to: ${url.pathname}`);
    
    // Debug
    const isApiRoute = url.pathname.startsWith('/api/');
    if (isApiRoute) {
      console.log(`Auth Middleware for API route: ${url.pathname}`);
      logToFile(`Auth Middleware for API route: ${url.pathname}`);
    }
    
    // Debug logging
    console.log(`[MIDDLEWARE] Request to: ${url.pathname}`);
    console.log(`[MIDDLEWARE] Headers:`, Object.fromEntries(request.headers.entries()));
    logToFile(`[MIDDLEWARE] Headers: ${JSON.stringify(Object.fromEntries(request.headers.entries()))}`);
    
    const cookieHeader = request.headers.get('cookie');
    console.log(`[MIDDLEWARE] Cookie header present: ${!!cookieHeader}`);
    logToFile(`[MIDDLEWARE] Cookie header present: ${!!cookieHeader}`);
    if (cookieHeader) {
      console.log(`[MIDDLEWARE] Cookie header length: ${cookieHeader.length}`);
      console.log(`[MIDDLEWARE] Cookie header content: ${cookieHeader.substring(0, 200)}`);
      console.log(`[MIDDLEWARE] Contains auth token: ${cookieHeader.includes('sb-ctckruhijobdabxvrwxi-auth-token')}`);
      logToFile(`[MIDDLEWARE] Cookie header length: ${cookieHeader.length}`);
      logToFile(`[MIDDLEWARE] Cookie header content: ${cookieHeader.substring(0, 200)}`);
      logToFile(`[MIDDLEWARE] Contains auth token: ${cookieHeader.includes('sb-ctckruhijobdabxvrwxi-auth-token')}`);
    } else {
      console.log(`[MIDDLEWARE] No cookie header found`);
      logToFile(`[MIDDLEWARE] No cookie header found`);
    }
    
    // Dodajemy supabaseClient do kontekstu dla wszystkich ścieżek
    locals.supabase = supabaseClient;

    // Dla ścieżek publicznych nie sprawdzamy uwierzytelnienia
    if (PUBLIC_PATHS.includes(url.pathname)) {
      console.log(`[Middleware] Public path, skipping auth check`);
      logToFile(`[Middleware] Public path, skipping auth check`);
      return next();
    }

    // Create Supabase instance
    console.log(`[MIDDLEWARE] Creating Supabase instance...`);
    logToFile(`[MIDDLEWARE] Creating Supabase instance...`);
    const supabase = createSupabaseServerInstance({ headers: request.headers, cookies: cookies });
    console.log(`[MIDDLEWARE] Supabase instance created`);
    logToFile(`[MIDDLEWARE] Supabase instance created`);
    
    // Check if user is authenticated
    console.log(`[MIDDLEWARE] Checking authentication...`);
    logToFile(`[MIDDLEWARE] Checking authentication...`);
    const { data: { user }, error } = await supabase.auth.getUser();
    console.log(`[MIDDLEWARE] Auth check result - User:`, user ? `${user.email} (${user.id})` : 'null', 'Error:', error?.message || 'none');
    logToFile(`[MIDDLEWARE] Auth check result - User: ${user ? `${user.email} (${user.id})` : 'null'}, Error: ${error?.message || 'none'}`);

    if (user) {
      // Jeśli użytkownik jest zalogowany, zapisujemy dane w kontekście
      locals.user = {
        email: user.email || null,
        id: user.id,
      };
      console.log(`[Middleware] User authenticated:`, locals.user);
      logToFile(`[Middleware] User authenticated: ${JSON.stringify(locals.user)}`);
    } else if (!PUBLIC_PATHS.includes(url.pathname)) {
      // Jeśli użytkownik nie jest zalogowany, przekierowujemy do strony logowania
      console.log(`[Middleware] User not authenticated, redirecting to login`);
      logToFile(`[Middleware] User not authenticated, redirecting to login`);
      return redirect('/auth/login');
    }

    return next();
  }
); 