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
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <svg viewBox="0 0 32 14" style={{ width: 160, height: 46, fill: 'none', stroke: 'rgba(0,0,0,0.35)', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round', animation: 'heroScrollCueChevron 2s ease-in-out infinite' }}><polyline points="4 3 16 11 28 3" /></svg>
          <svg viewBox="0 0 32 14" style={{ width: 160, height: 46, fill: 'none', stroke: 'rgba(0,0,0,0.35)', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round', marginTop: -24, animation: 'heroScrollCueChevron 2s ease-in-out 0.3s infinite' }}><polyline points="4 3 16 11 28 3" /></svg>
          <svg viewBox="0 0 32 14" style={{ width: 160, height: 46, fill: 'none', stroke: 'rgba(0,0,0,0.35)', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round', marginTop: -24, animation: 'heroScrollCueChevron 2s ease-in-out 0.6s infinite' }}><polyline points="4 3 16 11 28 3" /></svg>
        </div>
      </div>
    </>,
    document.body
  );
}
