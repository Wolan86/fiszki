import { useState, useEffect, useCallback } from "react";

// Stan trybu pełnoekranowego
interface FullscreenState {
  isActive: boolean;
  isSupported: boolean;
  isTransitioning: boolean;
}

// Rozszerzenie interfejsu Document dla API fullscreen
interface FullscreenDocument extends Document {
  webkitExitFullscreen?: () => Promise<void>;
  mozCancelFullScreen?: () => Promise<void>;
  msExitFullscreen?: () => Promise<void>;
}

// Rozszerzenie interfejsu HTMLElement dla API fullscreen
interface FullscreenElement extends HTMLElement {
  webkitRequestFullscreen?: () => Promise<void>;
  mozRequestFullScreen?: () => Promise<void>;
  msRequestFullscreen?: () => Promise<void>;
}

// Sprawdzenie czy jesteśmy w przeglądarce
const isBrowser = typeof window !== "undefined" && typeof document !== "undefined";

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
    setFullscreenState((prev) => ({
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
      // Replaced console.error with state update to handle error gracefully
      setFullscreenState((prev) => ({
        ...prev,
        isTransitioning: false,
      }));
      // Optional: You can add custom error handling here if needed
      if (process.env.NODE_ENV === "development") {
        // eslint-disable-next-line no-console
        console.error("Fullscreen error:", event);
      }
    };

    // Różne prefiksy dla różnych przeglądarek
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("mozfullscreenchange", handleFullscreenChange);
    document.addEventListener("MSFullscreenChange", handleFullscreenChange);

    document.addEventListener("fullscreenerror", handleFullscreenError);
    document.addEventListener("webkitfullscreenerror", handleFullscreenError);
    document.addEventListener("mozfullscreenerror", handleFullscreenError);
    document.addEventListener("MSFullscreenError", handleFullscreenError);

    // Sprawdzenie początkowego stanu i wsparcia API
    const docElement = document.documentElement as FullscreenElement;
    const isSupported = !!(
      document.documentElement.requestFullscreen ||
      docElement.webkitRequestFullscreen ||
      docElement.mozRequestFullScreen ||
      docElement.msRequestFullscreen
    );

    setFullscreenState((prev) => ({ ...prev, isSupported }));
    checkFullscreenStatus();

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
      document.removeEventListener("mozfullscreenchange", handleFullscreenChange);
      document.removeEventListener("MSFullscreenChange", handleFullscreenChange);

      document.removeEventListener("fullscreenerror", handleFullscreenError);
      document.removeEventListener("webkitfullscreenerror", handleFullscreenError);
      document.removeEventListener("mozfullscreenerror", handleFullscreenError);
      document.removeEventListener("MSFullscreenError", handleFullscreenError);
    };
  }, [checkFullscreenStatus]);

  // Funkcja wejścia w tryb pełnoekranowy
  const enterFullscreen = useCallback(async () => {
    if (!isBrowser || !fullscreenState.isSupported || fullscreenState.isActive || fullscreenState.isTransitioning) {
      return;
    }

    setFullscreenState((prev) => ({ ...prev, isTransitioning: true }));

    try {
      const docEl = document.documentElement as FullscreenElement;

      if (docEl.requestFullscreen) {
        await docEl.requestFullscreen();
      } else if (docEl.webkitRequestFullscreen) {
        await docEl.webkitRequestFullscreen();
      } else if (docEl.mozRequestFullScreen) {
        await docEl.mozRequestFullScreen();
      } else if (docEl.msRequestFullscreen) {
        await docEl.msRequestFullscreen();
      }
    } catch (error) {
      setFullscreenState((prev) => ({ ...prev, isTransitioning: false }));
      // Optional: You can add custom error handling here if needed
      if (process.env.NODE_ENV === "development") {
        // eslint-disable-next-line no-console
        console.error("Error entering fullscreen:", error);
      }
    }
  }, [fullscreenState.isSupported, fullscreenState.isActive, fullscreenState.isTransitioning]);

  // Funkcja wyjścia z trybu pełnoekranowego
  const exitFullscreen = useCallback(async () => {
    if (!isBrowser || !fullscreenState.isActive || fullscreenState.isTransitioning) {
      return;
    }

    setFullscreenState((prev) => ({ ...prev, isTransitioning: true }));

    try {
      const doc = document as FullscreenDocument;

      if (document.exitFullscreen) {
        await document.exitFullscreen();
      } else if (doc.webkitExitFullscreen) {
        await doc.webkitExitFullscreen();
      } else if (doc.mozCancelFullScreen) {
        await doc.mozCancelFullScreen();
      } else if (doc.msExitFullscreen) {
        await doc.msExitFullscreen();
      }
    } catch (error) {
      setFullscreenState((prev) => ({ ...prev, isTransitioning: false }));
      // Optional: You can add custom error handling here if needed
      if (process.env.NODE_ENV === "development") {
        // eslint-disable-next-line no-console
        console.error("Error exiting fullscreen:", error);
      }
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
