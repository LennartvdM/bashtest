import React, { useEffect, useMemo, useRef, useState } from 'react';

const ScrollSnap = ({ children }) => {
  const containerRef = useRef(null);
  const [snapMode, setSnapMode] = useState('y mandatory');

  // Prefer gentler snapping on touch devices to avoid the "yo-yo" feel
  useEffect(() => {
    const updateSnapMode = () => {
      const isTouch = typeof window !== 'undefined' && (
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        navigator.msMaxTouchPoints > 0
      );
      setSnapMode(isTouch ? 'y proximity' : 'y mandatory');
    };

    updateSnapMode();
    window.addEventListener('resize', updateSnapMode);
    return () => window.removeEventListener('resize', updateSnapMode);
  }, []);

  const baseSectionHeight = useMemo(
    () => 'calc(100svh - var(--nav-h, 60px))',
    []
  );

  return (
    <div
      ref={containerRef}
      className="w-full overflow-y-auto"
      style={{
        scrollSnapType: snapMode,
        height: '100svh',
        width: '100%',
        WebkitOverflowScrolling: 'touch',
        overscrollBehaviorY: 'none',
        scrollPaddingTop: 'var(--nav-h, 60px)',
        paddingTop: 'var(--nav-h, 60px)',
        scrollBehavior: 'smooth',
      }}
    >
      {React.Children.map(children, (child) => (
        <div
          style={{
            scrollSnapAlign: 'start',
            scrollSnapStop: 'always',
            minHeight: baseSectionHeight,
            width: '100%',
            position: 'relative',
          }}
        >
          {child}
        </div>
      ))}
    </div>
  );
};

export default ScrollSnap;