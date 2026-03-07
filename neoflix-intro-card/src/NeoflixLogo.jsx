/**
 * NeoflixLogo — Animated SVG logo with hover + click interactions.
 *
 * The logo has three layers:
 *   - Inner Ring: the smaller crescent/eye shape
 *   - Outer Ring: the larger swooping arcs
 *   - Wordmark: the "Neoflix" text
 *
 * Animation sequence:
 *   1. Mount: rings start splayed apart (Inner: -62deg, Outer: +97deg)
 *   2. After autoPlayDelay ms: both spring to 0deg — the "unfurl" / assembly
 *   3. Hover (anywhere on logo): rings counter-rotate slightly (Inner: -6deg, Outer: +5deg)
 *   4. Click: rings snap back to splayed positions, then reassemble
 *
 * Dependencies: React 18+, framer-motion 11+
 */
import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";

// ---------------------------------------------------------------------------
// Spring configs
// ---------------------------------------------------------------------------

/** Heavy, weighty spring — the signature Neoflix overshoot feel. */
const SPRING_HEAVY = {
  type: "spring",
  damping: 24,
  mass: 9,
  stiffness: 500,
};

/**
 * Clatter spring — hefty mechanical impact.
 * High mass = weighty, slow oscillation period.
 * Low damping = rings out for several swings before settling.
 * Moderate stiffness = strong enough snap-back to create visible oscillation.
 */
const SPRING_CLATTER = {
  type: "spring",
  damping: 4,
  mass: 5,
  stiffness: 200,
};

/** Standard entrance spring. */
const SPRING_ENTRANCE = {
  type: "spring",
  damping: 30,
  mass: 1,
  stiffness: 400,
};

// ---------------------------------------------------------------------------
// Ring rotation values
// ---------------------------------------------------------------------------

const INNER_RING = { splayed: -62, assembled: 0, hover: -6 };
const OUTER_RING = { splayed: 97, assembled: 0, hover: 5 };

// Clatter impulse — hefty jolt on drop impact.
const CLATTER_IMPULSE = { inner: -14, outer: 11 };

// ---------------------------------------------------------------------------
// SVG markup
// ---------------------------------------------------------------------------

const InnerRingSVG = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 395.143 395.143">
    <path
      fill="currentColor"
      d="M68.664 203.057c0 31.323 6.78 58.493 19.181 80.236 27.063 8.452 61.456 13.315 104.457 13.315-50.166 0-80.117-34.965-80.117-93.53 0-51.308 42.387-93.05 94.485-93.05 42.066 0 76.288 34.008 76.288 75.808 0-41.614-4.335-75.061-11.905-101.505a118.552 118.552 0 0 0-63.596-18.507c-76.531 0-138.793 61.563-138.793 137.233Z"
    />
    <circle fill="currentColor" cx="197.571" cy="197.571" r="34.485" />
  </svg>
);

const OuterRingSVG = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 395.143 395.143">
    <path
      fill="currentColor"
      d="M24.017 244.38c4.284 54.074 50.404 96.432 167.829 96.432-46.821 0-83.27-21.173-104.001-57.52-29.517-9.218-50.277-22.719-63.828-38.911Zm206.89-227.371C133.3-60.031-60.1 143.865 24.017 244.38c-7.567-95.518 115.45-227.574 206.89-227.372Zm95.571 167.314c0-122.473-42.457-167.197-95.57-167.314 16.905 13.343 30.929 35.126 40.145 67.322 33.252 21.039 55.425 57.945 55.425 99.992Z"
    />
    <circle fill="currentColor" cx="197.571" cy="197.571" r="34.485" />
  </svg>
);

