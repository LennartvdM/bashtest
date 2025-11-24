import React, { useCallback, useEffect, useRef, useState } from 'react';

const NAV_FALLBACK = 60;

const ScrollSnap = ({ children }) => {
  const containerRef = useRef(null);
  const sectionsRef = useRef([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sectionCount, setSectionCount] = useState(0);

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
      const target = sectionsRef.current[clamped];
      if (!target) return;

      setCurrentIndex(clamped);
      const destination = target.offsetTop - navHeight();
      container.scrollTo({ top: destination, behavior: 'auto' });
    },
    [navHeight]
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    sectionsRef.current = Array.from(container.querySelectorAll('section[id]'));
    const count = sectionsRef.current.length;
    setSectionCount(count);
    setCurrentIndex((prev) => (count ? Math.min(prev, count - 1) : 0));

    const onScroll = () => {
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
  }, [children, navHeight]);

  return (
    <div className="relative w-full">
      <div
        ref={containerRef}
        className="w-full overflow-y-auto"
        data-current-index={currentIndex}
        data-section-count={sectionCount}
        style={{
          height: '100svh',
          width: '100%',
          WebkitOverflowScrolling: 'touch',
          overscrollBehaviorY: 'none',
          scrollPaddingTop: 'var(--nav-h, 60px)',
          paddingTop: 'var(--nav-h, 60px)',
          scrollBehavior: 'auto',
        }}
      >
        {children}
      </div>

      <div className="fixed right-4 top-1/2 z-50 flex -translate-y-1/2 flex-col gap-2">
        <button
          type="button"
          onClick={() => scrollToIndex(currentIndex - 1)}
        className="rounded bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-md ring-1 ring-gray-300 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={currentIndex <= 0}
        >
          Up
        </button>
        <button
          type="button"
          onClick={() => scrollToIndex(currentIndex + 1)}
          className="rounded bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-md ring-1 ring-gray-300 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={currentIndex >= sectionCount - 1}
        >
          Down
        </button>
      </div>
    </div>
  );
};

export default ScrollSnap;