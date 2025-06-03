import React from "react";

interface FlashcardContentProps {
  frontContent: string;
  backContent: string;
  isFlipped: boolean;
  isEditing: boolean;
  editableFrontContent: string;
  editableBackContent: string;
  onFlip: () => void;
  onEditFrontContent: (content: string) => void;
  onEditBackContent: (content: string) => void;
  "data-testid"?: string;
}

export const FlashcardContent: React.FC<FlashcardContentProps> = ({
  frontContent,
  backContent,
  isFlipped,
  isEditing,
  editableFrontContent,
  editableBackContent,
  onFlip,
  onEditFrontContent,
  onEditBackContent,
  "data-testid": dataTestId = "flashcard-content"
}) => {
  const handleContentClick = () => {
    // Don't flip when in editing mode
    if (!isEditing) {
      onFlip();
    }
  };

  const currentFrontContent = isEditing ? editableFrontContent : frontContent;
  const currentBackContent = isEditing ? editableBackContent : backContent;

  return (
    <div 
      className={`relative w-full transition-all duration-300 p-6 min-h-[200px] flex items-center justify-center ${
        isFlipped 
          ? "bg-neutral-100 text-neutral-700" 
          : "bg-white text-neutral-900"
      } ${isEditing ? "" : "cursor-pointer"}`}
      onClick={handleContentClick}
      role={isEditing ? "form" : "button"}
      tabIndex={isEditing ? -1 : 0}
      aria-label={
        isEditing 
          ? "Edytujesz fiszkę" 
          : (isFlipped ? "Kliknij aby pokazać przód fiszki" : "Kliknij aby pokazać tył fiszki")
      }
      onKeyDown={(e) => {
        if (!isEditing && (e.key === "Enter" || e.key === " ")) {
          onFlip();
          e.preventDefault();
        }
      }}
      data-testid={dataTestId}
      data-flipped={isFlipped}
      data-editing={isEditing}
    >
      <div className="absolute top-2 right-2 text-xs text-neutral-400" data-testid="flashcard-side-indicator">
        {isFlipped ? "Odpowiedź" : "Pytanie"}
        {isEditing && <span className="ml-2 text-blue-500">(edytowanie)</span>}
      </div>
      
      <div className="text-center w-full">
        {isFlipped ? (
          <div className="prose w-full" data-testid="flashcard-back-content">
            {isEditing ? (
              <textarea
                value={currentBackContent}
                onChange={(e) => onEditBackContent(e.target.value)}
                className="w-full text-lg p-2 border border-neutral-300 rounded resize-none min-h-[80px]"
                placeholder="Wprowadź odpowiedź..."
                autoFocus
                data-testid="flashcard-back-edit-input"
              />
            ) : (
              <p className="text-lg">{currentBackContent}</p>
            )}
          </div>
        ) : (
          <div className="prose w-full" data-testid="flashcard-front-content">
            {isEditing ? (
              <textarea
                value={currentFrontContent}
                onChange={(e) => onEditFrontContent(e.target.value)}
                className="w-full text-lg font-medium p-2 border border-neutral-300 rounded resize-none min-h-[80px]"
                placeholder="Wprowadź pytanie..."
                autoFocus
                data-testid="flashcard-front-edit-input"
              />
            ) : (
              <p className="text-lg font-medium">{currentFrontContent}</p>
            )}
          </div>
        )}
      </div>
      
      {!isEditing && (
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-xs text-neutral-400" data-testid="flashcard-flip-hint">
          {isFlipped ? "Kliknij aby odwrócić" : "Kliknij aby zobaczyć odpowiedź"}
        </div>
      )}
    </div>
  );
}; 