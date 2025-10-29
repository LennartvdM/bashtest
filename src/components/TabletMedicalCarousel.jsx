import React, { useRef, useEffect } from 'react';

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

  const active = videos[current];
  return (
    <div ref={containerRef} className={className} style={{ position: 'relative', touchAction: 'pan-y', ...style }}>
      <div style={{ position: 'absolute', inset: 0, borderRadius: 16, overflow: 'hidden' }}>
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


