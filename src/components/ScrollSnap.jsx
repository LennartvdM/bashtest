import React from 'react';

const ScrollSnap = ({ children }) => {
  // Improve scroll snap for tablets - use proximity for better behavior
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
        WebkitOverflowScrolling: 'touch', // Smooth scrolling on iOS
        overscrollBehavior: 'contain', // Prevent scroll chaining
      }}
    >
      {React.Children.map(children, (child) => (
        <div
          style={{
            scrollSnapAlign: 'start',
            scrollSnapStop: 'always', // Always stop at each section
            minHeight: '100vh',
            width: '100%',
          }}
        >
          {child}
        </div>
      ))}
    </div>
  );
};

export default ScrollSnap; 