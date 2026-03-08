/**
 * IntroSlide — Complete intro/hero section.
 *
 * Layout (desktop):
 *   +-----------------------------------------+
 *   |  [navbar slot]                           |
 *   |                                          |
 *   |      (logo)  N e o f l i x              |
 *   |                                          |
 *   |  Record, Reflect, Refine:                |
 *   |  Improve patient care through            |
 *   |  video reflection.                       |
 *   |                  ˅˅                      |
 *   +-----------------------------------------+
 *
 * The navbar is a render prop / slot — pass your own component via `navbar`.
 *
 * Drop animation uses a custom rigid-body physics simulation (useDropPhysics)
 * instead of framer-motion springs. This gives us:
 *   - A hard floor constraint (no overshoot below rest position)
 *   - Tilt: the logo can lean on entry, hitting one side first for
 *     asymmetric bouncing
 *   - No squash — just translateY + rotate
 *
 * Dependencies: React 18+, framer-motion 11+
 */
import { useMemo, useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import NeoflixLogo from "./NeoflixLogo.jsx";
import RecordReflectRefine from "./RecordReflectRefine.jsx";
import useDropPhysics from "./useDropPhysics.js";

// Headline — gentle fade + rise, timed relative to drop landing.
const HEADLINE_TRANSITION_DEFAULT = {
  type: "tween",
  duration: 0.8,
  ease: [0.25, 0.1, 0.25, 1],
};

/**
 * Wait until the browser can actually paint smoothly before triggering the
 * drop. On first load the main thread is busy with JS parsing, font loading,
 * layout — a tween started during that window will stutter through dropped
 * frames. We chain two rAFs (guarantees at least one real paint has
 * happened) then add a small setTimeout so late-running tasks clear out.
 */
function useReadyToDrop(minDelayMs = 300) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let cancelled = false;
    let timerId;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (cancelled) return;
        timerId = setTimeout(() => { if (!cancelled) setReady(true); }, minDelayMs);
      });
    });
    return () => {
      cancelled = true;
      clearTimeout(timerId);
    };
  }, [minDelayMs]);
  return ready;
}

/** Double-chevron scroll indicator */
function ScrollChevrons({ visible }) {
  return (
    <div
      style={{
        position: "absolute",
        bottom: 32,
        left: "50%",
        transform: "translateX(-50%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 0,
        opacity: visible ? 1 : 0,
        transition: "opacity 1s ease-out",
        pointerEvents: visible ? "auto" : "none",
      }}
    >
      <svg
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill="none"
        stroke="rgb(82, 156, 156)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          animation: visible ? "introChevronBounce 1.8s ease-in-out infinite" : "none",
        }}
      >
        <polyline points="6 9 12 15 18 9" />
      </svg>
      <svg
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill="none"
        stroke="rgb(82, 156, 156)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          marginTop: -12,
          animation: visible ? "introChevronBounce 1.8s ease-in-out infinite 0.15s" : "none",
        }}
      >
        <polyline points="6 9 12 15 18 9" />
      </svg>
      <style>{`
        @keyframes introChevronBounce {
          0%, 100% { transform: translateY(0); opacity: 1; }
          50% { transform: translateY(6px); opacity: 0.6; }
        }
      `}</style>
    </div>
  );
}

/**
 * @param {Object} props
 * @param {React.ReactNode} [props.navbar]                         - Navbar component (slot)
 * @param {string}          [props.variant="desktop"]              - "desktop" | "tablet" | "mobile"
 * @param {string}          [props.backgroundColor="rgb(255,255,255)"]
 * @param {Object}          [props.logoProps]                      - Override props for NeoflixLogo
 * @param {Object}          [props.headlineProps]                  - Override props for RecordReflectRefine
 * @param {string}          [props.subtitle]                       - Subtitle text
 * @param {string}          [props.subtitleColor="rgb(152,151,161)"]
 * @param {boolean}         [props.fullHeight=true]                - Use 100vh (scroll-snap)
 * @param {string}          [props.className]
 * @param {Object}          [props.style]
 * @param {Object}          [props.calibration]                  - Calibration overrides (from CalibrationToolbox)
 */
