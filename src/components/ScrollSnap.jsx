import React from 'react';

import React, { useRef, useEffect } from 'react';

const ScrollSnap = ({ children }) => {
  const containerRef = useRef(null);
  const isTablet = typeof window !== 'undefined' && window.innerWidth < 1400 && (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    navigator.msMaxTouchPoints > 0
  );

  // For tablets, add smooth scroll assistance when scrolling between sections
  useEffect(() => {
    if (!isTablet || !containerRef.current) return;

    const container = containerRef.current;
    let scrollTimeout = null;
    let lastScrollTop = container.scrollTop;

    const handleScroll = () => {
      clearTimeout(scrollTimeout);
      
      // After scrolling stops, snap to nearest section
      scrollTimeout = setTimeout(() => {
        const scrollTop = container.scrollTop;
        const viewportHeight = container.clientHeight;
        const sections = Array.from(container.children);
        
        // Find the section that's most visible
        let closestSection = null;
        let closestDistance = Infinity;
        
        sections.forEach((section) => {
          const sectionTop = section.offsetTop;
          const sectionCenter = sectionTop + section.offsetHeight / 2;
          const viewportCenter = scrollTop + viewportHeight / 2;
          const distance = Math.abs(viewportCenter - sectionCenter);
          
          if (distance < closestDistance) {
            closestDistance = distance;
            closestSection = section;
          }
        });
        
        // Only snap if we're reasonably close to a section (within 30% of viewport)
        if (closestSection && closestDistance < viewportHeight * 0.3) {
          closestSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 150); // Wait 150ms after scroll stops
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      container.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, [isTablet]);

  return (
    <div
      ref={containerRef}
      className="w-full h-screen overflow-y-auto"
      style={{
        scrollSnapType: isTablet ? 'none' : 'y mandatory', // No scroll snap for tablets - use JS assistance
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
            scrollSnapAlign: isTablet ? 'none' : 'start',
            scrollSnapStop: isTablet ? 'normal' : 'normal',
            height: isTablet ? '100dvh' : '100vh',
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