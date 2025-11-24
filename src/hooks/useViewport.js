import { useState, useEffect, useRef } from 'react';

/**
 * Shared viewport hook that provides consistent viewport state across all components.
 * Prevents layout thrashing by debouncing resize events and providing stable state.
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
    };
  });

  const resizeTimeoutRef = useRef(null);
  const isUpdatingRef = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const updateViewport = () => {
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
      });

      // Allow next update after a brief delay
      setTimeout(() => {
        isUpdatingRef.current = false;
      }, 50);
    };

    const debouncedUpdate = () => {
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
      resizeTimeoutRef.current = setTimeout(updateViewport, 100);
    };

    // Immediate update for orientation changes (critical for stability)
    const handleOrientationChange = () => {
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
      // Small delay to let browser finish orientation change
      setTimeout(updateViewport, 50);
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

