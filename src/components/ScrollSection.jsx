import React, { useRef, useEffect, useState } from 'react';
import { useViewport } from '../hooks/useViewport';

export default function ScrollSection({ name, children, background }) {
  const ref = useRef();
  const [inView, setInView] = useState(false);
  const { isTablet } = useViewport();
  const observerRef = useRef(null);

  // Update IntersectionObserver when viewport state changes
  useEffect(() => {
    if (!ref.current) return;

    // CRITICAL: Don't recreate observer during rotation - causes layout thrashing
    // Defer observer updates until rotation completes
    if (document.documentElement.classList.contains('is-resizing')) {
      // Wait for rotation to complete, then recreate observer
      const checkRotationComplete = setInterval(() => {
        if (!document.documentElement.classList.contains('is-resizing')) {
          clearInterval(checkRotationComplete);
          // Trigger re-run of this effect after rotation completes
          // (This is a bit hacky but prevents observer churn during rotation)
        }
      }, 100);
      return () => clearInterval(checkRotationComplete);
    }

    // Disconnect existing observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    // Create new observer with current viewport settings
    observerRef.current = new window.IntersectionObserver(
      ([entry]) => {
        // For tablets, be more lenient - trigger if any significant portion is visible
        if (isTablet) {
          setInView(entry.intersectionRatio > 0.3 || entry.isIntersecting);
        } else {
          setInView(entry.isIntersecting);
        }
      },
      {
        threshold: isTablet ? 0.3 : 0.5,
        rootMargin: isTablet ? '-10% 0px -10% 0px' : '0px'
      }
    );

    observerRef.current.observe(ref.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [isTablet]); // Recreate observer when tablet state changes

  // CRITICAL: Lock all three height properties to identical values to "defend" section dimensions
  // This prevents layout thrashing during rotation by eliminating conflicting constraints
  // During rotation, use --frozen-viewport-height (set at rotation START, doesn't change)
  // After rotation, use --app-viewport-height (updated to new post-rotation value)
  const lockedHeight = 'var(--frozen-viewport-height, var(--app-viewport-height, 100dvh))';

  return (
    <section
      ref={ref}
      id={name}
      style={{
        minHeight: lockedHeight,
        height: lockedHeight,
        maxHeight: lockedHeight,
        width: '100%',
        position: 'relative',
        backgroundColor: background || 'transparent',
        overflow: 'hidden',
        // NO scrollMarginTop - the container's scrollPaddingTop handles navbar offset
        // Having both would cause double offset
        scrollSnapAlign: 'start', // Enable scroll snapping for this section
        // Performance containment for big sections - prevents layout from affecting siblings
        contain: 'layout paint style',
        // Safe area insets for notched devices
        paddingTop: 'env(safe-area-inset-top, 0px)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        paddingLeft: 'env(safe-area-inset-left, 0px)',
        paddingRight: 'env(safe-area-inset-right, 0px)',
        // Prevent any flex/growth during rotation
        flexShrink: 0,
        flexGrow: 0,
      }}
    >
      {children({ inView, ref })}
    </section>
  );
}
