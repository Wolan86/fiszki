import type { APIRoute } from "astro";
import { createSupabaseServerInstance } from "../../../db/supabase.client";

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
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
    // eslint-disable-next-line no-console
    console.error("Login error:", error);

    // Handle specific error cases with user-friendly messages
    let errorMessage = error.message;

    if (error.message.includes("Email not confirmed")) {
      errorMessage =
        "Adres email nie został potwierdzony. Sprawdź swoją skrzynkę pocztową i kliknij link potwierdzający.";
    } else if (error.message.includes("Invalid login credentials")) {
      errorMessage = "Niepoprawny email lub hasło.";
    } else if (error.message.includes("Too many requests")) {
      errorMessage = "Zbyt wiele prób logowania. Spróbuj ponownie za chwilę.";
    } else if (error.message.includes("User not found")) {
      errorMessage = "Użytkownik o podanym adresie email nie istnieje.";
    }

    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
      }),
      { status: 400 }
    );
  }

  return new Response(
    JSON.stringify({
      success: true,
      user: data.user,
    }),
    { status: 200 }
  );
};
