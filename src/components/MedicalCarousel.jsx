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

function MedicalCarousel({ reverse = false, onSlideChange, onCenterChange, onHighlighterRightChange }) {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [barKey, setBarKey] = useState(0);
  const [rect, setRect] = useState({ top: 0, height: 0 });
  const [ready, setReady] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [videoRect, setVideoRect] = useState({ left: 0, top: 0, width: 0, height: 0 });

  const rowRefs = useRef([]);
  const autoplayRef = useRef();
  const isMounted = useRef(true);
  const captionsRef = useRef();
  const videoContainerRef = useRef(null);
  const [center, setCenter] = useState({ x: 0, y: 0 });

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
      if (autoplayRef.current) {
        clearTimeout(autoplayRef.current);
      }
    };
  }, []);

  // Highlight position measurement
  const measure = () => {
    // Always use current, never null
    const node = rowRefs.current[current];
    if (node) {
      const { offsetTop, offsetHeight } = node;
      setRect({ top: offsetTop, height: offsetHeight });
      setReady(true);
    }
  };

  useLayoutEffect(measure, [current]);

  useLayoutEffect(() => {
    // After first render, ensure all refs are set and measure widths
    measure();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    // Defer measurement until after refs are set and browser has painted
    const raf = requestAnimationFrame(() => {
      measure();
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  useLayoutEffect(() => {
    if (ready && Number.isFinite(current) && captionsRef.current && onHighlighterRightChange) {
      const captionsRect = captionsRef.current.getBoundingClientRect();
      const x = captionsRect.left + rect.left + rect.width + window.scrollX;
      const y = captionsRect.top + rect.top + rect.height / 2 + window.scrollY;
      onHighlighterRightChange({ x, y });
    }
  });

  // Autocycle: only if not paused
  useEffect(() => {
    if (isPaused || !isMounted.current) return;

    return () => {
      if (autoplayRef.current) {
        clearTimeout(autoplayRef.current);
      }
    };
  }, [current, isPaused]);

  // On loading bar animation end: advance if not paused
  const handleBarEnd = () => {
    if (!isPaused && isMounted.current) {
      setCurrent((c) => {
        const next = (c + 1) % slides.length;
        setBarKey((k) => k + 1);
        return next;
      });
    }
  };

  const handleHover = (index) => {
    if (typeof index === 'number' && index >= 0 && index < slides.length) {
      // Only reset the bar if hovering to a different caption
      if (index !== current) {
        setBarKey((k) => k + 1);
      }
      setCurrent(index);
      setIsPaused(true);
      setHoveredIndex(index);
    }
  };

  const handleHoverEnd = () => {
    setIsPaused(false);
    setHoveredIndex(null);
  };

  // Call onSlideChange whenever current changes
  useEffect(() => {
    if (onSlideChange) {
      onSlideChange(current);
    }
  }, [current, onSlideChange]);

  useEffect(() => {
    function updateCenter() {
      if (videoContainerRef.current) {
        const rect = videoContainerRef.current.getBoundingClientRect();
        const newCenter = {
          x: rect.left + rect.width / 2 + window.scrollX,
          y: rect.top + rect.height / 2 + window.scrollY,
        };
        setCenter(newCenter);
        if (onCenterChange) onCenterChange(newCenter);
      }
    }
    updateCenter();
    window.addEventListener("resize", updateCenter);
    window.addEventListener("scroll", updateCenter);
    return () => {
      window.removeEventListener("resize", updateCenter);
      window.removeEventListener("scroll", updateCenter);
    };
  }, [onCenterChange]);

  useLayoutEffect(() => {
    if (videoContainerRef.current) {
      const rect = videoContainerRef.current.getBoundingClientRect();
      setVideoRect({
        left: rect.left + window.scrollX,
        top: rect.top + window.scrollY,
        width: rect.width,
        height: rect.height,
      });
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center w-full">
      {/* Debug: Red rectangle extending from left edge to left edge of video */}
      <div
        style={{
          position: 'fixed',
          left: 0,
          top: videoRect.top,
          width: videoRect.left,
          height: videoRect.height,
          background: 'rgba(200,200,200,0.5)',
          mixBlendMode: 'soft-light',
          zIndex: 0,
          pointerEvents: 'none',
        }}
      />
      <div className="max-w-6xl mx-auto flex flex-col items-start">
        <h2 className="font-bold leading-tight mb-10 text-left" style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: 50,
          fontWeight: 700,
          letterSpacing: -2,
          lineHeight: 1.2,
          color: '#383437',
          marginLeft: 0
        }}>
          In the moment<br />
          <span style={{ color: '#529C9C' }}>only</span> the patient<br />
          matters
        </h2>
        <div className="inline-flex flex-row items-center mx-auto w-full">
          <div ref={videoContainerRef} className="relative overflow-hidden rounded-2xl bg-gray-300 min-h-[320px] min-w-[320px] max-w-[480px] w-[480px] h-[320px] flex items-center justify-center flex-shrink-0 mb-4 md:mb-0">
            {/* Transparent red rectangle, same height as video, extends left from video edge */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                left: 0,
                width: 'calc(50% - 240px)',
                background: 'rgba(255,0,0,0.3)',
                zIndex: 1,
                pointerEvents: 'none',
              }}
            />
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
                />
              </div>
            ))}
            {/* Highlighter right-edge line */}
            {ready && Number.isFinite(current) && captionsRef.current && (
              (() => {
                const captionsRect = captionsRef.current.getBoundingClientRect();
                const highlighterTop = captionsRect.top + rect.top + rect.height / 2 + window.scrollY;
                const highlighterRight = captionsRect.left + rect.left + rect.width + window.scrollX;
                return (
                  <div
                    style={{
                      position: 'fixed',
                      top: highlighterTop,
                      left: highlighterRight,
                      width: `calc(100vw - ${highlighterRight}px)`,
                      height: 2,
                      background: '#e0e0e0',
                      mixBlendMode: 'screen',
                      zIndex: 30,
                      pointerEvents: 'none',
                    }}
                  />
                );
              })()
            )}
          </div>
          <div className="flex flex-col justify-center max-w-xl flex-shrink" style={{paddingLeft: 64}}>
            <div className="relative flex flex-col gap-2 items-start w-full" ref={captionsRef}>
              {ready && Number.isFinite(current) && (
                <>
                  {/* Highlighter rectangle */}
                  <div
                    className="absolute rounded-xl transition-all duration-700 ease pointer-events-none overflow-hidden"
                    style={{
                      top: rect.top,
                      height: rect.height,
                      width: 444,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      paddingLeft: 24,
                      paddingRight: 24,
                      background: hoveredIndex === current ? 'rgba(228,228,228,0.7)' : 'rgba(232,232,232,0.7)',
                      borderRadius: 10,
                      boxShadow: hoveredIndex === current ? '1px 1px 2px 0px rgba(0,0,0,0.5)' : '1px 1px 2px 0px rgba(0,0,0,0.25)',
                      transition: 'top 600ms cubic-bezier(0.4, 0, 0.2, 1), height 600ms cubic-bezier(0.4, 0, 0.2, 1), /* hover effects */ color 100ms cubic-bezier(0.4, 0, 0.2, 1), box-shadow 100ms cubic-bezier(0.4, 0, 0.2, 1), background 100ms cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                  >
                    <div className="w-full h-full rounded-xl relative pointer-events-none">
                      {/* Loading Bar */}
                      <div
                        key={barKey}
                        className="absolute left-0 bottom-0 h-[3px]"
                        style={{
                          background: 'rgba(82,156,156,0.5)',
                          animation: `grow 7000ms linear forwards`,
                          animationPlayState: isPaused ? 'paused' : 'running',
                          left: -24,
                          width: '100%'
                        }}
                        onAnimationEnd={handleBarEnd}
                      />
                    </div>
                  </div>
                  {/* Second highlighter: animated line protruding to the right */}
                  <div
                    className="absolute transition-all duration-700 ease"
                    style={{
                      top: rect.top + rect.height / 2,
                      left: `calc(50% + ${444 / 2}px)`, // static width
                      width: '100vw',
                      height: 2,
                      background: '#e0e0e0',
                      mixBlendMode: 'screen',
                      zIndex: 40,
                      pointerEvents: 'none',
                      transform: 'translateY(-50%)',
                      transition: 'top 600ms cubic-bezier(0.4, 0, 0.2, 1), left 600ms cubic-bezier(0.4, 0, 0.2, 1), width 600ms cubic-bezier(0.4, 0, 0.2, 1)',
                    }}
                  />
                </>
              )}
              {headlines.map((headline, i) => (
                <button
                  key={i}
                  ref={(el) => (rowRefs.current[i] = el)}
                  onMouseEnter={() => handleHover(i)}
                  onMouseLeave={handleHoverEnd}
                  className="relative z-10 text-right py-3 rounded-xl transition-all duration-700 ease"
                  style={{
                    display: 'block',
                    maxWidth: 480,
                    minWidth: 320,
                    paddingLeft: 24,
                    paddingRight: 24,
                    margin: '0 auto',
                  }}
                >
                  <p className="m-0 text-right text-2xl leading-tight" style={{
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 500,
                    letterSpacing: '-0.5px',
                    color: hoveredIndex === i ? '#2D6A6A' : (current === i ? '#574B4B' : '#808080'),
                    transition: 'color 0.6s, transform 0.3s',
                    transform: hoveredIndex === i ? 'translateY(-1px)' : 'translateY(0)',
                  }}>
                    {headline.firstLine}
                    <br />
                    {headline.secondLine}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      {/* Keyframes for loading bar */}
      <style>{`
        @keyframes grow { from { width: 0; } to { width: 112%; } }
      `}</style>
    </div>
  );
}

export default MedicalCarousel;