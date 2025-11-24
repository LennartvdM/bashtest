import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const NAV_FALLBACK = 60;
const WHEEL_THRESHOLD = 20; // ignore micro-scrolls from touchpads
const TOUCH_DISTANCE_THRESHOLD = 50; // pixels
const TOUCH_TIME_THRESHOLD = 450; // ms to be considered a flick
const ANIMATION_DURATION = 700; // ms lock while scrolling to target

const ScrollSnap = ({ children }) => {
  const containerRef = useRef(null);
  const sectionsRef = useRef([]);
  const lockRef = useRef(false);
  const [currentIndex, setCurrentIndex] = useState(0);
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

  const navHeight = useCallback(() => {
    if (typeof window === 'undefined') return NAV_FALLBACK;
    const raw = getComputedStyle(document.documentElement).getPropertyValue('--nav-h');
    const parsed = parseFloat(raw);
    return Number.isFinite(parsed) ? parsed : NAV_FALLBACK;
  }, []);

  const scrollToIndex = useCallback(
    (nextIndex) => {
      const container = containerRef.current;
      if (!container || lockRef.current) return;

      const clamped = Math.max(0, Math.min(nextIndex, sectionsRef.current.length - 1));
      if (clamped === currentIndex) return;

      const target = sectionsRef.current[clamped];
      if (!target) return;

      lockRef.current = true;
      setCurrentIndex(clamped);
      container.scrollTo({
        top: target.offsetTop - navHeight(),
        behavior: 'smooth',
      });

      window.setTimeout(() => {
        lockRef.current = false;
      }, ANIMATION_DURATION);
    },
    [currentIndex, navHeight]
  );

  // Wheel ratchet for desktop scrolls
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    const onWheel = (event) => {
      if (lockRef.current) return;
      if (Math.abs(event.deltaY) < WHEEL_THRESHOLD) return;
      event.preventDefault();
      const direction = event.deltaY > 0 ? 1 : -1;
      scrollToIndex(currentIndex + direction);
    };

    container.addEventListener('wheel', onWheel, { passive: false });
    return () => container.removeEventListener('wheel', onWheel, { passive: false });
  }, [currentIndex, scrollToIndex]);

  // Flick detection for tablets / touch devices
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    let startY = 0;
    let startTime = 0;

    const onTouchStart = (event) => {
      if (event.touches.length !== 1) return;
      startY = event.touches[0].clientY;
      startTime = Date.now();
    };

    const onTouchEnd = (event) => {
      if (lockRef.current) return;
      const touch = event.changedTouches[0];
      const deltaY = touch.clientY - startY;
      const elapsed = Date.now() - startTime;

      const traveledEnough = Math.abs(deltaY) > TOUCH_DISTANCE_THRESHOLD;
      const quickFlick = elapsed < TOUCH_TIME_THRESHOLD;
      if (!traveledEnough || !quickFlick) return;

      const direction = deltaY < 0 ? 1 : -1;
      scrollToIndex(currentIndex + direction);
    };

    container.addEventListener('touchstart', onTouchStart, { passive: true });
    container.addEventListener('touchend', onTouchEnd, { passive: true });
    return () => {
      container.removeEventListener('touchstart', onTouchStart, { passive: true });
      container.removeEventListener('touchend', onTouchEnd, { passive: true });
    };
  }, [currentIndex, scrollToIndex]);

  // Keep the reported index in sync when users scroll via keyboard or scrollbars
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    const onScroll = () => {
      if (!container) return;
      const offset = container.scrollTop + navHeight();
      const closestIndex = sectionsRef.current.reduce((closest, el, idx) => {
        const distance = Math.abs(el.offsetTop - offset);
        const closestDistance = Math.abs(
          sectionsRef.current[closest]?.offsetTop - offset || Infinity
        );
        return distance < closestDistance ? idx : closest;
      }, 0);
      setCurrentIndex(closestIndex);
    };

    container.addEventListener('scroll', onScroll, { passive: true });
    return () => container.removeEventListener('scroll', onScroll, { passive: true });
  }, [navHeight]);

  // Recompute index on resize to keep the active section accurate
  useEffect(() => {
    const onResize = () => {
      const container = containerRef.current;
      if (!container) return;
      const offset = container.scrollTop + navHeight();
      const closestIndex = sectionsRef.current.reduce((closest, el, idx) => {
        const distance = Math.abs(el.offsetTop - offset);
        const closestDistance = Math.abs(
          sectionsRef.current[closest]?.offsetTop - offset || Infinity
        );
        return distance < closestDistance ? idx : closest;
      }, 0);
      setCurrentIndex(closestIndex);
    };

    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [navHeight]);

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
      {React.Children.map(children, (child, idx) => (
        <div
          key={`scroll-section-${idx}`}
          ref={(el) => {
            sectionsRef.current[idx] = el;
          }}
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