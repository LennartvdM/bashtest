import { useLayoutEffect, useState } from 'react';

/**
 * Scroll-spy hook that tracks which section is currently in view
 * @param {string[]} ids - Array of section IDs to track
 * @param {number} offset - Pixel offset from top of viewport (default: 100)
 * @returns {string} - ID of the currently active section
 */
export default function useScrollSpy(ids, offset = 100) {
  const [active, setActive] = useState(ids[0]);

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
    const handler = (e) => setActive(e.detail);
    window.addEventListener('nav-activate', handler);
    return () => window.removeEventListener('nav-activate', handler);
  }, []);

  return active;
}
