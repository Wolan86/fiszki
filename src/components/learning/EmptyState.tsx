import { BookOpen, Plus } from "lucide-react";
import { Button } from "../ui/button";

const EmptyState = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-6">
      <div className="flex items-center justify-center w-16 h-16 bg-muted rounded-full">
        <BookOpen className="w-8 h-8 text-muted-foreground" />
      </div>

      <div className="text-center space-y-2">
        <h3 className="text-xl font-semibold">Brak fiszek do nauki</h3>
        <p className="text-muted-foreground max-w-md">
          Nie masz jeszcze żadnych zaakceptowanych fiszek do nauki. Stwórz nowe fiszki lub zaakceptuj wygenerowane, aby
          rozpocząć naukę.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Button onClick={() => (window.location.href = "/kreator")} className="flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Stwórz fiszki</span>
        </Button>

        <Button onClick={() => (window.location.href = "/fiszki")} variant="outline">
          Przejdź do fiszek
        </Button>
      </div>
    </div>
  );
};

export default EmptyState;
