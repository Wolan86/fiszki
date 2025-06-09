import type { FlashcardDto } from "../../types";
import FlashcardCard from "./FlashcardCard";

interface FlashcardViewerProps {
  flashcard: FlashcardDto;
  isFlipped: boolean;
  onFlip: () => void;
}

const FlashcardViewer = ({ flashcard, isFlipped, onFlip }: FlashcardViewerProps) => {
  return (
    <div className="flashcard-viewer w-full max-w-2xl">
      <FlashcardCard
        flashcard={flashcard}
        isFlipped={isFlipped}
        onClick={onFlip}
        className="mx-auto"
      />
      
      {/* Instrukcja */}
      <div className="text-center mt-6">
        <p className="text-sm text-muted-foreground">
          Kliknij kartę lub naciśnij spację, aby ją odwrócić
        </p>
      </div>
    </div>
  );
};

export default FlashcardViewer; 