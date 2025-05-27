import React, { useEffect, useState } from "react";

export default function SimpleCookieCutterBand({ 
  bandColor = "#4fa6a6", 
  bandHeight = 320
}) {
  const [bandWidth, setBandWidth] = useState(900);
  const maskId = "static-cutout-mask";
  const cutoutWidth = 480; // Fixed width matching your video
  const cutoutHeight = 320; // Fixed height matching your video
  const cornerRadius = 20; // Increased from 16 to 20 to avoid pixel conflicts
  
  // Calculate band width to extend 5% beyond left side of screen
  useEffect(() => {
    const updateBandWidth = () => {
      const viewportWidth = window.innerWidth;
      const videoRightEdge = viewportWidth / 2 + 20; // Right edge of video (50% + 20px)
      const leftExtension = viewportWidth * 0.05; // 5% of viewport width
      const newBandWidth = videoRightEdge + leftExtension;
      setBandWidth(newBandWidth);
    };

    updateBandWidth();
    window.addEventListener('resize', updateBandWidth);
    return () => window.removeEventListener('resize', updateBandWidth);
  }, []);
  
  // Position cutout at the right side of the band where video intersects
  const cutoutX = bandWidth - cutoutWidth; // flush to the right
  const cutoutY = 0; // Vertically centered

  // Create a path that has straight left corners and rounded right corners
  const pathData = `
    M0,0 
    L${bandWidth - cornerRadius},0 
    A${cornerRadius},${cornerRadius} 0 0 1 ${bandWidth},${cornerRadius}
    L${bandWidth},${bandHeight - cornerRadius}
    A${cornerRadius},${cornerRadius} 0 0 1 ${bandWidth - cornerRadius},${bandHeight}
    L0,${bandHeight}
    Z
  `;

  return (
    <div
      style={{
        width: bandWidth,
        height: bandHeight,
        pointerEvents: "none",
        position: 'absolute',
        right: 0,
        top: 0,
      }}
    >
      <svg width={bandWidth} height={bandHeight} style={{ display: "block" }}>
        <defs>
          <mask id={maskId}>
            {/* White area = visible band with straight left corners and rounded right corners */}
            <path
              d={pathData}
              fill="white"
            />
            {/* Black area = cutout (static position) */}
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
        />
        {/* Debug outline to show band boundaries */}
        <path
          d={pathData}
          fill="none"
          stroke="rgba(255,0,0,0.3)"
          strokeWidth="2"
        />
      </svg>
    </div>
  );
} 