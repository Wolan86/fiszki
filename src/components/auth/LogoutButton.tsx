import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

interface LogoutButtonProps {
  className?: string;
}

export const LogoutButton: React.FC<LogoutButtonProps> = ({ className = "" }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Błąd podczas wylogowywania');
      }

      // Przekierowanie po udanym wylogowaniu
      window.location.href = '/auth/login';
    } catch (error) {
      console.error('Błąd wylogowania:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleLogout}
      disabled={isLoading}
      className={className}
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
  );
}; 