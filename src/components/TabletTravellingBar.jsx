import React, { useRef, useEffect, useState } from "react";

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
 */
const TabletTravellingBar = ({ captions, current, onSelect, style, durationMs = 7000, paused = false, animationKey }) => {
  const containerRef = useRef(null);
  const buttonRefs = useRef([]);
  const [bar, setBar] = useState({ top: 0, height: 0 });

  // Effect: Update bar position when caption or size changes
  useEffect(() => {
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
  }, [current, captions.length]);

  // Recalculate if container or font resizes
  useEffect(() => {
    const update = () => {
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
    };
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [current, captions.length]);

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
      <style>
        {`
          @keyframes tabletTravellingProgress { from { width: 0%; } to { width: 100%; } }
        `}
      </style>
      {/* Animated background highlighter box */}
      <div
        style={{
          position: 'absolute',
          top: bar.top,
          height: bar.height,
          left: 0,
          width: '100%', // Full width to fill behind caption
          background: 'rgba(232, 232, 232, 0.9)', // Off-white highlighter color
          borderRadius: '12px', // Rounded corners
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)', // Subtle shadow
          overflow: 'hidden', // Clip inner loading bar to rounded corners
          transition: 'top 0.6s cubic-bezier(0.4,0,0.2,1), height 0.6s cubic-bezier(0.4,0,0.2,1)',
          zIndex: 1, // Positioned behind the text
          pointerEvents: 'none',
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
            transition: 'color 0.6s cubic-bezier(0.4,0,0.2,1)', // Slower color transition
            textAlign: 'left',
          }}
        >
          {caption}
        </button>
      ))}
    </div>
  );
};

export default TabletTravellingBar;

// redeploy marker
