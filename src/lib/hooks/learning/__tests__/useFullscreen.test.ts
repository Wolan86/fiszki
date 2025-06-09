import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach, type MockInstance } from 'vitest';
import { useFullscreen } from '../useFullscreen';

// Mock the fullscreen API
const mockRequestFullscreen = vi.fn().mockResolvedValue(undefined);
const mockExitFullscreen = vi.fn().mockResolvedValue(undefined);

describe('useFullscreen', () => {
  let addEventListenerSpy: MockInstance;
  let removeEventListenerSpy: MockInstance;

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();
    mockRequestFullscreen.mockClear();
    mockExitFullscreen.mockClear();

    // Setup DOM spies
    addEventListenerSpy = vi.spyOn(document, 'addEventListener');
    removeEventListenerSpy = vi.spyOn(document, 'removeEventListener');

    // Mock fullscreen API on document
    Object.defineProperty(document, 'fullscreenEnabled', {
      value: true,
      writable: true,
      configurable: true
    });

    Object.defineProperty(document, 'fullscreenElement', {
      value: null,
      writable: true,
      configurable: true
    });

    Object.defineProperty(document, 'exitFullscreen', {
      value: mockExitFullscreen,
      writable: true,
      configurable: true
    });

    // Mock requestFullscreen on a test element
    Element.prototype.requestFullscreen = mockRequestFullscreen;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('initialization', () => {
    it('should initialize with correct default state when fullscreen is supported', () => {
      const { result } = renderHook(() => useFullscreen());

      expect(result.current.isActive).toBe(false);
      expect(result.current.isSupported).toBe(true);
      expect(result.current.isTransitioning).toBe(false);
    });

    it('should initialize with isSupported false when fullscreen is not supported', () => {
      // Remove fullscreen support
      Object.defineProperty(document, 'fullscreenEnabled', {
        value: false,
        writable: true,
        configurable: true
      });
      delete (Element.prototype as any).requestFullscreen;

      const { result } = renderHook(() => useFullscreen());

      expect(result.current.isSupported).toBe(false);
    });
  });

  describe('event listeners', () => {
    it('should add event listeners on mount', () => {
      renderHook(() => useFullscreen());

      expect(addEventListenerSpy).toHaveBeenCalledWith('fullscreenchange', expect.any(Function));
      expect(addEventListenerSpy).toHaveBeenCalledWith('fullscreenerror', expect.any(Function));
    });

    it('should remove event listeners on unmount', () => {
      const { unmount } = renderHook(() => useFullscreen());

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith('fullscreenchange', expect.any(Function));
      expect(removeEventListenerSpy).toHaveBeenCalledWith('fullscreenerror', expect.any(Function));
    });
  });

  describe('fullscreen state detection', () => {
    it('should detect when fullscreen is active', () => {
      const { result } = renderHook(() => useFullscreen());

      // Simulate fullscreen change
      Object.defineProperty(document, 'fullscreenElement', {
        value: document.createElement('div'),
        writable: true,
        configurable: true
      });

      // Trigger fullscreen change event
      act(() => {
        const fullscreenChangeHandler = addEventListenerSpy.mock.calls.find(
          call => call[0] === 'fullscreenchange'
        )?.[1] as EventListener;
        
        if (fullscreenChangeHandler) {
          fullscreenChangeHandler(new Event('fullscreenchange'));
        }
      });

      expect(result.current.isActive).toBe(true);
    });
  });

  describe('entering fullscreen', () => {
    it('should enter fullscreen successfully', async () => {
      const { result } = renderHook(() => useFullscreen());

      await act(async () => {
        await result.current.enterFullscreen();
      });

      expect(mockRequestFullscreen).toHaveBeenCalledWith();
    });

    it('should handle fullscreen request errors', async () => {
      mockRequestFullscreen.mockRejectedValueOnce(new Error('Fullscreen failed'));
      
      const { result } = renderHook(() => useFullscreen());

      await act(async () => {
        await result.current.enterFullscreen();
      });

      expect(mockRequestFullscreen).toHaveBeenCalledWith();
      // Should not throw error
    });
  });

  describe('exiting fullscreen', () => {
    it('should exit fullscreen successfully', async () => {
      const { result } = renderHook(() => useFullscreen());

      // First simulate being in fullscreen
      Object.defineProperty(document, 'fullscreenElement', {
        value: document.createElement('div'),
        writable: true,
        configurable: true
      });

      // Trigger fullscreen change to update state
      act(() => {
        const fullscreenChangeHandler = addEventListenerSpy.mock.calls.find(
          call => call[0] === 'fullscreenchange'
        )?.[1] as EventListener;
        
        if (fullscreenChangeHandler) {
          fullscreenChangeHandler(new Event('fullscreenchange'));
        }
      });

      await act(async () => {
        await result.current.exitFullscreen();
      });

      expect(mockExitFullscreen).toHaveBeenCalledWith();
    });

    it('should handle exit fullscreen errors', async () => {
      mockExitFullscreen.mockRejectedValueOnce(new Error('Exit failed'));
      
      const { result } = renderHook(() => useFullscreen());

      // First simulate being in fullscreen
      Object.defineProperty(document, 'fullscreenElement', {
        value: document.createElement('div'),
        writable: true,
        configurable: true
      });

      // Trigger fullscreen change to update state
      act(() => {
        const fullscreenChangeHandler = addEventListenerSpy.mock.calls.find(
          call => call[0] === 'fullscreenchange'
        )?.[1] as EventListener;
        
        if (fullscreenChangeHandler) {
          fullscreenChangeHandler(new Event('fullscreenchange'));
        }
      });

      await act(async () => {
        await result.current.exitFullscreen();
      });

      expect(mockExitFullscreen).toHaveBeenCalledWith();
      // Should not throw error
    });
  });

  describe('toggle functionality', () => {
    it('should toggle to fullscreen when not active', async () => {
      const { result } = renderHook(() => useFullscreen());

      await act(async () => {
        await result.current.toggleFullscreen();
      });

      expect(mockRequestFullscreen).toHaveBeenCalledWith();
    });

    it('should toggle out of fullscreen when active', async () => {
      const { result } = renderHook(() => useFullscreen());
      
      // Set fullscreen as active
      Object.defineProperty(document, 'fullscreenElement', {
        value: document.createElement('div'),
        writable: true,
        configurable: true
      });

      // Trigger fullscreen change to update state
      act(() => {
        const fullscreenChangeHandler = addEventListenerSpy.mock.calls.find(
          call => call[0] === 'fullscreenchange'
        )?.[1] as EventListener;
        
        if (fullscreenChangeHandler) {
          fullscreenChangeHandler(new Event('fullscreenchange'));
        }
      });

      await act(async () => {
        await result.current.toggleFullscreen();
      });

      expect(mockExitFullscreen).toHaveBeenCalledWith();
    });
  });

  describe('browser compatibility', () => {
    it('should work with webkit prefixed methods', async () => {
      // Remove standard methods
      delete (document as any).exitFullscreen;
      delete (Element.prototype as any).requestFullscreen;

      // Add webkit methods
      const mockWebkitExitFullscreen = vi.fn().mockResolvedValue(undefined);
      const mockWebkitRequestFullscreen = vi.fn().mockResolvedValue(undefined);

      Object.defineProperty(document, 'webkitExitFullscreen', {
        value: mockWebkitExitFullscreen,
        writable: true,
        configurable: true
      });

      (document.documentElement as any).webkitRequestFullscreen = mockWebkitRequestFullscreen;

      const { result } = renderHook(() => useFullscreen());

      await act(async () => {
        await result.current.enterFullscreen();
      });

      expect(mockWebkitRequestFullscreen).toHaveBeenCalledWith();
    });
  });
}); 