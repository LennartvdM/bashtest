import React, { useRef, useEffect } from 'react';

const ScrollSnap = ({ children }) => {
  const containerRef = useRef(null);
  const touchStartY = useRef(0);
  const touchStartTime = useRef(0);
  const lastScrollTop = useRef(0);
  const isScrolling = useRef(false);

  // Improve scroll snap for tablets - use proximity for better behavior
  const isTablet = typeof window !== 'undefined' && window.innerWidth < 1400 && (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    navigator.msMaxTouchPoints > 0
  );

  useEffect(() => {
    if (!isTablet || !containerRef.current) return;

    const container = containerRef.current;
    const sections = Array.from(container.children);

    const findCurrentSection = () => {
      const scrollTop = container.scrollTop;
      const viewportHeight = container.clientHeight;
      const centerY = scrollTop + viewportHeight / 2;

      for (let i = 0; i < sections.length; i++) {
        const section = sections[i];
        const sectionTop = section.offsetTop;
        const sectionBottom = sectionTop + section.offsetHeight;

        if (centerY >= sectionTop && centerY < sectionBottom) {
          return i;
        }
      }
      return 0;
    };

    const scrollToSection = (index, direction) => {
      if (isScrolling.current) return;
      if (index < 0 || index >= sections.length) return;

      isScrolling.current = true;
      const targetSection = sections[index];
      
      targetSection.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });

      // Reset scrolling flag after animation
      setTimeout(() => {
        isScrolling.current = false;
      }, 500);
    };

    const handleTouchStart = (e) => {
      touchStartY.current = e.touches[0].clientY;
      touchStartTime.current = Date.now();
      lastScrollTop.current = container.scrollTop;
    };

    const handleTouchMove = (e) => {
      // Update last scroll position during touch move
      lastScrollTop.current = container.scrollTop;
    };

    const handleTouchEnd = (e) => {
      if (!touchStartY.current) return;

      const touchEndY = e.changedTouches[0].clientY;
      const touchEndTime = Date.now();
      const deltaY = touchStartY.current - touchEndY;
      const deltaTime = Math.max(touchEndTime - touchStartTime.current, 1); // Prevent division by zero
      const velocity = Math.abs(deltaY / deltaTime);

      // Very lenient thresholds for easy one-flick navigation
      // Minimum distance: 30px - just a quick flick
      // Minimum velocity: 0.15px/ms - very low threshold
      const minDistance = 30;
      const minVelocity = 0.15;
      const maxDistance = 500; // Allow larger swipes

      // Check if this was a deliberate swipe gesture
      // For a swipe to trigger, we need:
      // 1. Sufficient distance and velocity (very low thresholds)
      // 2. The user didn't scroll too much during the gesture (indicating a swipe, not a scroll)
      const actualScrollDelta = Math.abs(container.scrollTop - lastScrollTop.current);
      const isDeliberateSwipe = Math.abs(deltaY) > minDistance && 
                                 velocity > minVelocity && 
                                 Math.abs(deltaY) < maxDistance &&
                                 actualScrollDelta < 150; // Allow more scroll during swipe (user might scroll while swiping)

      if (isDeliberateSwipe && !isScrolling.current) {
        const currentIndex = findCurrentSection();
        
        // Small delay to let any natural scroll complete, then snap to next section
        setTimeout(() => {
          if (deltaY > 0) {
            // Swiped up - go to next section
            scrollToSection(currentIndex + 1, 'down');
          } else {
            // Swiped down - go to previous section
            scrollToSection(currentIndex - 1, 'up');
          }
        }, 50);
      }

      touchStartY.current = 0;
      touchStartTime.current = 0;
    };

    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: true });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isTablet]);

  return (
    <div
      ref={containerRef}
      className="w-full h-screen overflow-y-auto"
      style={{
        scrollSnapType: isTablet ? 'none' : 'y mandatory', // No scroll snap for tablets - swipe detection handles navigation
        height: '100vh',
        width: '100%',
        WebkitOverflowScrolling: 'touch', // Smooth scrolling on iOS
        overscrollBehavior: 'contain', // Prevent scroll chaining
      }}
    >
      {React.Children.map(children, (child) => (
        <div
          style={{
            scrollSnapAlign: isTablet ? 'none' : 'start',
            scrollSnapStop: isTablet ? 'normal' : 'always',
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