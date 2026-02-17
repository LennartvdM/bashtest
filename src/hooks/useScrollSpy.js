import { useLayoutEffect, useRef, useState } from 'react';

/**
 * Scroll-spy hook that tracks which section is currently in view
 * @param {string[]} ids - Array of section IDs to track
 * @param {number} offset - Pixel offset from top of viewport (default: 100)
 * @returns {string} - ID of the currently active section
 */
export default function useScrollSpy(ids, offset = 100) {
  const [active, setActive] = useState(ids[0]);

  // Lock: when a nav-activate fires (click navigation), freeze the active
  // state so the scroll spy doesn't ratchet through intermediate sections
  // during the animated scroll.
  const lockedRef = useRef(null);
  const lockTimerRef = useRef(null);

  useLayoutEffect(() => {
    const els = ids.map((id) => document.getElementById(id)).filter(Boolean);
    if (!els.length) return;

    let ticking = false;

    const calc = () => {
      ticking = false;
      const tops = els.map(el => el.getBoundingClientRect().top);
      let idx = 0;
      for (let i = 0; i < tops.length; i++) {
        if (tops[i] - offset <= 0) {
          idx = i;
        }
      }
      const newId = els[idx].id;

      // If locked to a nav target, skip until the scroll arrives there
      if (lockedRef.current) {
        if (newId === lockedRef.current) {
          lockedRef.current = null;
          clearTimeout(lockTimerRef.current);
        }
        return;
      }

      setActive(prev => prev === newId ? prev : newId);
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(calc);
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', calc);
    calc();

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', calc);
    };
  }, [ids, offset]);

  // Listen for programmatic nav-activate events
  useLayoutEffect(() => {
    const handler = (e) => {
      lockedRef.current = e.detail;
      setActive(e.detail);
      // Safety timeout in case the scroll never reaches the target
      clearTimeout(lockTimerRef.current);
      lockTimerRef.current = setTimeout(() => { lockedRef.current = null; }, 2000);
    };
    window.addEventListener('nav-activate', handler);
    return () => {
      window.removeEventListener('nav-activate', handler);
      clearTimeout(lockTimerRef.current);
    };
  }, []);

  return active;
}
