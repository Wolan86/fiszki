import { useEffect, useCallback } from "react";

// Sprawdzenie czy jesteśmy w przeglądarce
const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';

// Konfiguracja skrótów klawiaturowych
interface KeyboardHandlers {
  onPrevious?: () => void;
  onNext?: () => void;
  onFlip?: () => void;
  onFullscreen?: () => void;
  onExit?: () => void;
}

interface KeyboardShortcut {
  key: string;
  description: string;
  handler: () => void;
}

export const useKeyboardNavigation = (handlers: KeyboardHandlers) => {
  const {
    onPrevious,
    onNext,
    onFlip,
    onFullscreen,
    onExit,
  } = handlers;

  // Obsługa wydarzeń klawiatury
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!isBrowser) return;
    
    // Sprawdzenie czy focus nie jest na elemencie input/textarea
    const activeElement = document.activeElement;
    const isInputFocused = activeElement?.tagName === 'INPUT' || 
                          activeElement?.tagName === 'TEXTAREA' ||
                          activeElement?.getAttribute('contenteditable') === 'true';
    
    if (isInputFocused) return;

    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault();
        onPrevious?.();
        break;
      case 'ArrowRight':
        event.preventDefault();
        onNext?.();
        break;
      case ' ':
      case 'Enter':
        event.preventDefault();
        onFlip?.();
        break;
      case 'f':
      case 'F':
        event.preventDefault();
        onFullscreen?.();
        break;
      case 'Escape':
        event.preventDefault();
        onExit?.();
        break;
    }
  }, [onPrevious, onNext, onFlip, onFullscreen, onExit]);

  // Dodanie i usunięcie event listenera
  useEffect(() => {
    if (!isBrowser) return;
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Mapowanie klawiszy do opisów
  const shortcuts: KeyboardShortcut[] = [
    { key: '←/→', description: 'Nawigacja między fiszkami', handler: () => {} },
    { key: 'Spacja/Enter', description: 'Odwróć kartę', handler: () => {} },
    { key: 'F', description: 'Tryb pełnoekranowy', handler: () => {} },
    { key: 'ESC', description: 'Wyjście z trybu/zakończ', handler: () => {} },
  ];

  return {
    shortcuts,
  };
}; 