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

  // Use consistent height units - dvh for tablets, vh for desktop
  // Merge with existing CSS variable approach
  const sectionHeight = isTablet ? '100dvh' : '100vh';

  return (
    <section
      ref={ref}
      id={name}
      style={{
        minHeight: 'calc(var(--app-viewport-height, 100svh) - var(--nav-h, 60px))',
        height: sectionHeight,
        width: '100%',
        position: 'relative',
        backgroundColor: background || 'transparent',
        overflow: 'hidden',
        scrollMarginTop: 'var(--nav-h, 60px)',
        // Prevent layout shifts during orientation changes
        maxHeight: sectionHeight,
        // Performance containment for big sections
        contain: 'layout paint style',
        // Safe area insets for notched devices
        paddingTop: 'env(safe-area-inset-top, 0px)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        paddingLeft: 'env(safe-area-inset-left, 0px)',
        paddingRight: 'env(safe-area-inset-right, 0px)',
      }}
    >
      {children({ inView, ref })}
    </section>
  );
}
