import { useState, useRef, useEffect, useLayoutEffect } from "react";

const AUTOPLAY_MS = 6000;
const LOADING_BAR_FADE_DELAY = 500; // ms

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
  /* --------------------- state & refs --------------------- */
  const [active, setActive] = useState(0);
  const [rect, setRect] = useState({ top: 0, height: 0 });
  const [ready, setReady] = useState(false);
  const [progress, setProgress] = useState(0); // 0 to 1
  const [paused, setPaused] = useState(false);
  const [highlightTop, setHighlightTop] = useState(0);
  const [highlightHeight, setHighlightHeight] = useState(0);

  const raf = useRef();
  const startTime = useRef();
  const rowRefs = useRef([]);

  /* ----------------------- autoplay & progress ----------------------- */
  const animateProgress = (timestamp) => {
    if (!startTime.current) startTime.current = timestamp;
    const elapsed = timestamp - startTime.current;
    if (!paused) {
      setProgress(Math.min(elapsed / AUTOPLAY_MS, 1));
    }
    if (elapsed < AUTOPLAY_MS && !paused) {
      raf.current = requestAnimationFrame(animateProgress);
    } else if (!paused) {
      setProgress(0);
      setActive((p) => (p + 1) % slides.length);
      startTime.current = null;
      raf.current = requestAnimationFrame(animateProgress);
    }
  };

  // Start progress bar and autoplay
  const start = () => {
    cancelAnimationFrame(raf.current);
    setProgress(0);
    startTime.current = null;
    raf.current = requestAnimationFrame(animateProgress);
  };

  useEffect(() => {
    start();
    return () => cancelAnimationFrame(raf.current);
    // eslint-disable-next-line
  }, []);

  // Pause/resume progress on hover
  useEffect(() => {
    if (paused) {
      cancelAnimationFrame(raf.current);
    } else {
      // When resuming, calculate the new start time based on current progress
      const currentProgress = progress;
      const remainingTime = AUTOPLAY_MS * (1 - currentProgress);
      startTime.current = performance.now() - (AUTOPLAY_MS - remainingTime);
      raf.current = requestAnimationFrame(animateProgress);
    }
    // eslint-disable-next-line
  }, [paused, progress]);

  // Highlight bar movement logic
  useLayoutEffect(() => {
    const node = rowRefs.current[active];
    if (node) {
      const { offsetTop, offsetHeight } = node;
      setHighlightTop(offsetTop);
      setHighlightHeight(offsetHeight);
      setRect({ top: offsetTop, height: offsetHeight });
      setReady(true);
    }
    // eslint-disable-next-line
  }, [active]);

  useEffect(() => {
    window.addEventListener("resize", () => {
      const node = rowRefs.current[active];
      if (node) {
        const { offsetTop, offsetHeight } = node;
        setRect({ top: offsetTop, height: offsetHeight });
        setHighlightTop(offsetTop);
        setHighlightHeight(offsetHeight);
      }
    });
    return () => window.removeEventListener("resize", () => {});
    // eslint-disable-next-line
  }, [active]);

  const barKey = active;

  const handleSelect = (i) => {
    setActive(i);
    setProgress(0);
    startTime.current = null;
    raf.current = requestAnimationFrame(animateProgress);
  };

  /* ----------------------- render ------------------------- */
  return (
    <div className="flex flex-col max-w-5xl mx-auto p-8 md:p-14 font-cabin h-full w-full">
      <h2 className="text-5xl md:text-6xl font-extrabold text-slate-800 leading-tight mb-10 text-left">
        In the moment, <span className="text-teal-500">only</span> the patient<br className="hidden md:block" /> matters
      </h2>

      <div className={`flex flex-col md:flex-row gap-10 grow items-center md:items-start ${reverse ? "md:flex-row-reverse" : ""}`}>
        {/* Image/Slide Placeholder */}
        <div className="relative basis-1/2 flex items-center justify-center">
          <div className="overflow-hidden rounded-2xl shadow-lg bg-gray-300 min-h-[260px] min-w-[340px] max-w-[420px] w-full h-[240px] md:h-[280px] flex items-center justify-center">
            {/* Replace this with an <img> when ready */}
            <span className="text-6xl md:text-7xl text-teal-600 font-bold opacity-70 select-none">
              {slides[active].content}
            </span>
          </div>
        </div>

        {/* Text & Tabs */}
        <div
          onMouseLeave={() => setPaused(false)}
          onMouseEnter={() => setPaused(true)}
          className="basis-1/2 flex flex-col justify-center gap-4 relative min-w-[260px]"
        >
          {/* highlight bar/card - masked loading bar */}
          {ready && (
            <div
              className="absolute left-0 w-full rounded-xl bg-white/90 shadow-md transition-[top,height] duration-300 ease-[cubic-bezier(0.44,_0,_0.56,_1)] pointer-events-none"
              style={{
                top: highlightTop,
                height: highlightHeight,
                zIndex: 1,
                overflow: 'hidden',
              }}
            >
              <div
                key={barKey}
                className="absolute left-0 bottom-0 h-[3px] bg-teal-400 rounded-b-xl transition-all duration-200"
                style={{ width: `${progress * 100}%`, transition: paused ? 'none' : 'width 0.2s linear' }}
              />
            </div>
          )}

          {headlines.map((text, i) => (
            <button
              key={i}
              ref={(el) => (rowRefs.current[i] = el)}
              onClick={() => handleSelect(i)}
              className={`relative z-10 text-left py-4 px-6 rounded-xl transition-all duration-300 font-medium text-lg md:text-xl shadow-none ${
                active === i
                  ? "bg-white/80 shadow-md text-slate-700 font-semibold"
                  : "bg-transparent text-slate-500 hover:bg-slate-100"
              }`}
            >
              {text}
            </button>
          ))}
        </div>
      </div>

      {/* keyframes for progress bar (legacy, not used now) */}
      {/* <style>{`@keyframes grow{from{width:0}to{width:100%}}`}</style> */}
    </div>
  );
}

export default MedicalCarousel; 