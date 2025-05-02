import { defineMiddleware } from 'astro:middleware';
import { createSupabaseServerInstance, supabaseClient } from '../db/supabase.client.ts';

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
    // Dodajemy supabaseClient do kontekstu dla wszystkich ścieżek
    locals.supabase = supabaseClient;

    // Dla ścieżek publicznych nie sprawdzamy uwierzytelnienia
    if (PUBLIC_PATHS.includes(url.pathname)) {
      return next();
    }

    // Dla wszystkich innych ścieżek weryfikujemy sesję
    const supabase = createSupabaseServerInstance({
      cookies,
      headers: request.headers,
    });

    // Zawsze najpierw pobieramy sesję użytkownika
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      // Jeśli użytkownik jest zalogowany, zapisujemy dane w kontekście
      locals.user = {
        email: user.email || null,
        id: user.id,
      };
    } else if (!PUBLIC_PATHS.includes(url.pathname)) {
      // Jeśli użytkownik nie jest zalogowany, przekierowujemy do strony logowania
      return redirect('/auth/login');
    }

    return next();
  }
); 