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
  const [hover, setHover] = useState(null);
  const [paused, setPaused] = useState(false);
  const [barKey, setBarKey] = useState(0);
  const [rect, setRect] = useState({ top: 0, height: 0 });
  const [ready, setReady] = useState(false);

  const rowRefs = useRef([]);

  // Highlight position measurement
  const target = hover ?? active;

  const measure = () => {
    const node = rowRefs.current[target];
    if (node) {
      const { offsetTop, offsetHeight } = node;
      setRect({ top: offsetTop, height: offsetHeight });
      setReady(true);
    }
  };

  useLayoutEffect(measure, [target]);

  const handleHoverStart = (index) => {
    setPaused(true);
    setHover(index);
    setBarKey((k) => k + 1);
  };

  const handleHoverEnd = () => {
    setPaused(false);
    setBarKey((k) => k + 1);
  };

  // Advance to next slide and force new barKey
  const handleNextSlide = () => {
    if (!paused) {
      setActive((a) => (a + 1) % slides.length);
      setBarKey((k) => k + 1);
    }
  };

  return (
    <div className="flex flex-col max-w-5xl mx-auto p-8 md:p-14 font-cabin h-full w-full">
      <h2 className="text-5xl md:text-6xl font-extrabold text-slate-800 leading-tight mb-10 text-left">
        In the moment, <span className="text-teal-500">only</span> the patient<br className="hidden md:block" /> matters
      </h2>

      <div className={`flex flex-col md:flex-row gap-10 grow items-center md:items-start ${reverse ? "md:flex-row-reverse" : ""}`}>
        {/* Slides */}
        <div className="relative basis-1/2 overflow-hidden rounded-2xl bg-gray-300 min-h-[260px] min-w-[340px] max-w-[420px] w-full h-[240px] md:h-[280px]">
          {slides.map((s, i) => (
            <div
              key={s.id}
              className={`absolute inset-0 flex items-center justify-center text-6xl md:text-7xl text-teal-600 font-bold opacity-70 transition-all duration-600 ease-[cubic-bezier(0.4,0,0.2,1)] ${
                i === target ? "opacity-100 scale-100" : "opacity-0 scale-95"
              }`}
            >
              {s.content}
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div
          className="basis-1/2 relative flex flex-col justify-center gap-4 min-w-[260px]"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => handleHoverEnd()}
        >
          {/* Highlight bar */}
          {ready && (
            <div
              className="absolute left-0 w-full rounded-xl bg-white/90 shadow-md transition-all duration-600 ease-[cubic-bezier(0.4,0,0.2,1)] pointer-events-none"
              style={{ top: rect.top, height: rect.height }}
            >
              <div className="w-full h-full rounded-xl overflow-hidden relative pointer-events-none">
                <div
                  key={barKey}
                  className={`absolute left-0 bottom-0 h-[3px] bg-teal-500 loading-bar${paused ? " paused" : ""}`}
                  style={{ animationDuration: `${AUTOPLAY_MS}ms` }}
                  onAnimationEnd={handleNextSlide}
                />
              </div>
            </div>
          )}

          {headlines.map((text, i) => (
            <button
              key={i}
              ref={(el) => (rowRefs.current[i] = el)}
              onMouseEnter={() => handleHoverStart(i)}
              onMouseLeave={() => handleHoverEnd()}
              onClick={() => { setActive(i); setBarKey((k) => k + 1); }}
              className="relative z-10 text-left py-4 px-6 rounded-xl transition-transform duration-600 ease-[cubic-bezier(0.4,0,0.2,1)] hover:translate-x-1"
            >
              <p
                className={`text-lg md:text-xl font-medium transition-all duration-600 ease-[cubic-bezier(0.4,0,0.2,1)] ${
                  target === i 
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

      {/* Keyframes and loading bar pause style */}
      <style>{`
        @keyframes grow { from { width: 0; } to { width: 100%; } }
        .loading-bar { animation: grow linear forwards; }
        .paused.loading-bar { animation-play-state: paused; }
      `}</style>
    </div>
  );
}

export default MedicalCarousel;