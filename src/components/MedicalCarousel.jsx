import { useState, useRef, useLayoutEffect, useEffect } from "react";

const AUTOPLAY_MS = 6000;

const slides = [
  { id: "0", content: "1" },
  { id: "1", content: "2" },
  { id: "2", content: "3" },
];

const headlines = [
  "Medical interventions demand precision and urgency.",
  "Which makes coordination within teams vital for success.",
  "Task‑driven focus can lead to tunnel vision and misalignment.",
];

function MedicalCarousel({ reverse = false }) {
  const [active, setActive] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [barKey, setBarKey] = useState(0);
  const [rect, setRect] = useState({ top: 0, height: 0 });
  const [ready, setReady] = useState(false);

  const rowRefs = useRef([]);
  const autoplayRef = useRef();
  const isMounted = useRef(true);

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
    const node = rowRefs.current[active];
    if (node) {
      const { offsetTop, offsetHeight } = node;
      setRect({ top: offsetTop, height: offsetHeight });
      setReady(true);
    }
  };

  useLayoutEffect(measure, [active]);

  // Autocycle: only if not paused
  useEffect(() => {
    if (isPaused || !isMounted.current) return;

    autoplayRef.current = setTimeout(() => {
      if (!isMounted.current) return;
      
      setActive((a) => {
        const next = (a + 1) % slides.length;
        setBarKey((k) => k + 1);
        return next;
      });
    }, AUTOPLAY_MS);

    return () => {
      if (autoplayRef.current) {
        clearTimeout(autoplayRef.current);
      }
    };
  }, [active, isPaused]);

  // On loading bar animation end: advance if not paused
  const handleBarEnd = () => {
    if (!isPaused && isMounted.current) {
      setActive((a) => {
        const next = (a + 1) % slides.length;
        setBarKey((k) => k + 1);
        return next;
      });
    }
  };

  return (
    <div className="flex flex-col max-w-5xl mx-auto p-8 md:p-14 font-cabin h-full w-full">
      <h2 className="text-5xl md:text-6xl font-extrabold text-slate-800 leading-tight mb-10 text-left">
        In the moment, <span className="text-teal-500">only</span> the patient<br className="hidden md:block" /> matters
      </h2>

      <div className={`flex flex-col md:flex-row gap-10 grow items-center md:items-start ${reverse ? "md:flex-row-reverse" : ""}`}>
        {/* Slides (crossfade) */}
        <div className="relative basis-1/2 overflow-hidden rounded-2xl bg-gray-300 min-h-[260px] min-w-[340px] max-w-[420px] w-full h-[240px] md:h-[280px]">
          {slides.map((s, i) => (
            <div
              key={s.id}
              className={`absolute inset-0 flex items-center justify-center text-6xl md:text-7xl text-teal-600 font-bold transition-opacity duration-700 ease-in-out ${
                i === active ? "opacity-100 z-10" : "opacity-0 z-0"
              }`}
              style={{ pointerEvents: i === active ? 'auto' : 'none' }}
            >
              {s.content}
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div
          className="basis-1/2 relative flex flex-col justify-center gap-4 min-w-[260px]"
        >
          {/* Highlighter */}
          {ready && (
            <div
              className="absolute left-0 w-full rounded-xl bg-white/90 shadow-md transition-all duration-600 ease-[cubic-bezier(0.4,0,0.2,1)] pointer-events-none"
              style={{ top: rect.top, height: rect.height }}
            >
              <div className="w-full h-full rounded-xl overflow-hidden relative pointer-events-none">
                {/* Loading Bar */}
                <div
                  key={barKey}
                  className={`absolute left-0 bottom-0 h-[3px] bg-teal-500 loading-bar`}
                  style={{
                    animation: `grow ${AUTOPLAY_MS}ms linear forwards`,
                    animationPlayState: isPaused ? 'paused' : 'running',
                    width: '100%'
                  }}
                  onAnimationEnd={handleBarEnd}
                />
              </div>
            </div>
          )}

          {headlines.map((text, i) => (
            <button
              key={i}
              ref={(el) => (rowRefs.current[i] = el)}
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
              className="relative z-10 text-left py-4 px-6 rounded-xl transition-transform duration-600 ease-[cubic-bezier(0.4,0,0.2,1)] hover:translate-x-1"
            >
              <p
                className={`text-lg md:text-xl font-medium transition-all duration-600 ease-[cubic-bezier(0.4,0,0.2,1)] ${
                  active === i 
                    ? "text-teal-500 font-semibold" 
                    : "text-slate-500 hover:text-slate-600"
                }`}
              >
                {text}
              </p>
            </button>
          ))}
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