import type { APIRoute } from "astro";
import { createSupabaseServerInstance } from "@/db/supabase.client";

export const prerender = false;

export const GET: APIRoute = async ({ request, cookies, redirect }) => {
  const url = new URL(request.url);
  const token_hash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type");
  const next = url.searchParams.get("next") ?? "/";

  // Log the confirmation attempt for debugging
  console.log("Email confirmation attempt:", {
    token_hash: token_hash ? "***" : null,
    type,
    next,
  });

  if (token_hash && type) {
    const supabase = createSupabaseServerInstance({
      cookies,
      headers: request.headers,
    });

    const { error } = await supabase.auth.verifyOtp({
      type: type as any,
      token_hash,
    });

    if (error) {
      console.error("Email confirmation error:", error);
      // Redirect to login with error message
      return redirect(`/auth/login?error=confirmation_failed&message=${encodeURIComponent("Nie udało się potwierdzić adresu email. Link może być nieprawidłowy lub wygasły.")}`);
    }

    console.log("Email confirmation successful");
    // Redirect to login with success message
    return redirect("/auth/login?confirmed=true");
  }

  // If no token_hash or type, redirect to login with error
  console.error("Missing token_hash or type in confirmation URL");
  return redirect(`/auth/login?error=invalid_link&message=${encodeURIComponent("Nieprawidłowy link potwierdzający.")}`);
}; 