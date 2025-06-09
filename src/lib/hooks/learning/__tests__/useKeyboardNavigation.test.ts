import { renderHook } from '@testing-library/react';
import { beforeEach, afterEach, describe, expect, it, vi, type Mock, type MockInstance } from 'vitest';
import { useKeyboardNavigation } from '../useKeyboardNavigation';

describe('useKeyboardNavigation', () => {
  let mockHandlers: {
    onNext: Mock;
    onPrevious: Mock;
    onFlip: Mock;
    onFullscreen: Mock;
    onExit: Mock;
  };

  let addEventListenerSpy: MockInstance<any>;
  let removeEventListenerSpy: MockInstance<any>;

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();

    // Create fresh mock handlers
    mockHandlers = {
      onNext: vi.fn(),
      onPrevious: vi.fn(),
      onFlip: vi.fn(),
      onFullscreen: vi.fn(),
      onExit: vi.fn(),
    };

    // Mock window event listeners
    addEventListenerSpy = vi.spyOn(window, 'addEventListener');
    removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // Helper function to create mock DOM elements
  const createMockElement = (tagName: string, contenteditable?: string) => ({
    tagName,
    getAttribute: vi.fn().mockImplementation((attr: string) => {
      if (attr === 'contenteditable') return contenteditable;
      return null;
    }),
  });

  describe('Event Listener Registration', () => {
    it('should add keydown event listener on mount', () => {
      // Arrange & Act
      renderHook(() => useKeyboardNavigation(mockHandlers));

      // Assert
      expect(addEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
      expect(addEventListenerSpy).toHaveBeenCalledTimes(1);
    });

    it('should remove keydown event listener on unmount', () => {
      // Arrange
      const { unmount } = renderHook(() => useKeyboardNavigation(mockHandlers));

      // Act
      unmount();

      // Assert
      expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
      expect(removeEventListenerSpy).toHaveBeenCalledTimes(1);
    });

    it('should update event listener when handlers change', () => {
      // Arrange
      const { rerender } = renderHook(
        ({ handlers }) => useKeyboardNavigation(handlers),
        { initialProps: { handlers: mockHandlers } }
      );

      // Act - re-render with new handlers
      const newHandlers = { ...mockHandlers, onNext: vi.fn() };
      rerender({ handlers: newHandlers });

      // Assert - should remove old listener and add new one
      expect(removeEventListenerSpy).toHaveBeenCalled();
      expect(addEventListenerSpy).toHaveBeenCalledTimes(2);
    });
  });

  describe('Key Mapping - Arrow Keys', () => {
    it('should call onNext when ArrowRight is pressed', () => {
      // Arrange
      renderHook(() => useKeyboardNavigation(mockHandlers));
      const keydownHandler = addEventListenerSpy.mock.calls[0][1] as (event: KeyboardEvent) => void;
      const mockEvent = {
        key: 'ArrowRight',
        preventDefault: vi.fn(),
      } as unknown as KeyboardEvent;

      // Act
      keydownHandler(mockEvent);

      // Assert
      expect(mockHandlers.onNext).toHaveBeenCalledTimes(1);
      expect(mockEvent.preventDefault).toHaveBeenCalled();
    });

    it('should call onPrevious when ArrowLeft is pressed', () => {
      // Arrange
      renderHook(() => useKeyboardNavigation(mockHandlers));
      const keydownHandler = addEventListenerSpy.mock.calls[0][1] as (event: KeyboardEvent) => void;
      const mockEvent = {
        key: 'ArrowLeft',
        preventDefault: vi.fn(),
      } as unknown as KeyboardEvent;

      // Act
      keydownHandler(mockEvent);

      // Assert
      expect(mockHandlers.onPrevious).toHaveBeenCalledTimes(1);
      expect(mockEvent.preventDefault).toHaveBeenCalled();
    });

    it('should not call handlers when ArrowUp/ArrowDown pressed', () => {
      // Arrange
      renderHook(() => useKeyboardNavigation(mockHandlers));
      const keydownHandler = addEventListenerSpy.mock.calls[0][1] as (event: KeyboardEvent) => void;

      // Act - test ArrowUp
      const mockEventUp = {
        key: 'ArrowUp',
        preventDefault: vi.fn(),
      } as unknown as KeyboardEvent;
      keydownHandler(mockEventUp);

      // Act - test ArrowDown
      const mockEventDown = {
        key: 'ArrowDown',
        preventDefault: vi.fn(),
      } as unknown as KeyboardEvent;
      keydownHandler(mockEventDown);

      // Assert
      expect(mockHandlers.onNext).not.toHaveBeenCalled();
      expect(mockHandlers.onPrevious).not.toHaveBeenCalled();
      expect(mockHandlers.onFlip).not.toHaveBeenCalled();
      expect(mockHandlers.onFullscreen).not.toHaveBeenCalled();
      expect(mockHandlers.onExit).not.toHaveBeenCalled();
    });
  });

  describe('Key Mapping - Flip Actions', () => {
    it('should call onFlip when Space is pressed', () => {
      // Arrange
      renderHook(() => useKeyboardNavigation(mockHandlers));
      const keydownHandler = addEventListenerSpy.mock.calls[0][1] as (event: KeyboardEvent) => void;
      const mockEvent = {
        key: ' ',
        preventDefault: vi.fn(),
      } as unknown as KeyboardEvent;

      // Act
      keydownHandler(mockEvent);

      // Assert
      expect(mockHandlers.onFlip).toHaveBeenCalledTimes(1);
      expect(mockEvent.preventDefault).toHaveBeenCalled();
    });

    it('should call onFlip when Enter is pressed', () => {
      // Arrange
      renderHook(() => useKeyboardNavigation(mockHandlers));
      const keydownHandler = addEventListenerSpy.mock.calls[0][1] as (event: KeyboardEvent) => void;
      const mockEvent = {
        key: 'Enter',
        preventDefault: vi.fn(),
      } as unknown as KeyboardEvent;

      // Act
      keydownHandler(mockEvent);

      // Assert
      expect(mockHandlers.onFlip).toHaveBeenCalledTimes(1);
      expect(mockEvent.preventDefault).toHaveBeenCalled();
    });
  });

  describe('Key Mapping - Special Actions', () => {
    it('should call onFullscreen when f is pressed', () => {
      // Arrange
      renderHook(() => useKeyboardNavigation(mockHandlers));
      const keydownHandler = addEventListenerSpy.mock.calls[0][1] as (event: KeyboardEvent) => void;
      const mockEvent = {
        key: 'f',
        preventDefault: vi.fn(),
      } as unknown as KeyboardEvent;

      // Act
      keydownHandler(mockEvent);

      // Assert
      expect(mockHandlers.onFullscreen).toHaveBeenCalledTimes(1);
      expect(mockEvent.preventDefault).toHaveBeenCalled();
    });

    it('should call onFullscreen when F is pressed', () => {
      // Arrange
      renderHook(() => useKeyboardNavigation(mockHandlers));
      const keydownHandler = addEventListenerSpy.mock.calls[0][1] as (event: KeyboardEvent) => void;
      const mockEvent = {
        key: 'F',
        preventDefault: vi.fn(),
      } as unknown as KeyboardEvent;

      // Act
      keydownHandler(mockEvent);

      // Assert
      expect(mockHandlers.onFullscreen).toHaveBeenCalledTimes(1);
      expect(mockEvent.preventDefault).toHaveBeenCalled();
    });

    it('should call onExit when Escape is pressed', () => {
      // Arrange
      renderHook(() => useKeyboardNavigation(mockHandlers));
      const keydownHandler = addEventListenerSpy.mock.calls[0][1] as (event: KeyboardEvent) => void;
      const mockEvent = {
        key: 'Escape',
        preventDefault: vi.fn(),
      } as unknown as KeyboardEvent;

      // Act
      keydownHandler(mockEvent);

      // Assert
      expect(mockHandlers.onExit).toHaveBeenCalledTimes(1);
      expect(mockEvent.preventDefault).toHaveBeenCalled();
    });
  });

  describe('Input Focus Detection', () => {
    it('should ignore keys when INPUT element is focused', () => {
      // Arrange
      const mockElement = createMockElement('INPUT');
      vi.spyOn(document, 'activeElement', 'get').mockReturnValue(mockElement as any);
      
      renderHook(() => useKeyboardNavigation(mockHandlers));
      const keydownHandler = addEventListenerSpy.mock.calls[0][1] as (event: KeyboardEvent) => void;

      // Act
      const mockEvent = {
        key: 'ArrowRight',
        preventDefault: vi.fn(),
      } as unknown as KeyboardEvent;
      keydownHandler(mockEvent);

      // Assert
      expect(mockHandlers.onNext).not.toHaveBeenCalled();
      expect(mockEvent.preventDefault).not.toHaveBeenCalled();
    });

    it('should ignore keys when TEXTAREA element is focused', () => {
      // Arrange
      const mockElement = createMockElement('TEXTAREA');
      vi.spyOn(document, 'activeElement', 'get').mockReturnValue(mockElement as any);
      
      renderHook(() => useKeyboardNavigation(mockHandlers));
      const keydownHandler = addEventListenerSpy.mock.calls[0][1] as (event: KeyboardEvent) => void;

      // Act
      const mockEvent = {
        key: 'ArrowRight',
        preventDefault: vi.fn(),
      } as unknown as KeyboardEvent;
      keydownHandler(mockEvent);

      // Assert
      expect(mockHandlers.onNext).not.toHaveBeenCalled();
      expect(mockEvent.preventDefault).not.toHaveBeenCalled();
    });

    it('should ignore keys when contenteditable element is focused', () => {
      // Arrange
      const mockElement = createMockElement('DIV', 'true');
      vi.spyOn(document, 'activeElement', 'get').mockReturnValue(mockElement as any);
      
      renderHook(() => useKeyboardNavigation(mockHandlers));
      const keydownHandler = addEventListenerSpy.mock.calls[0][1] as (event: KeyboardEvent) => void;

      // Act
      const mockEvent = {
        key: 'ArrowRight',
        preventDefault: vi.fn(),
      } as unknown as KeyboardEvent;
      keydownHandler(mockEvent);

      // Assert
      expect(mockHandlers.onNext).not.toHaveBeenCalled();
      expect(mockEvent.preventDefault).not.toHaveBeenCalled();
    });

    it('should process keys when no element is focused', () => {
      // Arrange
      vi.spyOn(document, 'activeElement', 'get').mockReturnValue(null);
      
      renderHook(() => useKeyboardNavigation(mockHandlers));
      const keydownHandler = addEventListenerSpy.mock.calls[0][1] as (event: KeyboardEvent) => void;

      // Act
      const mockEvent = {
        key: 'ArrowRight',
        preventDefault: vi.fn(),
      } as unknown as KeyboardEvent;
      keydownHandler(mockEvent);

      // Assert
      expect(mockHandlers.onNext).toHaveBeenCalledTimes(1);
      expect(mockEvent.preventDefault).toHaveBeenCalled();
    });

    it('should process keys when non-input element is focused', () => {
      // Arrange
      const mockElement = createMockElement('BUTTON');
      vi.spyOn(document, 'activeElement', 'get').mockReturnValue(mockElement as any);
      
      renderHook(() => useKeyboardNavigation(mockHandlers));
      const keydownHandler = addEventListenerSpy.mock.calls[0][1] as (event: KeyboardEvent) => void;

      // Act
      const mockEvent = {
        key: 'ArrowRight',
        preventDefault: vi.fn(),
      } as unknown as KeyboardEvent;
      keydownHandler(mockEvent);

      // Assert
      expect(mockHandlers.onNext).toHaveBeenCalledTimes(1);
      expect(mockEvent.preventDefault).toHaveBeenCalled();
    });

    it('should process keys when contenteditable is false', () => {
      // Arrange
      const mockElement = createMockElement('DIV', 'false');
      vi.spyOn(document, 'activeElement', 'get').mockReturnValue(mockElement as any);
      
      renderHook(() => useKeyboardNavigation(mockHandlers));
      const keydownHandler = addEventListenerSpy.mock.calls[0][1] as (event: KeyboardEvent) => void;

      // Act
      const mockEvent = {
        key: 'ArrowRight',
        preventDefault: vi.fn(),
      } as unknown as KeyboardEvent;
      keydownHandler(mockEvent);

      // Assert
      expect(mockHandlers.onNext).toHaveBeenCalledTimes(1);
      expect(mockEvent.preventDefault).toHaveBeenCalled();
    });
  });

  describe('Handler Optionality', () => {
    it('should not error when onNext handler is undefined', () => {
      // Arrange
      const handlersWithoutNext = { ...mockHandlers, onNext: undefined };
      renderHook(() => useKeyboardNavigation(handlersWithoutNext));
      const keydownHandler = addEventListenerSpy.mock.calls[0][1] as (event: KeyboardEvent) => void;

      // Act & Assert
      expect(() => {
        const mockEvent = {
          key: 'ArrowRight',
          preventDefault: vi.fn(),
        } as unknown as KeyboardEvent;
        keydownHandler(mockEvent);
      }).not.toThrow();
    });

    it('should not error when onPrevious handler is undefined', () => {
      // Arrange
      const handlersWithoutPrev = { ...mockHandlers, onPrevious: undefined };
      renderHook(() => useKeyboardNavigation(handlersWithoutPrev));
      const keydownHandler = addEventListenerSpy.mock.calls[0][1] as (event: KeyboardEvent) => void;

      // Act & Assert
      expect(() => {
        const mockEvent = {
          key: 'ArrowLeft',
          preventDefault: vi.fn(),
        } as unknown as KeyboardEvent;
        keydownHandler(mockEvent);
      }).not.toThrow();
    });

    it('should not error when onFlip handler is undefined', () => {
      // Arrange
      const handlersWithoutFlip = { ...mockHandlers, onFlip: undefined };
      renderHook(() => useKeyboardNavigation(handlersWithoutFlip));
      const keydownHandler = addEventListenerSpy.mock.calls[0][1] as (event: KeyboardEvent) => void;

      // Act & Assert
      expect(() => {
        const mockEvent = {
          key: ' ',
          preventDefault: vi.fn(),
        } as unknown as KeyboardEvent;
        keydownHandler(mockEvent);
      }).not.toThrow();
    });

    it('should not error when onFullscreen handler is undefined', () => {
      // Arrange
      const handlersWithoutFullscreen = { ...mockHandlers, onFullscreen: undefined };
      renderHook(() => useKeyboardNavigation(handlersWithoutFullscreen));
      const keydownHandler = addEventListenerSpy.mock.calls[0][1] as (event: KeyboardEvent) => void;

      // Act & Assert
      expect(() => {
        const mockEvent = {
          key: 'f',
          preventDefault: vi.fn(),
        } as unknown as KeyboardEvent;
        keydownHandler(mockEvent);
      }).not.toThrow();
    });

    it('should not error when onExit handler is undefined', () => {
      // Arrange
      const handlersWithoutExit = { ...mockHandlers, onExit: undefined };
      renderHook(() => useKeyboardNavigation(handlersWithoutExit));
      const keydownHandler = addEventListenerSpy.mock.calls[0][1] as (event: KeyboardEvent) => void;

      // Act & Assert
      expect(() => {
        const mockEvent = {
          key: 'Escape',
          preventDefault: vi.fn(),
        } as unknown as KeyboardEvent;
        keydownHandler(mockEvent);
      }).not.toThrow();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty handlers object', () => {
      // Arrange & Act & Assert
      expect(() => {
        renderHook(() => useKeyboardNavigation({}));
      }).not.toThrow();
    });

    it('should ignore unknown key presses', () => {
      // Arrange
      renderHook(() => useKeyboardNavigation(mockHandlers));
      const keydownHandler = addEventListenerSpy.mock.calls[0][1] as (event: KeyboardEvent) => void;
      const mockEvent = {
        key: 'UnknownKey',
        preventDefault: vi.fn(),
      } as unknown as KeyboardEvent;

      // Act
      keydownHandler(mockEvent);

      // Assert
      expect(mockHandlers.onNext).not.toHaveBeenCalled();
      expect(mockHandlers.onPrevious).not.toHaveBeenCalled();
      expect(mockHandlers.onFlip).not.toHaveBeenCalled();
      expect(mockHandlers.onFullscreen).not.toHaveBeenCalled();
      expect(mockHandlers.onExit).not.toHaveBeenCalled();
      expect(mockEvent.preventDefault).not.toHaveBeenCalled();
    });
  });
});

// Separate describe block for shortcuts documentation to avoid spy conflicts
describe('useKeyboardNavigation - Shortcuts Documentation', () => {
  let mockHandlers: {
    onNext: Mock;
    onPrevious: Mock;
    onFlip: Mock;
    onFullscreen: Mock;
    onExit: Mock;
  };

  beforeEach(() => {
    mockHandlers = {
      onNext: vi.fn(),
      onPrevious: vi.fn(),
      onFlip: vi.fn(),
      onFullscreen: vi.fn(),
      onExit: vi.fn(),
    };
  });

  it('should return keyboard shortcuts documentation', () => {
    // Arrange & Act
    const { result } = renderHook(() => useKeyboardNavigation(mockHandlers));

    // Assert
    expect(result.current.shortcuts).toBeDefined();
    expect(Array.isArray(result.current.shortcuts)).toBe(true);
    expect(result.current.shortcuts.length).toBeGreaterThan(0);
    
    // Check structure of shortcuts
    result.current.shortcuts.forEach(shortcut => {
      expect(shortcut).toHaveProperty('key');
      expect(shortcut).toHaveProperty('description');
      expect(shortcut).toHaveProperty('handler');
      expect(typeof shortcut.key).toBe('string');
      expect(typeof shortcut.description).toBe('string');
      expect(typeof shortcut.handler).toBe('function');
    });
  });

  it('should maintain shortcuts structure across re-renders', () => {
    // Arrange
    const { result, rerender } = renderHook(() => useKeyboardNavigation(mockHandlers));
    const initialShortcuts = result.current.shortcuts;

    // Act
    rerender();

    // Assert
    expect(result.current.shortcuts).toHaveLength(initialShortcuts.length);
    result.current.shortcuts.forEach((shortcut, index) => {
      expect(shortcut.key).toBe(initialShortcuts[index].key);
      expect(shortcut.description).toBe(initialShortcuts[index].description);
      expect(typeof shortcut.handler).toBe('function');
    });
  });
}); 