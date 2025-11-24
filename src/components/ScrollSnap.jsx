import React from 'react';

const ScrollSnap = ({ children }) => {
  // Use proximity for tablets (less aggressive), mandatory for desktop
  const isTablet = typeof window !== 'undefined' && window.innerWidth < 1400 && (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    navigator.msMaxTouchPoints > 0
  );

  return (
    <div
      className="w-full h-screen overflow-y-auto"
      style={{
        scrollSnapType: isTablet ? 'y proximity' : 'y mandatory',
        height: '100vh',
        width: '100%',
        WebkitOverflowScrolling: 'touch',
        overscrollBehavior: 'contain',
        scrollBehavior: 'smooth',
      }}
    >
      {React.Children.map(children, (child) => (
        <div
          style={{
            scrollSnapAlign: 'start',
            scrollSnapStop: 'normal', // Changed from 'always' - allows easier scrolling
            height: isTablet ? '100dvh' : '100vh', // Use dvh for tablets to match section content
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