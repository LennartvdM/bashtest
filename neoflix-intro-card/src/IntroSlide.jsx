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
import { useMemo } from "react";
import { motion } from "framer-motion";
import NeoflixLogo from "./NeoflixLogo.jsx";
import RecordReflectRefine from "./RecordReflectRefine.jsx";

// Drop — gravity-like fall with firm landing.
// Tween with ease-in: accelerates like a falling object, stops dead on impact.
// No spring = no overshoot through the floor. The ring clatter sells the impact.
const DROP = {
  type: "tween",
  duration: 0.5,
  ease: [0.55, 0, 1, 1],
  delay: 0.6,
};

// Fade entrance spring (fallback when drop is disabled)
const ENTRANCE_LOGO = {
  type: "spring",
  damping: 30,
  mass: 1,
  stiffness: 400,
  delay: 0.9,
};

// Headline — appears well after the logo has settled and the viewer has taken it in.
// Gentle fade + subtle rise, not a spring bounce.
const ENTRANCE_HEADLINE = {
  type: "tween",
  duration: 0.8,
  ease: [0.25, 0.1, 0.25, 1],
  delay: 3.0,
};

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
          animate={{ opacity: 1, y: 0 }}
          transition={DROP}
          whileHover={{ scale: 1.01, y: -4 }}
        >
          <NeoflixLogo
            autoPlayDelay={300}
            enableClatter
            clatterDelay={1100}
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
          animate={{ opacity: 1, y: 0 }}
          transition={ENTRANCE_HEADLINE}
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
