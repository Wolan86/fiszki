import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { loginSchema, type LoginFormData } from "../../lib/validations/auth";
import { useLogin } from "./hooks/useLogin";

interface LoginFormProps {
  isLoading?: boolean;
  error?: string;
}

export const LoginForm: React.FC<LoginFormProps> = ({ isLoading: externalLoading = false, error: externalError }) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: "onBlur",
  });

  const { login, isLoading: loginLoading, error: loginError, clearError } = useLogin();

  const onSubmit = async (data: LoginFormData) => {
    clearError();
    await login(data);
  };

  const isFormDisabled = externalLoading || isSubmitting || loginLoading;
  const displayError = externalError || loginError;

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Logowanie</CardTitle>
        <CardDescription>Zaloguj się do swojego konta, aby mieć dostęp do swoich fiszek</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" data-testid="login-form" onSubmit={handleSubmit(onSubmit)}>
          {displayError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{displayError}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="twoj@email.pl"
              disabled={isFormDisabled}
              aria-invalid={!!errors.email}
              data-testid="email-input"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-sm text-red-500 mt-1" role="alert">
                {errors.email.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Hasło</Label>
              <a href="/auth/forgot-password" className="text-sm text-blue-600 hover:underline">
                Zapomniałeś hasła?
              </a>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              disabled={isFormDisabled}
              aria-invalid={!!errors.password}
              data-testid="password-input"
              {...register("password")}
            />
            {errors.password && (
              <p className="text-sm text-red-500 mt-1" role="alert">
                {errors.password.message}
              </p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isFormDisabled} data-testid="login-button">
            {isFormDisabled ? "Logowanie..." : "Zaloguj się"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-gray-600">
          Nie masz jeszcze konta?{" "}
          <a href="/auth/register" className="text-blue-600 hover:underline">
            Zarejestruj się
          </a>
        </p>
      </CardFooter>
    </Card>
  );
};
