import React, { useRef, useEffect } from 'react';

// Deck-of-cards tablet video carousel
export default function TabletMedicalCarousel({ videos = [], current = 0, onChange, onPauseChange, className, style }) {
  const containerRef = useRef(null);

  // Ensure we always have 3 videos to match deck-of-cards logic
  let videoSlides = videos;
  if (videos.length < 3) {
    videoSlides = [
      videos[0] || {},
      videos[1] || videos[0] || {},
      videos[2] || videos[1] || videos[0] || {},
    ];
  }

  // Determine opacity for each layer (0=top, 1=middle, 2=base)
  // Only fade out upper cards to reveal lower ones; never fade in
  // Use 1.2s for the opacity transition (match highlighter speed)
  const getOpacity = idx => {
    if (current === 0) return idx === 0 ? 1 : 1;
    if (current === 1) return idx === 0 ? 0 : idx === 1 ? 1 : 1;
    if (current === 2) return idx === 0 ? 0 : idx === 1 ? 0 : 1;
    return 1;
  };
  return (
    <div
      ref={containerRef}
      className={className}
      style={{ position: 'relative', touchAction: 'pan-y', ...style }}
    >
      {[2, 1, 0].map(i => (
        <div
          key={videoSlides[i]?.id || i}
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: 16,
            overflow: 'hidden',
            zIndex: i + 1,
            opacity: getOpacity(i),
            background: 'none',
            transition: 'opacity 1.2s cubic-bezier(0.4,0,0.2,1)',
            pointerEvents: i === current ? 'auto' : 'none',
          }}
        >
          <video
            src={videoSlides[i]?.video}
            className="w-full h-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            tabIndex={-1}
            aria-hidden="true"
            draggable="false"
            style={{ outline: 'none', background: 'none', width: '100%', height: '100%' }}
          />
        </div>
      ))}
      {/* Left/Right tap zones for accessibility (optional) */}
      <button
        aria-label="Previous"
        onClick={() => onChange?.((current - 1 + videos.length) % videos.length)}
        style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '15%', background: 'transparent', border: 'none', zIndex: 10 }}
      />
      <button
        aria-label="Next"
        onClick={() => onChange?.((current + 1) % videos.length)}
        style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '15%', background: 'transparent', border: 'none', zIndex: 10 }}
      />
    </div>
  );
}


