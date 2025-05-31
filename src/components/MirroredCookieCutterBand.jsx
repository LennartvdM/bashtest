import React, { useEffect, useState } from "react";

export default function MirroredCookieCutterBand({ 
  bandColor = "#f0f4f6", 
  bandHeight = 320,
  bandWidth = 900  // Can be overridden but defaults to same as original
}) {
  const [actualBandWidth, setActualBandWidth] = useState(bandWidth);
  const maskId = "mirrored-cutout-mask";
  const cutoutWidth = 480;
  const cutoutHeight = 320;
  const cornerRadius = 20;
  
  // MIRRORED CALCULATION:
  // Original extended 5% beyond left side of screen
  // This should extend 5% beyond right side of screen
  useEffect(() => {
    const updateBandWidth = () => {
      const viewportWidth = window.innerWidth;
      const videoLeftEdge = viewportWidth / 2 + 20; // Left edge of video (50% + 20px)
      const rightExtension = viewportWidth * 0.05; // 5% of viewport width
      const newBandWidth = videoLeftEdge + rightExtension;
      setActualBandWidth(newBandWidth);
    };

    updateBandWidth();
    window.addEventListener('resize', updateBandWidth);
    return () => window.removeEventListener('resize', updateBandWidth);
  }, []);
  
  // MIRRORED CUTOUT POSITIONING:
  // Original: cutout at right side (cutoutX = bandWidth - cutoutWidth)
  // Mirrored: cutout at left side (cutoutX = 0)
  const cutoutX = 0; // CHANGED: flush to the left instead of right
  const cutoutY = 0;

  // MIRRORED PATH:
  // Original: straight left corners, rounded right corners
  // Mirrored: rounded left corners, straight right corners
  const pathData = `
    M${cornerRadius},0 
    L${actualBandWidth},0 
    L${actualBandWidth},${bandHeight}
    L${cornerRadius},${bandHeight}
    A${cornerRadius},${cornerRadius} 0 0 1 0,${bandHeight - cornerRadius}
    L0,${cornerRadius}
    A${cornerRadius},${cornerRadius} 0 0 1 ${cornerRadius},0
    Z
  `;

  return (
    <div
      style={{
        width: actualBandWidth,
        height: bandHeight,
        pointerEvents: "none",
        position: 'absolute',
        left: 0,  // CHANGED: positioned from left instead of right
        top: 0,
      }}
    >
      <svg width={actualBandWidth} height={bandHeight} style={{ display: "block" }}>
        <defs>
          <mask id={maskId}>
            {/* White area = visible band with rounded left corners and straight right corners */}
            <path
              d={pathData}
              fill="white"
            />
            {/* Black area = cutout (at left side instead of right) */}
            <rect
              x={cutoutX}
              y={cutoutY}
              width={cutoutWidth}
              height={cutoutHeight}
              rx={cornerRadius}
              fill="black"
            />
          </mask>
        </defs>
        {/* The actual colored band with mask applied */}
        <path
          d={pathData}
          fill={bandColor}
          mask={`url(#${maskId})`}
          style={{
            opacity: 0.2,
            mixBlendMode: 'screen'
          }}
        />
      </svg>
    </div>
  );
} 