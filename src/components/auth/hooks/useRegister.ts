import { useState } from "react";
import { AuthService, type AuthError } from "../../../lib/services/auth";
import type { RegisterFormData } from "../../../lib/validations/auth";

interface UseRegisterReturn {
  register: (data: RegisterFormData) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
}

export const useRegister = (
  onSuccess?: () => void,
  onError?: (error: AuthError) => void
): UseRegisterReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const register = async (data: RegisterFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      await AuthService.register(data);
      onSuccess?.();
      // Redirect after successful registration
      window.location.href = "/auth/login?registered=true";
    } catch (err) {
      const authError = err as AuthError;
      let errorMessage = "Wystąpił błąd podczas rejestracji";
      
      // Handle different types of errors
      if (authError.status === 409) {
        errorMessage = "Użytkownik z tym adresem email już istnieje";
      } else if (authError.status === 400) {
        errorMessage = "Nieprawidłowe dane rejestracji";
      } else if (authError.message) {
        errorMessage = authError.message;
      }
      
      console.error('Registration error:', authError);
      setError(errorMessage);
      onError?.(authError);
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  return {
    register,
    isLoading,
    error,
    clearError,
  };
}; 