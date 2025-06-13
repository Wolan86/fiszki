import type { FlashcardDto } from "../../types";
import ProgressIndicator from "./ProgressIndicator";
import FlashcardViewer from "./FlashcardViewer";
import NavigationControls from "./NavigationControls";
import FullscreenControls from "./FullscreenControls";

interface LearningSessionProps {
  flashcards: FlashcardDto[];
  currentIndex: number;
  isCardFlipped: boolean;
  isFullscreen: boolean;
  totalCount: number;
  currentFlashcard: FlashcardDto | null;
  canGoPrevious: boolean;
  canGoNext: boolean;
  onNavigation: (direction: "prev" | "next") => void;
  onCardFlip: () => void;
  onFullscreenToggle: () => void;
  isFullscreenSupported: boolean;
}

const LearningSession = ({
  flashcards,
  currentIndex,
  isCardFlipped,
  isFullscreen,

  currentFlashcard,
  canGoPrevious,
  canGoNext,
  onNavigation,
  onCardFlip,
  onFullscreenToggle,
  isFullscreenSupported,
}: LearningSessionProps) => {
  if (!currentFlashcard) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Nie znaleziono fiszki</p>
      </div>
    );
  }

  return (
    <div className={`learning-session ${isFullscreen ? "fullscreen-mode" : ""}`}>
      {/* Nagłówek z postępem i kontrolkami fullscreen */}
      <div className="session-header flex justify-between items-center p-4 border-b">
        <ProgressIndicator current={currentIndex + 1} total={flashcards.length} showPercentage={true} />

        <FullscreenControls
          isFullscreen={isFullscreen}
          onToggleFullscreen={onFullscreenToggle}
          isSupported={isFullscreenSupported}
        />
      </div>

      {/* Główny obszar z fiszką */}
      <div className="session-content flex-1 flex flex-col items-center justify-center p-8">
        <FlashcardViewer flashcard={currentFlashcard} isFlipped={isCardFlipped} onFlip={onCardFlip} />
      </div>

      {/* Kontrolki nawigacji */}
      <div className="session-footer p-4 border-t">
        <NavigationControls
          currentIndex={currentIndex}
          totalCount={flashcards.length}
          onPrevious={() => onNavigation("prev")}
          onNext={() => onNavigation("next")}
          canGoPrevious={canGoPrevious}
          canGoNext={canGoNext}
        />
      </div>
    </div>
  );
};

export default LearningSession;
