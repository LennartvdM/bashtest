import React, { useRef, useEffect, useState, useCallback, memo } from "react";
import { useThrottleWithTrailing } from "../../../hooks/useDebounce";

/**
 * TabletTravellingBar
 * Animated underbar for switching captions on tablet.
 * Props:
 * - captions: array of string/JSX
 * - current: number (active index)
 * - onSelect: fn(idx)
 * - style: (optional)
 * - durationMs: number (optional, default 7000) – progress duration
 * - paused: boolean (optional, default false) – pause animation
 * - animationKey: any (optional) – force restart animation
 * - captionsVisible: boolean (optional, default true) – controls staggered entrance animation
 * - shouldTransition: boolean (optional, default true) – enables/disables transitions
 */
const TabletTravellingBar = memo(function TabletTravellingBar({ captions, current, onSelect, style, durationMs = 7000, paused = false, animationKey, captionsVisible = true, shouldTransition = true }) {
  const containerRef = useRef(null);
  const buttonRefs = useRef([]);
  const [bar, setBar] = useState({ top: 0, height: 0 });

  // Throttled bar position update
  const updateBarPosition = useCallback(() => {
    const btn = buttonRefs.current[current];
    const container = containerRef.current;
    if (btn && container) {
      const btnRect = btn.getBoundingClientRect();
      const contRect = container.getBoundingClientRect();
      setBar({
        top: btnRect.top - contRect.top,
        height: btnRect.height,
      });
    }
  }, [current]);

  const throttledUpdateBar = useThrottleWithTrailing(updateBarPosition, 100);

  // Effect: Update bar position when caption or size changes
  useEffect(() => {
    updateBarPosition();
  }, [current, captions.length, updateBarPosition]);

  // Recalculate if container or font resizes - throttled
  useEffect(() => {
    window.addEventListener('resize', throttledUpdateBar);
    return () => window.removeEventListener('resize', throttledUpdateBar);
  }, [throttledUpdateBar]);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column', // Vertical layout
        width: '100%',
        background: 'none',
        ...style
      }}
    >
      {/* Animated background highlighter box */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          height: bar.height,
          left: 0,
          width: '100%', // Full width to fill behind caption
          background: 'rgba(232, 232, 232, 0.9)', // Off-white highlighter color
          borderRadius: '12px', // Rounded corners
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)', // Subtle shadow
          overflow: 'hidden', // Clip inner loading bar to rounded corners
          transition: shouldTransition
            ? `transform 150ms cubic-bezier(0.2, 0, 0, 1), height 150ms cubic-bezier(0.2, 0, 0, 1), opacity 1.2s ease`
            : 'none',
          zIndex: 1, // Positioned behind the text
          pointerEvents: 'none',
          willChange: 'transform',
          opacity: captionsVisible ? 1 : 0,
          transform: captionsVisible ? `translateY(${bar.top}px)` : `translateY(${bar.top + 60}px)`,
        }}
      >
        {/* Loading bar along bottom edge of the highlighter */}
        <div
          key={`${animationKey}-${current}`}
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            height: 5,
            background: 'rgba(82,156,156,1)',
            animation: `tabletTravellingProgress ${durationMs}ms linear forwards`,
            animationPlayState: paused ? 'paused' : 'running',
          }}
        />
      </div>
      {captions.map((caption, idx) => (
        <button
          key={idx}
          ref={el => buttonRefs.current[idx] = el}
          onClick={() => onSelect(idx)}
          style={{
            width: '100%',
            padding: '16px 24px', // Adjusted padding for better look
            background: 'transparent',
            border: 'none',
            color: idx === current ? '#2a2323' : '#e0e0e0', // Make inactive text brighter
            fontWeight: idx === current ? 700 : 500, // Adjust font weight
            fontSize: 'clamp(16px, 2.4vw, 20px)',
            fontFamily: 'Inter, sans-serif',
            cursor: 'pointer',
            outline: 'none',
            position: 'relative',
            zIndex: 3,
            textAlign: 'left',
            opacity: captionsVisible ? 1 : 0,
            transform: captionsVisible ? 'translate3d(0,0,0)' : 'translateY(60px)',
            transition: shouldTransition
              ? (captionsVisible
                ? `transform 1.2s cubic-bezier(0.4,0,0.2,1) ${idx * 600}ms, opacity 1.2s ease ${idx * 600}ms, color 0.6s cubic-bezier(0.4,0,0.2,1)`
                : 'color 0.6s cubic-bezier(0.4,0,0.2,1)')
              : 'none',
          }}
        >
          {caption}
        </button>
      ))}
    </div>
  );
});

export default TabletTravellingBar;

// redeploy marker
