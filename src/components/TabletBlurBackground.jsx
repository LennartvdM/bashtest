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
  // Opacity logic: above+current are visible, lower (-1...current-1) fade out
  const getOpacity = idx => (idx >= current ? 1 : 0);
  const getZ = idx => 10 - idx;

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 0, width: '100%', height: '100%' }}>
      {[2, 1, 0].map(i => (
        <div
          key={bg[i].id || i}
          style={{
            position: 'absolute',
            inset: 0,
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
            style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }}
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
