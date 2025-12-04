import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useViewport } from '../hooks/useViewport';

const NAV_FALLBACK = 60;

const BREAKPOINT_WIDTH = 1024; // Align with desktop breakpoint for Tailwind (lg)

// Single source of truth for rotation timing - all components should respect this
const ROTATION_SETTLE_MS = 400;

const ScrollSnap = ({ children }) => {
  const containerRef = useRef(null);
  const sectionsRef = useRef([]);
  const currentIndexRef = useRef(0);
  const resizeTimeoutRef = useRef(null);
  const isResizingRef = useRef(false);
  const preservedSectionIndexRef = useRef(null); // Preserve discrete section index during rotation
  const frozenHeightRef = useRef(null); // Store pre-rotation height to freeze sections
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sectionCount, setSectionCount] = useState(0);
  const [isRotating, setIsRotating] = useState(false); // Track rotation state for CSS
  const { isTablet } = useViewport();
  const [currentBreakpoint, setCurrentBreakpoint] = useState(() => {
    if (typeof window === 'undefined') return 'desktop';
    return window.innerWidth >= BREAKPOINT_WIDTH ? 'desktop' : 'tablet';
  });

  const navHeight = useCallback(() => {
    if (typeof window === 'undefined') return NAV_FALLBACK;
    const raw = getComputedStyle(document.documentElement).getPropertyValue('--nav-h');
    const parsed = parseFloat(raw);
    return Number.isFinite(parsed) ? parsed : NAV_FALLBACK;
  }, []);

  const snapToActiveSection = useCallback(() => {
    const container = containerRef.current;
    const activeSection = sectionsRef.current[currentIndexRef.current];
    if (!container || !activeSection) return;

    const destination = activeSection.offsetTop - navHeight();
    container.scrollTo({ top: destination, behavior: 'auto' });
  }, [navHeight]);

  const refreshSections = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    sectionsRef.current = Array.from(container.querySelectorAll('section[id]'));
    const count = sectionsRef.current.length;
    setSectionCount(count);

    const clamped = Math.max(0, Math.min(currentIndexRef.current, count - 1));
    currentIndexRef.current = clamped;
    setCurrentIndex(clamped);
  }, []);

  // Note: scheduleResnap removed - rotation handler is now the single source of truth
  // for scroll position restoration. This prevents racing between multiple handlers.

  const scrollToIndex = useCallback(
    (nextIndex) => {
      const container = containerRef.current;
      if (!container) return;

      const clamped = Math.max(0, Math.min(nextIndex, sectionsRef.current.length - 1));
      const target = sectionsRef.current[clamped];
      if (!target) return;

      setCurrentIndex(clamped);
      currentIndexRef.current = clamped;
      const destination = target.offsetTop - navHeight();
      container.scrollTo({ top: destination, behavior: 'auto' });
    },
    [navHeight]
  );

  // UNIFIED rotation/resize handler - single source of truth for scroll preservation
  // Consolidates all resize events into one handler with consistent timing
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let settleTimeout = null;
    let isHandlingRotation = false;

    const startRotation = () => {
      // Debounce rapid-fire events (resize can fire many times during rotation)
      if (isHandlingRotation) return;
      isHandlingRotation = true;

      // Store pre-rotation state
      isResizingRef.current = true;
      preservedSectionIndexRef.current = currentIndexRef.current;

      // Freeze current height BEFORE rotation changes it
      // This is the key fix: we store the actual pixel value, not a CSS variable reference
      const currentHeight = window.visualViewport?.height ?? window.innerHeight;
      frozenHeightRef.current = currentHeight;
      document.documentElement.style.setProperty('--frozen-viewport-height', `${currentHeight}px`);

      // Add rotation class and set state for CSS control
      document.documentElement.classList.add('is-resizing');
      setIsRotating(true);

      // Clear any pending settle timeout
      if (settleTimeout) clearTimeout(settleTimeout);
    };

    const endRotation = () => {
      // Schedule the settle - use single consistent timing
      if (settleTimeout) clearTimeout(settleTimeout);

      settleTimeout = setTimeout(() => {
        isResizingRef.current = false;
        isHandlingRotation = false;

        // Update viewport height to new post-rotation value
        const newHeight = window.visualViewport?.height ?? window.innerHeight;
        document.documentElement.style.setProperty('--app-viewport-height', `${newHeight}px`);

        // Clear frozen height - sections can now use live value
        frozenHeightRef.current = null;
        document.documentElement.style.removeProperty('--frozen-viewport-height');

        // Remove rotation class and state
        document.documentElement.classList.remove('is-resizing');
        setIsRotating(false);

        // Refresh section measurements with new layout
        refreshSections();

        // Restore to preserved section using double rAF for layout stability
        if (preservedSectionIndexRef.current !== null) {
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              const targetIndex = Math.max(0, Math.min(
                preservedSectionIndexRef.current,
                sectionsRef.current.length - 1
              ));
              scrollToIndex(targetIndex);
              preservedSectionIndexRef.current = null;
            });
          });
        }
      }, ROTATION_SETTLE_MS);
    };

    const handleResizeEvent = () => {
      startRotation();
      endRotation();
    };

    // Single handler for all resize-like events
    window.addEventListener('resize', handleResizeEvent, { passive: true });
    window.addEventListener('orientationchange', handleResizeEvent, { passive: true });

    // visualViewport resize (mobile Safari) - but debounce to prevent double-firing
    let vpResizeTimeout = null;
    const handleVpResize = () => {
      if (vpResizeTimeout) clearTimeout(vpResizeTimeout);
      vpResizeTimeout = setTimeout(handleResizeEvent, 16); // ~1 frame
    };
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleVpResize);
    }

    // matchMedia orientation change (most reliable for tablets)
    let orientationQuery = null;
    const handleOrientationMedia = () => {
      startRotation();
      endRotation();
    };
    if (window.matchMedia) {
      orientationQuery = window.matchMedia('(orientation: portrait)');
      if (orientationQuery.addEventListener) {
        orientationQuery.addEventListener('change', handleOrientationMedia);
      } else if (orientationQuery.addListener) {
        orientationQuery.addListener(handleOrientationMedia);
      }
    }

    return () => {
      window.removeEventListener('resize', handleResizeEvent);
      window.removeEventListener('orientationchange', handleResizeEvent);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleVpResize);
      }
      if (settleTimeout) clearTimeout(settleTimeout);
      if (vpResizeTimeout) clearTimeout(vpResizeTimeout);
      if (orientationQuery) {
        if (orientationQuery.removeEventListener) {
          orientationQuery.removeEventListener('change', handleOrientationMedia);
        } else if (orientationQuery.removeListener) {
          orientationQuery.removeListener(handleOrientationMedia);
        }
      }
    };
  }, [scrollToIndex, refreshSections]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    refreshSections();

    const onScroll = () => {
      // Don't update during resize/orientation changes
      if (isResizingRef.current) return;
      
      // Determine which discrete section (0-4) is most visible
      // Use viewport center to determine the active section
      const offset = container.scrollTop + navHeight();
      const viewportCenter = container.scrollTop + (container.clientHeight / 2);
      
      let closestIndex = 0;
      let closestDistance = Infinity;
      
      sectionsRef.current.forEach((section, idx) => {
        if (!section) return;
        const sectionTop = section.offsetTop;
        const sectionCenter = sectionTop + (section.offsetHeight / 2);
        const distance = Math.abs(viewportCenter - sectionCenter);
        
        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = idx;
        }
      });
      
      // Only update if we've actually changed sections (discrete state change)
      if (closestIndex !== currentIndexRef.current) {
        setCurrentIndex(closestIndex);
        currentIndexRef.current = closestIndex;
      }
    };

    container.addEventListener('scroll', onScroll, { passive: true });
    return () => container.removeEventListener('scroll', onScroll, { passive: true });
  }, [children, navHeight, refreshSections]);

  useEffect(() => {
    const restoreSection = () => {
      const savedId = sessionStorage.getItem('scrollsnap:return-section');
      if (!savedId) return;

      const target = document.getElementById(savedId);
      const container = containerRef.current;
      if (target && container) {
        const destination = target.offsetTop - navHeight();
        container.scrollTo({ top: destination, behavior: 'auto' });
        const idx = sectionsRef.current.findIndex((section) => section?.id === savedId);
        if (idx >= 0) {
          setCurrentIndex(idx);
          currentIndexRef.current = idx;
        }
      }

      sessionStorage.removeItem('scrollsnap:return-section');
    };

    // Delay restoration to ensure layout has stabilized
    const id = window.setTimeout(restoreSection, 0);
    return () => window.clearTimeout(id);
  }, [navHeight]);

  // Initial viewport height setup only - resize is handled by unified rotation handler
  useEffect(() => {
    const setViewportHeight = () => {
      // Skip during rotation - the rotation handler manages height during transitions
      if (isResizingRef.current) return;

      const viewportHeight = window.visualViewport?.height ?? window.innerHeight;
      document.documentElement.style.setProperty(
        '--app-viewport-height',
        `${viewportHeight}px`
      );
    };

    const detectBreakpoint = () => {
      const width = window.innerWidth;
      return width >= BREAKPOINT_WIDTH ? 'desktop' : 'tablet';
    };

    // Breakpoint tracking only - no scroll manipulation
    const handleBreakpointChange = () => {
      // Skip during rotation - will be handled when rotation settles
      if (isResizingRef.current) return;

      const next = detectBreakpoint();
      if (next !== currentBreakpoint) {
        setCurrentBreakpoint(next);
      }
    };

    // Initial setup
    setViewportHeight();
    refreshSections();

    // Light listener just for breakpoint state (no scroll manipulation)
    window.addEventListener('resize', handleBreakpointChange, { passive: true });

    return () => {
      window.removeEventListener('resize', handleBreakpointChange);
    };
  }, [currentBreakpoint, refreshSections]);

  return (
    <div className="relative w-full">
      <div
        ref={containerRef}
        className="w-full overflow-y-auto"
        data-current-index={currentIndex}
        data-section-count={sectionCount}
        data-rotating={isRotating ? 'true' : 'false'}
        style={{
          height: 'var(--app-viewport-height, 100svh)',
          width: '100%',
          WebkitOverflowScrolling: 'touch',
          overscrollBehaviorY: 'none',
          scrollPaddingTop: 'var(--nav-h, 60px)',
          paddingTop: 'var(--nav-h, 60px)',
          // CRITICAL: Disable scroll-snap-type during rotation to prevent oscillation
          // This is the CSS-level fix that allows smooth rotation handling
          scrollSnapType: isRotating ? 'none' : 'y mandatory',
          scrollBehavior: isRotating ? 'auto' : 'smooth',
          // Prevent layout shifts during orientation changes
          willChange: 'scroll-position',
        }}
      >
        {children}
      </div>

      <div className="fixed right-4 top-1/2 z-50 flex -translate-y-1/2 flex-col gap-2">
        <button
          type="button"
          onClick={() => scrollToIndex(currentIndex - 1)}
          className="rounded bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-md ring-1 ring-gray-300 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={currentIndex <= 0}
        >
          Up
        </button>
        <button
          type="button"
          onClick={() => scrollToIndex(currentIndex + 1)}
          className="rounded bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-md ring-1 ring-gray-300 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={currentIndex >= sectionCount - 1}
        >
          Down
        </button>
      </div>
    </div>
  );
};

export default ScrollSnap;
