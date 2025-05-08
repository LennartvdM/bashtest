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
    <div className="flex flex-col max-w-[1200px] mx-auto p-10 font-cabin bg-slate-50 h-full w-full">
      <h2 className="text-4xl md:text-5xl font-semibold text-slate-800 leading-tight mb-10">
        In the moment, <span className="text-teal-600">only</span> the patient matters
      </h2>

      <div className={`flex flex-col md:flex-row gap-8 grow ${reverse ? "md:flex-row-reverse" : ""}`}>
        {/* Slides */}
        <div className="relative basis-1/2 overflow-hidden rounded-2xl bg-gray-300 min-h-[300px]">
          {slides.map((s, i) => (
            <div
              key={s.id}
              className={`absolute inset-0 flex items-center justify-center text-7xl text-teal-600 transition-opacity duration-[600ms] ease-[cubic-bezier(0.44,_0,_0.56,_1)] ${
                i === target ? "opacity-100" : "opacity-0"
              }`}
            >
              {s.content}
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div
          onMouseLeave={() => {
            setHover(null);
            start();
          }}
          className="basis-2/5 relative flex flex-col justify-center gap-2"
        >
          {/* highlight bar */}
          {ready && (
            <div
              className="absolute left-0 w-full rounded-lg bg-white/90 shadow-sm transition-[top,height] duration-[600ms] ease-[cubic-bezier(0.44,_0,_0.56,_1)] pointer-events-none"
              style={{ top: rect.top, height: rect.height }}
            >
              {hover === null && (
                <div
                  key={barKey}
                  className="absolute left-0 bottom-0 h-[3px] bg-teal-600 animate-[grow_6s_linear_forwards]"
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
              className="relative z-10 text-left py-4 px-5 rounded-lg"
            >
              <p
                className={`text-lg font-semibold break-words transition-colors duration-[600ms] ease-[cubic-bezier(0.44,_0,_0.56,_1)] ${
                  target === i ? "text-teal-600" : "text-slate-800"
                }`}
              >
                {text}
              </p>
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