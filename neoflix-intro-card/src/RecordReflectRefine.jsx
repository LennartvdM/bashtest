/**
 * RecordReflectRefine — Cycling headline component with intro reveal.
 *
 * Intro phase: words appear one at a time, each highlighted in teal.
 *   Step 1: "Record," (teal)
 *   Step 2: "Record," (dark) + "Reflect," (teal)
 *   Step 3: "Record," (dark) + "Reflect," (dark) + "Refine:" (teal)
 *
 * Then continues cycling all three words with the teal highlight.
 * After the first full cycle completes, fires onFirstCycleComplete.
 *
 * Two variants:
 *   - "desktop": 62px bold headline + 47px subtitle
 *   - "mobile": 62px bold headline only, narrower, centered
 *
 * Dependencies: React 18+
 */
import { useState, useEffect, useCallback, useRef } from "react";

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
  onFirstCycleComplete,
  className = "",
  style = {},
}) {
  // introStep: 0 = nothing visible, 1/2/3 = that many words revealed
  const [introStep, setIntroStep] = useState(0);
  const [introComplete, setIntroComplete] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [showSubtitleText, setShowSubtitleText] = useState(false);
  const firstCycleFired = useRef(false);

  // Phase 1: Intro reveal — words appear one at a time
  useEffect(() => {
    if (!autoPlay || introComplete) return;
    const timer = setInterval(() => {
      setIntroStep((prev) => {
        if (prev >= 3) {
          clearInterval(timer);
          return prev;
        }
        return prev + 1;
      });
    }, cycleDelay);
    return () => clearInterval(timer);
  }, [cycleDelay, autoPlay, introComplete]);

  // Transition from intro to cycling after all 3 words are revealed
  useEffect(() => {
    if (introStep < 3 || introComplete) return;
    const timer = setTimeout(() => {
      setIntroComplete(true);
      setActiveIndex(0);
    }, cycleDelay);
    return () => clearTimeout(timer);
  }, [introStep, introComplete, cycleDelay]);

  // Phase 2: Post-intro cycling
  useEffect(() => {
    if (!autoPlay || !introComplete) return;
    const timer = setInterval(() => {
      setActiveIndex((prev) => {
        const next = (prev + 1) % 3;
        onVariantChange?.(next);
        // First time we cycle back to 0 = first full cycle done
        if (next === 0 && !firstCycleFired.current) {
          firstCycleFired.current = true;
          setShowSubtitleText(true);
          onFirstCycleComplete?.();
        }
        return next;
      });
    }, cycleDelay);
    return () => clearInterval(timer);
  }, [cycleDelay, autoPlay, introComplete, onVariantChange, onFirstCycleComplete]);

  const handleClick = useCallback(() => {
    if (!introComplete) {
      setIntroStep((prev) => Math.min(prev + 1, 3));
      return;
    }
    setActiveIndex((prev) => {
      const next = (prev + 1) % 3;
      onVariantChange?.(next);
      return next;
    });
  }, [introComplete, onVariantChange]);

  const isMobile = variant === "mobile";

  const getWordStyle = (wordId) => {
    if (!introComplete) {
      // Intro: word not yet revealed
      if (wordId >= introStep) {
        return { opacity: 0, color: darkColor };
      }
      // Revealed — teal if it's the most recently revealed word
      return {
        opacity: 1,
        color: wordId === introStep - 1 ? tealColor : darkColor,
      };
    }
    // Cycling phase: all visible, one highlighted
    return { opacity: 1, color: activeIndex === wordId ? tealColor : darkColor };
  };

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
        {WORDS.map((word) => {
          const ws = getWordStyle(word.id);
          return (
            <span
              key={word.id}
              style={{
                color: ws.color,
                opacity: ws.opacity,
                fontWeight: 700,
                transition: "opacity 0.4s ease-out, color 0s",
              }}
            >
              {word.text}
            </span>
          );
        })}
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
            opacity: showSubtitleText ? 1 : 0,
            transition: "opacity 0.8s ease-out",
          }}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}

RecordReflectRefine.displayName = "RecordReflectRefine";
