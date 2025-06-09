import { Maximize, Minimize } from "lucide-react";
import { Button } from "../ui/button";

interface FullscreenControlsProps {
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  isSupported: boolean;
}

const FullscreenControls = ({
  isFullscreen,
  onToggleFullscreen,
  isSupported,
}: FullscreenControlsProps) => {
  if (!isSupported) {
    return null;
  }

  return (
    <div className="flex items-center space-x-2">
      {isFullscreen && (
        <span className="text-xs text-muted-foreground">
          ESC - wyjście z pełnego ekranu
        </span>
      )}
      
      <Button
        variant="ghost"
        size="sm"
        onClick={onToggleFullscreen}
        className="flex items-center space-x-1"
        title={isFullscreen ? "Wyjdź z pełnego ekranu" : "Tryb pełnoekranowy"}
      >
        {isFullscreen ? (
          <>
            <Minimize className="w-4 h-4" />
            <span className="hidden sm:inline">Okno</span>
          </>
        ) : (
          <>
            <Maximize className="w-4 h-4" />
            <span className="hidden sm:inline">Pełny ekran</span>
          </>
        )}
      </Button>
    </div>
  );
};

export default FullscreenControls; 