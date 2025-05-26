import React, { useRef, useLayoutEffect, useState } from "react";

export default function CookieCutterBand({ videoRef, bandColor = "yellow", bandHeight = 320, bandWidth = 900, bandTop = 200 }) {
  const [cutout, setCutout] = useState({ x: 0, y: 0, width: 0, height: 0, rx: 0 });
  const bandRef = useRef();

  // Debug: confirm render
  console.log("CookieCutterBand rendered");

  // Dynamically measure the video container
  useLayoutEffect(() => {
    function updateCutout() {
      if (videoRef.current && bandRef.current) {
        const videoRect = videoRef.current.getBoundingClientRect();
        const bandRect = bandRef.current.getBoundingClientRect();
        setCutout({
          x: videoRect.left - bandRect.left,
          y: videoRect.top - bandRect.top,
          width: videoRect.width,
          height: videoRect.height,
          rx: 24 // match your video border-radius
        });
      }
    }
    updateCutout();
    window.addEventListener("resize", updateCutout);
    window.addEventListener("scroll", updateCutout);
    return () => {
      window.removeEventListener("resize", updateCutout);
      window.removeEventListener("scroll", updateCutout);
    };
  }, [videoRef]);

  return (
    <svg
      ref={bandRef}
      width={bandWidth}
      height={bandHeight}
      style={{
        position: "absolute",
        left: `calc(50% - ${bandWidth / 2}px)`,
        top: bandTop,
        zIndex: 9999,
        pointerEvents: "none"
      }}
    >
      {/* <defs>
        <mask id="cookie-cutter-mask">
          <rect width={bandWidth} height={bandHeight} fill="white" />
          <rect
            x={cutout.x}
            y={cutout.y}
            width={cutout.width}
            height={cutout.height}
            rx={cutout.rx}
            fill="black"
          />
        </mask>
      </defs> */}
      <rect
        width={bandWidth}
        height={bandHeight}
        fill={bandColor}
        // mask="url(#cookie-cutter-mask)"
        style={{ stroke: "red", strokeWidth: 2 }} // for debugging
      />
    </svg>
  );
} 