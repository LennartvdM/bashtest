import React, { useEffect, useRef } from 'react';

export default function HeroScrollCue({ onClick }) {
  const blueRef = useRef(null);
  const redRef = useRef(null);
  const yellowRef = useRef(null);
  const bS0 = useRef(null);
  const bS1 = useRef(null);
  const rS0 = useRef(null);
  const rS1 = useRef(null);
  const yS0 = useRef(null);
  const yS1 = useRef(null);
  const rafId = useRef(null);

  useEffect(() => {
    const lerp = (a, b, t) => a + (b - a) * t;

    const pos = (t, delay) => {
      const phase = ((t - delay) / 2.4) * Math.PI * 2;
      return -4 + 8 * (0.5 + 0.5 * Math.sin(phase - Math.PI / 2));
    };

    const update = () => {
      const t = performance.now() / 1000;

      const cutterY = pos(t, 0);
      const blueY = pos(t, 0.15);
      const redY = pos(t, 0.3);
      const yellowY = pos(t, 0.45);

      if (blueRef.current)
        blueRef.current.setAttribute('transform', `translate(0, ${(0 + cutterY) - (18 + blueY)})`);
      if (redRef.current)
        redRef.current.setAttribute('transform', `translate(0, ${(18 + blueY) - (63 + redY)})`);
      if (yellowRef.current)
        yellowRef.current.setAttribute('transform', `translate(0, ${(63 + redY) - (108 + yellowY)})`);

      const stops = [
        { s0: bS0.current, s1: bS1.current, delay: 0.15 },
        { s0: rS0.current, s1: rS1.current, delay: 0.3 },
        { s0: yS0.current, s1: yS1.current, delay: 0.45 },
      ];

      for (const s of stops) {
        if (!s.s0 || !s.s1) continue;
        const phase = ((t - s.delay) / 2.4) * Math.PI * 2;
        const wave = 0.5 + 0.5 * Math.sin(phase - Math.PI / 2);
        const op = lerp(0.12, 0.55, wave);
        const g0 = Math.round(lerp(140, 210, wave));
        const g1 = Math.round(lerp(160, 220, wave));
        s.s0.setAttribute('stop-color', `rgba(${g0},${g0},${g0},${op})`);
        s.s1.setAttribute('stop-color', `rgba(${g1},${g1},${g1},${op * 0.75})`);
      }

      rafId.current = requestAnimationFrame(update);
    };

    rafId.current = requestAnimationFrame(update);
    return () => { if (rafId.current) cancelAnimationFrame(rafId.current); };
  }, []);

  const tall = "M25,4 L10,20 L10,55 L72,115 Q80,125 88,115 L150,55 L150,20 L135,4 Q132,0 128,0 L28,0 Q25,0 25,4Z";
  const short = "M25,4 L10,18 L72,78 Q80,88 88,78 L150,18 L135,4 Q132,0 128,0 L28,0 Q25,0 25,4Z";

  return (
    <div
      className="absolute bottom-6 left-1/2 cursor-pointer z-20"
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-label="Scroll to next section"
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onClick?.(); }}
      style={{ transform: 'translateX(-50%) scale(0.35)', transformOrigin: 'center bottom' }}
    >
      {/* Shared path defs */}
      <svg style={{ position: 'absolute', width: 0, height: 0 }}>
        <defs>
          <path id="hs-tall" d={tall} />
          <path id="hs-short" d={short} />
        </defs>
      </svg>

      <div style={{ position: 'relative', width: 160, height: 280 }}>

        {/* Layer 1 — top, cut by invisible cutter */}
        <div style={{
          position: 'absolute', left: 0, top: 18, width: 160, height: 150,
          zIndex: 3, animation: 'hsc-bob 2.4s ease-in-out infinite 0.15s',
        }}>
          <svg viewBox="0 0 160 150" width="160" height="150" style={{ overflow: 'visible' }}>
            <defs>
              <mask id="hsc-m1">
                <use href="#hs-tall" fill="white" />
                <g ref={blueRef}>
                  <use href="#hs-short" fill="black" stroke="black" strokeWidth="10" strokeLinejoin="round" />
                </g>
              </mask>
              <linearGradient id="hsc-g1" x1="0" y1="0" x2="1" y2="1">
                <stop ref={bS0} offset="0%" stopColor="rgba(160,160,160,0.5)" />
                <stop ref={bS1} offset="100%" stopColor="rgba(190,190,190,0.35)" />
              </linearGradient>
            </defs>
            <use href="#hs-tall" fill="url(#hsc-g1)" mask="url(#hsc-m1)" />
          </svg>
        </div>

        {/* Layer 2 — middle, cut by layer 1 */}
        <div style={{
          position: 'absolute', left: 0, top: 63, width: 160, height: 150,
          zIndex: 2, animation: 'hsc-bob 2.4s ease-in-out infinite 0.3s',
        }}>
          <svg viewBox="0 0 160 150" width="160" height="150" style={{ overflow: 'visible' }}>
            <defs>
              <mask id="hsc-m2">
                <use href="#hs-tall" fill="white" />
                <g ref={redRef}>
                  <use href="#hs-tall" fill="black" stroke="black" strokeWidth="10" strokeLinejoin="round" />
                </g>
              </mask>
              <linearGradient id="hsc-g2" x1="0" y1="0" x2="1" y2="1">
                <stop ref={rS0} offset="0%" stopColor="rgba(160,160,160,0.5)" />
                <stop ref={rS1} offset="100%" stopColor="rgba(190,190,190,0.35)" />
              </linearGradient>
            </defs>
            <use href="#hs-tall" fill="url(#hsc-g2)" mask="url(#hsc-m2)" />
          </svg>
        </div>

        {/* Layer 3 — bottom, cut by layer 2 */}
        <div style={{
          position: 'absolute', left: 0, top: 108, width: 160, height: 150,
          zIndex: 1, animation: 'hsc-bob 2.4s ease-in-out infinite 0.45s',
        }}>
          <svg viewBox="0 0 160 150" width="160" height="150" style={{ overflow: 'visible' }}>
            <defs>
              <mask id="hsc-m3">
                <use href="#hs-tall" fill="white" />
                <g ref={yellowRef}>
                  <use href="#hs-tall" fill="black" stroke="black" strokeWidth="10" strokeLinejoin="round" />
                </g>
              </mask>
              <linearGradient id="hsc-g3" x1="0" y1="0" x2="1" y2="1">
                <stop ref={yS0} offset="0%" stopColor="rgba(160,160,160,0.5)" />
                <stop ref={yS1} offset="100%" stopColor="rgba(190,190,190,0.35)" />
              </linearGradient>
            </defs>
            <use href="#hs-tall" fill="url(#hsc-g3)" mask="url(#hsc-m3)" />
          </svg>
        </div>

      </div>

      <style>{`
        @keyframes hsc-bob {
          0%, 100% { transform: translateY(-4px); }
          50% { transform: translateY(4px); }
        }
      `}</style>
    </div>
  );
}
