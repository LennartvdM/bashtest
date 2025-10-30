import React, { useRef, useEffect, useState } from "react";

/**
 * TabletTravellingBar
 * Animated underbar for switching captions on tablet.
 * Props:
 * - captions: array of string/JSX
 * - current: number (active index)
 * - onSelect: fn(idx)
 * - style: (optional)
 */
const TabletTravellingBar = ({ captions, current, onSelect, style }) => {
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
        flexDirection: 'column', // Changed to column for vertical layout
        width: '100%',
        background: 'none',
        ...style
      }}
    >
      {/* Animated vertical bar */}
      <div
        style={{
          position: 'absolute',
          top: bar.top,
          height: bar.height,
          left: 0, // Positioned on the left
          width: '6px', // Vertical bar width
          background: 'rgba(82,156,156,0.9)',
          borderRadius: 6,
          boxShadow: '0 1px 6px rgba(0,0,0,0.15)',
          transition: 'top 1.2s cubic-bezier(0.4,0,0.2,1), height 1.2s cubic-bezier(0.4,0,0.2,1)',
          zIndex: 2,
          pointerEvents: 'none',
        }}
      ></div>
      {captions.map((caption, idx) => (
        <button
          key={idx}
          ref={el => buttonRefs.current[idx] = el}
          onClick={() => onSelect(idx)}
          style={{
            width: '100%', // Full width for vertical items
            padding: '16px 0 12px 24px', // Add left padding to not overlap with bar
            background: 'transparent',
            border: 'none',
            color: idx === current ? '#2a2323' : '#bdbdbd',
            fontWeight: idx === current ? 700 : 400,
            fontSize: 'clamp(15px,2vw,18px)',
            fontFamily: 'Inter, sans-serif',
            cursor: 'pointer',
            outline: 'none',
            position: 'relative',
            zIndex: 3,
            transition: 'color 0.3s',
            textAlign: 'left', // Align text to the left
          }}
        >
          {caption}
        </button>
      ))}
    </div>
  );
};

export default TabletTravellingBar;
