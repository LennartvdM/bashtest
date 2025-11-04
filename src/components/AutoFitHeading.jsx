import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';

// Auto-scaling multi-line heading: preserves explicit breaks, scales block via transform
const AutoFitHeading = ({
  lines = [],
  basePx = 44,
  lineHeight = 1.1,
  style,
  lineAligns = [],
  animate = false,
  visible = true,
  delayStepMs = 400,
  baseDelayMs = 0
}) => {
  const containerRef = useRef(null);
  const contentRef = useRef(null);
  const [scale, setScale] = useState(1);

  const resolveAlign = (i) => lineAligns[i] || 'center';

  const fit = () => {
    const container = containerRef.current;
    const content = contentRef.current;
    if (!container || !content) return;

    content.style.transform = 'scale(1)';
    // eslint-disable-next-line no-unused-expressions
    content.offsetHeight;

    const cw = container.clientWidth;
    const ch = container.clientHeight;
    const bounds = content.getBoundingClientRect();
    const bw = bounds.width || 1;
    const bh = bounds.height || 1;

    const scaleX = cw / bw;
    const scaleY = ch > 0 ? (ch / bh) : Number.POSITIVE_INFINITY;
    const newScale = Math.max(0.01, Math.min(scaleX, scaleY) * 0.9);
    setScale(newScale);
  };

  useLayoutEffect(() => { fit(); }, []);

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
          transformOrigin: 'center left',
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
          <div
            key={i}
            style={{
              display: 'block',
              textAlign: resolveAlign(i),
              opacity: animate ? (visible ? 1 : 0) : 1,
              transform: animate ? (visible ? 'translateY(0)' : 'translateY(8px)') : 'none',
              transition: animate
                ? `opacity 900ms ease ${baseDelayMs + i * delayStepMs}ms, transform 900ms cubic-bezier(0.4,0,0.2,1) ${baseDelayMs + i * delayStepMs}ms`
                : 'none',
              willChange: animate ? 'opacity, transform' : 'auto'
            }}
          >
            {ln}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AutoFitHeading;

// redeploy marker
