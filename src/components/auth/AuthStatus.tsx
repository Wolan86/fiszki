import React from "react";
import { LogoutButton } from "./LogoutButton";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";

interface AuthStatusProps {
  user?: {
    email: string | null;
    id: string;
  };
}

export const AuthStatus: React.FC<AuthStatusProps> = ({ user }) => {
  if (!user) {
    return (
      <Button 
        variant="ghost" 
        size="sm" 
        className="flex items-center gap-2"
        onClick={() => { window.location.href = "/auth/login"; }}
      >
        <User className="h-4 w-4" />
        Zaloguj się
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <div className="text-sm font-medium hidden md:block">
        {user.email}
      </div>
      <LogoutButton />
    </div>
  );
}; 