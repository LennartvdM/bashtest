// redeploy marker: 2025-10-31T00:00:00Z
import React, { useState, useRef, useEffect, useLayoutEffect, useMemo, useCallback, useReducer } from 'react';
import MedicalCarousel from '../MedicalCarousel';
import TabletMedicalCarousel from '../TabletMedicalCarousel';
import ReactDOM from 'react-dom';
import SimpleCookieCutterBand from '../SimpleCookieCutterBand';
import MirroredCookieCutterBand from '../MirroredCookieCutterBand';
import { useSectionLifecycle } from '../../hooks/useSectionLifecycle';
import VideoManager from '../VideoManager';
import TabletTravellingBar from '../TabletTravellingBar';
import TabletBlurBackground from '../TabletBlurBackground';
import AutoFitHeading from '../AutoFitHeading';
import { useTabletLayout } from '../../hooks/useTabletLayout';
import { useThrottleWithTrailing } from '../../hooks/useDebounce';

// ============================================================================
// STYLE CONSTANTS - Extracted for stable references and reduced object creation
// ============================================================================
const BLUR_VIDEO_BASE_STYLE = {
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

const VIDEO_OVERLAY_STYLE = {
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  zIndex: 1,
  pointerEvents: 'none',
};

const VIDEO_INNER_CONTAINER_STYLE = {
  width: '100%',
  height: '100%',
  position: 'relative',
  display: 'inline-block',
};

const VIDEO_CONTROLS_HIDDEN_CSS = `
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

// ============================================================================
// STATE REDUCERS - Grouped related state for fewer re-renders
// ============================================================================

// Visibility state reducer
const visibilityReducer = (state, action) => {
  switch (action.type) {
    case 'SHOW_HEADER':
      return { ...state, header: true };
    case 'SHOW_VIDEO':
      return { ...state, video: true };
    case 'SHOW_CAPTIONS':
      return { ...state, captions: true };
    case 'RESET':
      return { header: false, video: false, captions: false };
    case 'SHOW_ALL':
      return { header: true, video: true, captions: true };
    default:
      return state;
  }
};

// Measurements state reducer
const measurementsReducer = (state, action) => {
  switch (action.type) {
    case 'SET_RECT':
      return { ...state, rect: action.payload };
    case 'SET_RIGHT_RECT':
      return { ...state, rightRect: action.payload, rightReady: true };
    case 'SET_CAPTION_TOP':
      return { ...state, captionTop: action.payload };
    case 'SET_HEADER_HEIGHT':
      return { ...state, headerHeight: action.payload };
    case 'SET_VIDEO_TOP':
      return { ...state, videoTop: action.payload };
    case 'SET_COLLECTION_TOP':
      return { ...state, collectionTop: action.payload };
    case 'SET_VIDEO_AND_CAPTION_TOP':
      return { ...state, videoAndCaptionTop: action.payload };
    case 'SET_BITE_RECT':
      return { ...state, biteRect: action.payload };
    case 'SET_NAVBAR_HEIGHT':
      return { ...state, navbarHeight: action.payload };
    case 'SET_HIGHLIGHTER':
      return { ...state, highlighterLeftPx: action.payload.left, highlighterWidthPx: action.payload.width };
    default:
      return state;
  }
};

// Interaction state reducer
const interactionReducer = (state, action) => {
  switch (action.type) {
    case 'SET_PAUSED':
      return { ...state, isPaused: action.payload };
    case 'SET_HOVERED_INDEX':
      return { ...state, hoveredIndex: action.payload };
    case 'SET_VIDEO_HOVER':
      return { ...state, videoHover: action.payload };
    case 'ENABLE_INTERACTIONS':
      return { ...state, interactionsEnabled: true };
    case 'DISABLE_INTERACTIONS':
      return { ...state, interactionsEnabled: false, videoHover: false, hoveredIndex: null };
    case 'RESET':
      return { isPaused: true, hoveredIndex: null, videoHover: false, interactionsEnabled: false };
    default:
      return state;
  }
};

const VARIANTS = {
  v2: {
    id: 'medical-v2',
    blurVideos: [
      { id: "0", video: "/videos/blururgency.mp4", alt: "Blurred medical urgency" },
      { id: "1", video: "/videos/blurcoordination.mp4", alt: "Blurred team coordination" },
      { id: "2", video: "/videos/blurfocus.mp4", alt: "Blurred medical focus" },
    ],
    headlines: [
      { firstLine: "Medical interventions demand", secondLine: "precision and urgency." },
      { firstLine: "Which makes coordination within", secondLine: "teams vital for success." },
      { firstLine: "Task‑driven focus can lead to", secondLine: "tunnel vision and misalignment." },
    ],
    mainVideos: [
      { id: "0", video: "/videos/urgency.mp4", alt: "Medical urgency demonstration" },
      { id: "1", video: "/videos/coordination.mp4", alt: "Medical team coordination" },
      { id: "2", video: "/videos/focus.mp4", alt: "Medical focus and precision" },
    ],
    cookieComponent: SimpleCookieCutterBand,
    orientation: 'video-right',
    header: {
      line1: 'In the moment,',
      line2prefix: '',
      line2highlight: 'only',
      line2suffix: ' the patient',
      line3: 'matters'
    }
  },
  v3: {
    id: 'medical-v3',
    blurVideos: [
      { id: "0", video: "/videos/blursskills.mp4", alt: "Blurred skills demonstration" },
      { id: "1", video: "/videos/blurteam.mp4", alt: "Blurred team coordination" },
      { id: "2", video: "/videos/blurperspectives.mp4", alt: "Blurred perspectives" },
    ],
    headlines: [
      { firstLine: "Quiet reflection allows for", secondLine: "sharpening skills." },
      { firstLine: "Further video debriefs foster", secondLine: "cohesion amongst peers." },
      { firstLine: "Shared understanding enhances", secondLine: "decisiveness." },
    ],
    mainVideos: [
      { id: "0", video: "/videos/skills.mp4", alt: "Sharpening skills" },
      { id: "1", video: "/videos/team.mp4", alt: "Team cohesion" },
      { id: "2", video: "/videos/perspectives.mp4", alt: "Shared perspectives" },
    ],
    cookieComponent: MirroredCookieCutterBand,
    orientation: 'video-left',
    header: {
      line1: 'Yet,',
      line1suffix: ' ',
      line2prefix: '',
      line2highlight: 'reflection',
      line2suffix: '',
      line3: 'strengthens',
      line4: 'the next'
    }
  }
};

const BASE_INDEX = 2; // index of the always-visible base video

const MedicalSection = ({ inView, sectionRef, variant = 'v2' }) => {
  // Memoize config to prevent unnecessary recalculations
  const config = useMemo(() => VARIANTS[variant] || VARIANTS.v2, [variant]);
  const {
    blurVideos,
    headlines,
    mainVideos,
    cookieComponent: CookieCutterBand,
    orientation,
    id: sectionId,
    header,
  } = config;
  const { 
    sectionState, 
    shouldAnimate, 
    isActive,
    isPreserved 
  } = useSectionLifecycle(sectionId, inView);

  // ============================================================================
  // STATE - Using reducers for grouped state to minimize re-renders
  // ============================================================================

  // Visibility state (header, video, captions visibility)
  const [visibility, dispatchVisibility] = useReducer(visibilityReducer, {
    header: false,
    video: false,
    captions: false,
  });

  // Measurements state (positions and dimensions)
  const [measurements, dispatchMeasurements] = useReducer(measurementsReducer, {
    rect: { top: 0, height: 0 },
    rightRect: { top: 0, height: 0 },
    rightReady: false,
    captionTop: 0,
    headerHeight: 0,
    videoTop: '0px',
    collectionTop: '60px',
    videoAndCaptionTop: '0px',
    biteRect: { x: 0, y: 0, width: 0, height: 0, rx: 0 },
    navbarHeight: 60,
    highlighterLeftPx: 0,
    highlighterWidthPx: 0,
  });

  // Interaction state (paused, hover states)
  const [interaction, dispatchInteraction] = useReducer(interactionReducer, {
    isPaused: false,
    hoveredIndex: null,
    videoHover: false,
    interactionsEnabled: false,
  });

  // Remaining individual state (frequently updated or independent)
  const [currentVideo, setCurrentVideo] = useState(0);
  const [videoCenter, setVideoCenter] = useState({ x: 0, y: 0 });
  const [barKey, setBarKey] = useState(0);
  const [outlineFullOpacity, setOutlineFullOpacity] = useState(false);
  const [highlightOutlineFullOpacity, setHighlightOutlineFullOpacity] = useState(false);
  const [disableTransitions, setDisableTransitions] = useState(false);

  // All useRef hooks next
  const rowRefs = useRef({});
  const captionsRef = useRef();
  const videoContainerRef = useRef();
  const hoverTimeoutRef = useRef(null);
  const rightRowRefs = useRef({});
  const rightCaptionsRef = useRef();
  const headerRef = useRef();
  const videoAnchorRef = useRef();
  const captionRef = useRef();
  const contentAnchorRef = useRef();
  const shadedFrameRef = useRef();
  const captionButtonRefs = useRef([]);

  // Destructure for easier access
  const { header: headerVisible, video: videoVisible, captions: captionsVisible } = visibility;
  const {
    rightRect, rightReady, captionTop, headerHeight, videoTop,
    collectionTop, videoAndCaptionTop, biteRect, navbarHeight,
    highlighterLeftPx, highlighterWidthPx
  } = measurements;
  const { isPaused, hoveredIndex, videoHover, interactionsEnabled } = interaction;

  // Derived/computed values after all state declarations
  const safeVideoHover = interactionsEnabled && videoHover;
  const safeHoveredIndex = interactionsEnabled ? hoveredIndex : null;

  // Transition control to prevent rewind animations
  const shouldTransition = sectionState === 'entering' || sectionState === 'active';
  
  // Debug logging
  

  // Animation constants
  const NUDGE_TRANSITION = 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) 0.3s, outline 0.2s ease';
  const SLIDE_TRANSITION = 'transform 2.25s cubic-bezier(0.4,0,0.2,1), opacity 2.25s ease, outline 0.2s ease';

  // Use unified tablet layout hook for stable layout detection during rotation
  const {
    mode: layoutMode,
    isDesktop,
    isTabletPortrait,
    isTabletLandscape,
    isTablet,
    isRotating,
    isTouchDevice,
  } = useTabletLayout();

  // Layout modes:
  // - Portrait tablet: vertical stack layout (simplified)
  // - Landscape tablet: horizontal desktop-like layout with touch handlers
  // - Desktop: horizontal layout with hover handlers
  const isTabletLayout = isTabletPortrait; // Only portrait uses vertical tablet layout
  const isLandscapeTablet = isTabletLandscape; // Landscape uses desktop layout with touch

  const isVideoLeft = orientation === 'video-left';

  // Memoize layout dimensions - scale down for landscape tablet
  const layoutDimensions = useMemo(() => {
    const landscapeScale = isLandscapeTablet ? 0.7 : 1;
    return {
      landscapeScale,
      bandWidth: 900 * landscapeScale,
      bandHeight: 320 * landscapeScale,
      cutoutWidth: 480 * landscapeScale,
      cutoutHeight: 320 * landscapeScale,
      cornerRadius: 16,
      gap: 32 * landscapeScale,
      videoHeight: 320 * landscapeScale,
    };
  }, [isLandscapeTablet]);

  const { bandWidth, bandHeight, cutoutWidth, cutoutHeight, cornerRadius, gap, videoHeight } = layoutDimensions;

  // Portrait tablet: touch device in portrait orientation
  // Landscape tablet: touch device in landscape orientation  
  // Desktop: not a touch device or outside tablet dimensions
  const isPortraitTablet = isTabletLayout;
  const isDesktopLayout = !isTabletLayout && !isLandscapeTablet;

  // Memoize layout-dependent computed values
  const layoutValues = useMemo(() => ({
    videoContainerWidth: isTabletLayout ? 'min(480px, 90vw)' : 480,
    captionContainerWidth: isTabletLayout ? 'min(520px, 90vw)' : (isLandscapeTablet ? 320 : 444),
    videoOffscreenTransform: isTabletLayout
      ? 'translateY(200px)'
      : (isVideoLeft ? 'translateX(200px)' : 'translateX(-200px)'),
    captionOffscreenTransform: isTabletLayout
      ? 'translateY(200px)'
      : (isVideoLeft ? 'translateX(-200px)' : 'translateX(200px)'),
    layoutKey: isTabletLayout ? 'tablet' : (isLandscapeTablet ? 'landscape-tablet' : 'desktop'),
  }), [isTabletLayout, isLandscapeTablet, isVideoLeft]);

  const { videoContainerWidth, captionContainerWidth, videoOffscreenTransform, captionOffscreenTransform, layoutKey } = layoutValues;
  const TABLET_AUTOPLAY_MS = 7000;

  // Memoize band position calculations
  const bandPositions = useMemo(() => ({
    bandLeft: `calc(50% - ${(bandWidth + cutoutWidth) / 2}px + 20px)`,
    bandTop: '50%',
  }), [bandWidth, cutoutWidth]);
  const { bandLeft, bandTop } = bandPositions;

  // --- Gantry Frame dimensions and animation ---
  const isNudging = safeVideoHover;

  // Memoize gantry frame style to prevent object recreation
  const gantryFrameStyle = useMemo(() => ({
    position: isTabletLayout ? 'relative' : 'absolute',
    top: isTabletLayout ? 'auto' : videoAndCaptionTop,
    width: '100%',
    height: '100%',
    zIndex: 2,
    display: 'flex',
    alignItems: 'stretch',
    transition: shouldTransition ? (isNudging ? NUDGE_TRANSITION : SLIDE_TRANSITION) : 'none !important',
    transform: shouldTransition
      ? (safeVideoHover
          ? 'translateY(-12px)'
          : videoVisible
            ? 'translate3d(0,0,0)'
            : videoOffscreenTransform)
      : videoOffscreenTransform,
    opacity: shouldTransition ? (videoVisible ? 1 : 0) : 0,
    overflow: 'visible',
    borderRadius: '16px',
    boxShadow: safeVideoHover ? 'inset 0 0 0 3px rgba(255, 255, 255, 0.5)' : 'none'
  }), [isTabletLayout, videoAndCaptionTop, shouldTransition, isNudging, safeVideoHover, videoVisible, videoOffscreenTransform]);
  // Layout detection is now handled by useTabletLayout hook
  // The hook provides stable values during rotation to prevent thrashing

  // When this section is fully active on tablet, gently ask the next section to preload its first videos
  useEffect(() => {
    if (!isTabletLayout && !isLandscapeTablet) return;
    if (sectionState === 'active') {
      const payload = {
        type: 'tablet-preload-next',
        detail: {
          blur: blurVideos[BASE_INDEX]?.video,
          first: mainVideos[0]?.video
        }
      };
      const timer = setTimeout(() => {
        try { window.dispatchEvent(new CustomEvent(payload.type, { detail: payload.detail })); } catch {}
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [sectionState, isTabletLayout, isLandscapeTablet]);

  // Previously we staged mounting for performance; revert to always-on for reliability

  // Consolidated layout measurements - single throttled handler for all resize/scroll updates
  const updateLayoutMeasurements = useCallback(() => {
    // Navbar height
    const nav = document.querySelector('nav');
    const h = nav ? (nav.getBoundingClientRect().height || 60) : 60;
    dispatchMeasurements({ type: 'SET_NAVBAR_HEIGHT', payload: h });

    // Video container rect
    if (videoContainerRef.current) {
      const rect = videoContainerRef.current.getBoundingClientRect();
      dispatchMeasurements({
        type: 'SET_BITE_RECT',
        payload: {
          x: rect.left + window.scrollX,
          y: rect.top + window.scrollY,
          width: rect.width,
          height: rect.height,
          rx: 16
        }
      });
    }
  }, []);

  const throttledLayoutUpdate = useThrottleWithTrailing(updateLayoutMeasurements, 100);

  // Single event listener for all layout-dependent measurements
  useEffect(() => {
    updateLayoutMeasurements();
    window.addEventListener('resize', throttledLayoutUpdate);
    window.addEventListener('scroll', throttledLayoutUpdate, { passive: true });
    return () => {
      window.removeEventListener('resize', throttledLayoutUpdate);
      window.removeEventListener('scroll', throttledLayoutUpdate);
    };
  }, [sectionState, updateLayoutMeasurements, throttledLayoutUpdate]);

  // Modified entrance animation effect
  useEffect(() => {
    if (shouldAnimate) {
      setDisableTransitions(false);
      // Reset to initial state for fresh entrance
      setCurrentVideo(0);
      dispatchInteraction({ type: 'SET_PAUSED', payload: true });
      dispatchVisibility({ type: 'RESET' });
      dispatchInteraction({ type: 'DISABLE_INTERACTIONS' });

      // Start entrance ceremony
      const timers = [];

      timers.push(setTimeout(() => dispatchVisibility({ type: 'SHOW_HEADER' }), 450));
      timers.push(setTimeout(() => dispatchVisibility({ type: 'SHOW_VIDEO' }), 2925));
      timers.push(setTimeout(() => dispatchVisibility({ type: 'SHOW_CAPTIONS' }), 3225));
      timers.push(setTimeout(() => {
        dispatchInteraction({ type: 'ENABLE_INTERACTIONS' });
        dispatchInteraction({ type: 'SET_PAUSED', payload: false });
      }, 6000));

      return () => timers.forEach(timer => clearTimeout(timer));
    }
  }, [shouldAnimate]);

  // Tablet autoplay loop and progress sync (portrait and landscape)
  // Start autoplay when section is entering or active (not just active)
  useEffect(() => {
    if (!isTabletLayout && !isLandscapeTablet) return;
    // For tablets, start autoplay as soon as section is entering or active
    if (sectionState !== 'entering' && sectionState !== 'active') return;
    
    const id = setInterval(() => {
      if (!isPaused) {
        setBarKey((k) => k + 1);
        setCurrentVideo((c) => (c + 1) % 3);
      }
    }, TABLET_AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [isTabletLayout, isLandscapeTablet, isPaused, sectionState]);

  useEffect(() => {
    if (isTabletLayout || isLandscapeTablet) {
      setBarKey((k) => k + 1);
      // For tablets, ensure autoplay can start even if section is just entering
      if (sectionState === 'entering' || sectionState === 'active') {
        dispatchInteraction({ type: 'SET_PAUSED', payload: false });
      }
    }
  }, [isTabletLayout, isLandscapeTablet, sectionState]);

  // Gentle cleanup when preserved
  useEffect(() => {
    if (isPreserved) {
      setDisableTransitions(true);
      dispatchInteraction({ type: 'SET_PAUSED', payload: true });
      dispatchInteraction({ type: 'DISABLE_INTERACTIONS' });
    }
  }, [isPreserved]);

  // Full cleanup when section becomes inactive
  useEffect(() => {
    if (sectionState === 'preserving' || sectionState === 'cleaned' || sectionState === 'idle') {
      setDisableTransitions(true);
      dispatchVisibility({ type: 'RESET' });
      setCurrentVideo(0);
      dispatchInteraction({ type: 'RESET' });
      setBarKey(0);
    }
  }, [sectionState]);

  // Force remove transitions when section becomes idle
  useEffect(() => {
    if (sectionState === 'idle') {
      // Force remove all transitions on media elements
      const mediaElements = document.querySelectorAll('.video-gantry-frame, .video-frame');
      mediaElements.forEach(el => {
        el.style.transition = 'none';
        el.style.animation = 'none';
        el.style.transform = videoOffscreenTransform;
        el.style.opacity = '0';
      });

      // Double-RAF pattern: first frame applies styles, second frame re-enables transitions
      // This avoids synchronous forced reflow (layout thrashing)
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          mediaElements.forEach(el => {
            el.style.transition = '';
          });
        });
      });
    }
  }, [sectionState]);

  // Measure right highlighter position
  useLayoutEffect(() => {
    const node = rightRowRefs.current[currentVideo];
    if (node) {
      const { offsetTop, offsetHeight } = node;
      dispatchMeasurements({ type: 'SET_RIGHT_RECT', payload: { top: offsetTop, height: offsetHeight } });
    }
  }, [currentVideo, hoveredIndex]);

  // Position calculations
  useLayoutEffect(() => {
    if (videoAnchorRef.current && captionRef.current && contentAnchorRef.current) {
      const videoRect = videoAnchorRef.current.getBoundingClientRect();
      const captionRect = captionRef.current.getBoundingClientRect();
      const parentRect = contentAnchorRef.current.getBoundingClientRect();

      const videoAnchorTop = videoRect.top - parentRect.top;
      const videoAnchorHeight = videoRect.height;
      const captionHeight = captionRect.height;

      const top = videoAnchorTop + (videoAnchorHeight / 2) - (captionHeight / 2);
      dispatchMeasurements({ type: 'SET_CAPTION_TOP', payload: top });
    }
  }, [headerHeight, gap, videoHeight]);

  useLayoutEffect(() => {
    if (headerRef.current) {
      const headerRect = headerRef.current.getBoundingClientRect();
      dispatchMeasurements({ type: 'SET_HEADER_HEIGHT', payload: headerRect.height });
      dispatchMeasurements({ type: 'SET_VIDEO_TOP', payload: `${headerRect.height + gap}px` });
    }
  }, [gap]);

  // Re-measure and stabilize when crossing tablet/desktop breakpoint
  useLayoutEffect(() => {
    if (headerRef.current) {
      const headerRect = headerRef.current.getBoundingClientRect();
      dispatchMeasurements({ type: 'SET_HEADER_HEIGHT', payload: headerRect.height });
      dispatchMeasurements({ type: 'SET_VIDEO_TOP', payload: `${headerRect.height + gap}px` });
    }
    // Ensure all parts are visible after layout switch
    dispatchVisibility({ type: 'SHOW_ALL' });
  }, [isTabletLayout, gap]);

  useLayoutEffect(() => {
    const totalHeight = headerHeight + gap + videoHeight;
    // Sections now start at y=0 and extend behind the navbar
    // Center the ENTIRE CONTENT COLLECTION in the visible viewport (below navbar)
    const sectionHeight = window.innerHeight;
    const navH = navbarHeight;
    // Content center should be at: navH + (sectionHeight - navH) / 2
    // Simplified: sectionHeight/2 + navH/2
    const top = (sectionHeight / 2) - (totalHeight / 2) + (navH / 2);
    dispatchMeasurements({ type: 'SET_COLLECTION_TOP', payload: `${top}px` });
    dispatchMeasurements({ type: 'SET_VIDEO_AND_CAPTION_TOP', payload: `${top + headerHeight + gap}px` });
  }, [headerHeight, gap, videoHeight, navbarHeight]);


  // Animate outline opacity
  useEffect(() => {
    let timeout;
    if (safeVideoHover) {
      setOutlineFullOpacity(true);
      timeout = setTimeout(() => setOutlineFullOpacity(false), 150);
    } else {
      setOutlineFullOpacity(false);
    }
    return () => clearTimeout(timeout);
  }, [safeVideoHover]);

  // Animate highlighter outline opacity
  useEffect(() => {
    let timeout;
    if (safeHoveredIndex === currentVideo) {
      setHighlightOutlineFullOpacity(true);
      timeout = setTimeout(() => setHighlightOutlineFullOpacity(false), 150);
    } else {
      setHighlightOutlineFullOpacity(false);
    }
    return () => clearTimeout(timeout);
  }, [safeHoveredIndex, currentVideo]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  // Memoize event handlers to prevent unnecessary re-renders
  const handleSlideChange = useCallback((index) => {
    setCurrentVideo(index);
  }, []);

  const handleHover = useCallback((index) => {
    if (!interactionsEnabled) return;

    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }

    if (typeof index === 'number' && index >= 0 && index < headlines.length) {
      if (index !== currentVideo) setBarKey((k) => k + 1);
      setCurrentVideo(index);
      dispatchInteraction({ type: 'SET_PAUSED', payload: true });
      dispatchInteraction({ type: 'SET_HOVERED_INDEX', payload: index });
    }
  }, [interactionsEnabled, headlines.length, currentVideo]);

  const handleHoverEnd = useCallback(() => {
    if (!interactionsEnabled) return;

    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }

    hoverTimeoutRef.current = setTimeout(() => {
      dispatchInteraction({ type: 'SET_PAUSED', payload: false });
      dispatchInteraction({ type: 'SET_HOVERED_INDEX', payload: null });
    }, 50);
  }, [interactionsEnabled]);

  const handleBarEnd = useCallback(() => {
    if (!isPaused) {
      setBarKey((k) => k + 1);
      setCurrentVideo((c) => (c + 1) % 3);
    }
  }, [isPaused]);

  // Memoized handlers for tablet carousel
  const handleTabletCarouselChange = useCallback((idx) => {
    setCurrentVideo(idx);
    dispatchInteraction({ type: 'SET_PAUSED', payload: true });
    setBarKey((k) => k + 1);
  }, []);

  const handleTabletPauseChange = useCallback((p) => {
    dispatchInteraction({ type: 'SET_PAUSED', payload: !!p });
  }, []);

  const handleTabletBarSelect = useCallback((i) => {
    setCurrentVideo(i);
    dispatchInteraction({ type: 'SET_PAUSED', payload: true });
    setBarKey((k) => k + 1);
    setTimeout(() => dispatchInteraction({ type: 'SET_PAUSED', payload: false }), 100);
  }, []);

  // Memoize tablet captions to prevent array recreation
  const tabletCaptions = useMemo(() =>
    headlines.map(h => <span key={h.firstLine}>{h.firstLine}<br />{h.secondLine}</span>),
  [headlines]);

  // Memoized handler for landscape tablet caption clicks
  const handleLandscapeTabletCaptionClick = useCallback((i) => {
    setCurrentVideo(i);
    dispatchInteraction({ type: 'SET_PAUSED', payload: true });
    setBarKey((k) => k + 1);
    dispatchInteraction({ type: 'SET_HOVERED_INDEX', payload: i });
    setTimeout(() => {
      dispatchInteraction({ type: 'SET_PAUSED', payload: false });
      dispatchInteraction({ type: 'SET_HOVERED_INDEX', payload: null });
    }, 100);
  }, []);

  // Memoized touch handlers for landscape tablet
  const handleLandscapeTabletTouchStart = useCallback((i) => {
    setCurrentVideo(i);
    dispatchInteraction({ type: 'SET_PAUSED', payload: true });
    setBarKey((k) => k + 1);
    dispatchInteraction({ type: 'SET_HOVERED_INDEX', payload: i });
  }, []);

  const handleLandscapeTabletTouchEnd = useCallback(() => {
    setTimeout(() => {
      dispatchInteraction({ type: 'SET_PAUSED', payload: false });
      dispatchInteraction({ type: 'SET_HOVERED_INDEX', payload: null });
    }, 100);
  }, []);

  // Memoized handler for video hover state (used by MedicalCarousel)
  const handleVideoHover = useCallback((hover) => {
    dispatchInteraction({ type: 'SET_VIDEO_HOVER', payload: hover });
  }, []);

  // Unified Tablet Layout (Portrait & Landscape)
  // Uses CSS Grid that adapts smoothly during rotation
  if (isTabletLayout) {
    const isActive = sectionState === 'active';
    // During rotation, disable all transitions for smooth experience
    const transitionsDisabled = disableTransitions || isRotating;

    // Responsive sizing based on orientation
    // Portrait: taller viewport, use height-based sizing
    // Landscape: wider viewport, constrain width more
    const contentWidth = isTabletLandscape
      ? 'min(75vw, 520px)' // Landscape: narrower to leave room
      : 'min(92vw, clamp(260px, 60vh, 480px))'; // Portrait: use more width
    const captionWidth = isTabletLandscape
      ? 'min(75vw, 520px)'
      : 'min(520px, 90vw)';
    const contentGap = isTabletLandscape ? 16 : 24;

    return (
      <div
        key={layoutKey}
        ref={sectionRef}
        className="w-full h-screen relative overflow-hidden"
        style={{
          background: '#1c3424',
          // Smooth transition when NOT rotating
          transition: isRotating ? 'none' : 'all 0.3s ease-out',
        }}
      >
        <TabletBlurBackground blurVideos={blurVideos} current={currentVideo} fadeDuration={1.2} />

        {/* Foreground content wrapper - CSS Grid for smooth orientation adaptation */}
        <div style={{
          paddingTop: 'var(--nav-h, 60px)',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
          minHeight: 'calc(100dvh - var(--nav-h, 60px))',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: contentGap,
          position: 'relative',
          zIndex: 1,
          // Smooth gap/sizing transition (disabled during rotation)
          transition: isRotating ? 'none' : 'gap 0.3s ease-out',
        }}>

          {/* Header */}
          <div style={{
            width: contentWidth,
            margin: '0 auto',
            textAlign: 'left',
            opacity: headerVisible ? 1 : 0,
            transition: transitionsDisabled ? 'none' : (shouldTransition ? 'opacity 2.25s ease, width 0.3s ease-out' : 'width 0.3s ease-out'),
          }}>
            <div style={{ width: '70%', margin: 0 }}>
              <AutoFitHeading
                lines={[
                  header.line1suffix ? (
                    <span key="combined-line">{header.line1}{header.line1suffix}<span style={{ color: '#3fd1c7' }}>{header.line2highlight}</span>{header.line2suffix}</span>
                  ) : header.line1,
                  header.line1suffix ? header.line3 : (
                    <span key="highlight-line">{header.line2prefix}<span style={{ color: '#3fd1c7' }}>{header.line2highlight}</span>{header.line2suffix}</span>
                  ),
                  header.line1suffix ? header.line4 : header.line3
                ].filter(Boolean)}
                minPx={isTabletLandscape ? 22 : 26}
                maxPx={isTabletLandscape ? 36 : 44}
                lineHeight={1.2}
                lineAligns={['left','left','left']}
                visible={headerVisible}
                commaStagger
                staggerDelayMs={1125}
                postGroupStartIndex={1}
              />
            </div>
          </div>

          {/* Video Container */}
          <div style={{
            width: contentWidth,
            transition: isRotating ? 'none' : 'width 0.3s ease-out',
          }}>
            <div style={{
              width: '100%',
              aspectRatio: '3 / 2',
              borderRadius: 16,
              overflow: 'hidden',
              position: 'relative',
              opacity: videoVisible ? 1 : 0,
              transition: transitionsDisabled
                ? 'none'
                : (videoVisible ? 'opacity 2.25s ease, transform 2.25s cubic-bezier(0.4,0,0.2,1)' : 'none'),
              transform: videoVisible ? 'translate3d(0,0,0)' : videoOffscreenTransform,
            }}>
              <TabletMedicalCarousel
                videos={mainVideos}
                current={currentVideo}
                onChange={handleTabletCarouselChange}
                onPauseChange={handleTabletPauseChange}
                style={{ width: '100%', height: '100%' }}
              />
            </div>
          </div>

          {/* Captions */}
          <div style={{
            width: captionWidth,
            margin: '0 auto',
            textAlign: 'center',
            position: 'relative',
            opacity: captionsVisible ? 1 : 0,
            transition: transitionsDisabled
              ? 'none'
              : (captionsVisible ? 'opacity 0.5s ease, width 0.3s ease-out' : 'width 0.3s ease-out'),
          }}>
            <TabletTravellingBar
              captions={tabletCaptions}
              current={currentVideo}
              onSelect={handleTabletBarSelect}
              style={{ margin: '0 auto', background: 'none' }}
              durationMs={TABLET_AUTOPLAY_MS}
              paused={isPaused}
              animationKey={barKey}
              captionsVisible={captionsVisible}
              shouldTransition={!transitionsDisabled}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      key={layoutKey}
      ref={sectionRef} 
      className="h-screen w-full relative overflow-hidden"
      style={{
        opacity: sectionState === 'idle' || sectionState === 'cleaned' ? 0 : 1,
        transition: 'opacity 0.3s ease',
        paddingTop: isTabletLayout ? 16 : 0
      }}
    >
      <style>{VIDEO_CONTROLS_HIDDEN_CSS}</style>
      {/* Always-visible base blur video */}
      <div
        className="absolute inset-0 flex items-center justify-center opacity-100 z-0"
        style={BLUR_VIDEO_BASE_STYLE}
      >
        <div style={VIDEO_INNER_CONTAINER_STYLE}>
          <VideoManager
            src={blurVideos[BASE_INDEX].video}
            isPlaying={isActive || shouldAnimate}
            className="w-full h-full object-cover"
            controls={false}
            preload="metadata"
            tabIndex="-1"
            aria-hidden="true"
            draggable="false"
            disablePictureInPicture
            disableRemotePlayback
            controlsList="nodownload nofullscreen noremoteplayback"
            onContextMenu={(e) => e.preventDefault()}
          />
          <div style={VIDEO_OVERLAY_STYLE} />
        </div>
      </div>
      {/* Other blur videos fade in/out on top */}
      {blurVideos.map((video, index) => (
        index !== BASE_INDEX && (
          <div
            key={video.id}
            className={`absolute inset-0 flex items-center justify-center transition-opacity duration-700 ease z-10 ${
              index === currentVideo ? 'opacity-100' : 'opacity-0'
            }`}
            style={{
              ...BLUR_VIDEO_BASE_STYLE,
              transition: shouldTransition ? 'opacity 700ms ease' : 'none'
            }}
          >
            <div style={VIDEO_INNER_CONTAINER_STYLE}>
              <VideoManager
                src={video.video}
                isPlaying={(isActive || shouldAnimate) && (index === 0 ? currentVideo === 0 : currentVideo <= 1)}
                className="w-full h-full object-cover"
                controls={false}
                preload="metadata"
                tabIndex="-1"
                aria-hidden="true"
                draggable="false"
                disablePictureInPicture
                disableRemotePlayback
                controlsList="nodownload nofullscreen noremoteplayback"
                onContextMenu={(e) => e.preventDefault()}
              />
              <div style={VIDEO_OVERLAY_STYLE} />
            </div>
          </div>
        )
      ))}
      {/* Header on tablet: render above the carousel */}
      {isTabletLayout && (
        <div
          ref={headerRef}
          data-testid="header-frame-tablet"
          className="header-frame-tablet"
          style={{
            position: 'relative',
            width: 'min(92vw, clamp(260px, 60vh, 480px))',
            background: 'none',
            zIndex: 20,
            opacity: headerVisible ? 1 : 0,
            margin: '0 auto 24px',
            transition: shouldTransition ? (headerVisible ? 'opacity 1.2s ease' : 'none') : 'none'
          }}
        >
          <div style={{ width: '100%', display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-start' }}>
            <h2 style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 40,
              fontWeight: 700,
              letterSpacing: -2,
              lineHeight: 1.2,
              color: '#fff',
              margin: 0,
              textShadow: [
                '0 4px 32px rgba(0,0,0,0.22)',
                '0 2px 16px rgba(0,0,0,0.18)',
                '0 1px 2px rgba(0,0,0,0.12)',
                '0 0px 1px rgba(0,0,0,0.18)',
                '0 0px 8px rgba(82,156,156,0.10)'
              ].join(', '),
              textAlign: 'left',
              width: '100%'
            }}>
              <span style={{ opacity: headerVisible ? 1 : 0, transition: shouldTransition ? 'opacity 1.2s ease' : 'none' }}>{header.line1}</span>
              {header.line1suffix ? (
                <span style={{ opacity: headerVisible ? 1 : 0, transition: shouldTransition ? 'opacity 1.2s ease 0.6s' : 'none' }}>{header.line1suffix}</span>
              ) : (
                <br />
              )}
              <span style={{ opacity: headerVisible ? 1 : 0, color: '#3fd1c7', transition: shouldTransition ? 'opacity 1.2s ease 0.6s' : 'none' }}>{header.line2highlight}</span>
              <span style={{ opacity: headerVisible ? 1 : 0, transition: shouldTransition ? 'opacity 1.2s ease 0.6s' : 'none' }}>{header.line2suffix}</span>
              <br />
              <span style={{ opacity: headerVisible ? 1 : 0, transition: shouldTransition ? 'opacity 1.2s ease 0.6s' : 'none' }}>{header.line3}</span>
              {header.line4 && (
                <>
                  <br />
                  <span style={{ opacity: headerVisible ? 1 : 0, transition: shouldTransition ? 'opacity 1.2s ease 0.6s' : 'none' }}>{header.line4}</span>
                </>
              )}
            </h2>
          </div>
        </div>
      )}
      {/* Foreground content: flex row (desktop) or column (tablet) */}
      <div style={{
        position: 'relative',
        width: '100%',
        height: isTabletLayout ? 'auto' : bandHeight,
        display: 'flex',
        flexDirection: isTabletLayout ? 'column' : 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: isTabletLayout ? 32 : 0,
        zIndex: 20,
      }}>
        {/* Spacer (centered) */}
        <div
          data-testid="spacer"
          className="spacer"
          style={{
            position: 'absolute',
            left: '50%',
            top: collectionTop,
            width: 40,
            height: headerHeight + gap + videoHeight,
            transform: 'translateX(-50%)',
            background: 'rgba(255, 0, 0, 0)',
            pointerEvents: 'none',
            zIndex: 10,
            display: isTabletLayout ? 'none' : 'block',
          }}
        />
        {/* Video Anchor (now contains cookiecutter and video container) */}
        <div
          ref={videoAnchorRef}
          data-testid="video-anchor"
          style={{
            position: isTabletLayout ? 'relative' : 'absolute',
            ...(isTabletLayout
              ? {}
              : isVideoLeft
                ? { left: 'calc(50% + 20px)' }
                : { right: 'calc(50% + 20px)' }),
            top: isTabletLayout ? 'auto' : videoAndCaptionTop,
            width: videoContainerWidth,
            maxWidth: isTabletLayout ? '90vw' : 480,
            height: isTabletLayout ? 'auto' : videoHeight,
            aspectRatio: isTabletLayout ? '3 / 2' : undefined,
            opacity: 1,
            pointerEvents: 'none',
            zIndex: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: isTabletLayout ? '0 auto' : undefined,
          }}
        >
          {/* CookieCutterBand: sibling to video container */}
          {shouldTransition && (
            <div style={{
              position: 'absolute',
              ...(isVideoLeft ? { left: 0 } : { right: 0 }),
              top: 0,
              width: bandWidth,
              height: bandHeight,
              zIndex: 1,
              pointerEvents: 'none',
              transition: isNudging
                ? 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) 0.3s'
                : 'transform 1.5s cubic-bezier(0.4,0,0.2,1), opacity 1.5s ease',
              transform: safeVideoHover
                ? 'translateY(-12px)'
                : videoVisible
                  ? 'translateX(0)'
                  : videoOffscreenTransform,
              opacity: videoVisible ? 0.4 : 0,
              mixBlendMode: 'screen'
            }}>
              <CookieCutterBand
                bandColor="#f0f4f6"
                bandHeight={bandHeight}
                bandWidth={bandWidth}
              />
            </div>
          )}
          {/* Gantry Frame: contains only the video container now */}
          {shouldTransition && (
            <div
              className="video-gantry-frame"
              data-section-inactive={!shouldTransition}
              style={{
                ...gantryFrameStyle,
                position: isTabletLayout ? 'relative' : 'absolute',
                ...(isTabletLayout
                  ? {}
                  : isVideoLeft
                    ? { left: 0 }
                    : { right: 0 }),
                top: isTabletLayout ? 'auto' : 0,
                zIndex: 3,
                pointerEvents: 'auto'
              }}
            >
            {/* Targeting Outline Animation */}
            <div
              className="target-outline"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                border: '3px solid white',
                borderRadius: 16,
                pointerEvents: 'none',
                boxSizing: 'border-box',
                transform: safeVideoHover ? 'scale(1)' : 'scale(1.08)',
                opacity: safeVideoHover ? (outlineFullOpacity ? 0.9 : 0.4) : 0,
                transition: shouldTransition ? [
                  safeVideoHover 
                    ? 'transform 0.9s cubic-bezier(0.4, 0, 0.2, 1) 0.2s'
                    : 'transform 0.9s cubic-bezier(0.4, 0, 0.2, 1)',
                  outlineFullOpacity
                    ? 'opacity 0.1s cubic-bezier(.4,2,.6,1)'
                    : safeVideoHover
                    ? 'opacity 0.2s cubic-bezier(.4,0,.2,1) 0.2s'
                    : 'opacity 0.13s'
                ].join(', ') : 'none',
                zIndex: 10
              }}
            />
            {/* Video Frame (no hover transform or border) */}
            <div
              data-testid="video-frame"
              className="video-frame"
              style={{ 
                position: isTabletLayout ? 'relative' : 'absolute',
                left: isTabletLayout ? 'auto' : 0,
                top: isTabletLayout ? 'auto' : 0,
                width: '100%',
                height: isTabletLayout ? 'auto' : '100%',
                aspectRatio: isTabletLayout ? '3 / 2' : undefined,
                zIndex: 3,
                background: 'none',
                borderRadius: 16,
                overflow: 'hidden',
                border: 'none',
                boxShadow: 'none',
                opacity: shouldTransition ? (videoVisible ? 1 : 0) : 0, // Always hide when not transitioning
                transition: shouldTransition ? 'opacity 1.5s ease' : 'none !important'
              }}
              ref={videoContainerRef}
            >
              <MedicalCarousel
                current={currentVideo}
                setVideoCenter={setVideoCenter}
                hoveredIndex={safeHoveredIndex}
                isActive={safeHoveredIndex === currentVideo || isPaused}
                videoHover={safeVideoHover}
                setVideoHover={handleVideoHover}
                interactionsEnabled={interactionsEnabled}
                videos={mainVideos}
                enableTouchNavigation={isLandscapeTablet}
                onTouchChange={handleTabletCarouselChange}
              />
            </div>
          </div>
          )}
        </div>
      </div>
      {/* Video Anchor (positioning reference) */}
      <div
        data-testid="video-anchor-ref"
        style={{
          position: 'absolute',
          ...(isVideoLeft
            ? { left: 'calc(50% + 20px)' }
            : { right: 'calc(50% + 20px)' }),
          top: videoAndCaptionTop,
          width: 480,
          height: videoHeight,
          opacity: 0,
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />
      {/* Caption Anchor with entrance animation */}
      <div
        className="caption-anchor"
        style={{
          position: isTabletLayout ? 'relative' : 'absolute',
          ...(isTabletLayout
            ? {}
            : isVideoLeft
              ? { right: 'calc(50% + 20px)' }
              : { left: 'calc(50% + 20px)' }),
          top: isTabletLayout ? 'auto' : videoAndCaptionTop,
          width: captionContainerWidth,
          maxWidth: isTabletLayout ? '90vw' : 444,
          height: isTabletLayout ? 'auto' : videoHeight,
          display: 'flex',
          alignItems: isTabletLayout ? 'stretch' : 'center',
          justifyContent: isTabletLayout ? 'flex-start' : 'center',
          zIndex: 20,
          transition: shouldTransition ? (captionsVisible ? 'opacity 0.5s ease' : 'none') : 'none',
          opacity: captionsVisible ? 1 : 0,
          margin: isTabletLayout ? '0 auto' : undefined,
        }}
      >
        {/* Caption Section (centered inside caption anchor) */}
        <div
          ref={captionRef}
          className="MedicalSection-caption-area flex flex-col items-start justify-center"
          data-testid="MedicalSection-caption-area"
          style={{
            maxWidth: isTabletLayout ? '100%' : 520,
            width: isTabletLayout ? '100%' : 'auto',
            marginLeft: 0,
            paddingLeft: 0,
          }}
        >
          <div className="relative flex flex-col gap-2 items-stretch" style={{ width: 'auto', marginLeft: 0, paddingLeft: 0 }}>
            {((rightReady && Number.isFinite(currentVideo) && Number.isFinite(rightRect.top) && Number.isFinite(rightRect.height)) || (isLandscapeTablet && sectionState !== 'idle')) && (
              <>
                {/* Targeting outline container */}
                <div
                  className="absolute transition-all duration-700 ease"
                  style={{
                    top: rightRect.top,
                    left: '50%',
                    width: isTabletLayout ? '100%' : 444,
                    height: rightRect.height,
                    transform: 'translateX(-50%)',
                    zIndex: 5,
                    pointerEvents: 'none',
                    transition: shouldTransition ? 'all 700ms ease' : 'none',
                    display: isTabletLayout ? 'none' : undefined, // Only hide for portrait tablet
                  }}
                >
                  {/* Targeting outline */}
                  <div
                    className="absolute inset-0 transition-all duration-700 ease"
                    style={{
                      border: '3px solid white',
                      borderRadius: 10,
                      mixBlendMode: 'screen',
                      transform: safeHoveredIndex === currentVideo ? 'scale(1)' : 'scale(1.08, 1.3)',
                      transition: shouldTransition ? [
                        safeHoveredIndex === currentVideo 
                          ? 'transform 0.9s cubic-bezier(0.4, 0, 0.2, 1) 0.2s'
                          : 'transform 0.9s cubic-bezier(0.4, 0, 0.2, 1)',
                        highlightOutlineFullOpacity
                          ? 'opacity 0.1s cubic-bezier(.4,2,.6,1)'
                          : safeHoveredIndex === currentVideo
                          ? 'opacity 0.33s cubic-bezier(.4,0,.2,1) 0.2s'
                          : 'opacity 0.13s'
                      ].join(', ') : 'none',
                      opacity: (safeHoveredIndex === currentVideo || (isLandscapeTablet && hoveredIndex === null)) ? (highlightOutlineFullOpacity ? 0.9 : 0.4) : 0
                    }}
                  />
                  {/* Duplicated Highlighter rectangle for right section */}
                  <div
                    className="absolute rounded-xl pointer-events-none overflow-hidden"
                    style={{
                      top: 0,
                      height: rightRect.height,
                      width: isTabletLayout ? '100%' : 444,
                      left: 0,
                      paddingLeft: 24,
                      paddingRight: 24,
                      background: (safeHoveredIndex === currentVideo || (isLandscapeTablet && hoveredIndex === null)) ? 'rgba(228,228,228,1)' : 'rgba(232,232,232,1)',
                      borderRadius: 10,
                      boxShadow: (safeHoveredIndex === currentVideo || (isLandscapeTablet && hoveredIndex === null)) ? '1px 1px 2px 0px rgba(0,0,0,0.5)' : '1px 1px 2px 0px rgba(0,0,0,0.25)',
                      opacity: captionsVisible ? 1 : 0,
                      transform: captionsVisible ? 'translate3d(0,0,0)' : (isVideoLeft ? 'translateX(-200px)' : 'translateX(200px)'),
                      transition: shouldTransition
                        ? `top 0.6s cubic-bezier(0.4, 0, 0.2, 1), height 0.6s cubic-bezier(0.4, 0, 0.2, 1), color 0.25s, box-shadow 0.25s, background 0.25s, opacity 1.2s ease, transform 1.2s cubic-bezier(0.4,0,0.2,1)`
                        : 'none',
                      zIndex: 30
                    }}
                  >
                    <div className="w-full h-full rounded-xl relative pointer-events-none">
                      {/* Loading Bar */}
                      <div
                        key={barKey}
                        className="absolute left-0 bottom-0 h-[5px]"
                        style={{
                          background: 'rgba(82,156,156,1)',
                          animation: `grow-overflow 7000ms linear forwards`,
                          animationPlayState: isPaused ? 'paused' : 'running',
                          left: -24,
                          width: '100%'
                        }}
                        onAnimationEnd={handleBarEnd}
                      />
                    </div>
                  </div>
                  {/* Horizontal line */}
                  <div
                    className="absolute"
                    style={{
                      top: '50%',
                      left: '50%',
                      width: '100vw',
                      height: 5,
                      background: '#e0e0e0',
                      mixBlendMode: 'screen',
                      pointerEvents: 'none',
                      transform: isVideoLeft ? 'translateY(-50%) translateX(-100%)' : 'translateY(-50%)',
                      transition: shouldTransition
                        ? 'top 600ms cubic-bezier(0.4, 0, 0.2, 1), left 600ms cubic-bezier(0.4, 0, 0.2, 1), width 600ms cubic-bezier(0.4, 0, 0.2, 1), opacity 0.5s ease 1.2s'
                        : 'none',
                      opacity: captionsVisible ? 0.2 : 0,
                      display: (isTabletLayout || isLandscapeTablet) ? 'none' : undefined,
                    }}
                  />
                </div>
              </>
            )}
            {headlines.map((headline, i) => (
              <button
                key={i}
                ref={(el) => (rightRowRefs.current[i] = el)}
                onMouseEnter={interactionsEnabled && !isLandscapeTablet ? () => handleHover(i) : undefined}
                onMouseLeave={interactionsEnabled && !isLandscapeTablet ? handleHoverEnd : undefined}
                onClick={interactionsEnabled && isLandscapeTablet ? () => handleLandscapeTabletCaptionClick(i) : undefined}
                onTouchStart={interactionsEnabled && isLandscapeTablet ? () => handleLandscapeTabletTouchStart(i) : undefined}
                onTouchEnd={interactionsEnabled && isLandscapeTablet ? handleLandscapeTabletTouchEnd : undefined}
                className={`relative ${isVideoLeft ? 'text-left' : 'text-right'} py-3 rounded-xl`}
                style={{
                  display: 'block',
                  maxWidth: isTabletLayout ? '100%' : 480,
                  minWidth: isTabletLayout ? '0px' : 320,
                  width: '100%',
                  paddingLeft: 24,
                  paddingRight: 24,
                  zIndex: 40,
                  cursor: interactionsEnabled ? 'pointer' : 'default',
                  opacity: captionsVisible ? 1 : 0,
                  transform: captionsVisible ? 'translate3d(0,0,0)' : captionOffscreenTransform,
                  transition: shouldTransition
                    ? (captionsVisible
                      ? `transform 1.2s cubic-bezier(0.4,0,0.2,1) ${i * 300}ms, opacity 1.2s ease ${i * 300}ms`
                      : 'none')
                    : 'none'
                }}
              >
                <p className={`m-0 ${isVideoLeft ? 'text-left' : 'text-right'} text-2xl leading-tight`} style={{
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 500,
                  letterSpacing: '-0.5px',
                  color:
                    safeHoveredIndex === i
                      ? '#2D6A6A'
                      : currentVideo === i
                      ? '#2a2323'
                      : '#bdbdbd',
                  mixBlendMode:
                    safeHoveredIndex === i
                      ? 'normal'
                      : currentVideo === i
                      ? 'normal'
                      : 'screen',
                  transition: shouldTransition ? 'color 0.6s, transform 0.3s' : 'none',
                  transform: safeHoveredIndex === i ? 'translateY(-1px)' : 'translateY(0)',
                  userSelect: 'none',
                  WebkitUserSelect: 'none'
                }}>
                  {headline.firstLine}
                  <br />
                  {headline.secondLine}
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>
      {/* Header Frame with entrance animation */}
      <div
        ref={headerRef}
        data-testid="header-frame"
        className="header-frame"
        style={{
          position: 'absolute',
          ...(isVideoLeft
            ? { left: `calc(50% + ${gap / 2}px)` }
            : { right: `calc(50% + ${gap / 2}px)` }),
          top: collectionTop,
          width: cutoutWidth,
          background: 'none',
          zIndex: 20,
          transition: shouldTransition ? (headerVisible ? 'opacity 2.25s ease' : 'none') : 'none',
          opacity: headerVisible ? 1 : 0,
        }}
      >
        <div style={{ width: cutoutWidth, display: 'flex', alignItems: isVideoLeft ? 'flex-end' : 'flex-start', justifyContent: isVideoLeft ? 'flex-end' : 'flex-start', marginRight: 0 }}>
          <h2 style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: isLandscapeTablet ? 32 : 48,
            fontWeight: 700,
            letterSpacing: -2,
            lineHeight: 1.2,
            color: '#fff',
            margin: 0,
            marginBottom: 32,
            textShadow: [
              '0 4px 32px rgba(0,0,0,0.22)',
              '0 2px 16px rgba(0,0,0,0.18)',
              '0 1px 2px rgba(0,0,0,0.12)',
              '0 0px 1px rgba(0,0,0,0.18)',
              '0 0px 8px rgba(82,156,156,0.10)'
            ].join(', '),
            alignSelf: isVideoLeft ? 'flex-end' : 'flex-start',
            paddingLeft: 0,
            textAlign: isVideoLeft ? 'right' : 'left',
            width: '100%',
            userSelect: 'none',
            WebkitUserSelect: 'none'
          }}>
            <span
              style={{
                transition: shouldTransition ? 'opacity 2.25s ease' : 'none',
                opacity: headerVisible ? 1 : 0,
              }}
            >
              {header.line1}
            </span>
            {header.line1suffix ? (
              <span
                style={{
                  transition: shouldTransition ? 'opacity 2.25s ease 1.125s' : 'none',
                  opacity: headerVisible ? 1 : 0,
                }}
              >
                {header.line1suffix}
              </span>
            ) : (
              <br />
            )}
            <span
              style={{
                transition: shouldTransition ? 'opacity 2.25s ease 1.125s' : 'none',
                opacity: headerVisible ? 1 : 0,
                color: '#3fd1c7'
              }}
            >
              {header.line2highlight}
            </span>
            <span
              style={{
                transition: shouldTransition ? 'opacity 2.25s ease 1.125s' : 'none',
                opacity: headerVisible ? 1 : 0,
              }}
            >
              {header.line2suffix}
            </span>
            <br />
            <span
              style={{
                transition: shouldTransition ? 'opacity 2.25s ease 1.125s' : 'none',
                opacity: headerVisible ? 1 : 0,
              }}
            >
              {header.line3}
            </span>
            {header.line4 && (
              <>
                <br />
                <span
                  style={{
                    transition: shouldTransition ? 'opacity 2.25s ease 1.125s' : 'none',
                    opacity: headerVisible ? 1 : 0,
                  }}
                >
                  {header.line4}
                </span>
              </>
            )}
          </h2>
        </div>
      </div>
    </div>
  );
};

export default MedicalSection;