const WordmarkSVG = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 894.846 198.191">
    <path
      fill="currentColor"
      d="M129.67 137.377 26.207 3.003H0v192.458h32.486V60.476l103.736 134.985h25.934V3.003H129.67v134.374zm163.518-69.949q-13.654-8.19-32.759-8.19-19.387 0-34.534 8.873a63.203 63.203 0 0 0-23.75 24.433q-8.6 15.56-8.599 36.307 0 21.294 8.872 36.854a60.123 60.123 0 0 0 25.252 24.024q16.38 8.464 39.038 8.462a94.357 94.357 0 0 0 28.936-4.64q14.467-4.64 24.024-12.558l-9.555-22.931a61.517 61.517 0 0 1-20.474 10.783 76.356 76.356 0 0 1-22.385 3.412q-13.655 0-22.932-4.914a31.287 31.287 0 0 1-13.922-14.741 50.002 50.002 0 0 1-4.183-16.107h95.635v-10.1q0-20.743-7.507-35.762a55.137 55.137 0 0 0-21.158-23.204Zm-50.913 20.338q8.049-5.323 19.519-5.323 15.285 0 23.477 9.964 7.26 8.838 8.08 24.433h-67.052a50.525 50.525 0 0 1 3.691-14.06 33.567 33.567 0 0 1 12.285-15.014Zm203.512-20.064q-15.292-8.46-36.035-8.463-20.749 0-36.035 8.463a59.168 59.168 0 0 0-23.75 24.023q-8.465 15.56-8.462 36.853 0 21.294 8.463 36.99a58.914 58.914 0 0 0 23.75 24.16q15.285 8.464 36.034 8.463 20.743 0 36.035-8.463a58.966 58.966 0 0 0 23.75-24.16q8.459-15.694 8.463-36.99 0-21.293-8.463-36.853a59.22 59.22 0 0 0-23.75-24.023ZM434.321 161.2q-9.284 11.055-24.569 11.056-15.291 0-24.57-11.056-9.283-11.056-9.28-32.623 0-21.837 9.28-32.622 9.279-10.781 24.57-10.783 15.285 0 24.57 10.783 9.277 10.787 9.281 32.622 0 21.569-9.282 32.623ZM552.25 40.949a21.29 21.29 0 0 1 9.555-9.419q6.552-3.41 17.471-3.958l12.558-.819-2.184-25.115-13.377.819q-31.396 1.913-46.272 16.38-14.882 14.472-14.877 42.86v.272h-25.661V87.63h25.661v107.831h34.123V87.63h36.308V61.969h-36.308v-5.733q0-9.277 3.004-15.287Zm108.104 129.124a22.255 22.255 0 0 1-11.465-2.73 16.656 16.656 0 0 1-6.961-8.327 35.192 35.192 0 0 1-2.32-13.512V3.003h-34.125v144.139q0 25.119 11.33 38.083 11.324 12.968 35.08 12.966a70.83 70.83 0 0 0 9.963-.683q4.773-.683 9.691-1.774l.547-27.026a28.85 28.85 0 0 1-5.734 1.092q-3.007.275-6.006.273Zm32.209-108.104h34.124v133.493h-34.124zM690.379 0h38.219v33.305h-38.219zm204.467 195.461-56.274-68.807 52.725-64.685H851.44l-32.213 41.186-32.213-41.186h-39.856l52.426 64.562-55.975 68.93h39.856l35.508-45.148 35.743 45.148h40.13z"
    />
  </svg>
);

/** Full combined logo SVG string (useful for favicons, navbar icons, etc.) */
export const NEOFLIX_LOGO_FULL_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 406.548 428.788">
  <g>
    <path fill="currentColor" d="M26.01 307.464c5.39 68.03 63.415 121.324 211.152 121.324-58.907 0-104.765-26.64-130.847-72.367-37.136-11.599-63.256-28.585-80.304-48.957ZM286.307 21.4C163.502-75.529-79.82 181.001 26.01 307.463 16.49 187.289 171.26 21.145 286.307 21.399Zm120.241 210.503c0-154.088-53.418-210.356-120.241-210.504 21.27 16.788 38.913 44.194 50.509 84.701 41.835 26.47 69.732 72.903 69.732 125.803Z"/>
    <path fill="currentColor" d="M82.183 255.473c0 39.41 8.53 73.592 24.132 100.947 34.05 10.634 77.32 16.753 131.42 16.753-63.114 0-100.797-43.992-100.797-117.674 0-64.553 53.329-117.069 118.875-117.069 52.924 0 95.98 42.787 95.98 95.376 0-52.356-5.454-94.437-14.977-127.706a149.154 149.154 0 0 0-80.013-23.285c-96.287 0-174.62 77.455-174.62 172.658Z"/>
    <circle fill="currentColor" cx="244.366" cy="248.571" r="43.387"/>
  </g>
