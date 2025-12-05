import { useState, useEffect, useRef } from 'react';

/**
 * Simplified tablet layout hook with stable rotation handling.
 *
 * Key principles:
 * 1. Single source of truth for layout detection
 * 2. Debounced updates to prevent thrashing
 * 3. Respects ScrollSnap's is-resizing class
 */

const DEBOUNCE_MS = 150;

// Touch device detection
const detectTouchDevice = () => {
  if (typeof window === 'undefined') return false;
  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    navigator.msMaxTouchPoints > 0 ||
    (window.matchMedia && window.matchMedia('(pointer: coarse)').matches)
  );
};

// Layout detection
const detectLayoutMode = () => {
  if (typeof window === 'undefined') {
    return { mode: 'desktop', isPortrait: true, width: 1024, height: 768, isTouchDevice: false };
  }

  const width = window.visualViewport?.width ?? window.innerWidth;
  const height = window.visualViewport?.height ?? window.innerHeight;
  const isTouchDevice = detectTouchDevice();

  let isPortrait = height > width;
  if (window.matchMedia) {
    isPortrait = window.matchMedia('(orientation: portrait)').matches;
  }

  const isTabletSize = width >= 600 && width <= 1400;
  const isTabletDevice = isTouchDevice && isTabletSize;

  let mode = 'desktop';
  if (isTabletDevice) {
    mode = isPortrait ? 'tablet-portrait' : 'tablet-landscape';
  }

  return { mode, isPortrait, width, height, isTouchDevice };
};

export function useTabletLayout() {
  const [layout, setLayout] = useState(detectLayoutMode);
  const [isRotating, setIsRotating] = useState(false);

  const debounceRef = useRef(null);
  const frozenModeRef = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const update = () => {
      // Check if ScrollSnap is handling rotation
      const rotating = document.documentElement.classList.contains('is-resizing');

      if (rotating) {
        // Freeze current mode during rotation
        if (!frozenModeRef.current) {
          frozenModeRef.current = layout.mode;
        }
        setIsRotating(true);

        // Schedule check for when rotation ends
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(update, DEBOUNCE_MS);
        return;
      }

      // Rotation complete - update layout
      frozenModeRef.current = null;
      setIsRotating(false);
      setLayout(detectLayoutMode());
    };

    const debouncedUpdate = () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(update, DEBOUNCE_MS);
    };

    // Single handler for all resize-like events
    window.addEventListener('resize', debouncedUpdate, { passive: true });
    window.addEventListener('orientationchange', debouncedUpdate, { passive: true });

    // matchMedia is most reliable for orientation
    const mq = window.matchMedia?.('(orientation: portrait)');
    if (mq?.addEventListener) {
      mq.addEventListener('change', debouncedUpdate);
    }

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      window.removeEventListener('resize', debouncedUpdate);
      window.removeEventListener('orientationchange', debouncedUpdate);
      if (mq?.removeEventListener) {
        mq.removeEventListener('change', debouncedUpdate);
      }
    };
  }, []); // Empty deps - handlers are stable

  // Use frozen mode during rotation
  const effectiveMode = isRotating && frozenModeRef.current
    ? frozenModeRef.current
    : layout.mode;

  return {
    mode: effectiveMode,
    isDesktop: effectiveMode === 'desktop',
    isTabletPortrait: effectiveMode === 'tablet-portrait',
    isTabletLandscape: effectiveMode === 'tablet-landscape',
    isTablet: effectiveMode.startsWith('tablet'),
    width: layout.width,
    height: layout.height,
    isPortrait: layout.isPortrait,
    isRotating,
    isTouchDevice: layout.isTouchDevice,
  };
}

export default useTabletLayout;
