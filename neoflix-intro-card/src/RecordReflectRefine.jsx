/**
 * RecordReflectRefine — Cycling headline component.
 *
 * Cycles through 3 states every 1800ms, highlighting one word at a time in teal.
 * Clicking advances to the next word immediately.
 *
 * Two variants:
 *   - "desktop": 62px bold headline + 47px subtitle, width: 717px
 *   - "mobile": 62px bold headline only, narrower, centered
 *
 * Dependencies: React 18+, framer-motion 11+
 */
import { useState, useEffect, useCallback } from "react";

const CYCLE_DELAY_MS = 1800;

// Color tokens
const TEAL = "rgb(82, 156, 156)";
const DARK = "rgb(56, 52, 55)";
const GREY = "rgb(131, 130, 143)";

const WORDS = [
  { text: "Record,", id: 0 },
  { text: " Reflect,", id: 1 },
  { text: " Refine:", id: 2 },
];

/**
 * @param {Object} props
 * @param {number}   [props.cycleDelay=1800]     - ms between word highlights
 * @param {string}   [props.tealColor]            - Override teal highlight color
 * @param {string}   [props.darkColor]            - Override dark text color
 * @param {string}   [props.greyColor]            - Override grey subtitle color
 * @param {boolean}  [props.showSubtitle=true]    - Show the subtitle line
 * @param {string}   [props.subtitle]             - Override subtitle text
 * @param {string}   [props.variant="desktop"]    - "desktop" or "mobile"
 * @param {boolean}  [props.autoPlay=true]        - Whether to auto-cycle
 * @param {Function} [props.onVariantChange]      - Callback when active word changes
 * @param {string}   [props.className]
 * @param {Object}   [props.style]
 */
export default function RecordReflectRefine({
  cycleDelay = CYCLE_DELAY_MS,
  tealColor = TEAL,
  darkColor = DARK,
  greyColor = GREY,
  showSubtitle = true,
  subtitle = "Improve patient care through video reflection.",
  variant = "desktop",
  autoPlay = true,
  onVariantChange,
  className = "",
  style = {},
}) {
  const [activeIndex, setActiveIndex] = useState(0);

  // Auto-cycle through the 3 words
  useEffect(() => {
    if (!autoPlay) return;
    const timer = setInterval(() => {
      setActiveIndex((prev) => {
        const next = (prev + 1) % 3;
        onVariantChange?.(next);
        return next;
      });
    }, cycleDelay);
    return () => clearInterval(timer);
  }, [cycleDelay, autoPlay, onVariantChange]);

  // Click advances to next word
  const handleClick = useCallback(() => {
    setActiveIndex((prev) => {
      const next = (prev + 1) % 3;
      onVariantChange?.(next);
      return next;
    });
  }, [onVariantChange]);

  const isMobile = variant === "mobile";

  return (
    <div
      className={`record-reflect-refine ${className}`}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: isMobile ? "center" : "flex-start",
        justifyContent: "center",
        gap: 20,
        maxWidth: 2018,
        width: isMobile ? "auto" : "100%",
        cursor: "pointer",
        userSelect: "none",
        WebkitUserSelect: "none",
        ...style,
      }}
      onClick={handleClick}
    >
      <h1
        style={{
          fontFamily: '"Inter", "Inter Placeholder", sans-serif',
          fontSize: "62px",
          fontWeight: 700,
          letterSpacing: "-2px",
          textAlign: "left",
          lineHeight: 1.2,
          margin: 0,
          whiteSpace: isMobile ? "pre" : "pre-wrap",
          wordBreak: isMobile ? undefined : "break-word",
          wordWrap: isMobile ? undefined : "break-word",
        }}
      >
        {WORDS.map((word) => (
          <span
            key={word.id}
            style={{
              color: activeIndex === word.id ? tealColor : darkColor,
              fontWeight: 700,
              transition: "color 0s",
            }}
          >
            {word.text}
          </span>
        ))}
      </h1>

      {showSubtitle && !isMobile && (
        <p
          style={{
            fontFamily: '"Inter", "Inter Placeholder", sans-serif',
            fontSize: "47px",
            fontWeight: 500,
            letterSpacing: "-2px",
            textAlign: "left",
            color: greyColor,
            margin: 0,
            lineHeight: 1.2,
          }}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}

RecordReflectRefine.displayName = "RecordReflectRefine";