</svg>`;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * @param {Object} props
 * @param {string}   [props.color="#48c1c4"]         - Teal color for ring SVGs
 * @param {string}   [props.wordmarkColor="#1c3664"]  - Dark blue for the wordmark
 * @param {number}   [props.autoPlayDelay=400]        - ms before the unfurl animation fires
 * @param {boolean}  [props.ready=true]               - Gate all animations (unfurl, clatter) until true
 * @param {boolean}  [props.enableClatter=false]      - Enable drop-impact clatter on rings
 * @param {number}   [props.clatterDelay=1400]        - ms after ready+enableClatter to start clatter
 * @param {Function} [props.onClick]                  - Called on click (before "explode")
 * @param {string}   [props.className]
 * @param {Object}   [props.style]
 */
export default function NeoflixLogo({
  color = "#48c1c4",
  wordmarkColor = "#1c3664",
  autoPlayDelay = 400,
  ready = true,
  enableClatter = false,
  clatterDelay = 1400,
  calibration,
  onClick,
  className = "",
  style = {},
}) {
  // Calibration overrides for spring configs and ring rotations
  const cal = calibration || {};

  const SPRING_HEAVY_CAL = cal.assemblyDamping != null ? {
    type: "spring",
    damping: cal.assemblyDamping ?? SPRING_HEAVY.damping,
    mass: cal.assemblyMass ?? SPRING_HEAVY.mass,
    stiffness: cal.assemblyStiffness ?? SPRING_HEAVY.stiffness,
  } : SPRING_HEAVY;

  const SPRING_CLATTER_CAL = cal.clatterDamping != null ? {
    type: "spring",
    damping: cal.clatterDamping ?? SPRING_CLATTER.damping,
    mass: cal.clatterMass ?? SPRING_CLATTER.mass,
    stiffness: cal.clatterStiffness ?? SPRING_CLATTER.stiffness,
  } : SPRING_CLATTER;

  const INNER = {
    splayed: cal.innerSplayed ?? INNER_RING.splayed,
    assembled: INNER_RING.assembled,
    hover: INNER_RING.hover,
  };
  const OUTER = {
    splayed: cal.outerSplayed ?? OUTER_RING.splayed,
    assembled: OUTER_RING.assembled,
    hover: OUTER_RING.hover,
  };
  const IMPULSE = {
    inner: cal.clatterInner ?? CLATTER_IMPULSE.inner,
    outer: cal.clatterOuter ?? CLATTER_IMPULSE.outer,
  };
  const [assembled, setAssembled] = useState(enableClatter);
  const [hovered, setHovered] = useState(false);
  const [clatterOffset, setClatterOffset] = useState({ inner: 0, outer: 0 });
  const [isClatterPhase, setIsClatterPhase] = useState(false);

  // Auto-unfurl — gated on `ready` so it won't fire during first-load jank.
  // When enableClatter is true, rings start assembled (no wiggle during drop).
  // The clatter impact is what introduces rotation, not the unfurl.
  useEffect(() => {
    if (!ready) return;
    if (enableClatter) {
      // Start assembled immediately — no splayed→assembled transition during fall
      setAssembled(true);
      return;
    }
    const timer = setTimeout(() => setAssembled(true), autoPlayDelay);
    return () => clearTimeout(timer);
  }, [autoPlayDelay, ready, enableClatter]);

  // Clatter — on drop impact, snap rings to impulse offset, then spring back to 0.
  // The depleting sine wave comes from SPRING_CLATTER: high mass + low damping
  // means the rings overshoot, oscillate, and decay like a struck bell.
  useEffect(() => {
    if (!enableClatter || !ready) return;
    let cancelled = false;
    const startTimer = setTimeout(() => {
      if (cancelled) return;
      // 1. Snap to impulse position (no transition — instant displacement)
      setClatterOffset(IMPULSE);
      setIsClatterPhase(true);
      // 2. After a brief hold (one frame rendered at impulse), target 0.
      //    The spring's low damping creates the depleting sine wave.
      const holdTimer = setTimeout(() => {
        if (cancelled) return;
        setClatterOffset({ inner: 0, outer: 0 });
        // Keep clatter spring active long enough for full decay
        setTimeout(() => { if (!cancelled) setIsClatterPhase(false); }, 2000);
      }, 50);
      return () => clearTimeout(holdTimer);
    }, clatterDelay);
    return () => {
      cancelled = true;
      clearTimeout(startTimer);
    };
  }, [enableClatter, clatterDelay, ready]);

  // Click: explode apart, then reassemble
  const handleClick = useCallback(() => {
    onClick?.();
    setAssembled(false);
    setTimeout(() => setAssembled(true), autoPlayDelay);
  }, [onClick, autoPlayDelay]);

  // Compute target rotations (base + clatter offset)
  const innerTarget = (!assembled
    ? INNER.splayed
    : hovered ? INNER.hover : INNER.assembled) + clatterOffset.inner;

  const outerTarget = (!assembled
    ? OUTER.splayed
    : hovered ? OUTER.hover : OUTER.assembled) + clatterOffset.outer;

  const ringTransition = isClatterPhase ? SPRING_CLATTER_CAL : SPRING_HEAVY_CAL;

  return (
    <motion.div
      className={`neoflix-logo ${className}`}
      style={{
        position: "relative",
        width: 935,
        height: 287,
        aspectRatio: "935 / 287",
        overflow: "visible",
        cursor: assembled ? "pointer" : "default",
        ...style,
      }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      onTap={handleClick}
      initial={enableClatter ? { opacity: 1 } : { opacity: 0.001, scale: 1.01 }}
      animate={ready ? { opacity: 1, scale: 1 } : undefined}
      transition={enableClatter ? { duration: 0 } : SPRING_ENTRANCE}
    >
      {/* Inner Ring */}
      <motion.div
        style={{
          position: "absolute",
          left: "-4.6%",
          top: "-15%",
          bottom: "-14.6%",
          aspectRatio: "1 / 1",
          color,
          zIndex: 1,
        }}
        animate={{ rotate: innerTarget }}
        transition={ringTransition}
      >
        <InnerRingSVG />
      </motion.div>

      {/* Outer Ring */}
      <motion.div
        style={{
          position: "absolute",
          left: "-4.6%",
          top: "-14.6%",
          bottom: "-15%",
          aspectRatio: "1 / 1",
          color,
          zIndex: 1,
        }}
        animate={{ rotate: outerTarget }}
        transition={ringTransition}
      >
        <OuterRingSVG />
      </motion.div>

      {/* Wordmark "Neoflix" */}
      <div
        style={{
          position: "absolute",
          right: 0,
          bottom: 0,
          height: "50%",
          aspectRatio: "4.52 / 1",
          color: wordmarkColor,
          zIndex: 1,
        }}
      >
        <WordmarkSVG />
      </div>
    </motion.div>
  );
}

NeoflixLogo.displayName = "NeoflixLogo";
