import React from "react";

export default function SimpleCookieCutterBand({ 
  bandColor = "#4fa6a6", 
  bandHeight = 320, 
  bandWidth = 900 
}) {
  // Static positioning - no dynamic tracking needed
  // Just cut out a fixed area where the video will be
  const maskId = "static-cutout-mask";
  const cutoutWidth = 480; // Fixed width matching your video
  const cutoutHeight = 320; // Fixed height matching your video
  const cornerRadius = 20; // Increased from 16 to 20 to avoid pixel conflicts
  
  // Position cutout at the right side of the band where video intersects
  const cutoutX = bandWidth - cutoutWidth; // flush to the right
  const cutoutY = 0; // Vertically centered

  return (
    <div
      style={{
        width: bandWidth,
        height: bandHeight,
        pointerEvents: "none",
      }}
    >
      <svg width={bandWidth} height={bandHeight} style={{ display: "block" }}>
        <defs>
          <mask id={maskId}>
            {/* White area = visible band with straight left corners */}
            <path
              d={`M0,0 L${bandWidth},0 L${bandWidth},${bandHeight} L0,${bandHeight} Z`}
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
          d={`M0,0 L${bandWidth},0 L${bandWidth},${bandHeight} L0,${bandHeight} Z`}
          fill={bandColor}
          mask={`url(#${maskId})`}
        />
        {/* Debug outline to show band boundaries */}
        <path
          d={`M0,0 L${bandWidth},0 L${bandWidth},${bandHeight} L0,${bandHeight} Z`}
          fill="none"
          stroke="rgba(255,0,0,0.3)"
          strokeWidth="2"
        />
      </svg>
    </div>
  );
} 