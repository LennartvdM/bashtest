/**
 * Example component demonstrating tablet best practices
 * This is a reference implementation showing patterns for:
 * - Orientation change handling
 * - Fluid responsive layouts
 * - Performance optimizations
 * - Touch interactions
 */

import React, { useRef, useEffect, useState, useMemo } from 'react';
import { useViewport } from '../../hooks/useViewport';

export default function TabletOptimizedSection({ children, content }) {
  const containerRef = useRef(null);
  const { isTablet, isPortrait, isLandscape, width, height, aspectRatio } = useViewport();
  const [isResizing, setIsResizing] = useState(false);
  const resizeTimeoutRef = useRef(null);

  // Detect orientation changes and lock operations
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResizeStart = () => {
      setIsResizing(true);
      // Cancel any ongoing animations or operations
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
    };

    const handleResizeEnd = () => {
      // Wait for layout to stabilize (300ms is safe)
      resizeTimeoutRef.current = setTimeout(() => {
        setIsResizing(false);
      }, 300);
    };

    // Use matchMedia for reliable orientation detection
    let orientationQuery = null;
    if (window.matchMedia) {
      orientationQuery = window.matchMedia('(orientation: portrait)');
      const handleOrientationChange = () => {
        handleResizeStart();
        setTimeout(handleResizeEnd, 100);
      };
      
      if (orientationQuery.addEventListener) {
        orientationQuery.addEventListener('change', handleOrientationChange);
      } else if (orientationQuery.addListener) {
        orientationQuery.addListener(handleOrientationChange);
      }
    }

    window.addEventListener('resize', handleResizeStart, { passive: true });
    window.addEventListener('orientationchange', handleResizeStart, { passive: true });

    return () => {
      window.removeEventListener('resize', handleResizeStart);
      window.removeEventListener('orientationchange', handleResizeStart);
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
      if (orientationQuery) {
        if (orientationQuery.removeEventListener) {
          orientationQuery.removeEventListener('change', handleResizeStart);
        } else if (orientationQuery.removeListener) {
          orientationQuery.removeListener(handleResizeStart);
        }
      }
    };
  }, []);

  // Memoize layout calculations to prevent unnecessary recalculations
  const layoutConfig = useMemo(() => {
    if (!isTablet) {
      return {
        columns: 3,
        gap: '2rem',
        padding: '2rem',
      };
    }

    if (isPortrait) {
      return {
        columns: 1,
        gap: '1.5rem',
        padding: '1.5rem',
      };
    }

    // Landscape tablet
    return {
      columns: 2,
      gap: '1.5rem',
      padding: '1.5rem',
    };
  }, [isTablet, isPortrait]);

  // Calculate responsive font size using clamp
  const headingSize = useMemo(() => {
    if (isTablet) {
      return isPortrait 
        ? 'clamp(2rem, 6vw, 3rem)'  // Smaller in portrait
        : 'clamp(2.5rem, 4vw, 4rem)'; // Larger in landscape
    }
    return 'clamp(3rem, 5vw, 5rem)';
  }, [isTablet, isPortrait]);

  // Don't render expensive content during resize
  if (isResizing) {
    return (
      <section
        ref={containerRef}
        style={{
          height: '100dvh',
          minHeight: '100dvh',
          maxHeight: '100dvh',
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f0f0f0',
        }}
      >
        <div>Loading...</div>
      </section>
    );
  }

  return (
    <section
      ref={containerRef}
      style={{
        height: '100dvh',
        minHeight: '100dvh',
        maxHeight: '100dvh',
        width: '100%',
        padding: layoutConfig.padding,
        display: 'grid',
        gridTemplateColumns: `repeat(${layoutConfig.columns}, 1fr)`,
        gap: layoutConfig.gap,
        overflow: 'auto',
        // Prevent layout shifts
        willChange: isResizing ? 'contents' : 'auto',
        // Safe area insets for notched devices
        paddingTop: `calc(${layoutConfig.padding} + env(safe-area-inset-top, 0px))`,
        paddingBottom: `calc(${layoutConfig.padding} + env(safe-area-inset-bottom, 0px))`,
      }}
    >
      {/* Example: Responsive heading */}
      <h1
        style={{
          fontSize: headingSize,
          gridColumn: '1 / -1',
          margin: 0,
          lineHeight: 1.2,
        }}
      >
        {content?.title || 'Tablet Optimized Section'}
      </h1>

      {/* Example: Grid content that adapts to orientation */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${layoutConfig.columns}, 1fr)`,
          gap: layoutConfig.gap,
          gridColumn: '1 / -1',
        }}
      >
        {content?.items?.map((item, idx) => (
          <div
            key={idx}
            style={{
              aspectRatio: isTablet && isPortrait ? '4/3' : '16/9',
              backgroundColor: '#e0e0e0',
              borderRadius: '8px',
              padding: '1rem',
              // Smooth transitions (only when not resizing)
              transition: isResizing ? 'none' : 'all 0.3s ease',
            }}
          >
            {item}
          </div>
        ))}
      </div>

      {children}
    </section>
  );
}

/**
 * Usage example:
 * 
 * <TabletOptimizedSection
 *   content={{
 *     title: "My Section",
 *     items: [
 *       <Card key="1" />,
 *       <Card key="2" />,
 *       <Card key="3" />,
 *     ]
 *   }}
 * >
 *   <AdditionalContent />
 * </TabletOptimizedSection>
 */

