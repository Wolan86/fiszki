import { useState, useEffect, useCallback } from "react";

// Stan trybu pełnoekranowego
interface FullscreenState {
  isActive: boolean;
  isSupported: boolean;
  isTransitioning: boolean;
}

// Sprawdzenie czy jesteśmy w przeglądarce
const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';

export const useFullscreen = () => {
  const [fullscreenState, setFullscreenState] = useState<FullscreenState>({
    isActive: false,
    isSupported: isBrowser && !!document.documentElement.requestFullscreen,
    isTransitioning: false,
  });

  // Sprawdzenie aktualnego stanu fullscreen
  const checkFullscreenStatus = useCallback(() => {
    if (!isBrowser) return;
    
    const isCurrentlyFullscreen = document.fullscreenElement !== null;
    setFullscreenState(prev => ({
      ...prev,
      isActive: isCurrentlyFullscreen,
      isTransitioning: false,
    }));
  }, []);

  // Obsługa zmian fullscreen
  useEffect(() => {
    if (!isBrowser) return;

    const handleFullscreenChange = () => {
      checkFullscreenStatus();
    };

    const handleFullscreenError = (event: Event) => {
      console.error('Fullscreen error:', event);
      setFullscreenState(prev => ({
        ...prev,
        isTransitioning: false,
      }));
    };

    // Różne prefiksy dla różnych przeglądarek
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    document.addEventListener('fullscreenerror', handleFullscreenError);
    document.addEventListener('webkitfullscreenerror', handleFullscreenError);
    document.addEventListener('mozfullscreenerror', handleFullscreenError);
    document.addEventListener('MSFullscreenError', handleFullscreenError);

    // Sprawdzenie początkowego stanu i wsparcia API
    const isSupported = !!(
      document.documentElement.requestFullscreen ||
      (document.documentElement as any).webkitRequestFullscreen ||
      (document.documentElement as any).mozRequestFullScreen ||
      (document.documentElement as any).msRequestFullscreen
    );

    setFullscreenState(prev => ({ ...prev, isSupported }));
    checkFullscreenStatus();

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);

      document.removeEventListener('fullscreenerror', handleFullscreenError);
      document.removeEventListener('webkitfullscreenerror', handleFullscreenError);
      document.removeEventListener('mozfullscreenerror', handleFullscreenError);
      document.removeEventListener('MSFullscreenError', handleFullscreenError);
    };
  }, [checkFullscreenStatus]);

  // Funkcja wejścia w tryb pełnoekranowy
  const enterFullscreen = useCallback(async () => {
    if (!isBrowser || !fullscreenState.isSupported || fullscreenState.isActive || fullscreenState.isTransitioning) {
      return;
    }

    setFullscreenState(prev => ({ ...prev, isTransitioning: true }));

    try {
      const docEl = document.documentElement;
      
      if (docEl.requestFullscreen) {
        await docEl.requestFullscreen();
      } else if ((docEl as any).webkitRequestFullscreen) {
        await (docEl as any).webkitRequestFullscreen();
      } else if ((docEl as any).mozRequestFullScreen) {
        await (docEl as any).mozRequestFullScreen();
      } else if ((docEl as any).msRequestFullscreen) {
        await (docEl as any).msRequestFullscreen();
      }
    } catch (error) {
      console.error('Error entering fullscreen:', error);
      setFullscreenState(prev => ({ ...prev, isTransitioning: false }));
    }
  }, [fullscreenState.isSupported, fullscreenState.isActive, fullscreenState.isTransitioning]);

  // Funkcja wyjścia z trybu pełnoekranowego
  const exitFullscreen = useCallback(async () => {
    if (!isBrowser || !fullscreenState.isActive || fullscreenState.isTransitioning) {
      return;
    }

    setFullscreenState(prev => ({ ...prev, isTransitioning: true }));

    try {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      } else if ((document as any).webkitExitFullscreen) {
        await (document as any).webkitExitFullscreen();
      } else if ((document as any).mozCancelFullScreen) {
        await (document as any).mozCancelFullScreen();
      } else if ((document as any).msExitFullscreen) {
        await (document as any).msExitFullscreen();
      }
    } catch (error) {
      console.error('Error exiting fullscreen:', error);
      setFullscreenState(prev => ({ ...prev, isTransitioning: false }));
    }
  }, [fullscreenState.isActive, fullscreenState.isTransitioning]);

  // Funkcja toggle
  const toggleFullscreen = useCallback(async () => {
    if (fullscreenState.isActive) {
      await exitFullscreen();
    } else {
      await enterFullscreen();
    }
  }, [fullscreenState.isActive, exitFullscreen, enterFullscreen]);

  return {
    ...fullscreenState,
    enterFullscreen,
    exitFullscreen,
    toggleFullscreen,
  };
}; 