import React, { useRef, useState, useEffect } from 'react';

const ScrollSnap = ({ children }) => {
  const containerRef = useRef(null);
  const [currentScreenIndex, setCurrentScreenIndex] = useState(0);
  const totalScreens = React.Children.count(children);

  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY;
    if (delta > 0 && currentScreenIndex < totalScreens - 1) {
      setCurrentScreenIndex(currentScreenIndex + 1);
    } else if (delta < 0 && currentScreenIndex > 0) {
      setCurrentScreenIndex(currentScreenIndex - 1);
    }
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      container.removeEventListener('wheel', handleWheel, { passive: false });
    };
  }, [currentScreenIndex]);

  const containerStyle = {
    transform: `translateY(-${currentScreenIndex * 100}vh)`,
    transition: 'transform 0.6s ease',
    position: 'relative',
    width: '100%',
    height: '100%'
  };

  return (
    <div ref={containerRef} className="w-full h-screen overflow-hidden">
      <div style={containerStyle}>
        {React.Children.map(children, (child) => (
          <div className="w-full h-screen">
            {child}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ScrollSnap; 