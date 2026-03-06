import React from 'react';
import { createPortal } from 'react-dom';

/**
 * HeroScrollCue — bottom-center animated chevrons.
 * Visible only on the hero slide (index 0), fades out on scroll.
 * Rendered via portal to document.body to avoid parent CSS interference.
 */
export default function HeroScrollCue({ visible, onScroll }) {
  return createPortal(
    <>
      <style>{`
        @keyframes heroScrollCueChevron {
          0%, 100% { opacity: 0.25; transform: translateY(0); }
          50% { opacity: 1; transform: translateY(3px); }
        }
      `}</style>
      <div
        data-testid="hero-scroll-cue"
        onClick={onScroll}
        role="button"
        tabIndex={0}
        aria-label="Scroll down to begin"
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onScroll(); }}
        style={{
          position: 'fixed',
          bottom: 40,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          zIndex: 9999,
          cursor: 'pointer',
          transition: 'opacity 0.4s ease',
          opacity: visible ? 1 : 0,
          pointerEvents: visible ? 'auto' : 'none',
        }}
      >
        {/*
          3 chevrons built from negative space:
          4 overlapping filled downward-pointing triangles (rgba fill).
          The thin gaps between them read as chevron "strokes".
          A mask clips to a soft rounded-rect so edges aren't harsh.
        */}
        <svg
          viewBox="0 0 120 80"
          width="160"
          height="107"
          style={{
            display: 'block',
            flexShrink: 0,
            minWidth: 160,
            minHeight: 107,
            animation: 'heroScrollCueChevron 2s ease-in-out infinite',
          }}
        >
          {/* 4 filled triangles stacked — gaps between them = 3 chevrons */}
          {/* Triangle 1 (top) */}
          <polygon points="10,0 60,22 110,0" fill="rgba(0,0,0,0.28)" />
          {/* Triangle 2 */}
          <polygon points="10,20 60,42 110,20" fill="rgba(0,0,0,0.28)" />
          {/* Triangle 3 */}
          <polygon points="10,40 60,62 110,40" fill="rgba(0,0,0,0.28)" />
          {/* Triangle 4 (bottom) */}
          <polygon points="10,60 60,82 110,60" fill="rgba(0,0,0,0.28)" />
        </svg>
      </div>
    </>,
    document.body
  );
}
