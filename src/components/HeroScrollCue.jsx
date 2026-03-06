import React from 'react';
import { createPortal } from 'react-dom';

/**
 * HeroScrollCue — bottom-center "Scroll to explore" indicator.
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
          gap: 10,
          zIndex: 9999,
          cursor: 'pointer',
          transition: 'opacity 0.4s ease',
          opacity: visible ? 1 : 0,
          pointerEvents: visible ? 'auto' : 'none',
        }}
      >
        <span style={{
          color: 'rgba(0,0,0,0.40)',
          fontSize: '0.7rem',
          fontWeight: 500,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
        }}>Scroll to explore</span>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <svg viewBox="0 0 24 24" style={{ width: 28, height: 28, fill: 'none', stroke: 'rgba(0,0,0,0.30)', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', animation: 'heroScrollCueChevron 2s ease-in-out infinite' }}><polyline points="6 9 12 15 18 9" /></svg>
          <svg viewBox="0 0 24 24" style={{ width: 28, height: 28, fill: 'none', stroke: 'rgba(0,0,0,0.30)', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', marginTop: -14, animation: 'heroScrollCueChevron 2s ease-in-out 0.3s infinite' }}><polyline points="6 9 12 15 18 9" /></svg>
          <svg viewBox="0 0 24 24" style={{ width: 28, height: 28, fill: 'none', stroke: 'rgba(0,0,0,0.30)', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', marginTop: -14, animation: 'heroScrollCueChevron 2s ease-in-out 0.6s infinite' }}><polyline points="6 9 12 15 18 9" /></svg>
        </div>
      </div>
    </>,
    document.body
  );
}
