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
 *   +-----------------------------------------+
 *
 * The navbar is a render prop / slot — pass your own component via `navbar`.
 *
 * Dependencies: React 18+, framer-motion 11+
 */
import { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import NeoflixLogo from "./NeoflixLogo.jsx";
import RecordReflectRefine from "./RecordReflectRefine.jsx";

// Drop — still accelerating when it hits the ground.
// Gentle ease-in, no ease-out: velocity is increasing at impact.
// Feels like it was heading toward terminal velocity but the floor
// interrupted. Not a dramatic gravity plunge — just a slight pickup.
const DROP = {
  type: "tween",
  duration: 0.38,
  ease: [0.22, 0, 1, 1],
};

// Headline — gentle fade + rise, timed relative to drop landing.
const HEADLINE_TRANSITION = {
  type: "tween",
  duration: 0.8,
  ease: [0.25, 0.1, 0.25, 1],
};

/**
 * Wait until the browser can actually paint smoothly before triggering the
 * drop. On first load the main thread is busy with JS parsing, font loading,
 * layout — a tween started during that window will stutter through dropped
 * frames. We chain two rAFs (guarantees at least one
 * real
 * paint has
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
}) {
  const isMobile = variant === "mobile";
  const isDesktop = variant === "desktop";
  const readyToDrop = useReadyToDrop(300);
  const [showHeadline, setShowHeadline] = useState(false);

  // Show headline ~2s after drop lands (drop is 0.38s, settle + breathe)
  useEffect(() => {
    if (!readyToDrop) return;
    const id = setTimeout(() => setShowHeadline(true), 2400);
    return () => clearTimeout(id);
  }, [readyToDrop]);

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
        {/* Logo — drops from above, lands firm, ring clatter on impact */}
        <motion.div
          style={{
            width: logoDimensions.width,
            maxWidth: 935,
            position: "relative",
            display: "flex",
            justifyContent: "center",
            marginBottom: isMobile ? 40 : 60,
          }}
          initial={{ opacity: 1, y: -600 }}
          animate={readyToDrop ? { opacity: 1, y: 0 } : { opacity: 1, y: -600 }}
          transition={readyToDrop ? DROP : { duration: 0 }}
          whileHover={{ scale: 1.01, y: -4 }}
        >
          <NeoflixLogo
            autoPlayDelay={300}
            ready={readyToDrop}
            enableClatter
            clatterDelay={340}
            style={{ width: "100%", height: "auto" }}
            {...logoProps}
          />
        </motion.div>

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
          initial={{ opacity: 0, y: 16 }}
          animate={showHeadline ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
          transition={showHeadline ? HEADLINE_TRANSITION : { duration: 0 }}
        >
          <RecordReflectRefine
            variant={isMobile ? "mobile" : "desktop"}
            showSubtitle={!isMobile}
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
    </section>
  );
}

IntroSlide.displayName = "IntroSlide";
