import React, { useRef, useEffect, memo } from 'react';

const TabletMedicalCarousel = memo(function TabletMedicalCarousel({ videos = [], current = 0, onChange, onPauseChange, className, style, sectionActive = true }) {
  const containerRef = useRef(null);
  const videoRefs = useRef([null, null, null]);
  const [deckLoaded, setDeckLoaded] = React.useState(false);

  // Defer loading of lower deck videos - load top video first, then rest after grace period
  useEffect(() => {
    const timer = setTimeout(() => setDeckLoaded(true), 500);
    return () => clearTimeout(timer);
  }, []);

  // Pause/play videos - only play the topmost visible video (current) and base (2)
  // Others are stacked underneath and don't need to decode frames
  // When section is off-screen, pause ALL videos to free GPU decode.
  useEffect(() => {
    videoRefs.current.forEach((video, idx) => {
      if (!video) return;
      if (sectionActive && (idx === current || idx === 2)) {
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    });
  }, [current, deckLoaded, sectionActive]);

  // Ensure there are 3 valid slides
  const videoSlides = [
    videos[0] || {},
    videos[1] || videos[0] || {},
    videos[2] || videos[1] || videos[0] || {},
  ];

  // Opacity logic: upper cards (>= current) are visible, lower (< current) fade away
  const getOpacity = idx => (idx >= current ? 1 : 0);
  const getZ = idx => 10 - idx; // Higher z for upper layers

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
            zIndex: getZ(i),
            opacity: getOpacity(i),
            background: 'none',
            transition: 'opacity 1.2s cubic-bezier(0.4,0,0.2,1)',
            pointerEvents: i === current ? 'auto' : 'none',
          }}
        >
          <video
            ref={el => { videoRefs.current[i] = el; }}
            src={i === 0 || deckLoaded ? videoSlides[i]?.video : undefined}
            className="w-full h-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            tabIndex={-1}
            aria-hidden="true"
            draggable="false"
            style={{ outline: 'none', background: 'none', width: '100%', height: '100%' }}
          />
        </div>
      ))}
      {/* Left/Right tap zones for navigation */}
      <button
        aria-label="Previous"
        onClick={() => onChange?.((current - 1 + videos.length) % videos.length)}
        style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '15%', background: 'transparent', border: 'none', zIndex: 99 }}
      />
      <button
        aria-label="Next"
        onClick={() => onChange?.((current + 1) % videos.length)}
        style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '15%', background: 'transparent', border: 'none', zIndex: 99 }}
      />
    </div>
  );
});

export default TabletMedicalCarousel;
