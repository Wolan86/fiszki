import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { registerSchema, type RegisterFormData } from "../../lib/validations/auth";
import { useRegister } from "./hooks/useRegister";

interface RegisterFormProps {
  isLoading?: boolean;
  error?: string;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ isLoading: externalLoading = false, error: externalError }) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: "onBlur",
  });

  const { register: registerUser, isLoading: registerLoading, error: registerError, clearError } = useRegister();

  const onSubmit = async (data: RegisterFormData) => {
    clearError();
    await registerUser(data);
  };

  const isFormDisabled = externalLoading || isSubmitting || registerLoading;
  const displayError = externalError || registerError;

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Rejestracja</CardTitle>
        <CardDescription>Utwórz konto, aby móc tworzyć i zapisywać swoje fiszki</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" data-testid="register-form" onSubmit={handleSubmit(onSubmit)}>
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
            <Label htmlFor="password">Hasło</Label>
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
            <p className="text-xs text-gray-500">
              Hasło musi zawierać minimum 8 znaków, w tym przynajmniej jedną cyfrę i jeden znak specjalny.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Potwierdzenie hasła</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              disabled={isFormDisabled}
              aria-invalid={!!errors.confirmPassword}
              data-testid="confirm-password-input"
              {...register("confirmPassword")}
            />
            {errors.confirmPassword && (
              <p className="text-sm text-red-500 mt-1" role="alert">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isFormDisabled} data-testid="register-button">
            {isFormDisabled ? "Rejestracja..." : "Zarejestruj się"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-gray-600">
          Masz już konto?{" "}
          <a href="/auth/login" className="text-blue-600 hover:underline">
            Zaloguj się
          </a>
        </p>
      </CardFooter>
    </Card>
  );
};
