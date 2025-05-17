import { useState, useRef, useLayoutEffect, useEffect } from "react";

const AUTOPLAY_MS = 6600; // 6.6 seconds
const HIGHLIGHTER_HORIZONTAL_PADDING = 48; // 24px on each side

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

function MedicalCarousel({ reverse = false }) {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [barKey, setBarKey] = useState(0);
  const [rect, setRect] = useState({ top: 0, height: 0 });
  const [ready, setReady] = useState(false);
  const [maxCaptionWidth, setMaxCaptionWidth] = useState(0);
  const [captionsWidth, setCaptionsWidth] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const rowRefs = useRef([]);
  const autoplayRef = useRef();
  const isMounted = useRef(true);
  const captionsRef = useRef();

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
    // Measure all caption widths for highlighter min-width
    const widths = rowRefs.current.map((el) => el ? el.offsetWidth : 0);
    setMaxCaptionWidth(Math.max(...widths, 0));
    // Measure captions container width for highlighter max-width
    if (captionsRef.current) {
      setCaptionsWidth(captionsRef.current.offsetWidth);
    }
  };

  useLayoutEffect(measure, [current]);

  // Autocycle: only if not paused
  useEffect(() => {
    if (isPaused || !isMounted.current) return;

    autoplayRef.current = setTimeout(() => {
      if (!isMounted.current) return;
      setCurrent((c) => {
        const next = (c + 1) % slides.length;
        setBarKey((k) => k + 1);
        return next;
      });
    }, AUTOPLAY_MS);

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

  return (
    <div className="min-h-screen flex flex-col items-center justify-center w-full bg-[#f5f8fa]">
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
          <div className="relative overflow-hidden rounded-2xl bg-gray-300 min-h-[320px] min-w-[320px] max-w-[480px] w-[480px] h-[320px] flex items-center justify-center flex-shrink-0 mb-4 md:mb-0">
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
          </div>
          <div className="flex flex-col justify-center max-w-xl flex-shrink" style={{paddingLeft: 64}}>
            <div className="relative flex flex-col gap-2 items-start w-full" ref={captionsRef}>
              {ready && Number.isFinite(current) && (
                <div
                  className="absolute rounded-xl transition-all duration-700 ease pointer-events-none"
                  style={{
                    top: rect.top,
                    height: rect.height,
                    width: maxCaptionWidth + HIGHLIGHTER_HORIZONTAL_PADDING,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: hoveredIndex === current ? '#e4e4e4' : '#e8e8e8',
                    borderRadius: 10,
                    boxShadow: hoveredIndex === current ? '1px 1px 2px 0px rgba(0,0,0,0.5)' : '1px 1px 2px 0px rgba(0,0,0,0.25)',
                    transition: 'top 600ms cubic-bezier(0.4, 0, 0.2, 1), height 600ms cubic-bezier(0.4, 0, 0.2, 1), /* hover effects */ color 100ms cubic-bezier(0.4, 0, 0.2, 1), box-shadow 100ms cubic-bezier(0.4, 0, 0.2, 1), background 100ms cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                >
                  <div className="w-full h-full rounded-xl overflow-hidden relative pointer-events-none">
                    {/* Loading Bar */}
                    <div
                      key={barKey}
                      className="absolute left-0 bottom-0 h-[3px]"
                      style={{
                        background: 'rgba(82,156,156,0.5)',
                        animation: `grow ${AUTOPLAY_MS}ms linear forwards`,
                        animationPlayState: isPaused ? 'paused' : 'running',
                        width: '100%'
                      }}
                      onAnimationEnd={handleBarEnd}
                    />
                  </div>
                </div>
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
        @keyframes grow { from { width: 0; } to { width: 100%; } }
      `}</style>
    </div>
  );
}

export default MedicalCarousel;