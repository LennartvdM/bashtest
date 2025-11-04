import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';

// Auto-scaling multi-line heading: preserves explicit breaks, scales block via transform
const AutoFitHeading = ({
  lines = [],
  basePx = 44,
  lineHeight = 1.1,
  style,
  lineAligns = [],
  // Animation controls
  visible = true,
  commaStagger = false,
  staggerDelayMs = 600,
  // Starting index (inclusive) whose lines appear with the delayed group (post-comma)
  postGroupStartIndex = null,
  afterCommaStyle
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
        {lines.map((ln, i) => {
          const shouldDelay = postGroupStartIndex !== null && i >= postGroupStartIndex;
          const baseStyle = {
            display: 'block',
            textAlign: resolveAlign(i),
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(8px)',
            transition: `opacity 900ms ease ${shouldDelay ? staggerDelayMs : 0}ms, transform 900ms cubic-bezier(0.4,0,0.2,1) ${shouldDelay ? staggerDelayMs : 0}ms`,
            willChange: 'opacity, transform'
          };

          // If we need to stagger after the comma on this line and it is a string
          if (commaStagger && typeof ln === 'string' && ln.includes(',')) {
            const idx = ln.indexOf(',');
            const before = ln.slice(0, idx + 1); // include comma
            const after = ln.slice(idx + 1);

            // Immediate segment (before comma)
            const immediate = (
              <span key={`pre-${i}`} style={{ opacity: visible ? 1 : 0, transition: 'opacity 900ms ease 0ms' }}>{before}</span>
            );

            // Delayed segment (after comma)
            const delayed = (
              <span
                key={`post-${i}`}
                style={{
                  opacity: visible ? 1 : 0,
                  transition: `opacity 900ms ease ${staggerDelayMs}ms`,
                  ...(afterCommaStyle || {})
                }}
              >
                {after}
              </span>
            );

            return (
              <div key={i} style={baseStyle}>
                {immediate}
                {delayed}
              </div>
            );
          }

          // Default: whole line with baseStyle, applying delay if in post group
          return (
            <div key={i} style={baseStyle}>{ln}</div>
          );
        })}
      </div>
    </div>
  );
};

export default AutoFitHeading;

// redeploy marker
