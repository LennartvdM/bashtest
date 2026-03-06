import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

const TALL_HOUSE = 'M25,4 L10,20 L10,55 L72,115 Q80,125 88,115 L150,55 L150,20 L135,4 Q132,0 128,0 L28,0 Q25,0 25,4Z';
const SHORT_HOUSE = 'M25,4 L10,18 L72,78 Q80,88 88,78 L150,18 L135,4 Q132,0 128,0 L28,0 Q25,0 25,4Z';

const LAYERS = [
  { className: 'hsc-layer-blue', top: 18, delay: 0.15, maskId: 'hscBlueMask', cutId: 'hscBlueCut', gradId: 'hscGBlue', s0Id: 'hscBStop0', s1Id: 'hscBStop1' },
  { className: 'hsc-layer-red', top: 63, delay: 0.3, maskId: 'hscRedMask', cutId: 'hscRedCut', gradId: 'hscGRed', s0Id: 'hscRStop0', s1Id: 'hscRStop1' },
  { className: 'hsc-layer-yellow', top: 108, delay: 0.45, maskId: 'hscYellowMask', cutId: 'hscYellowCut', gradId: 'hscGYellow', s0Id: 'hscYStop0', s1Id: 'hscYStop1' },
];

// The "cutter" layer (index 0 in animation) has delay 0
const CUTTER_DELAY = 0;

function lerp(a, b, t) { return a + (b - a) * t; }

function pos(t, delay) {
  const phase = ((t - delay) / 2.4) * Math.PI * 2;
  return -4 + 8 * (0.5 + 0.5 * Math.sin(phase - Math.PI / 2));
}

/**
 * HeroScrollCue — bottom-center animated chevrons with masked SVG layers.
 * 3 staggered chevron shapes built via SVG mask cutouts.
 * Visible only on the hero slide (index 0), fades out on scroll.
 * Rendered via portal to document.body to avoid parent CSS interference.
 */
export default function HeroScrollCue({ visible, onScroll }) {
  const rafRef = useRef(null);
  const refsRef = useRef({ cuts: [], stops: [] });

  useEffect(() => {
    const cuts = LAYERS.map(l => document.getElementById(l.cutId));
    const stops = LAYERS.map(l => ({
      s0: document.getElementById(l.s0Id),
      s1: document.getElementById(l.s1Id),
      delay: l.delay,
    }));
    refsRef.current = { cuts, stops };

    function update() {
      const t = performance.now() / 1000;
      const { cuts: c, stops: s } = refsRef.current;

      const cutterY = pos(t, CUTTER_DELAY);
      const layerPositions = LAYERS.map(l => pos(t, l.delay));

      // Blue cut: cutter relative to blue
      if (c[0]) c[0].setAttribute('transform', `translate(0, ${(0 + cutterY) - (LAYERS[0].top + layerPositions[0])})`);
      // Red cut: blue relative to red
      if (c[1]) c[1].setAttribute('transform', `translate(0, ${(LAYERS[0].top + layerPositions[0]) - (LAYERS[1].top + layerPositions[1])})`);
      // Yellow cut: red relative to yellow
      if (c[2]) c[2].setAttribute('transform', `translate(0, ${(LAYERS[1].top + layerPositions[1]) - (LAYERS[2].top + layerPositions[2])})`);

      // Gradient opacity ripple
      for (const st of s) {
        if (!st.s0) continue;
        const phase = ((t - st.delay) / 2.4) * Math.PI * 2;
        const wave = 0.5 + 0.5 * Math.sin(phase - Math.PI / 2);

        const op = lerp(0.12, 0.55, wave);
        const g0 = Math.round(lerp(140, 210, wave));
        const g1 = Math.round(lerp(160, 220, wave));

        st.s0.setAttribute('stop-color', `rgba(${g0},${g0},${g0},${op})`);
        st.s1.setAttribute('stop-color', `rgba(${g1},${g1},${g1},${op * 0.75})`);
      }

      rafRef.current = requestAnimationFrame(update);
    }

    rafRef.current = requestAnimationFrame(update);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, []);

  return createPortal(
    <>
      <style>{`
        @keyframes hscBob {
          0%, 100% { transform: translateY(-4px); }
          50%      { transform: translateY(4px); }
        }
        .hsc-anchor {
          position: relative;
          width: 160px;
          height: 320px;
        }
        .hsc-layer {
          position: absolute;
          left: 0;
          width: 160px;
          height: 150px;
          animation: hscBob 2.4s ease-in-out infinite;
        }
        .hsc-layer svg {
          width: 100%;
          height: 100%;
          overflow: visible;
        }
        .hsc-layer-blue   { top: 18px;  z-index: 3; animation-delay: 0.15s; }
        .hsc-layer-red    { top: 63px;  z-index: 2; animation-delay: 0.3s; }
        .hsc-layer-yellow { top: 108px; z-index: 1; animation-delay: 0.45s; }
      `}</style>

      {/* Shared SVG defs (zero-size, hidden) */}
      <svg style={{ position: 'absolute', width: 0, height: 0 }}>
        <defs>
          <path id="hscTallHouse" d={TALL_HOUSE} />
          <path id="hscShortHouse" d={SHORT_HOUSE} />
        </defs>
      </svg>

      <div
        data-testid="hero-scroll-cue"
        onClick={onScroll}
        role="button"
        tabIndex={0}
        aria-label="Scroll down to begin"
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onScroll(); }}
        style={{
          position: 'fixed',
          bottom: 40,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          zIndex: 9999,
          cursor: 'pointer',
          transition: 'opacity 0.4s ease',
          opacity: visible ? 1 : 0,
          pointerEvents: visible ? 'auto' : 'none',
        }}
      >
        <div className="hsc-anchor">
          {LAYERS.map((layer, i) => (
            <div key={layer.maskId} className={`hsc-layer ${layer.className}`}>
              <svg viewBox="0 0 160 150">
                <defs>
                  <mask id={layer.maskId}>
                    <use href="#hscTallHouse" fill="white" />
                    <g id={layer.cutId}>
                      <use
                        href={i === 0 ? '#hscShortHouse' : '#hscTallHouse'}
                        fill="black"
                        stroke="black"
                        strokeWidth="10"
                        strokeLinejoin="round"
                      />
                    </g>
                  </mask>
                  <linearGradient id={layer.gradId} x1="0" y1="0" x2="1" y2="1">
                    <stop id={layer.s0Id} offset="0%" stopColor="rgba(160,160,160,0.5)" />
                    <stop id={layer.s1Id} offset="100%" stopColor="rgba(190,190,190,0.35)" />
                  </linearGradient>
                </defs>
                <use href="#hscTallHouse" fill={`url(#${layer.gradId})`} mask={`url(#${layer.maskId})`} />
              </svg>
            </div>
          ))}
        </div>
      </div>
    </>,
    document.body
  );
}
