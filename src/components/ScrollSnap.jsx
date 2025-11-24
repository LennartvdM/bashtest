import React from 'react';

const ScrollSnap = ({ children }) => {
  return (
    <div
      className="w-full h-screen overflow-y-auto"
      style={{
        scrollSnapType: 'y mandatory',
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