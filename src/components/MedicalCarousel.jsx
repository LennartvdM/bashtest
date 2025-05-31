import { useState, useRef, useLayoutEffect, useEffect } from "react";

const AUTOPLAY_MS = 6600; // 6.6 seconds

const slides = [
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

function MedicalCarousel({ current, setVideoCenter, hoveredIndex, isActive, videoHover, setVideoHover, interactionsEnabled }) {
  const videoContainerRef = useRef(null);

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
        minHeight: '320px', 
        minWidth: '320px', 
        maxWidth: '480px', 
        width: '480px', 
        height: '320px',
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
          src={slides[2].video}
          className="w-full h-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          alt={slides[2].alt}
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
      {/* Videos that fade in/out (only urgency and coordination) */}
      {[0, 1].map((i) => (
        <div
          key={slides[i].id}
          className={`absolute inset-0 flex items-center justify-center transition-opacity duration-700 ease ${
            i === current ? "opacity-100" : "opacity-0"
          }`}
          style={{ 
            pointerEvents: i === current ? 'auto' : 'none', 
            background: 'none', 
            borderRadius: '16px', 
            overflow: 'hidden',
            zIndex: i + 1 // Ensure proper stacking order
          }}
        >
          <video
            src={slides[i].video}
            className="w-full h-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            alt={slides[i].alt}
            tabIndex="-1"
            aria-hidden="true"
            draggable="false"
            style={{ 
              outline: 'none', 
              transition: 'outline 0.2s', 
              background: 'none',
              opacity: i === current ? 1 : 0,
              willChange: 'opacity'
            }}
          />
        </div>
      ))}
    </div>
  );
}

export default MedicalCarousel;