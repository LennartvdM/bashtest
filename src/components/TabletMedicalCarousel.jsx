import React, { useRef, useEffect, useState } from 'react';

// Touch-first, controlled carousel for tablet portrait
// Props:
// - videos: [{ id, video, alt }]
// - current: number
// - onChange: (nextIdx: number) => void
// - onPauseChange?: (paused: boolean) => void
// - className/style: optional wrappers
export default function TabletMedicalCarousel({ videos = [], current = 0, onChange, onPauseChange, className, style }) {
  const startXRef = useRef(null);
  const isPointerDownRef = useRef(false);
  const containerRef = useRef(null);
  const [prevIndex, setPrevIndex] = useState(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    console.log('[TabletCarousel] mounted with', videos.length, 'videos, current=', current);

    const onPointerDown = (e) => {
      isPointerDownRef.current = true;
      startXRef.current = e.clientX ?? (e.touches && e.touches[0]?.clientX);
      if (onPauseChange) onPauseChange(true);
      console.log('[TabletCarousel] pointer down');
    };
    const onPointerUp = (e) => {
      if (!isPointerDownRef.current) return;
      const endX = e.clientX ?? (e.changedTouches && e.changedTouches[0]?.clientX);
      if (typeof startXRef.current === 'number' && typeof endX === 'number') {
        const delta = endX - startXRef.current;
        if (Math.abs(delta) > 32) {
          if (delta < 0) {
            console.log('[TabletCarousel] swipe next');
            onChange?.((current + 1) % videos.length);
          } else {
            console.log('[TabletCarousel] swipe prev');
            onChange?.((current - 1 + videos.length) % videos.length);
          }
        }
      }
      isPointerDownRef.current = false;
      startXRef.current = null;
      if (onPauseChange) onPauseChange(false);
    };
    const onPointerCancel = () => {
      isPointerDownRef.current = false;
      startXRef.current = null;
      if (onPauseChange) onPauseChange(false);
    };

    el.addEventListener('touchstart', onPointerDown, { passive: true });
    el.addEventListener('touchend', onPointerUp, { passive: true });
    el.addEventListener('touchcancel', onPointerCancel, { passive: true });
    el.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerCancel);

    return () => {
      el.removeEventListener('touchstart', onPointerDown);
      el.removeEventListener('touchend', onPointerUp);
      el.removeEventListener('touchcancel', onPointerCancel);
      el.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerCancel);
    };
  }, [current, videos.length, onChange, onPauseChange]);

  // Track previous index to enable crossfade
  useEffect(() => {
    setPrevIndex((prev) => (prev === current ? prev : prev === null ? current : prev));
    // On current change, set previous to last value and clear after fade
    const timeout = setTimeout(() => setPrevIndex(current), 720); // match fade duration
    return () => clearTimeout(timeout);
  }, [current]);

  const active = videos[current];
  const prev = typeof prevIndex === 'number' && prevIndex !== current ? videos[prevIndex] : null;
  return (
    <div ref={containerRef} className={className} style={{ position: 'relative', touchAction: 'pan-y', ...style }}>
      <style>
        {`
          @keyframes tablet-fade-in { from { opacity: 0; } to { opacity: 1; } }
          @keyframes tablet-fade-out { from { opacity: 1; } to { opacity: 0; } }
          @media (prefers-reduced-motion: reduce) {
            .tablet-fade-in, .tablet-fade-out { animation: none !important; }
          }
        `}
      </style>
      {/* Previous layer fading out */}
      {prev && (
        <div className="tablet-fade-out" style={{ position: 'absolute', inset: 0, borderRadius: 16, overflow: 'hidden', animation: 'tablet-fade-out 700ms ease', pointerEvents: 'none', zIndex: 1 }}>
          <video
            key={`prev-${prev?.id}`}
            src={prev?.video}
            className="w-full h-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            tabIndex={-1}
            aria-hidden="true"
            draggable="false"
            style={{ outline: 'none', background: 'none' }}
          />
        </div>
      )}
      {/* Active layer fading in */}
      <div className="tablet-fade-in" style={{ position: 'absolute', inset: 0, borderRadius: 16, overflow: 'hidden', animation: 'tablet-fade-in 700ms ease', zIndex: 2 }}>
        <video
          key={active?.id}
          src={active?.video}
          className="w-full h-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          tabIndex={-1}
          aria-hidden="true"
          draggable="false"
          style={{ outline: 'none', background: 'none' }}
        />
      </div>
      {/* Left/Right tap zones for accessibility (optional) */}
      <button aria-label="Previous" onClick={() => { console.log('[TabletCarousel] tap prev'); onChange?.((current - 1 + videos.length) % videos.length); }} style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '15%', background: 'transparent', border: 'none', zIndex: 5 }} />
      <button aria-label="Next" onClick={() => { console.log('[TabletCarousel] tap next'); onChange?.((current + 1) % videos.length); }} style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '15%', background: 'transparent', border: 'none', zIndex: 5 }} />
    </div>
  );
}


