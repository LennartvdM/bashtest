import { useState, useRef, useEffect, useLayoutEffect } from "react";

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
  /* --------------------- state & refs --------------------- */
  const [active, setActive] = useState(0);
  const [hover, setHover] = useState(null);
  const [rect, setRect] = useState({ top: 0, height: 0 });
  const [ready, setReady] = useState(false);

  const timer = useRef();
  const rowRefs = useRef([]);

  /* ----------------------- autoplay ----------------------- */
  const clear = () => clearInterval(timer.current);

  const start = () => {
    clear();
    timer.current = setInterval(() => {
      setActive((p) => (p + 1) % slides.length);
    }, AUTOPLAY_MS);
  };

  useEffect(() => {
    start();
    return clear;
  }, []);

  const handleSelect = (i) => {
    setActive(i);
    start();
  };

  /* ---------------- measure highlight pos ----------------- */
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

  useEffect(() => {
    requestAnimationFrame(measure);
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [target]);

  /* ----------------------- render ------------------------- */
  const barKey = hover === null ? active : -1;

  return (
    <div className="flex flex-col max-w-5xl mx-auto p-8 md:p-14 font-cabin bg-[#f6fafd] rounded-3xl shadow-xl h-full w-full">
      <h2 className="text-5xl md:text-6xl font-extrabold text-slate-800 leading-tight mb-10 text-left">
        In the moment, <span className="text-teal-500">only</span> the patient<br className="hidden md:block" /> matters
      </h2>

      <div className={`flex flex-col md:flex-row gap-10 grow items-center md:items-start ${reverse ? "md:flex-row-reverse" : ""}`}>
        {/* Image/Slide Placeholder */}
        <div className="relative basis-1/2 flex items-center justify-center">
          <div className="overflow-hidden rounded-2xl shadow-lg bg-gray-300 min-h-[260px] min-w-[340px] max-w-[420px] w-full h-[240px] md:h-[280px] flex items-center justify-center">
            {/* Replace this with an <img> when ready */}
            <span className="text-6xl md:text-7xl text-teal-600 font-bold opacity-70 select-none">
              {slides[target].content}
            </span>
          </div>
        </div>

        {/* Text & Tabs */}
        <div
          onMouseLeave={() => {
            setHover(null);
            start();
          }}
          className="basis-1/2 flex flex-col justify-center gap-4 relative min-w-[260px]"
        >
          {/* highlight bar/card */}
          {ready && (
            <div
              className="absolute left-0 w-full rounded-xl bg-white/90 shadow-md transition-[top,height] duration-500 ease-[cubic-bezier(0.44,_0,_0.56,_1)] pointer-events-none"
              style={{ top: rect.top, height: rect.height }}
            >
              {hover === null && (
                <div
                  key={barKey}
                  className="absolute left-0 bottom-0 h-[3px] bg-teal-400 rounded-b-xl animate-[grow_6s_linear_forwards]"
                />
              )}
            </div>
          )}

          {headlines.map((text, i) => (
            <button
              key={i}
              ref={(el) => (rowRefs.current[i] = el)}
              onMouseEnter={() => {
                clear();
                setHover(i);
              }}
              onClick={() => handleSelect(i)}
              className={`relative z-10 text-left py-4 px-6 rounded-xl transition-all duration-300 font-medium text-lg md:text-xl shadow-none ${
                target === i
                  ? "bg-white/80 shadow-md text-slate-700 font-semibold"
                  : "bg-transparent text-slate-500 hover:bg-slate-100"
              }`}
            >
              {text}
            </button>
          ))}
        </div>
      </div>

      {/* keyframes for progress bar */}
      <style>{`@keyframes grow{from{width:0}to{width:100%}}`}</style>
    </div>
  );
}

export default MedicalCarousel; 