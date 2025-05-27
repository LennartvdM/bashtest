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
  const cornerRadius = 20;
  
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
            {/* White area = visible band */}
            <rect width={bandWidth} height={bandHeight} fill="white" rx={cornerRadius} />
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
        <rect
          width={bandWidth}
          height={bandHeight}
          fill={bandColor}
          mask={`url(#${maskId})`}
          rx={cornerRadius}
        />
        {/* Debug outline to show band boundaries */}
        <rect
          width={bandWidth}
          height={bandHeight}
          fill="none"
          stroke="rgba(255,0,0,0.3)"
          strokeWidth="2"
          rx={cornerRadius}
        />
      </svg>
    </div>
  );
} 