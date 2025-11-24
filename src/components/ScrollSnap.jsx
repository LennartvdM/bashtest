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
      
      // Stop any ongoing scroll momentum
      container.scrollTop = container.scrollTop;
      
      // Immediately scroll to target - scroll snap will handle the final positioning
      targetSection.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });

      // Reset scrolling flag after animation completes
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

      // More lenient thresholds for easier one-flick navigation
      // Minimum distance: 40px - a quick flick
      // Minimum velocity: 0.2px/ms - moderate speed
      const minDistance = 40;
      const minVelocity = 0.2;
      const maxDistance = 400;

      // Check if this was a deliberate swipe gesture
      // The key is: user swiped quickly without much actual scrolling
      const actualScrollDelta = Math.abs(container.scrollTop - lastScrollTop.current);
      const isDeliberateSwipe = Math.abs(deltaY) > minDistance && 
                                 velocity > minVelocity && 
                                 Math.abs(deltaY) < maxDistance &&
                                 actualScrollDelta < 100; // User swiped, didn't scroll much

      if (isDeliberateSwipe && !isScrolling.current) {
        const currentIndex = findCurrentSection();
        
        // Immediately snap to next section - don't wait
        if (deltaY > 0) {
          // Swiped up - go to next section
          scrollToSection(currentIndex + 1, 'down');
        } else {
          // Swiped down - go to previous section
          scrollToSection(currentIndex - 1, 'up');
        }
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
        scrollSnapType: isTablet ? 'y proximity' : 'y mandatory', // Proximity for tablets (less sticky), mandatory for desktop
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
            scrollSnapStop: 'always',
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