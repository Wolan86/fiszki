import type { LoginFormData, RegisterFormData } from "../validations/auth";

export interface AuthResponse {
  success: boolean;
  message?: string;
  data?: {
    user: {
      id: string;
      email: string;
    };
    session: {
      access_token: string;
      refresh_token: string;
    };
  };
}

export interface AuthError extends Error {
  code?: string;
  status?: number;
}

async function makeRequest(endpoint: string, data: LoginFormData | RegisterFormData): Promise<AuthResponse> {
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      const error = new Error(result.error || "Wystąpił błąd") as AuthError;
      error.status = response.status;
      error.code = result.code;
      throw error;
    }

    return result;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Wystąpił nieoczekiwany błąd");
  }
}

export const AuthService = {
  async login(data: LoginFormData): Promise<AuthResponse> {
    return makeRequest("/api/auth/login", data);
  },

  async register(data: RegisterFormData): Promise<AuthResponse> {
    return makeRequest("/api/auth/register", data);
  },
};

export default AuthService;
