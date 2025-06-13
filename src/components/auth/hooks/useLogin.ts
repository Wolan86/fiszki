import { useState } from "react";
import { AuthService, type AuthError } from "../../../lib/services/auth";
import type { LoginFormData } from "../../../lib/validations/auth";

interface UseLoginReturn {
  login: (data: LoginFormData) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
}

export const useLogin = (onSuccess?: () => void, onError?: (error: AuthError) => void): UseLoginReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      await AuthService.login(data);
      onSuccess?.();
      // Redirect after successful login
      window.location.href = "/kreator";
    } catch (err) {
      const authError = err as AuthError;
      let errorMessage = "Wystąpił błąd podczas logowania";

      // Handle different types of errors
      if (authError.status === 401) {
        errorMessage = "Niepoprawny email lub hasło";
      } else if (authError.status === 400) {
        errorMessage = "Nieprawidłowe dane logowania";
      } else if (authError.message) {
        errorMessage = authError.message;
      }

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
    login,
    isLoading,
    error,
    clearError,
  };
};
