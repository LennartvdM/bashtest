import { useLayoutEffect, useState, useRef } from 'react';

/**
 * Scroll-spy hook that tracks which section is currently in view.
 *
 * Lock pattern: when a nav-activate event fires (sidebar click), the hook
 * immediately sets active to the target and locks. While locked, scroll
 * events are ignored so the pill goes directly from origin to destination
 * without stepping through intermediate sections. The lock releases when
 * the scroll arrives at the target, or after a 2 s safety timeout.
 *
 * @param {string[]} ids - Array of section IDs to track
 * @param {number} offset - Pixel offset from top of viewport (default: 100)
 * @returns {string} - ID of the currently active section
 */
export default function useScrollSpy(ids, offset = 100) {
  const [active, setActive] = useState(ids[0]);
  const lockRef = useRef(null); // { targetId, timeoutId } when locked

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

      // If locked, only release when scroll arrives at the target
      if (lockRef.current) {
        if (newId === lockRef.current.targetId) {
          clearTimeout(lockRef.current.timeoutId);
          lockRef.current = null;
        } else {
          return; // skip intermediate updates
        }
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
      if (lockRef.current) {
        clearTimeout(lockRef.current.timeoutId);
        lockRef.current = null;
      }
    };
  }, [ids, offset]);

  // Listen for programmatic nav-activate events
  useLayoutEffect(() => {
    const handler = (e) => {
      const targetId = e.detail;
      setActive(targetId);

      // Lock scroll spy during animated scroll
      if (lockRef.current) clearTimeout(lockRef.current.timeoutId);
      const timeoutId = setTimeout(() => { lockRef.current = null; }, 2000);
      lockRef.current = { targetId, timeoutId };
    };
    window.addEventListener('nav-activate', handler);
    return () => window.removeEventListener('nav-activate', handler);
  }, []);

  return active;
}
