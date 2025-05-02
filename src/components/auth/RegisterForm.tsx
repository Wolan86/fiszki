import React, { useState } from "react";
import type { ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface RegisterFormProps {
  isLoading?: boolean;
  error?: string;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({
  isLoading = false,
  error
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [validationErrors, setValidationErrors] = useState<{
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  // Client-side validation only
  const validateForm = (): boolean => {
    const errors: { 
      email?: string; 
      password?: string; 
      confirmPassword?: string 
    } = {};
    let isValid = true;

    // Walidacja email
    if (!email) {
      errors.email = "Email jest wymagany";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = "Podaj poprawny adres email";
      isValid = false;
    }

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

  // Check validation on blur
  const handleBlur = () => {
    validateForm();
  };

  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
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
        <CardTitle>Rejestracja</CardTitle>
        <CardDescription>
          Utwórz konto, aby móc tworzyć i zapisywać swoje fiszki
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="twoj@email.pl"
              value={email}
              onChange={handleEmailChange}
              onBlur={handleBlur}
              disabled={isLoading}
              aria-invalid={!!validationErrors.email}
            />
            {validationErrors.email && (
              <p className="text-sm text-red-500 mt-1">{validationErrors.email}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Hasło</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={handlePasswordChange}
              onBlur={handleBlur}
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
            <Label htmlFor="confirmPassword">Potwierdzenie hasła</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={handleConfirmPasswordChange}
              onBlur={handleBlur}
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
            {isLoading ? "Rejestracja..." : "Zarejestruj się"}
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