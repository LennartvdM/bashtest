import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Unified tablet layout hook that provides stable layout state during rotation.
 *
 * Key principles:
 * 1. Layout state is FROZEN during rotation (while is-resizing class is present)
 * 2. Layout only updates AFTER rotation settles (400ms + buffer)
 * 3. Returns stable CSS custom property values for responsive sizing
 * 4. Distinguishes between portrait tablet, landscape tablet, and desktop
 */

const ROTATION_SETTLE_MS = 400;
const ROTATION_BUFFER_MS = 100;

// Touch device detection (cached)
const detectTouchDevice = () => {
  if (typeof window === 'undefined') return false;
  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    navigator.msMaxTouchPoints > 0
  );
};

// Layout detection (called only when safe to update)
const detectLayoutMode = (isTouchDevice) => {
  if (typeof window === 'undefined') {
    return { mode: 'desktop', isPortrait: true, width: 1024, height: 768 };
  }

  const width = window.visualViewport?.width ?? window.innerWidth;
  const height = window.visualViewport?.height ?? window.innerHeight;

  // Use matchMedia for orientation (most reliable)
  let isPortrait = height > width;
  if (window.matchMedia) {
    const portraitQuery = window.matchMedia('(orientation: portrait)');
    isPortrait = portraitQuery.matches;
  }

  // Tablet detection: touch device with width in tablet range
  const isTabletDevice = isTouchDevice && width >= 600 && width <= 1400;

  let mode = 'desktop';
  if (isTabletDevice) {
    mode = isPortrait ? 'tablet-portrait' : 'tablet-landscape';
  }

  return { mode, isPortrait, width, height };
};

export function useTabletLayout() {
  const isTouchDevice = useRef(detectTouchDevice()).current;

  const [layoutState, setLayoutState] = useState(() => {
    const initial = detectLayoutMode(isTouchDevice);
    return {
      ...initial,
      isRotating: false,
      // Frozen values during rotation
      frozenMode: null,
    };
  });

  const updateTimeoutRef = useRef(null);
  const isRotatingRef = useRef(false);

  // Check if currently in rotation
  const isCurrentlyRotating = useCallback(() => {
    return document.documentElement.classList.contains('is-resizing');
  }, []);

  // Safe update function (only called when rotation is complete)
  const performUpdate = useCallback(() => {
    if (isCurrentlyRotating()) {
      // Still rotating, schedule another check
      if (updateTimeoutRef.current) clearTimeout(updateTimeoutRef.current);
      updateTimeoutRef.current = setTimeout(performUpdate, 50);
      return;
    }

    isRotatingRef.current = false;
    const newLayout = detectLayoutMode(isTouchDevice);

    setLayoutState(prev => ({
      ...newLayout,
      isRotating: false,
      frozenMode: null,
    }));
  }, [isTouchDevice, isCurrentlyRotating]);

  // Start rotation - freeze current state
  const startRotation = useCallback(() => {
    if (isRotatingRef.current) return;
    isRotatingRef.current = true;

    setLayoutState(prev => ({
      ...prev,
      isRotating: true,
      frozenMode: prev.mode, // Remember current mode during rotation
    }));

    // Clear any pending update
    if (updateTimeoutRef.current) clearTimeout(updateTimeoutRef.current);
  }, []);

  // End rotation - schedule update after settle time
  const endRotation = useCallback(() => {
    if (updateTimeoutRef.current) clearTimeout(updateTimeoutRef.current);
    updateTimeoutRef.current = setTimeout(performUpdate, ROTATION_SETTLE_MS + ROTATION_BUFFER_MS);
  }, [performUpdate]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      if (isCurrentlyRotating()) {
        startRotation();
        endRotation();
      } else if (!isRotatingRef.current) {
        // Normal resize (not rotation), update immediately with debounce
        if (updateTimeoutRef.current) clearTimeout(updateTimeoutRef.current);
        updateTimeoutRef.current = setTimeout(performUpdate, 100);
      }
    };

    const handleOrientationChange = () => {
      startRotation();
      endRotation();
    };

    // Listen for resize events
    window.addEventListener('resize', handleResize, { passive: true });
    window.addEventListener('orientationchange', handleOrientationChange, { passive: true });

    // Listen for visualViewport changes (mobile Safari)
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize);
    }

    // Listen for matchMedia orientation changes
    let portraitQuery = null;
    if (window.matchMedia) {
      portraitQuery = window.matchMedia('(orientation: portrait)');
      if (portraitQuery.addEventListener) {
        portraitQuery.addEventListener('change', handleOrientationChange);
      } else if (portraitQuery.addListener) {
        portraitQuery.addListener(handleOrientationChange);
      }
    }

    return () => {
      if (updateTimeoutRef.current) clearTimeout(updateTimeoutRef.current);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleResize);
      }
      if (portraitQuery) {
        if (portraitQuery.removeEventListener) {
          portraitQuery.removeEventListener('change', handleOrientationChange);
        } else if (portraitQuery.removeListener) {
          portraitQuery.removeListener(handleOrientationChange);
        }
      }
    };
  }, [startRotation, endRotation, performUpdate, isCurrentlyRotating]);

  // Derived values - use frozen mode during rotation for stability
  const effectiveMode = layoutState.isRotating && layoutState.frozenMode
    ? layoutState.frozenMode
    : layoutState.mode;

  return {
    // Layout mode: 'desktop' | 'tablet-portrait' | 'tablet-landscape'
    mode: effectiveMode,

    // Boolean helpers for easy conditional checks
    isDesktop: effectiveMode === 'desktop',
    isTabletPortrait: effectiveMode === 'tablet-portrait',
    isTabletLandscape: effectiveMode === 'tablet-landscape',
    isTablet: effectiveMode === 'tablet-portrait' || effectiveMode === 'tablet-landscape',

    // Raw values (may change during rotation)
    width: layoutState.width,
    height: layoutState.height,
    isPortrait: layoutState.isPortrait,

    // Rotation state
    isRotating: layoutState.isRotating,

    // Touch device detection
    isTouchDevice,
  };
}

export default useTabletLayout;
