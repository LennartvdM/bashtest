import { useState, useRef, useEffect, useLayoutEffect, useMemo, useCallback, useReducer } from 'react';
import React from 'react';
import { useSectionLifecycle } from '../../../hooks/useSectionLifecycle';
import { useTabletLayout } from '../../../hooks/useTabletLayout';
import { useThrottleWithTrailing } from '../../../hooks/useDebounce';
import { visibilityReducer, measurementsReducer, interactionReducer } from './MedicalSection.reducers';
import { VARIANTS, BASE_INDEX } from './MedicalSection.data';

export function useMedicalSection({ inView, variant = 'v2' }) {
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
  const [highlighterSnap, setHighlighterSnap] = useState(false);

  // All useRef hooks next
  const rowRefs = useRef({});
  const captionsRef = useRef();
  const videoContainerRef = useRef();
  const hoverTimeoutRef = useRef(null);
  const videoDebounceRef = useRef(null);
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
    captionTop, headerHeight, videoTop,
    collectionTop, videoAndCaptionTop, biteRect, navbarHeight,
    highlighterLeftPx, highlighterWidthPx
  } = measurements;
  const { isPaused, hoveredIndex, videoHover, interactionsEnabled } = interaction;

  // Derived/computed values after all state declarations
  const safeVideoHover = interactionsEnabled && videoHover;
  const safeHoveredIndex = interactionsEnabled ? hoveredIndex : null;

  // Transition control to prevent rewind animations
  const shouldTransition = sectionState === 'entering' || sectionState === 'active';

  // Re-enable transitions after a snap (instant position change)
  useEffect(() => {
    if (highlighterSnap) {
      const id = requestAnimationFrame(() => setHighlighterSnap(false));
      return () => cancelAnimationFrame(id);
    }
  }, [highlighterSnap]);


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
      if (videoDebounceRef.current) {
        clearTimeout(videoDebounceRef.current);
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
      // Update visual hover state immediately (text color feedback)
      dispatchInteraction({ type: 'SET_PAUSED', payload: true });
      dispatchInteraction({ type: 'SET_HOVERED_INDEX', payload: index });

      // Debounce the video/highlighter switch so quick passes over
      // intermediate items don't cause step-by-step ratcheting
      if (videoDebounceRef.current) {
        clearTimeout(videoDebounceRef.current);
      }
      videoDebounceRef.current = setTimeout(() => {
        // Snap mode: disable transform transition so the highlighter
        // teleports to the destination instead of sliding through intermediates
        setHighlighterSnap(true);
        setBarKey((k) => k + 1);
        setCurrentVideo(index);
        videoDebounceRef.current = null;
      }, 80);
    }
  }, [interactionsEnabled, headlines.length]);

  const handleHoverEnd = useCallback(() => {
    if (!interactionsEnabled) return;

    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    if (videoDebounceRef.current) {
      clearTimeout(videoDebounceRef.current);
      videoDebounceRef.current = null;
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

  return {
    // config
    blurVideos, headlines, mainVideos, CookieCutterBand, orientation, sectionId, header,
    // lifecycle
    sectionState, shouldAnimate, isActive, isPreserved,
    // visibility
    headerVisible, videoVisible, captionsVisible,
    // measurements
    captionTop, headerHeight, videoTop,
    collectionTop, videoAndCaptionTop, biteRect, navbarHeight,
    highlighterLeftPx, highlighterWidthPx,
    // interaction
    isPaused, hoveredIndex, videoHover, interactionsEnabled,
    // individual state
    currentVideo, videoCenter, setVideoCenter, barKey, outlineFullOpacity, highlightOutlineFullOpacity, disableTransitions, highlighterSnap,
    // refs
    rowRefs, captionsRef, videoContainerRef, rightCaptionsRef,
    headerRef, videoAnchorRef, captionRef, contentAnchorRef, shadedFrameRef, captionButtonRefs,
    // derived
    safeVideoHover, safeHoveredIndex, shouldTransition,
    NUDGE_TRANSITION, SLIDE_TRANSITION,
    isDesktop, isTabletPortrait, isTabletLandscape, isTablet, isRotating, isTouchDevice,
    isTabletLayout, isLandscapeTablet, isVideoLeft,
    bandWidth, bandHeight, cutoutWidth, cutoutHeight, cornerRadius, gap, videoHeight,
    videoContainerWidth, captionContainerWidth, videoOffscreenTransform, captionOffscreenTransform, layoutKey,
    TABLET_AUTOPLAY_MS, bandLeft, bandTop,
    isNudging, gantryFrameStyle, isPortraitTablet, isDesktopLayout,
    // handlers
    handleSlideChange, handleHover, handleHoverEnd, handleBarEnd,
    handleTabletCarouselChange, handleTabletPauseChange, handleTabletBarSelect,
    tabletCaptions, handleLandscapeTabletCaptionClick, handleLandscapeTabletTouchStart, handleLandscapeTabletTouchEnd,
    handleVideoHover,
  };
}
