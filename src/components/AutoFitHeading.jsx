import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';

/**
 * AutoFitHeading
 * - Renders multi-line heading (lines separated by <br />) that scales font-size
 *   to fit container width, respecting min/max.
 * Props:
 *   - lines: React.ReactNode[] (each item renders on its own line)
 *   - minPx: number (default 24)
 *   - maxPx: number (default 44)
 *   - lineHeight: number (default 1.2)
 *   - style: React.CSSProperties (optional)
 */
const AutoFitHeading = ({ lines = [], minPx = 24, maxPx = 44, lineHeight = 1.2, style }) => {
  const containerRef = useRef(null);
  const measureRef = useRef(null);
  const [fontSize, setFontSize] = useState(maxPx);

  const fit = () => {
    const container = containerRef.current;
    const measure = measureRef.current;
    if (!container || !measure) return;

    const available = container.clientWidth;
    if (available <= 0) return;

    // Binary search font-size within [minPx, maxPx]
    let low = minPx;
    let high = maxPx;
    let best = minPx;
    for (let i = 0; i < 12; i++) {
      const mid = Math.floor((low + high) / 2);
      measure.style.fontSize = mid + 'px';
      // widest line width
      let widest = 0;
      Array.from(measure.children).forEach((child) => {
        const w = child.getBoundingClientRect().width;
        if (w > widest) widest = w;
      });
      if (widest <= available) {
        best = mid;
        low = mid + 1;
      } else {
        high = mid - 1;
      }
    }
    setFontSize(best);
  };

  useLayoutEffect(() => {
    fit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const onResize = () => fit();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return (
    <div ref={containerRef} style={{ width: '100%', ...style }}>
      {/* Visible heading */}
      <h2 style={{
        fontFamily: 'Inter, sans-serif',
        fontWeight: 700,
        letterSpacing: -2,
        lineHeight,
        color: '#fff',
        margin: 0,
        textAlign: 'center',
        textShadow: '0 4px 24px rgba(0,0,0,0.28), 0 2px 8px rgba(0,0,0,0.22), 0 1px 2px rgba(0,0,0,0.18)',
        fontSize
      }}>
        {lines.map((ln, i) => (
          <React.Fragment key={i}>
            {ln}
            {i < lines.length - 1 && <br />}
          </React.Fragment>
        ))}
      </h2>

      {/* Hidden measurer */}
      <div ref={measureRef} style={{
        position: 'absolute',
        visibility: 'hidden',
        pointerEvents: 'none',
        inset: 0,
        fontFamily: 'Inter, sans-serif',
        fontWeight: 700,
        letterSpacing: -2,
        lineHeight,
        whiteSpace: 'pre',
      }}>
        {lines.map((ln, i) => (
          <div key={i} style={{ display: 'block' }}>
            {/* Render as plain text width measurement; if ln is node with spans, it will still approximate width */}
            <span>{ln}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AutoFitHeading;
