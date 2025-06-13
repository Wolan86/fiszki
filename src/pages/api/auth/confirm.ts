import type { APIRoute } from "astro";
import { createSupabaseServerInstance } from "@/db/supabase.client";

export const prerender = false;

export const GET: APIRoute = async ({ request, cookies, redirect }) => {
  const url = new URL(request.url);
  const token_hash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type");

  // Email confirmation attempt with specified parameters

  if (token_hash && type) {
    const supabase = createSupabaseServerInstance({
      cookies,
      headers: request.headers,
    });

    const { error } = await supabase.auth.verifyOtp({
      type: type as "signup" | "invite" | "magiclink" | "recovery" | "email_change" | "email",
      token_hash,
    });

    if (error) {
      // Email confirmation error - redirecting with error message
      return redirect(
        `/auth/login?error=confirmation_failed&message=${encodeURIComponent("Nie udało się potwierdzić adresu email. Link może być nieprawidłowy lub wygasły.")}`
      );
    }

    // Email confirmation successful - redirecting to login
    return redirect("/auth/login?confirmed=true");
  }

  // Missing token_hash or type - redirecting with error
  return redirect(`/auth/login?error=invalid_link&message=${encodeURIComponent("Nieprawidłowy link potwierdzający.")}`);
};
