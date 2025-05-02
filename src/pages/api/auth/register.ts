import type { APIRoute } from "astro";
import { z } from "zod";

// Define schema for validation
const registerSchema = z.object({
  email: z.string().email("Niepoprawny format adresu email"),
  password: z
    .string()
    .min(8, "Hasło musi mieć co najmniej 8 znaków")
    .regex(/(?=.*\d)(?=.*[!@#$%^&*])/, "Hasło musi zawierać przynajmniej jedną cyfrę i jeden znak specjalny"),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "Hasła nie są identyczne",
  path: ["confirmPassword"]
});

export const POST: APIRoute = async ({ request }) => {
  try {
    // Parse request body
    const body = await request.json();
    
    // Validate input
    const result = registerSchema.safeParse(body);
    if (!result.success) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: result.error.issues[0].message 
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    
    const { email, password } = result.data;
    
    // Here you would add your actual user registration logic with Supabase or your DB
    // This is a placeholder implementation
    
    // For now, simulate successful registration
    // TODO: Implement actual user creation in the database
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Rejestracja zakończona sukcesem" 
      }),
      { status: 201, headers: { "Content-Type": "application/json" } }
    );
    
  } catch (error) {
    console.error("Error during registration:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: "Wystąpił błąd podczas rejestracji. Spróbuj ponownie później." 
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};

export const prerender = false; 