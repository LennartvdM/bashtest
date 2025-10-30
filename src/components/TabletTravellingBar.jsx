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
  const [bar, setBar] = useState({ left: 0, width: 0 });

  // Effect: Update bar position when caption or size changes
  useEffect(() => {
    const btn = buttonRefs.current[current];
    const container = containerRef.current;
    if (btn && container) {
      const btnRect = btn.getBoundingClientRect();
      const contRect = container.getBoundingClientRect();
      setBar({
        left: btnRect.left - contRect.left,
        width: btnRect.width,
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
          left: btnRect.left - contRect.left,
          width: btnRect.width,
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
        width: '100%',
        background: 'none',
        ...style
      }}
    >
      {/* Animated underbar */}
      <div
        style={{
          position: 'absolute',
          left: bar.left,
          width: bar.width,
          height: 6,
          bottom: 0,
          background: 'rgba(82,156,156,0.9)',
          borderRadius: 6,
          boxShadow: '0 1px 6px rgba(0,0,0,0.15)',
          transition: 'left 1.2s cubic-bezier(0.4,0,0.2,1), width 1.2s cubic-bezier(0.4,0,0.2,1)',
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
            flex: 1,
            padding: '16px 0 12px 0',
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
          }}
        >
          {caption}
        </button>
      ))}
    </div>
  );
};

export default TabletTravellingBar;
