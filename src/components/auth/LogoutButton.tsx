import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

interface LogoutButtonProps {
  className?: string;
}

export const LogoutButton: React.FC<LogoutButtonProps> = ({ className = "" }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Błąd podczas wylogowywania");
      }

      // Przekierowanie po udanym wylogowaniu
      window.location.href = "/auth/login";
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Błąd podczas wylogowywania";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleLogout}
        disabled={isLoading}
        className={className}
        data-testid="logout-button"
      >
        {isLoading ? (
          "Wylogowywanie..."
        ) : (
          <>
            <LogOut className="h-4 w-4 mr-2" />
            Wyloguj się
          </>
        )}
      </Button>
      {error && (
        <p className="text-red-500 text-sm mt-1" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};
