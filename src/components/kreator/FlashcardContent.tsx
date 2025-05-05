import React from "react";

interface FlashcardContentProps {
  frontContent: string;
  backContent: string;
  isFlipped: boolean;
  onFlip: () => void;
}

export const FlashcardContent: React.FC<FlashcardContentProps> = ({
  frontContent,
  backContent,
  isFlipped,
  onFlip
}) => {
  return (
    <div 
      className={`relative w-full cursor-pointer transition-all duration-300 p-6 min-h-[200px] flex items-center justify-center ${
        isFlipped 
          ? "bg-neutral-100 text-neutral-700" 
          : "bg-white text-neutral-900"
      }`}
      onClick={onFlip}
      role="button"
      tabIndex={0}
      aria-label={isFlipped ? "Kliknij aby pokazać przód fiszki" : "Kliknij aby pokazać tył fiszki"}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          onFlip();
          e.preventDefault();
        }
      }}
      data-testid="flashcard-content"
      data-flipped={isFlipped}
    >
      <div className="absolute top-2 right-2 text-xs text-neutral-400" data-testid="flashcard-side-indicator">
        {isFlipped ? "Odpowiedź" : "Pytanie"}
      </div>
      
      <div className="text-center">
        {isFlipped ? (
          <div className="prose" data-testid="flashcard-back-content">
            <p className="text-lg">{backContent}</p>
          </div>
        ) : (
          <div className="prose" data-testid="flashcard-front-content">
            <p className="text-lg font-medium">{frontContent}</p>
          </div>
        )}
      </div>
      
      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-xs text-neutral-400" data-testid="flashcard-flip-hint">
        {isFlipped ? "Kliknij aby odwrócić" : "Kliknij aby zobaczyć odpowiedź"}
      </div>
    </div>
  );
}; 