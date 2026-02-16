import React, { useRef, useEffect, useCallback, memo } from "react";
import { useThrottleWithTrailing } from "../../../hooks/useDebounce";

const AUTOPLAY_MS = 6600; // 6.6 seconds

// Default slides if no videos prop is provided
const defaultSlides = [
  { id: "0", video: "/videos/urgency.mp4", alt: "Medical urgency demonstration" },
  { id: "1", video: "/videos/coordination.mp4", alt: "Medical team coordination" },
  { id: "2", video: "/videos/focus.mp4", alt: "Medical focus and precision" },
];

const headlines = [
  {
    firstLine: "Medical interventions demand",
    secondLine: "precision and urgency."
  },
  {
    firstLine: "Which makes coordination within",
    secondLine: "teams vital for success."
  },
  {
    firstLine: "Task‑driven focus can lead to",
    secondLine: "tunnel vision and misalignment."
  }
];

/*
IMPORTANT: This is NOT a crossfade - it's a sequential card removal system.
State 0: A=100%, B=100% (stacked on top of each other)
State 1: A=0%, B=100% (remove top card A)
State 2: A=0%, B=0% (remove card B, reveal base C)

DO NOT "fix" this to crossfade between A and B.
The stacking is intentional to avoid ugly transitions.
*/

const MedicalCarousel = memo(function MedicalCarousel({ current, setVideoCenter, hoveredIndex, isActive, videoHover, setVideoHover, interactionsEnabled, videos, enableTouchNavigation, onTouchChange, sectionActive = true }) {
  const videoContainerRef = useRef(null);
  const videoRefs = useRef([null, null, null]);
  const [deckLoaded, setDeckLoaded] = React.useState(false);

  // Use videos prop if provided, otherwise fallback to default slides
  const videoSlides = videos || defaultSlides;

  // Defer loading of lower deck videos - load top video first, then rest after a grace period
  useEffect(() => {
    const timer = setTimeout(() => setDeckLoaded(true), 500);
    return () => clearTimeout(timer);
  }, []);

  // Pause/play videos based on visibility - only play the topmost visible video
  // Video 0 is on top, covers 1 and 2. Video 1 covers 2. No need to decode hidden videos.
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

  // Throttled center update to reduce resize/scroll handler frequency
  const updateCenter = useCallback(() => {
    if (videoContainerRef.current) {
      const rect = videoContainerRef.current.getBoundingClientRect();
      const newCenter = {
        x: rect.left + rect.width / 2 + window.scrollX,
        y: rect.top + rect.height / 2 + window.scrollY,
      };
      setVideoCenter && setVideoCenter(newCenter);
    }
  }, [setVideoCenter]);

  const throttledUpdateCenter = useThrottleWithTrailing(updateCenter, 100);

  useEffect(() => {
    updateCenter();
    window.addEventListener("resize", throttledUpdateCenter);
    window.addEventListener("scroll", throttledUpdateCenter, { passive: true });
    return () => {
      window.removeEventListener("resize", throttledUpdateCenter);
      window.removeEventListener("scroll", throttledUpdateCenter);
    };
  }, [updateCenter, throttledUpdateCenter]);

  return (
    <div 
      className="inline-flex flex-row items-center mx-auto w-full relative" 
      style={{
        position: 'relative', 
        minHeight: '0px',
        minWidth: '0px',
        maxWidth: '480px',
        width: '100%',
        height: 'auto',
        aspectRatio: '3 / 2',
        cursor: interactionsEnabled ? 'pointer' : 'default'
      }}
      onMouseEnter={() => interactionsEnabled && setVideoHover?.(true)}
      onMouseLeave={() => interactionsEnabled && setVideoHover?.(false)}
    >
      {/* Static base video (focus) as persistent background */}
      <div
        className="absolute inset-0 flex items-center justify-center z-0"
        style={{
          borderRadius: '16px',
          overflow: 'hidden',
        }}
      >
        <video
          ref={el => { videoRefs.current[2] = el; }}
          src={deckLoaded ? videoSlides[2].video : undefined}
          className="w-full h-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          alt={videoSlides[2].alt}
          tabIndex="-1"
          aria-hidden="true"
          draggable="false"
          style={{
            outline: 'none',
            transition: 'outline 0.2s',
            background: 'none',
            opacity: 1
          }}
        />
      </div>

      {/* Overlay videos that stack and remove sequentially */}
      {[0, 1].map((i) => {
        // Calculate opacity based on current state
        let opacity = 1;
        if (current === 0) {
          // State 0: Both videos at 100%
          opacity = 1;
        } else if (current === 1) {
          // State 1: First video at 0%, second at 100%
          opacity = i === 0 ? 0 : 1;
        } else {
          // State 2: Both videos at 0%
          opacity = 0;
        }

        return (
          <div
            key={videoSlides[i].id}
            className="absolute inset-0 flex items-center justify-center transition-opacity" // Remove duration-700, use style transition below
            style={{ 
              pointerEvents: i === current ? 'auto' : 'none', 
              background: 'none', 
              borderRadius: '16px', 
              overflow: 'hidden',
              zIndex: 2 - i, // Reverse the z-index so urgency (0) is on top of coordination (1)
              opacity: opacity,
              transition: 'opacity 1.2s cubic-bezier(0.4,0,0.2,1)' // Slower fade
            }}
          >
            <video
              ref={el => { videoRefs.current[i] = el; }}
              src={i === 0 || deckLoaded ? videoSlides[i].video : undefined}
              className="w-full h-full object-cover"
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              alt={videoSlides[i].alt}
              tabIndex="-1"
              aria-hidden="true"
              draggable="false"
              style={{
                outline: 'none',
                transition: 'outline 0.2s',
                background: 'none',
                opacity: 1, // Video itself is always at full opacity
                willChange: 'opacity'
              }}
            />
          </div>
        );
      })}
      {/* Touch navigation overlay for landscape tablets */}
      {enableTouchNavigation && (
        <>
          <button
            aria-label="Previous"
            onClick={() => onTouchChange?.((current - 1 + videoSlides.length) % videoSlides.length)}
            style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '15%', background: 'transparent', border: 'none', zIndex: 99, cursor: 'pointer' }}
          />
          <button
            aria-label="Next"
            onClick={() => onTouchChange?.((current + 1) % videoSlides.length)}
            style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '15%', background: 'transparent', border: 'none', zIndex: 99, cursor: 'pointer' }}
          />
        </>
      )}
    </div>
  );
});

export default MedicalCarousel;