export default function IntroSlide({
  navbar = null,
  variant = "desktop",
  backgroundColor = "rgb(255, 255, 255)",
  logoProps = {},
  headlineProps = {},
  subtitle = "Improve patient care through video reflection.",
  subtitleColor = "rgb(152, 151, 161)",
  fullHeight = true,
  className = "",
  style = {},
  calibration,
}) {
  const isMobile = variant === "mobile";
  const isDesktop = variant === "desktop";

  // Calibration overrides
  const cal = calibration || {};
  const readyDelay = cal.readyDelay ?? 300;
  const headlineDelay = cal.headlineDelay ?? 2400;
  const headlineStartY = cal.headlineStartY ?? 16;
  const headlineDuration = cal.headlineDuration ?? 0.8;
  const logoMarginBottom = cal.logoMarginBottom ?? (isMobile ? 40 : 60);
  const chevronDelay = cal.chevronDelay ?? 3000; // ms after subtitle appears

  // Drop physics (vibe-mapped)
  const dropStartY = cal.dropStartY ?? -600;
  const dropGravity = cal.dropGravity ?? 1400;
  const dropHalfWidth = cal.dropHalfWidth ?? 300;
  const dropBounciness = cal.dropBounciness ?? 1;
  const dropWobble = cal.dropWobble ?? 0.75;
  const dropSnap = cal.dropSnap ?? 4.15;

  const HEADLINE_TRANSITION = useMemo(() => ({
    ...HEADLINE_TRANSITION_DEFAULT,
    duration: headlineDuration,
  }), [headlineDuration]);

  const readyToDrop = useReadyToDrop(readyDelay);
  const [showHeadline, setShowHeadline] = useState(false);
  const [impacted, setImpacted] = useState(false);
  const [showChevrons, setShowChevrons] = useState(false);

  const logoContainerRef = useRef(null);

  const handleImpact = useCallback(() => {
    setImpacted(true);
  }, []);

  // Physics-driven drop animation (vibe-mapped)
  const { settled } = useDropPhysics(logoContainerRef, {
    enabled: readyToDrop,
    bounciness: dropBounciness,
    wobble: dropWobble,
    snap: dropSnap,
    gravity: dropGravity,
    startY: dropStartY,
    halfWidth: dropHalfWidth,
    onImpact: handleImpact,
  });

  // Show headline after drop lands
  useEffect(() => {
    if (!readyToDrop) return;
    const id = setTimeout(() => setShowHeadline(true), headlineDelay);
    return () => clearTimeout(id);
  }, [readyToDrop, headlineDelay]);

  // When the first word cycle completes, start chevron timer
  const handleFirstCycleComplete = useCallback(() => {
    const id = setTimeout(() => setShowChevrons(true), chevronDelay);
    return () => clearTimeout(id);
  }, [chevronDelay]);

  const logoDimensions = useMemo(() => {
    if (isMobile) return { width: "99.5vw", height: 242 };
    if (isDesktop) return { width: "60vw", height: 221 };
    return { width: "99.5vw", height: 242 }; // tablet
  }, [isMobile, isDesktop]);

  return (
    <section
      className={`intro-slide ${className}`}
      style={{
        position: "relative",
        width: "100%",
        height: fullHeight ? "100vh" : "auto",
        minHeight: fullHeight ? "100vh" : undefined,
        backgroundColor,
        overflow: "clip",
        display: "flex",
        flexDirection: "column",
        scrollSnapAlign: "start",
        scrollSnapStop: "always",
        ...style,
      }}
    >
      {/* Navbar slot */}
      {navbar}

      {/* Hero content area */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          padding: isMobile ? "0 16px" : "0 40px",
        }}
      >
        {/* Logo — physics-driven drop with hard floor + tilt bounce */}
        <div
          ref={logoContainerRef}
          style={{
            width: logoDimensions.width,
            maxWidth: 935,
            position: "relative",
            display: "flex",
            justifyContent: "center",
            marginBottom: logoMarginBottom,
            transformOrigin: "center bottom",
            // Start off-screen; useDropPhysics takes over immediately
            transform: `translateY(${dropStartY}px)`,
          }}
        >
          <NeoflixLogo
            autoPlayDelay={cal.autoPlayDelay ?? 300}
            ready={readyToDrop}
            enableClatter
            clatterDelay={cal.clatterDelay ?? 340}
            calibration={calibration}
            style={{ width: "100%", height: "auto" }}
            {...logoProps}
          />
        </div>

        {/* Headline + subtitle area */}
        <motion.div
          style={{
            width: "100%",
            maxWidth: isMobile ? undefined : 685,
            display: "flex",
            flexDirection: "column",
            alignItems: isMobile ? "center" : "flex-start",
            ...(isDesktop
              ? { margin: "0 auto" }
              : {}),
          }}
          initial={{ opacity: 0, y: headlineStartY }}
          animate={showHeadline ? { opacity: 1, y: 0 } : { opacity: 0, y: headlineStartY }}
          transition={showHeadline ? HEADLINE_TRANSITION : { duration: 0 }}
        >
          <RecordReflectRefine
            variant={isMobile ? "mobile" : "desktop"}
            showSubtitle={!isMobile}
            cycleDelay={cal.cycleDelay}
            onFirstCycleComplete={handleFirstCycleComplete}
            {...headlineProps}
          />

          {/* Mobile-only subtitle (separate from the cycling headline) */}
          {isMobile && (
            <p
              style={{
                fontFamily: '"Inter", "Inter Placeholder", sans-serif',
                fontSize: "27px",
                fontWeight: 700,
                color: subtitleColor,
                textAlign: "center",
                margin: "24px 0 0 0",
                lineHeight: 1.3,
              }}
            >
              {subtitle}
            </p>
          )}
        </motion.div>
      </div>

      {/* Scroll-down chevrons */}
      <ScrollChevrons visible={showChevrons} />
    </section>
  );
}

IntroSlide.displayName = "IntroSlide";
