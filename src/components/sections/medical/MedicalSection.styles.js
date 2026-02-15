export const BLUR_VIDEO_BASE_STYLE = {
  left: '-2vw',
  width: '104vw',
  filter: 'brightness(0.7) saturate(1)',
  willChange: 'opacity',
  pointerEvents: 'none',
  transform: 'translateZ(0)',
  WebkitTransform: 'translateZ(0)',
  backfaceVisibility: 'hidden',
  WebkitBackfaceVisibility: 'hidden',
  perspective: '1000px',
  WebkitPerspective: '1000px',
};

export const VIDEO_OVERLAY_STYLE = {
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  zIndex: 1,
  pointerEvents: 'none',
};

export const VIDEO_INNER_CONTAINER_STYLE = {
  width: '100%',
  height: '100%',
  position: 'relative',
  display: 'inline-block',
};

export const VIDEO_CONTROLS_HIDDEN_CSS = `
  video {
    pointer-events: none !important;
    outline: none !important;
    user-select: none !important;
    -webkit-user-select: none !important;
    -webkit-touch-callout: none !important;
  }

  video::-webkit-media-controls,
  video::-webkit-media-controls-panel,
  video::-webkit-media-controls-start-playbook-button,
  video::-webkit-media-controls-play-button,
  video::-webkit-media-controls-timeline,
  video::-webkit-media-controls-current-time-display,
  video::-webkit-media-controls-time-remaining-display,
  video::-webkit-media-controls-mute-button,
  video::-webkit-media-controls-volume-slider,
  video::-webkit-media-controls-fullscreen-button,
  video::-webkit-media-controls-overlay-enclosure,
  video::-webkit-media-controls-overlay-play-button {
    display: none !important;
    visibility: hidden !important;
    opacity: 0 !important;
    pointer-events: none !important;
  }

  video::-ms-media-controls {
    display: none !important;
  }
`;
