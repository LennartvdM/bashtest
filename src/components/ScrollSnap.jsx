import React, { useCallback, useEffect, useRef, useState } from 'react';

const NAV_FALLBACK = 60;
const WHEEL_THRESHOLD = 20; // ignore micro-scrolls from touchpads
const TOUCH_DISTANCE_THRESHOLD = 50; // pixels
const TOUCH_TIME_THRESHOLD = 450; // ms to be considered a flick

const ScrollSnap = ({ children }) => {
  const containerRef = useRef(null);
  const sectionsRef = useRef([]);
  const wheelCooldownRef = useRef(0);
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

  const navHeight = useCallback(() => {
    if (typeof window === 'undefined') return NAV_FALLBACK;
    const raw = getComputedStyle(document.documentElement).getPropertyValue('--nav-h');
    const parsed = parseFloat(raw);
    return Number.isFinite(parsed) ? parsed : NAV_FALLBACK;
  }, []);

  const getClosestIndex = useCallback(() => {
    const container = containerRef.current;
    if (!container) return 0;
    const offset = container.scrollTop + navHeight();
    return sectionsRef.current.reduce((closest, el, idx) => {
      const distance = Math.abs(el.offsetTop - offset);
      const closestDistance = Math.abs(
        sectionsRef.current[closest]?.offsetTop - offset || Infinity
      );
      return distance < closestDistance ? idx : closest;
    }, 0);
  }, [navHeight]);

  const scrollToIndex = useCallback(
    (nextIndex) => {
      const container = containerRef.current;
      if (!container) return;

      const clamped = Math.max(0, Math.min(nextIndex, sectionsRef.current.length - 1));
      const activeIndex = getClosestIndex();
      if (clamped === activeIndex) return;

      const target = sectionsRef.current[clamped];
      if (!target) return;

      setCurrentIndex(clamped);
      const destination = target.offsetTop - navHeight();
      const delta = destination - container.scrollTop;
      if (Math.abs(delta) < 1) return;
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    },
    [getClosestIndex, navHeight]
  );

  // Wheel ratchet for desktop scrolls
  useEffect(() => {
    const onWheel = (event) => {
      const container = containerRef.current;
      if (!container) return;
      const path = event.composedPath?.() || [];
      if (!path.includes(container)) return;
      const now = Date.now();
      if (now - wheelCooldownRef.current < 700) return;
      if (Math.abs(event.deltaY) < WHEEL_THRESHOLD) return;
      event.preventDefault();
      wheelCooldownRef.current = now;
      const direction = event.deltaY > 0 ? 1 : -1;
      scrollToIndex(getClosestIndex() + direction);
    };

    window.addEventListener('wheel', onWheel, { passive: false });
    return () => window.removeEventListener('wheel', onWheel, { passive: false });
  }, [scrollToIndex]);

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
  }, [scrollToIndex]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    sectionsRef.current = Array.from(
      container.querySelectorAll('section[id]')
    );
  }, [children]);

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
  }, [getClosestIndex, navHeight]);

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
  }, [getClosestIndex, navHeight]);

  return (
    <div
      ref={containerRef}
      className="w-full overflow-y-auto"
      data-current-index={currentIndex}
      data-section-count={sectionsRef.current.length}
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
      {children}
    </div>
  );
};

export default ScrollSnap;