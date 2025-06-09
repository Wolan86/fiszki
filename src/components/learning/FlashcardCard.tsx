import { useState, useRef, useEffect } from "react";
import type { FlashcardDto } from "../../types";

interface FlashcardCardProps {
  flashcard: FlashcardDto;
  isFlipped: boolean;
  onClick: () => void;
  className?: string;
}

interface TouchState {
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  isDragging: boolean;
}

const FlashcardCard = ({ flashcard, isFlipped, onClick, className = "" }: FlashcardCardProps) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [touchState, setTouchState] = useState<TouchState>({
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    isDragging: false,
  });
  const cardRef = useRef<HTMLDivElement>(null);

  const handleClick = () => {
    if (isAnimating || touchState.isDragging) return;
    setIsAnimating(true);
    onClick();
    
    // Reset animacji po zakończeniu
    setTimeout(() => setIsAnimating(false), 300);
  };

  // Obsługa gestów dotykowych
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setTouchState({
      startX: touch.clientX,
      startY: touch.clientY,
      currentX: touch.clientX,
      currentY: touch.clientY,
      isDragging: false,
    });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    const deltaX = Math.abs(touch.clientX - touchState.startX);
    const deltaY = Math.abs(touch.clientY - touchState.startY);
    
    // Rozpocznij przeciąganie jeśli ruch jest wystarczająco duży
    if (deltaX > 10 || deltaY > 10) {
      setTouchState(prev => ({
        ...prev,
        currentX: touch.clientX,
        currentY: touch.clientY,
        isDragging: true,
      }));
    }
  };

  const handleTouchEnd = () => {
    if (!touchState.isDragging) {
      // Jeśli nie było przeciągania, traktuj jako tap
      handleClick();
    }
    
    setTouchState({
      startX: 0,
      startY: 0,
      currentX: 0,
      currentY: 0,
      isDragging: false,
    });
  };

  const truncateText = (text: string, maxLength: number = 300) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  // Efekt dla animacji hover na desktop
  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const handleMouseEnter = () => {
      const faces = card.querySelectorAll('[data-face]');
      faces.forEach((face) => {
        (face as HTMLElement).style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.15)';
        (face as HTMLElement).style.transform += ' translateY(-2px)';
      });
    };

    const handleMouseLeave = () => {
      const faces = card.querySelectorAll('[data-face]');
      faces.forEach((face) => {
        (face as HTMLElement).style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
        (face as HTMLElement).style.transform = (face as HTMLElement).style.transform.replace(' translateY(-2px)', '');
      });
    };

    card.addEventListener('mouseenter', handleMouseEnter);
    card.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      card.removeEventListener('mouseenter', handleMouseEnter);
      card.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  const containerStyle: React.CSSProperties = {
    perspective: '1000px',
    width: '100%',
    maxWidth: '500px',
    height: '300px',
  };

  const cardStyle: React.CSSProperties = {
    position: 'relative',
    width: '100%',
    height: '100%',
    transformStyle: 'preserve-3d',
    transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    borderRadius: '12px',
    cursor: 'pointer',
    transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
    pointerEvents: isAnimating ? 'none' : 'auto',
  };

  const faceStyle: React.CSSProperties = {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backfaceVisibility: 'hidden',
    borderRadius: '12px',
    border: '2px solid hsl(var(--border))',
    background: 'hsl(var(--card))',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
    transition: 'all 0.3s ease',
  };

  const backStyle: React.CSSProperties = {
    ...faceStyle,
    transform: 'rotateY(180deg)',
  };

  const contentStyle: React.CSSProperties = {
    padding: '2rem',
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    textAlign: 'center',
  };

  return (
    <div className={`${className} fade-in`} style={containerStyle}>
      <div 
        ref={cardRef}
        style={cardStyle}
        onClick={handleClick}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Przednia strona */}
        <div style={faceStyle} data-face="front">
          <div style={contentStyle}>
            <div className="text-xs text-muted-foreground mb-2 text-center font-medium uppercase tracking-wide">
              Przód
            </div>
            <div className="text-lg text-center leading-relaxed">
              {truncateText(flashcard.front_content)}
            </div>
          </div>
        </div>

        {/* Tylna strona */}
        <div style={backStyle} data-face="back">
          <div style={contentStyle}>
            <div className="text-xs text-muted-foreground mb-2 text-center font-medium uppercase tracking-wide">
              Tył
            </div>
            <div className="text-lg text-center leading-relaxed">
              {truncateText(flashcard.back_content)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlashcardCard; 