import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';

// Auto-scaling multi-line heading: preserves explicit breaks, scales block via transform
const AutoFitHeading = ({ lines = [], basePx = 44, lineHeight = 1.1, style, lineAligns = [] }) => {
  const containerRef = useRef(null);
  const contentRef = useRef(null);
  const [scale, setScale] = useState(1);

  const resolveAlign = (i) => lineAligns[i] || 'center';

  const fit = () => {
    const container = containerRef.current;
    const content = contentRef.current;
    if (!container || !content) return;

    // Reset to scale 1 for accurate measure
    content.style.transform = 'scale(1)';
    // Force reflow
    // eslint-disable-next-line no-unused-expressions
    content.offsetHeight;

    const cw = container.clientWidth;
    const ch = container.clientHeight; // may be 0 if height is auto
    const bounds = content.getBoundingClientRect();
    const bw = bounds.width || 1;
    const bh = bounds.height || 1;

    const scaleX = cw / bw;
    const scaleY = ch > 0 ? (ch / bh) : Number.POSITIVE_INFINITY; // fit by width if no height
    const newScale = Math.max(0.01, Math.min(scaleX, scaleY) * 0.9);
    setScale(newScale);
  };

  useLayoutEffect(() => {
    fit();
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const ro = new ResizeObserver(() => fit());
    ro.observe(container);
    if (contentRef.current) ro.observe(contentRef.current);

    const onFontsReady = () => fit();
    if (document && document.fonts && document.fonts.ready) {
      document.fonts.ready.then(onFontsReady);
    } else {
      window.addEventListener('load', onFontsReady);
    }

    return () => {
      ro.disconnect();
      if (!(document && document.fonts && document.fonts.ready)) {
        window.removeEventListener('load', onFontsReady);
      }
    };
  }, []);

  return (
    <div ref={containerRef} style={{ width: '100%', overflow: 'visible', ...style }}>
      <div
        ref={contentRef}
        style={{
          display: 'inline-block',
          transform: `scale(${scale})`,
          transformOrigin: 'top center',
          whiteSpace: 'nowrap',
          lineHeight,
          fontFamily: 'Inter, sans-serif',
          fontWeight: 700,
          letterSpacing: -2,
          fontSize: basePx,
          color: '#fff',
          textShadow: '0 4px 24px rgba(0,0,0,0.28), 0 2px 8px rgba(0,0,0,0.22), 0 1px 2px rgba(0,0,0,0.18)'
        }}
      >
        {lines.map((ln, i) => (
          <div key={i} style={{ display: 'block', textAlign: resolveAlign(i) }}>{ln}</div>
        ))}
      </div>
    </div>
  );
};

export default AutoFitHeading;
