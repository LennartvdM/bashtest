import { useState, useRef, useLayoutEffect, useEffect } from "react";

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

function MedicalCarousel({ current, setVideoCenter, hoveredIndex, isActive, videoHover, setVideoHover, interactionsEnabled, videos }) {
  const videoContainerRef = useRef(null);

  // Use videos prop if provided, otherwise fallback to default slides
  const videoSlides = videos || defaultSlides;

  useEffect(() => {
    function updateCenter() {
      if (videoContainerRef.current) {
        const rect = videoContainerRef.current.getBoundingClientRect();
        const newCenter = {
          x: rect.left + rect.width / 2 + window.scrollX,
          y: rect.top + rect.height / 2 + window.scrollY,
        };
        setVideoCenter && setVideoCenter(newCenter);
      }
    }
    updateCenter();
    window.addEventListener("resize", updateCenter);
    window.addEventListener("scroll", updateCenter);
    return () => {
      window.removeEventListener("resize", updateCenter);
      window.removeEventListener("scroll", updateCenter);
    };
  }, [setVideoCenter]);

  return (
    <div 
      className="inline-flex flex-row items-center mx-auto w-full relative" 
      style={{
        position: 'relative', 
        minHeight: '0px',
        minWidth: '280px',
        maxWidth: '480px',
        width: 'min(92vw, 480px)',
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
          src={videoSlides[2].video}
          className="w-full h-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          alt={videoSlides[2].alt}
          tabIndex="-1"
          aria-hidden="true"
          draggable="false"
          style={{ 
            outline: 'none', 
            transition: 'outline 0.2s', 
            background: 'none',
            opacity: 1 // Always fully visible
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
            className="absolute inset-0 flex items-center justify-center transition-opacity duration-700 ease"
            style={{ 
              pointerEvents: i === current ? 'auto' : 'none', 
              background: 'none', 
              borderRadius: '16px', 
              overflow: 'hidden',
              zIndex: 2 - i, // Reverse the z-index so urgency (0) is on top of coordination (1)
              opacity: opacity
            }}
          >
            <video
              src={videoSlides[i].video}
              className="w-full h-full object-cover"
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
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
    </div>
  );
}

export default MedicalCarousel;