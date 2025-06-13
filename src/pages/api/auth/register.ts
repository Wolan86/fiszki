import type { APIRoute } from "astro";
import { z } from "zod";
import { createSupabaseServerInstance } from "@/db/supabase.client";

// Define schema for validation
const registerSchema = z
  .object({
    email: z.string().email("Niepoprawny format adresu email"),
    password: z
      .string()
      .min(8, "Hasło musi mieć co najmniej 8 znaków")
      .regex(/(?=.*\d)(?=.*[!@#$%^&*])/, "Hasło musi zawierać przynajmniej jedną cyfrę i jeden znak specjalny"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Hasła nie są identyczne",
    path: ["confirmPassword"],
  });

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    // Parse request body
    const body = await request.json();

    // Validate input
    const result = registerSchema.safeParse(body);
    if (!result.success) {
      return new Response(
        JSON.stringify({
          success: false,
          error: result.error.issues[0].message,
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const { email, password } = result.data;

    // Create Supabase client
    const supabase = createSupabaseServerInstance({
      cookies,
      headers: request.headers,
    });

    // Register user with Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${new URL(request.url).origin}/api/auth/confirm`,
      },
    });

    // Log the response for debugging
    console.log("Supabase signUp response:", {
      user: data.user ? { 
        id: data.user.id, 
        email: data.user.email, 
        email_confirmed_at: data.user.email_confirmed_at,
        confirmed_at: data.user.confirmed_at 
      } : null,
      session: data.session ? { access_token: "***", user: data.session.user.id } : null,
      error: error ? error.message : null
    });

    if (error) {
      console.error("Supabase registration error:", error);
      
      // Handle specific error cases
      if (error.message.includes("User already registered") || error.message.includes("already been registered")) {
        return new Response(
          JSON.stringify({
            success: false,
            error: "Użytkownik o tym adresie email już istnieje.",
          }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }
      
      if (error.message.includes("Password")) {
        return new Response(
          JSON.stringify({
            success: false,
            error: "Hasło nie spełnia wymagań bezpieczeństwa.",
          }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({
          success: false,
          error: "Wystąpił błąd podczas rejestracji. Spróbuj ponownie później.",
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // Check if email confirmation is required
    // If user exists but session is null, it means email confirmation is required
    if (data.user && !data.session) {
      return new Response(
        JSON.stringify({
          success: true,
          message: "Rejestracja zakończona sukcesem. Sprawdź swoją skrzynkę pocztową i potwierdź adres email.",
          requiresEmailConfirmation: true,
        }),
        { status: 201, headers: { "Content-Type": "application/json" } }
      );
    }

    // Registration successful - user can log in immediately
    return new Response(
      JSON.stringify({
        success: true,
        message: "Rejestracja zakończona sukcesem.",
        user: {
          id: data.user?.id,
          email: data.user?.email,
        },
      }),
      { status: 201, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error during registration:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: "Wystąpił błąd podczas rejestracji. Spróbuj ponownie później.",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};

export const prerender = false;
