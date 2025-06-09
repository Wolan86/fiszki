import { ChevronLeft, ChevronRight, Home } from "lucide-react";
import { Button } from "../ui/button";

interface NavigationControlsProps {
  currentIndex: number;
  totalCount: number;
  onPrevious: () => void;
  onNext: () => void;
  canGoPrevious: boolean;
  canGoNext: boolean;
}

const NavigationControls = ({
  currentIndex,
  totalCount,
  onPrevious,
  onNext,
  canGoPrevious,
  canGoNext,
}: NavigationControlsProps) => {
  return (
    <div className="flex items-center justify-between">
      {/* Przycisk poprzedni */}
      <Button
        variant="outline"
        size="lg"
        onClick={onPrevious}
        disabled={!canGoPrevious}
        className="flex items-center space-x-2"
      >
        <ChevronLeft className="w-4 h-4" />
        <span>Poprzednia</span>
      </Button>

      {/* Środkowa sekcja z instrukcjami */}
      <div className="flex flex-col items-center space-y-2">
        <div className="text-xs text-muted-foreground text-center">
          <div>Strzałki: nawigacja</div>
          <div>Spacja/Enter: odwróć kartę</div>
          <div>F: tryb pełnoekranowy</div>
        </div>
        
        {/* Przycisk powrotu */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => window.location.href = '/fiszki'}
          className="flex items-center space-x-1 text-xs"
        >
          <Home className="w-3 h-3" />
          <span>Zakończ naukę</span>
        </Button>
      </div>

      {/* Przycisk następny */}
      <Button
        variant="outline"
        size="lg"
        onClick={onNext}
        disabled={!canGoNext}
        className="flex items-center space-x-2"
      >
        <span>Następna</span>
        <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  );
};

export default NavigationControls; 