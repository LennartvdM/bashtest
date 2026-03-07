import React, { memo, useRef, useEffect } from "react";

/**
 * TabletTravellingBar
 * Animated underbar for switching captions on tablet.
 *
 * The highlighter is positioned entirely with CSS math (grid + translateY),
 * making it independent from the caption buttons. It can jump from any
 * item to any other item in a single smooth motion — no DOM measurement,
 * no getBoundingClientRect, no resize listeners.
 *
 * An SVG <mask> punches circular holes in the highlighter wherever it
 * overlaps with the SectionDotNav arrow buttons, so the background video
 * shows through the transparent button areas instead of the gray bar.
 */
const MASK_ID = 'ttb-btn-mask';

const TabletTravellingBar = memo(function TabletTravellingBar({ captions, current, onSelect, style, durationMs = 7000, paused = false, animationKey, captionsVisible = true, shouldTransition = true }) {
  const count = captions.length;
  const highlighterRef = useRef(null);
  const maskRef = useRef(null);
  const rafRef = useRef(null);

  // Continuously sync mask circles with all SectionDotNav elements (arrows + dots)
  useEffect(() => {
    const circles = [];
    const svgNS = 'http://www.w3.org/2000/svg';

    const update = () => {
      const el = highlighterRef.current;
      const maskEl = maskRef.current;
      if (el && maskEl) {
        const hRect = el.getBoundingClientRect();
        // Gather all nav elements: arrow buttons and dots
        const navItems = document.querySelectorAll('.arrow-btn, .arrow-dot');
        // Ensure we have enough circle elements in the mask
        while (circles.length < navItems.length) {
          const c = document.createElementNS(svgNS, 'circle');
          c.setAttribute('fill', 'black');
          maskEl.appendChild(c);
          circles.push(c);
        }
        // Hide excess circles
        for (let i = navItems.length; i < circles.length; i++) {
          circles[i].setAttribute('r', '0');
        }
        // Position each circle over its corresponding nav element
        for (let i = 0; i < navItems.length; i++) {
          const bRect = navItems[i].getBoundingClientRect();
          const cx = bRect.left + bRect.width / 2 - hRect.left;
          const cy = bRect.top + bRect.height / 2 - hRect.top;
          const r = Math.max(bRect.width, bRect.height) / 2 + 2;
          circles[i].setAttribute('cx', cx);
          circles[i].setAttribute('cy', cy);
          circles[i].setAttribute('r', r);
        }
      }
      rafRef.current = requestAnimationFrame(update);
    };
    rafRef.current = requestAnimationFrame(update);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      circles.length = 0;
    };
  }, []);

  return (
    <div
      style={{
        position: 'relative',
        display: 'grid',
        gridTemplateRows: `repeat(${count}, 1fr)`,
        width: '100%',
        background: 'none',
        ...style
      }}
    >
      {/* SVG mask: white rect = visible everywhere, black circles added dynamically for each nav element */}
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          <mask ref={maskRef} id={MASK_ID} x="-9999" y="-9999" width="99999" height="99999" maskUnits="userSpaceOnUse">
            <rect x="-9999" y="-9999" width="99999" height="99999" fill="white" />
          </mask>
        </defs>
      </svg>

      {/* Highlighter — positioned via transform math, fully independent of button DOM */}
      <div
        ref={highlighterRef}
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: '100%',
          height: `calc(100% / ${count})`,
          background: 'rgba(232, 232, 232, 0.9)',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          overflow: 'hidden',
          transition: shouldTransition
            ? 'transform 420ms cubic-bezier(0.4, 0, 0.2, 1), opacity 1.2s ease'
            : 'none',
          zIndex: 1,
          pointerEvents: 'none',
          willChange: 'transform',
          opacity: captionsVisible ? 1 : 0,
          transform: captionsVisible
            ? `translateY(${current * 100}%)`
            : `translateY(calc(${current * 100}% + 60px))`,
          mask: `url(#${MASK_ID})`,
          WebkitMask: `url(#${MASK_ID})`,
        }}
      >
        {/* Loading bar along bottom edge */}
        <div
          key={`${animationKey}-${current}`}
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            height: 5,
            background: 'rgba(82,156,156,1)',
            animation: `tabletTravellingProgress ${durationMs}ms linear forwards`,
            animationPlayState: paused ? 'paused' : 'running',
          }}
        />
      </div>
      {captions.map((caption, idx) => (
        <button
          key={idx}
          onClick={() => onSelect(idx)}
          style={{
            width: '100%',
            padding: '16px 24px',
            background: 'transparent',
            border: 'none',
            color: idx === current ? '#2a2323' : '#e0e0e0',
            fontWeight: idx === current ? 700 : 500,
            fontSize: 'clamp(16px, 2.4vw, 20px)',
            fontFamily: 'Inter, sans-serif',
            cursor: 'pointer',
            outline: 'none',
            position: 'relative',
            zIndex: 3,
            textAlign: 'left',
            opacity: captionsVisible ? 1 : 0,
            transform: captionsVisible ? 'translate3d(0,0,0)' : 'translateY(60px)',
            transition: shouldTransition
              ? (captionsVisible
                ? `transform 1.2s cubic-bezier(0.4,0,0.2,1) ${idx * 600}ms, opacity 1.2s ease ${idx * 600}ms, color 0.6s cubic-bezier(0.4,0,0.2,1)`
                : 'color 0.6s cubic-bezier(0.4,0,0.2,1)')
              : 'none',
          }}
        >
          {caption}
        </button>
      ))}
    </div>
  );
});

export default TabletTravellingBar;
