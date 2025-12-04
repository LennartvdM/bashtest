import { useState, useEffect, useRef } from 'react';

// Match the timing constant from ScrollSnap.jsx
const ROTATION_SETTLE_MS = 400;

/**
 * Shared viewport hook that provides consistent viewport state across all components.
 * Prevents layout thrashing by debouncing resize events and providing stable state.
 * CRITICAL: Respects is-resizing state to prevent state updates during rotation.
 */
export function useViewport() {
  const [viewportState, setViewportState] = useState(() => {
    if (typeof window === 'undefined') {
      return {
        isTablet: false,
        isTouchDevice: false,
        width: 0,
        height: 0,
        isPortrait: true,
        isLandscape: false,
        aspectRatio: 1,
        isRotating: false,
      };
    }

    const isTouchDevice =
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      navigator.msMaxTouchPoints > 0;

    // Use visualViewport API for accurate height (critical for mobile Safari)
    // visualViewport.height reflects true visible area during rotation/UI transitions
    const viewportHeight = window.visualViewport?.height ?? window.innerHeight;
    const viewportWidth = window.visualViewport?.width ?? window.innerWidth;
    const width = viewportWidth;
    const height = viewportHeight;
    const isTablet = isTouchDevice && width >= 600 && width <= 1400;
    const isPortrait = height > width;

    return {
      isTablet,
      isTouchDevice,
      width,
      height,
      isPortrait,
      isLandscape: !isPortrait,
      aspectRatio: width > 0 ? width / height : 1,
      isRotating: false,
    };
  });

  const resizeTimeoutRef = useRef(null);
  const isUpdatingRef = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Helper to check if rotation is in progress
    const isCurrentlyRotating = () => {
      return document.documentElement.classList.contains('is-resizing');
    };

    const updateViewport = () => {
      // CRITICAL: Skip updates during rotation to prevent layout thrashing
      // The ScrollSnap component manages state during rotation
      if (isCurrentlyRotating()) {
        // Just update the isRotating flag
        setViewportState(prev => prev.isRotating ? prev : { ...prev, isRotating: true });
        return;
      }

      // Prevent multiple simultaneous updates
      if (isUpdatingRef.current) return;
      isUpdatingRef.current = true;

      const isTouchDevice =
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        navigator.msMaxTouchPoints > 0;

      // Use visualViewport API for accurate height (critical for mobile Safari)
      // visualViewport.height reflects true visible area during rotation/UI transitions
      const viewportHeight = window.visualViewport?.height ?? window.innerHeight;
      const viewportWidth = window.visualViewport?.width ?? window.innerWidth;
      const width = viewportWidth;
      const height = viewportHeight;
      const isTablet = isTouchDevice && width >= 600 && width <= 1400;
      const isPortrait = height > width;

      setViewportState({
        isTablet,
        isTouchDevice,
        width,
        height,
        isPortrait,
        isLandscape: !isPortrait,
        aspectRatio: width > 0 ? width / height : 1,
        isRotating: false,
      });

      // Allow next update after a brief delay
      setTimeout(() => {
        isUpdatingRef.current = false;
      }, 50);
    };

    const debouncedUpdate = () => {
      // Skip if currently rotating - wait for rotation to settle
      if (isCurrentlyRotating()) {
        if (resizeTimeoutRef.current) clearTimeout(resizeTimeoutRef.current);
        // Update isRotating state
        setViewportState(prev => prev.isRotating ? prev : { ...prev, isRotating: true });
        return;
      }

      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
      resizeTimeoutRef.current = setTimeout(updateViewport, 100);
    };

    // For orientation changes, wait for ScrollSnap's rotation handling to complete
    const handleOrientationChange = () => {
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
      // Mark as rotating immediately
      setViewportState(prev => prev.isRotating ? prev : { ...prev, isRotating: true });
      // Wait for rotation to settle (match ScrollSnap's timing + buffer)
      resizeTimeoutRef.current = setTimeout(updateViewport, ROTATION_SETTLE_MS + 100);
    };

    // Use matchMedia for orientation (more reliable)
    let portraitQuery = null;
    if (window.matchMedia) {
      portraitQuery = window.matchMedia('(orientation: portrait)');
      if (portraitQuery.addEventListener) {
        portraitQuery.addEventListener('change', handleOrientationChange);
      } else if (portraitQuery.addListener) {
        portraitQuery.addListener(handleOrientationChange);
      }
    }

    // Debounced resize handler
    window.addEventListener('resize', debouncedUpdate, { passive: true });
    window.addEventListener('orientationchange', handleOrientationChange, { passive: true });

    // Listen to visualViewport changes (more accurate for mobile Safari)
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', debouncedUpdate);
      window.visualViewport.addEventListener('scroll', debouncedUpdate);
    }

    // Initial update
    updateViewport();

    return () => {
      window.removeEventListener('resize', debouncedUpdate);
      window.removeEventListener('orientationchange', handleOrientationChange);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', debouncedUpdate);
        window.visualViewport.removeEventListener('scroll', debouncedUpdate);
      }
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
      if (portraitQuery) {
        if (portraitQuery.removeEventListener) {
          portraitQuery.removeEventListener('change', handleOrientationChange);
        } else if (portraitQuery.removeListener) {
          portraitQuery.removeListener(handleOrientationChange);
        }
      }
    };
  }, []);

  return viewportState;
}

