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

function MedicalCarousel({ current, setVideoCenter, videoHover, setVideoHover }) {
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
    <div className="inline-flex flex-row items-center mx-auto w-full relative" style={{position: 'relative', minHeight: '320px', minWidth: '320px', maxWidth: '480px', width: '480px', height: '320px'}}>
      <div
        ref={videoContainerRef}
        className="relative z-10 overflow-hidden rounded-2xl bg-gray-300 w-full h-full flex items-center justify-center flex-shrink-0 group"
        onMouseEnter={() => setVideoHover(true)}
        onMouseLeave={() => setVideoHover(false)}
        style={{
          transition: 'transform 0.3s cubic-bezier(0.4,0,0.2,1), border 0.2s',
          transform: videoHover ? 'translateY(-12px)' : 'none',
          border: videoHover ? '2px solid #f5f5f5' : 'none',
          padding: '24px', // Add padding to ensure consistent spacing
        }}
      >
        {slides.map((s, i) => (
          <div
            key={s.id}
            className={`absolute inset-0 flex items-center justify-center transition-opacity duration-700 ease ${
              i === current ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
            style={{ pointerEvents: i === current ? 'auto' : 'none' }}
          >
            <video
              src={s.video}
              className="w-full h-full object-cover"
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              alt={s.alt}
              controls={false}
              controlsList="nodownload nofullscreen noremoteplayback"
              disablePictureInPicture
              tabIndex="-1"
              aria-hidden="true"
              style={{ outline: 'none', transition: 'outline 0.2s' }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default MedicalCarousel;