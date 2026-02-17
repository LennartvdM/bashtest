import React, { memo } from "react";

/**
 * TabletTravellingBar
 * Animated underbar for switching captions on tablet.
 *
 * The highlighter is positioned entirely with CSS math (grid + translateY),
 * making it independent from the caption buttons. It can jump from any
 * item to any other item in a single smooth motion — no DOM measurement,
 * no getBoundingClientRect, no resize listeners.
 */
const TabletTravellingBar = memo(function TabletTravellingBar({ captions, current, onSelect, style, durationMs = 7000, paused = false, animationKey, captionsVisible = true, shouldTransition = true }) {
  const count = captions.length;

  return (
    <div
      style={{
        position: 'relative',
        display: 'grid',
        gridTemplateRows: `repeat(${count}, 1fr)`,
        width: '100%',
        background: 'none',
        ...style
      }}
    >
      {/* Highlighter — positioned via transform math, fully independent of button DOM */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: '100%',
          height: `calc(100% / ${count})`,
          background: 'rgba(232, 232, 232, 0.9)',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          overflow: 'hidden',
          transition: shouldTransition
            ? 'transform 420ms cubic-bezier(0.4, 0, 0.2, 1), opacity 1.2s ease'
            : 'none',
          zIndex: 1,
          pointerEvents: 'none',
          willChange: 'transform',
          opacity: captionsVisible ? 1 : 0,
          transform: captionsVisible
            ? `translateY(${current * 100}%)`
            : `translateY(calc(${current * 100}% + 60px))`,
        }}
      >
        {/* Loading bar along bottom edge */}
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
          onClick={() => onSelect(idx)}
          style={{
            width: '100%',
            padding: '16px 24px',
            background: 'transparent',
            border: 'none',
            color: idx === current ? '#2a2323' : '#e0e0e0',
            fontWeight: idx === current ? 700 : 500,
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
