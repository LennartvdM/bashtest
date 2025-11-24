import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useViewport } from '../hooks/useViewport';

const NAV_FALLBACK = 60;

const BREAKPOINT_WIDTH = 1024; // Align with desktop breakpoint for Tailwind (lg)

const ScrollSnap = ({ children }) => {
  const containerRef = useRef(null);
  const sectionsRef = useRef([]);
  const currentIndexRef = useRef(0);
  const resizeTimeoutRef = useRef(null);
  const isResizingRef = useRef(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sectionCount, setSectionCount] = useState(0);
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

  const scheduleResnap = useCallback(() => {
    window.clearTimeout(resizeTimeoutRef.current);
    resizeTimeoutRef.current = window.setTimeout(() => {
      refreshSections();
      snapToActiveSection();
    }, 150);
  }, [refreshSections, snapToActiveSection]);

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

  // Disable scroll snap during orientation changes to prevent layout thrashing
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let resizeEndTimeout = null;
    let currentSectionIndex = null;

    const handleResizeStart = () => {
      isResizingRef.current = true;
      
      // Disable scroll snap via CSS class (prevents snap oscillation)
      if (typeof document !== 'undefined') {
        document.documentElement.classList.add('is-resizing');
      }
      
      // Remember which section is currently most visible
      if (containerRef.current) {
        const container = containerRef.current;
        const scrollTop = container.scrollTop;
        const viewportHeight = container.clientHeight;
        const sections = Array.from(container.children);
        
        let closestIndex = 0;
        let closestDistance = Infinity;
        
        sections.forEach((section, idx) => {
          const sectionTop = section.offsetTop;
          const sectionCenter = sectionTop + section.offsetHeight / 2;
          const viewportCenter = scrollTop + viewportHeight / 2;
          const distance = Math.abs(viewportCenter - sectionCenter);
          
          if (distance < closestDistance) {
            closestDistance = distance;
            closestIndex = idx;
          }
        });
        
        currentSectionIndex = closestIndex;
      }
    };

    const handleResizeEnd = () => {
      // Wait for layout to stabilize after resize, then restore scroll position
      if (resizeEndTimeout) clearTimeout(resizeEndTimeout);
      resizeEndTimeout = setTimeout(() => {
        isResizingRef.current = false;
        
        // Re-enable scroll snap
        if (typeof document !== 'undefined') {
          document.documentElement.classList.remove('is-resizing');
        }
        
        // Restore scroll to the same section after layout stabilizes
        if (containerRef.current && currentSectionIndex !== null) {
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              if (!containerRef.current) return;
              const sections = Array.from(containerRef.current.children);
              if (sections[currentSectionIndex]) {
                sections[currentSectionIndex].scrollIntoView({ 
                  behavior: 'auto', 
                  block: 'start' 
                });
              }
              currentSectionIndex = null;
            });
          });
        }
      }, 300); // Wait 300ms after resize ends
    };

    const handleResize = () => {
      handleResizeStart();
      if (resizeEndTimeout) clearTimeout(resizeEndTimeout);
      resizeEndTimeout = setTimeout(handleResizeEnd, 100);
    };

    window.addEventListener('resize', handleResize, { passive: true });
    window.addEventListener('orientationchange', handleResizeStart, { passive: true });
    
    // Use matchMedia for orientation (fires after orientation change completes)
    let orientationQuery = null;
    if (window.matchMedia) {
      orientationQuery = window.matchMedia('(orientation: portrait)');
      if (orientationQuery.addEventListener) {
        orientationQuery.addEventListener('change', () => {
          handleResizeStart();
          setTimeout(handleResizeEnd, 100);
        });
      } else if (orientationQuery.addListener) {
        orientationQuery.addListener(() => {
          handleResizeStart();
          setTimeout(handleResizeEnd, 100);
        });
      }
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResizeStart);
      if (resizeEndTimeout) clearTimeout(resizeEndTimeout);
      if (orientationQuery) {
        if (orientationQuery.removeEventListener) {
          orientationQuery.removeEventListener('change', handleResizeStart);
        } else if (orientationQuery.removeListener) {
          orientationQuery.removeListener(handleResizeStart);
        }
      }
    };
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    refreshSections();

    const onScroll = () => {
      // Don't update during resize/orientation changes
      if (isResizingRef.current) return;
      
      const offset = container.scrollTop + navHeight();
      const closestIndex = sectionsRef.current.reduce((closest, el, idx) => {
        const distance = Math.abs(el.offsetTop - offset);
        const closestDistance = Math.abs(
          sectionsRef.current[closest]?.offsetTop - offset || Infinity
        );
        return distance < closestDistance ? idx : closest;
      }, 0);
      setCurrentIndex(closestIndex);
      currentIndexRef.current = closestIndex;
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

  useEffect(() => {
    const setViewportHeight = () => {
      // Use visualViewport API for accurate height (critical for mobile Safari)
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

    const handleBreakpointChange = () => {
      const next = detectBreakpoint();
      if (next !== currentBreakpoint) {
        setCurrentBreakpoint(next);
      }

      setViewportHeight();
      scheduleResnap();
    };

    setViewportHeight();
    scheduleResnap();
    window.addEventListener('resize', handleBreakpointChange);
    window.addEventListener('orientationchange', handleBreakpointChange);
    
    // Listen to visualViewport changes (more accurate for mobile Safari)
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleBreakpointChange);
    }
    
    return () => {
      window.clearTimeout(resizeTimeoutRef.current);
      window.removeEventListener('resize', handleBreakpointChange);
      window.removeEventListener('orientationchange', handleBreakpointChange);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleBreakpointChange);
      }
    };
  }, [currentBreakpoint, scheduleResnap]);

  return (
    <div className="relative w-full">
      <div
        ref={containerRef}
        className="w-full overflow-y-auto"
        data-current-index={currentIndex}
        data-section-count={sectionCount}
        style={{
          height: 'var(--app-viewport-height, 100svh)',
          width: '100%',
          WebkitOverflowScrolling: 'touch',
          overscrollBehaviorY: 'none',
          scrollPaddingTop: 'var(--nav-h, 60px)',
          paddingTop: 'var(--nav-h, 60px)',
          scrollBehavior: 'auto',
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
