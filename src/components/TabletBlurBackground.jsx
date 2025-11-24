import React from "react";

/**
 * TabletBlurBackground
 * Shows a stack of 3 blurred videos, fading out the upper decks as the carousel index changes.
 * Props:
 *   - blurVideos: [{id, video, alt}],
 *   - current: number (active idx),
 *   - fadeDuration (optional): seconds, default 1.2
 * Usage: placed as absolute full-background for each MedicalSection.
 */
const TabletBlurBackground = ({ blurVideos = [], current = 0, fadeDuration = 1.2 }) => {
  // Guarantee 3 videos
  const bg = [
    blurVideos[0] || {},
    blurVideos[1] || blurVideos[0] || {},
    blurVideos[2] || blurVideos[1] || blurVideos[0] || {},
  ];
  // Opacity logic: above+current are visible, lower fade out
  const getOpacity = idx => (idx >= current ? 1 : 0);
  const getZ = idx => 10 - idx;

  // Use dynamic viewport height (100dvh) with bleed to cover full height on mobile devices
  // Parent sections use overflow hidden, so this extra size will not affect layout.
  // Use calc(100dvh + 12vh) to maintain 6vh bleed on top and bottom
  return (
    <div style={{ position: 'absolute', top: '-6vh', left: 0, width: '100%', height: 'calc(100dvh + 12vh)', zIndex: 0, pointerEvents: 'none' }}>
      {[2, 1, 0].map(i => (
        <div
          key={bg[i].id || i}
          style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            zIndex: getZ(i),
            opacity: getOpacity(i),
            pointerEvents: 'none',
            transition: `opacity ${fadeDuration}s cubic-bezier(0.4,0,0.2,1)`,
            filter: 'none',
            overflow: 'hidden',
          }}
        >
          <video
            src={bg[i].video}
            style={{ width: '100%', minHeight: '100%', minWidth: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            tabIndex={-1}
            aria-hidden="true"
            draggable="false"
          />
        </div>
      ))}
    </div>
  );
};

export default TabletBlurBackground;
