import React, { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface ResetPasswordFormProps {
  onSubmit: (password: string, confirmPassword: string, token: string) => void;
  token: string;
  isLoading?: boolean;
  error?: string;
}

export const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({
  onSubmit,
  token,
  isLoading = false,
  error
}) => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [validationErrors, setValidationErrors] = useState<{
    password?: string;
    confirmPassword?: string;
  }>({});

  const validateForm = (): boolean => {
    const errors: { password?: string; confirmPassword?: string } = {};
    let isValid = true;

    // Walidacja hasła
    if (!password) {
      errors.password = "Hasło jest wymagane";
      isValid = false;
    } else if (password.length < 8) {
      errors.password = "Hasło musi mieć co najmniej 8 znaków";
      isValid = false;
    } else if (!/(?=.*\d)(?=.*[!@#$%^&*])/.test(password)) {
      errors.password = "Hasło musi zawierać przynajmniej jedną cyfrę i jeden znak specjalny";
      isValid = false;
    }

    // Walidacja potwierdzenia hasła
    if (!confirmPassword) {
      errors.confirmPassword = "Potwierdzenie hasła jest wymagane";
      isValid = false;
    } else if (confirmPassword !== password) {
      errors.confirmPassword = "Hasła nie są identyczne";
      isValid = false;
    }

    setValidationErrors(errors);
    return isValid;
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(password, confirmPassword, token);
    }
  };

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const handleConfirmPasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Resetowanie hasła</CardTitle>
        <CardDescription>
          Wprowadź i potwierdź nowe hasło
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="password">Nowe hasło</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={handlePasswordChange}
              disabled={isLoading}
              aria-invalid={!!validationErrors.password}
            />
            {validationErrors.password && (
              <p className="text-sm text-red-500 mt-1">{validationErrors.password}</p>
            )}
            <p className="text-xs text-gray-500">
              Hasło musi zawierać minimum 8 znaków, w tym przynajmniej jedną cyfrę i jeden znak specjalny.
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Potwierdzenie nowego hasła</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={handleConfirmPasswordChange}
              disabled={isLoading}
              aria-invalid={!!validationErrors.confirmPassword}
            />
            {validationErrors.confirmPassword && (
              <p className="text-sm text-red-500 mt-1">{validationErrors.confirmPassword}</p>
            )}
          </div>
          
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? "Resetowanie..." : "Zresetuj hasło"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-gray-600">
          <a href="/auth/login" className="text-blue-600 hover:underline">
            Powrót do logowania
          </a>
        </p>
      </CardFooter>
    </Card>
  );
}; 