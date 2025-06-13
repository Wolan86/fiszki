import React, { useEffect } from "react";
import LoadingSpinner from "./LoadingSpinner";
import ErrorMessage from "./ErrorMessage";
import EmptyState from "./EmptyState";
import LearningSession from "./LearningSession";
import { useLearningSession } from "../../lib/hooks/learning/useLearningSession";
import { useFullscreen } from "../../lib/hooks/learning/useFullscreen";
import { useKeyboardNavigation } from "../../lib/hooks/learning/useKeyboardNavigation";

const LearningPage = () => {
  // Custom hooks
  const {
    flashcards,
    currentIndex,
    isCardFlipped,
    isLoading,
    error,
    totalCount,
    canGoPrevious,
    canGoNext,
    currentFlashcard,
    handleNavigation,
    handleCardFlip,
    handleRetry,
  } = useLearningSession({ limit: 20 });

  const { isActive: isFullscreen, isSupported: isFullscreenSupported, toggleFullscreen } = useFullscreen();

  // Funkcja do wyjścia z nauki
  const handleExit = () => {
    if (typeof window !== "undefined") {
      window.location.replace("/fiszki");
    }
  };

  // Use effect for any side effects that might have been causing the react-compiler error
  useEffect(() => {
    // Any side effects that were previously done outside the component should be here
  }, []);

  // Konfiguracja skrótów klawiaturowych
  useKeyboardNavigation({
    onPrevious: canGoPrevious ? () => handleNavigation("prev") : undefined,
    onNext: canGoNext ? () => handleNavigation("next") : undefined,
    onFlip: handleCardFlip,
    onFullscreen: isFullscreenSupported ? toggleFullscreen : undefined,
    onExit: isFullscreen ? toggleFullscreen : handleExit,
  });

  // Renderowanie warunkowe
  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={handleRetry} />;
  }

  if (flashcards.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className={`learning-page-container ${isFullscreen ? "fullscreen" : ""}`}>
      <LearningSession
        flashcards={flashcards}
        currentIndex={currentIndex}
        isCardFlipped={isCardFlipped}
        isFullscreen={isFullscreen}
        totalCount={totalCount}
        currentFlashcard={currentFlashcard}
        canGoPrevious={canGoPrevious}
        canGoNext={canGoNext}
        onNavigation={handleNavigation}
        onCardFlip={handleCardFlip}
        onFullscreenToggle={toggleFullscreen}
        isFullscreenSupported={isFullscreenSupported}
      />
    </div>
  );
};

export default LearningPage;
