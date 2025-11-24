import React, { useRef, useEffect, useState } from 'react';

export default function ScrollSection({ name, children, background }) {
  const ref = useRef();
  const [inView, setInView] = useState(false);

  useEffect(() => {
    // More lenient threshold for tablets - use lower threshold or rootMargin
    const isTablet = typeof window !== 'undefined' && window.innerWidth < 1400 && (
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      navigator.msMaxTouchPoints > 0
    );
    
    const observer = new window.IntersectionObserver(
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
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      id={name}
      style={{
        minHeight: '100vh',
        width: '100%',
        scrollSnapAlign: 'start',
        scrollSnapStop: 'normal', // Allows easier scrolling - can skip snap points with fast scroll
        position: 'relative',
        backgroundColor: background || 'transparent',
      }}
    >
      {children({ inView, ref })}
    </section>
  );
} 