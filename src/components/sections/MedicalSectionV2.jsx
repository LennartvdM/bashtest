// redeploy marker: 2025-10-31T00:00:00Z
import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import MedicalCarousel from '../MedicalCarousel';
import TabletMedicalCarousel from '../TabletMedicalCarousel';
import ReactDOM from 'react-dom';
import SimpleCookieCutterBand from '../SimpleCookieCutterBand';
import { useSectionLifecycle } from '../../hooks/useSectionLifecycle';
import VideoManager from '../VideoManager';
import TabletTravellingBar from '../TabletTravellingBar';
import TabletBlurBackground from '../TabletBlurBackground';
import AutoFitHeading from '../AutoFitHeading';

const blurVideos = [
  { id: "0", video: "/videos/blururgency.mp4", alt: "Blurred medical urgency" },
  { id: "1", video: "/videos/blurcoordination.mp4", alt: "Blurred team coordination" },
  { id: "2", video: "/videos/blurfocus.mp4", alt: "Blurred medical focus" }, // base video
];

const BASE_INDEX = 2; // index of the always-visible base video

const headlines = [
  {
    firstLine: "Medical interventions demand",
    secondLine: "precision and urgency."
  },
  {
    firstLine: "Which makes coordination within",
    secondLine: "teams vital for success."
  },
  {
    firstLine: "Task‑driven focus can lead to",
    secondLine: "tunnel vision and misalignment."
  }
];

const mainVideos = [
  { id: "0", video: "/videos/urgency.mp4", alt: "Medical urgency demonstration" },
  { id: "1", video: "/videos/coordination.mp4", alt: "Medical team coordination" },
  { id: "2", video: "/videos/focus.mp4", alt: "Medical focus and precision" },
];

const MedicalSectionV2 = ({ inView, sectionRef }) => {
  const { 
    sectionState, 
    shouldAnimate, 
    isActive,
    isPreserved 
  } = useSectionLifecycle('medical-v2', inView);

  // All useState hooks first
  const [currentVideo, setCurrentVideo] = useState(0);
  const [videoCenter, setVideoCenter] = useState({ x: 0, y: 0 });
  const [highlighterRight, setHighlighterRight] = useState({ x: 0, y: 0 });
  const [ready, setReady] = useState(false);
  const [barKey, setBarKey] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [rect, setRect] = useState({ top: 0, height: 0 });
  const [interactionsEnabled, setInteractionsEnabled] = useState(false);
  const [videoHover, setVideoHover] = useState(false);
  const [headerVisible, setHeaderVisible] = useState(false);
  const [videoVisible, setVideoVisible] = useState(false);
  const [captionsVisible, setCaptionsVisible] = useState(false);
  const [rightRect, setRightRect] = useState({ top: 0, height: 0 });
  const [rightReady, setRightReady] = useState(false);
  const [captionTop, setCaptionTop] = useState(0);
  const [headerHeight, setHeaderHeight] = useState(0);
  const [videoTop, setVideoTop] = useState('0px');
  const [collectionTop, setCollectionTop] = useState('60px');
  const [videoAndCaptionTop, setVideoAndCaptionTop] = useState('0px');
  const [biteRect, setBiteRect] = useState({ x: 0, y: 0, width: 0, height: 0, rx: 0 });
  const [outlineFullOpacity, setOutlineFullOpacity] = useState(false);
  const [highlightOutlineFullOpacity, setHighlightOutlineFullOpacity] = useState(false);
  const [tabletHeaderStyle, setTabletHeaderStyle] = useState({});
  const [navbarHeight, setNavbarHeight] = useState(60);
  const [disableTransitions, setDisableTransitions] = useState(false);
  // Always mount heavy UI on tablet to ensure visibility and avoid hook-order issues

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
  const [highlighterLeftPx, setHighlighterLeftPx] = useState(0);
  const [highlighterWidthPx, setHighlighterWidthPx] = useState(0);

  // Derived/computed values after all state declarations
  const safeVideoHover = interactionsEnabled && videoHover;
  const safeHoveredIndex = interactionsEnabled ? hoveredIndex : null;

  // Transition control to prevent rewind animations
  const shouldTransition = sectionState === 'entering' || sectionState === 'active';
  
  // Debug logging
  

  // Animation constants
  const NUDGE_TRANSITION = 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) 0.3s, outline 0.2s ease';
  const SLIDE_TRANSITION = 'transform 2.25s cubic-bezier(0.4,0,0.2,1), opacity 2.25s ease, outline 0.2s ease';

  // Band and cutout dimensions
  const bandWidth = 900;
  const bandHeight = 320;
  const cutoutWidth = 480;
  const cutoutHeight = 320;
  const cornerRadius = 16;
  const gap = 32;
  const videoHeight = 320;
  // Detect touch device
  const isTouchDevice = typeof window !== 'undefined' && (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    navigator.msMaxTouchPoints > 0
  );

  // Helper function to detect layout based on dimensions and orientation
  const detectLayout = (touchDevice) => {
    if (typeof window === 'undefined') return { isTablet: false, isLandscapeTablet: false };
    
    const width = window.innerWidth;
    const height = window.innerHeight;
    const isPortrait = height > width;
    
    // Use orientation API if available, otherwise use aspect ratio
    let isPortraitOrientation = isPortrait;
    if (window.matchMedia) {
      const portraitQuery = window.matchMedia('(orientation: portrait)');
      isPortraitOrientation = portraitQuery.matches;
    }
    
    // Tablet detection: touch device with reasonable tablet dimensions
    // iPads range from 768px to 1366px in various orientations
    const isTabletDevice = touchDevice && width >= 600 && width <= 1400;
    
    if (!isTabletDevice) {
      return { isTablet: false, isLandscapeTablet: false };
    }
    
    // Portrait tablet: touch device in portrait orientation
    // Landscape tablet: touch device in landscape orientation
    return {
      isTablet: isPortraitOrientation,
      isLandscapeTablet: !isPortraitOrientation
    };
  };

  const initialLayout = detectLayout(isTouchDevice);
  const [isTabletLayout, setIsTabletLayout] = useState(initialLayout.isTablet);
  const [isLandscapeTablet, setIsLandscapeTablet] = useState(initialLayout.isLandscapeTablet);

  // Portrait tablet: touch device in portrait orientation
  // Landscape tablet: touch device in landscape orientation  
  // Desktop: not a touch device or outside tablet dimensions
  const isPortraitTablet = isTabletLayout;
  const isDesktopLayout = !isTabletLayout && !isLandscapeTablet;

  const videoContainerWidth = isTabletLayout ? 'min(480px, 90vw)' : 480;
  const captionContainerWidth = isTabletLayout ? 'min(520px, 90vw)' : 444;
  const videoOffscreenTransform = isTabletLayout ? 'translateY(200px)' : 'translateX(-200px)';
  const captionOffscreenTransform = isTabletLayout ? 'translateY(200px)' : 'translateX(200px)';
  const TABLET_AUTOPLAY_MS = 7000;
  const layoutKey = isTabletLayout ? 'tablet' : (isLandscapeTablet ? 'landscape-tablet' : 'desktop');

  // Calculate the left offset so the cutout aligns with the video container
  const bandLeft = `calc(50% - ${(bandWidth + cutoutWidth) / 2}px + 20px)`;
  const bandTop = '50%';

  // --- Gantry Frame dimensions and animation ---
  const isNudging = safeVideoHover;
  const gantryFrameStyle = {
    position: isTabletLayout ? 'relative' : 'absolute',
    right: isTabletLayout ? 'auto' : 'calc(50% + 20px)',
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
    opacity: shouldTransition ? (videoVisible ? 1 : 0) : 0, // Always hide when not transitioning
    overflow: 'visible',
    borderRadius: '16px',
    boxShadow: safeVideoHover ? 'inset 0 0 0 3px rgba(255, 255, 255, 0.5)' : 'none'
  };
  // Match the timing constant from ScrollSnap.jsx
  const ROTATION_SETTLE_MS = 400;

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let layoutTimeout = null;
    let isWaitingForRotation = false;

    const updateLayout = () => {
      // CRITICAL: Don't update layout during rotation to prevent thrashing
      // Wait for ScrollSnap to complete its rotation handling first
      if (document.documentElement.classList.contains('is-resizing')) {
        // Schedule a retry after rotation settles
        if (!isWaitingForRotation) {
          isWaitingForRotation = true;
          if (layoutTimeout) clearTimeout(layoutTimeout);
          layoutTimeout = setTimeout(() => {
            isWaitingForRotation = false;
            updateLayout();
          }, ROTATION_SETTLE_MS + 150); // After ScrollSnap's settle + buffer
        }
        return;
      }

      isWaitingForRotation = false;
      const layout = detectLayout(isTouchDevice);

      // Only update state if values actually changed (prevents unnecessary re-renders)
      setIsTabletLayout(prev => prev === layout.isTablet ? prev : layout.isTablet);
      setIsLandscapeTablet(prev => prev === layout.isLandscapeTablet ? prev : layout.isLandscapeTablet);
    };

    // Debounced version to prevent rapid-fire updates
    const debouncedUpdateLayout = () => {
      // Skip entirely if rotating - the orientation handler will catch it
      if (document.documentElement.classList.contains('is-resizing')) {
        return;
      }
      if (layoutTimeout) clearTimeout(layoutTimeout);
      layoutTimeout = setTimeout(updateLayout, 150);
    };

    // Initial check (skip if already rotating)
    if (!document.documentElement.classList.contains('is-resizing')) {
      updateLayout();
    }

    // Use debounced handler for resize events to reduce thrashing
    window.addEventListener('resize', debouncedUpdateLayout, { passive: true });

    // For orientation changes, wait for ScrollSnap's rotation to fully complete
    const handleOrientationChange = () => {
      // Cancel any pending updates
      if (layoutTimeout) clearTimeout(layoutTimeout);
      // Wait for ScrollSnap's rotation handling to complete + extra buffer
      layoutTimeout = setTimeout(updateLayout, ROTATION_SETTLE_MS + 150);
    };

    window.addEventListener('orientationchange', handleOrientationChange, { passive: true });

    // Use matchMedia for orientation changes (more reliable)
    let portraitQuery = null;
    if (window.matchMedia) {
      portraitQuery = window.matchMedia('(orientation: portrait)');
      // Modern browsers
      if (portraitQuery.addEventListener) {
        portraitQuery.addEventListener('change', handleOrientationChange);
      }
      // Legacy browsers
      else if (portraitQuery.addListener) {
        portraitQuery.addListener(handleOrientationChange);
      }
    }

    return () => {
      if (layoutTimeout) clearTimeout(layoutTimeout);
      window.removeEventListener('resize', debouncedUpdateLayout);
      window.removeEventListener('orientationchange', handleOrientationChange);
      if (portraitQuery) {
        if (portraitQuery.removeEventListener) {
          portraitQuery.removeEventListener('change', handleOrientationChange);
        } else if (portraitQuery.removeListener) {
          portraitQuery.removeListener(handleOrientationChange);
        }
      }
    };
  }, [isTouchDevice]);

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

  // Track fixed navbar height for correct vertical offset across transitions
  useEffect(() => {
    const readNav = () => {
      const nav = document.querySelector('nav');
      const h = nav ? (nav.getBoundingClientRect().height || 60) : 60;
      setNavbarHeight(h);
    };
    readNav();
    window.addEventListener('resize', readNav);
    window.addEventListener('scroll', readNav, { passive: true });
    return () => {
      window.removeEventListener('resize', readNav);
      window.removeEventListener('scroll', readNav);
    };
  }, [sectionState]);

  // Modified entrance animation effect
  useEffect(() => {
    if (shouldAnimate) {
      setDisableTransitions(false);
      // Reset to initial state for fresh entrance
      setCurrentVideo(0);
      setIsPaused(true);
      setHeaderVisible(false);
      setVideoVisible(false);
      setCaptionsVisible(false);
      setInteractionsEnabled(false);
      
      // Start entrance ceremony
      const timers = [];
      
      timers.push(setTimeout(() => setHeaderVisible(true), 450));
      timers.push(setTimeout(() => setVideoVisible(true), 2925));
      timers.push(setTimeout(() => setCaptionsVisible(true), 3225));
      timers.push(setTimeout(() => {
        setInteractionsEnabled(true);
        setIsPaused(false);
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
        setIsPaused(false);
      }
    }
  }, [isTabletLayout, isLandscapeTablet, sectionState]);

  // Gentle cleanup when preserved
  useEffect(() => {
    if (isPreserved) {
      setDisableTransitions(true);
      setIsPaused(true);
      setInteractionsEnabled(false);
      setVideoHover(false);
      setHoveredIndex(null);
    }
  }, [isPreserved]);

  // Full cleanup when section becomes inactive
  useEffect(() => {
    if (sectionState === 'preserving' || sectionState === 'cleaned' || sectionState === 'idle') {
      setDisableTransitions(true);
      setHeaderVisible(false);
      setVideoVisible(false);
      setCaptionsVisible(false);
      setCurrentVideo(0);
      setIsPaused(true);
      setInteractionsEnabled(false);
      setVideoHover(false);
      setHoveredIndex(null);
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
        el.style.transform = 'translateX(-200px)';
        el.style.opacity = '0';
      });
      

      
      // Force a reflow to ensure styles are applied
      document.body.offsetHeight;
      
      // Re-enable transitions on next frame if needed
      requestAnimationFrame(() => {
        mediaElements.forEach(el => {
          el.style.transition = '';
        });
      });
    }
  }, [sectionState]);

  // Measure right highlighter position
  useLayoutEffect(() => {
    const node = rightRowRefs.current[currentVideo];
    if (node) {
      const { offsetTop, offsetHeight } = node;
      setRightRect({ top: offsetTop, height: offsetHeight });
      setRightReady(true);
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
      setCaptionTop(top);
    }
  }, [headerHeight, gap, videoHeight]);

  useLayoutEffect(() => {
    if (headerRef.current) {
      const headerRect = headerRef.current.getBoundingClientRect();
      setHeaderHeight(headerRect.height);
      setVideoTop(`${headerRect.height + gap}px`);
    }
  }, []);

  // Re-measure and stabilize when crossing tablet/desktop breakpoint
  useLayoutEffect(() => {
    if (headerRef.current) {
      const headerRect = headerRef.current.getBoundingClientRect();
      setHeaderHeight(headerRect.height);
      setVideoTop(`${headerRect.height + gap}px`);
    }
    // Ensure all parts are visible after layout switch
    setHeaderVisible(true);
    setVideoVisible(true);
    setCaptionsVisible(true);
  }, [isTabletLayout]);

  useLayoutEffect(() => {
    const totalHeight = headerHeight + gap + videoHeight;
    const viewportHeight = window.innerHeight;
    const nav = document.querySelector('nav');
    const navbarHeight = nav ? (nav.getBoundingClientRect().height || 60) : 60;
    // Center the video content (not the entire collection) in the viewport below navbar
    const top = navbarHeight + (viewportHeight - navbarHeight) / 2 - headerHeight - gap - videoHeight / 2;
    setCollectionTop(`${top}px`);
    setVideoAndCaptionTop(`${top + headerHeight + gap}px`);
  }, [headerHeight, gap, videoHeight]);

  // Measure video container position and size for SVG
  useLayoutEffect(() => {
    function updateVideoRect() {
      if (videoContainerRef.current) {
        const rect = videoContainerRef.current.getBoundingClientRect();
        setBiteRect({
          x: rect.left + window.scrollX,
          y: rect.top + window.scrollY,
          width: rect.width,
          height: rect.height,
          rx: 16
        });
      }
    }
    updateVideoRect();
    window.addEventListener('resize', updateVideoRect);
    window.addEventListener('scroll', updateVideoRect);
    return () => {
      window.removeEventListener('resize', updateVideoRect);
      window.removeEventListener('scroll', updateVideoRect);
    };
  }, []);

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

  const handleSlideChange = (index) => {
    setCurrentVideo(index);
  };

  const handleHover = (index) => {
    if (!interactionsEnabled) return;
    
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    
    if (typeof index === 'number' && index >= 0 && index < headlines.length) {
      if (index !== currentVideo) setBarKey((k) => k + 1);
      setCurrentVideo(index);
      setIsPaused(true);
      setHoveredIndex(index);
    }
  };

  const handleHoverEnd = () => {
    if (!interactionsEnabled) return;
    
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    
    hoverTimeoutRef.current = setTimeout(() => {
      setIsPaused(false);
      setHoveredIndex(null);
    }, 50);
  };

  const handleBarEnd = () => {
    if (!isPaused) {
      setBarKey((k) => k + 1);
      setCurrentVideo((c) => (c + 1) % 3);
    }
  };

  // Tablet Portrait: simplified render path
  if (isTabletLayout) {
    const isActive = sectionState === 'active';
    return (
      <div key={layoutKey} ref={sectionRef} className="w-full relative overflow-hidden" style={{ background: '#1c3424' }}>
        <style>{`@keyframes tablet-progress { from { width: 0%; } to { width: 100%; } }`}</style>
        <TabletBlurBackground blurVideos={blurVideos} current={currentVideo} fadeDuration={1.2} />
        {/* Foreground content wrapper - centered in visible area below navbar */}
        <div style={{
          paddingTop: 'var(--nav-h, 60px)',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
          minHeight: 'calc(100dvh - var(--nav-h, 60px))',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 24,
          position: 'relative',
          zIndex: 1
        }}>
        {/* Header wrapper matches video width; inner is 70% aligned left */}
        <div style={{
          width: 'min(92vw, clamp(260px, 60vh, 480px))',
          margin: '0 auto',
          textAlign: 'left',
          opacity: headerVisible ? 1 : 0,
          transition: disableTransitions ? 'none' : (shouldTransition ? (headerVisible ? 'opacity 2.25s ease' : 'none') : 'none')
        }}>
          <div style={{ width: '70%', margin: 0 }}>
          <AutoFitHeading
            lines={[
              'In the moment,',
              <span key="only-line"><span style={{ color: '#3fd1c7' }}>only</span> the patient</span>,
              'Matters'
            ]}
            minPx={26}
            maxPx={44}
            lineHeight={1.2}
            lineAligns={['left','left','left']}
            visible={headerVisible}
            commaStagger
            staggerDelayMs={1125}
            postGroupStartIndex={1}
          />
          </div>
        </div>
        <div style={{ width: 'min(92vw, clamp(260px, 60vh, 480px))' }}>
          <div style={{
            width: '100%',
            aspectRatio: '3 / 2',
            borderRadius: 16,
            overflow: 'hidden',
            position: 'relative',
            opacity: videoVisible ? 1 : 0,
            transition: disableTransitions ? 'none' : (videoVisible ? 'opacity 2.25s ease, transform 2.25s cubic-bezier(0.4,0,0.2,1)' : 'none'),
            transform: videoVisible ? 'translate3d(0,0,0)' : videoOffscreenTransform
          }}>
            <TabletMedicalCarousel
              videos={mainVideos}
              current={currentVideo}
              onChange={(idx) => {
                console.log('[Tablet V2] onChange to', idx);
                setCurrentVideo(idx);
                setIsPaused(true);
                setBarKey((k) => k + 1);
              }}
              onPauseChange={(p) => setIsPaused(!!p)}
              style={{ width: '100%', height: '100%' }}
            />
            
            {/* Progress moved to active caption highlight */}
          </div>
        </div>
        <div style={{
          width: 'min(520px, 90vw)',
          margin: '0 auto',
          textAlign: 'center',
          position: 'relative',
          opacity: captionsVisible ? 1 : 0,
          transition: disableTransitions ? 'none' : (captionsVisible ? 'opacity 2.25s ease, transform 2.25s cubic-bezier(0.4,0,0.2,1)' : 'none'),
          transform: captionsVisible ? 'translate3d(0,0,0)' : captionOffscreenTransform
        }}>
          <TabletTravellingBar
            captions={headlines.map(h => <span>{h.firstLine}<br />{h.secondLine}</span>)}
            current={currentVideo}
            onSelect={i => {
              setCurrentVideo(i);
              setIsPaused(true);
              setBarKey(k => k + 1);
              setTimeout(() => setIsPaused(false), 100);
            }}
            style={{ margin: '0 auto', background: 'none' }}
            durationMs={TABLET_AUTOPLAY_MS}
            paused={isPaused}
            animationKey={barKey}
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
      <style>
        {`
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
        `}
      </style>
      {/* Always-visible base blur video */}
      <div
        className="absolute inset-0 flex items-center justify-center opacity-100 z-0"
        style={{
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
          WebkitPerspective: '1000px'
        }}
      >
        <div style={{
          width: '100%',
          height: '100%',
          position: 'relative',
          display: 'inline-block'
        }}>
          <VideoManager
            src={blurVideos[BASE_INDEX].video}
            isPlaying={isActive || shouldAnimate}
            className="w-full h-full object-cover"
            controls={false}
            preload="auto"
            tabIndex="-1"
            aria-hidden="true"
            draggable="false"
            disablePictureInPicture
            disableRemotePlayback
            controlsList="nodownload nofullscreen noremoteplayback"
            onContextMenu={(e) => e.preventDefault()}
          />
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 1,
            pointerEvents: 'none'
          }} />
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
              transition: shouldTransition ? 'opacity 700ms ease' : 'none'
            }}
          >
            <div style={{
              width: '100%',
              height: '100%',
              position: 'relative',
              display: 'inline-block'
            }}>
              <VideoManager
                src={video.video}
                isPlaying={isActive || shouldAnimate}
                className="w-full h-full object-cover"
                controls={false}
                preload="auto"
                tabIndex="-1"
                aria-hidden="true"
                draggable="false"
                disablePictureInPicture
                disableRemotePlayback
                controlsList="nodownload nofullscreen noremoteplayback"
                onContextMenu={(e) => e.preventDefault()}
              />
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                zIndex: 1,
                pointerEvents: 'none'
              }} />
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
              <span style={{ opacity: headerVisible ? 1 : 0, transition: shouldTransition ? 'opacity 1.2s ease' : 'none' }}>In the moment,</span>
              <br />
              <span style={{ opacity: headerVisible ? 1 : 0, color: '#3fd1c7', transition: shouldTransition ? 'opacity 1.2s ease 0.6s' : 'none' }}>only</span>
              <span style={{ opacity: headerVisible ? 1 : 0, transition: shouldTransition ? 'opacity 1.2s ease 0.6s' : 'none' }}> {' '}the patient</span>
              <br />
              <span style={{ opacity: headerVisible ? 1 : 0, transition: shouldTransition ? 'opacity 1.2s ease 0.6s' : 'none' }}>matters</span>
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
            right: isTabletLayout ? 'auto' : 'calc(50% + 20px)',
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
              right: 0,
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
                  : 'translateX(-200px)',
              opacity: videoVisible ? 0.4 : 0,
              mixBlendMode: 'screen'
            }}>
              <SimpleCookieCutterBand
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
                right: isTabletLayout ? 'auto' : 0,
                left: isTabletLayout ? 'auto' : undefined,
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
                setVideoHover={setVideoHover}
                interactionsEnabled={interactionsEnabled}
                videos={mainVideos}
                enableTouchNavigation={isLandscapeTablet}
                onTouchChange={(idx) => {
                  setCurrentVideo(idx);
                  setIsPaused(true);
                  setBarKey((k) => k + 1);
                }}
              />
            </div>
          </div>
          )}
        </div>
      </div>
      {/* Video Anchor (left of spacer) */}
      <div
        ref={videoAnchorRef}
        data-testid="video-anchor"
        style={{
          position: 'absolute',
          right: 'calc(50% + 20px)', // 20px is half the spacer width
          top: videoAndCaptionTop,
          width: 480,
          height: videoHeight,
          opacity: 0.5,
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />
      {/* Caption Anchor with entrance animation */}
      <div
        className="caption-anchor"
        style={{
          position: isTabletLayout ? 'relative' : 'absolute',
          left: isTabletLayout ? 'auto' : 'calc(50% + 20px)',
          top: isTabletLayout ? 'auto' : videoAndCaptionTop,
          width: captionContainerWidth,
          maxWidth: isTabletLayout ? '90vw' : 444,
          height: isTabletLayout ? 'auto' : videoHeight,
          display: 'flex',
          alignItems: isTabletLayout ? 'stretch' : 'center',
          justifyContent: isTabletLayout ? 'flex-start' : 'center',
          zIndex: 20,
          transition: shouldTransition ? (captionsVisible ? 'transform 2.25s cubic-bezier(0.4,0,0.2,1), opacity 2.25s ease' : 'none') : 'none',
          opacity: captionsVisible ? 1 : 0,
          transform: captionsVisible ? 'translate3d(0,0,0)' : captionOffscreenTransform,
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
          <div className="relative flex flex-col gap-2 items-start" style={{ width: 'auto', marginLeft: 0, paddingLeft: 0 }}>
            {((rightReady && Number.isFinite(currentVideo) && Number.isFinite(rightRect.top) && Number.isFinite(rightRect.height)) || (isLandscapeTablet && sectionState !== 'idle')) && (
              <>
                {/* Targeting outline container */}
                <div
                  className="absolute transition-all duration-700 ease"
                  style={{
                    top: rightRect.top,
                    left: '50%',
                    width: (isTabletLayout || isLandscapeTablet) ? '100%' : 444,
                    height: rightRect.height,
                    transform: 'translateX(-50%)',
                    zIndex: 5,
                    pointerEvents: 'none',
                    transition: shouldTransition ? 'all 700ms ease' : 'none',
                    display: (isTabletLayout || isLandscapeTablet) ? 'none' : undefined,
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
                    className="absolute rounded-xl transition-all duration-700 ease pointer-events-none overflow-hidden"
                    style={{
                      top: 0,
                      height: rightRect.height,
                      width: (isTabletLayout || isLandscapeTablet) ? '100%' : 444,
                      left: 0,
                      paddingLeft: 24,
                      paddingRight: 24,
                      background: (safeHoveredIndex === currentVideo || (isLandscapeTablet && hoveredIndex === null)) ? 'rgba(228,228,228,1)' : 'rgba(232,232,232,1)',
                      borderRadius: 10,
                      boxShadow: (safeHoveredIndex === currentVideo || (isLandscapeTablet && hoveredIndex === null)) ? '1px 1px 2px 0px rgba(0,0,0,0.5)' : '1px 1px 2px 0px rgba(0,0,0,0.25)',
                      transition: 'top 0.6s cubic-bezier(0.4, 0, 0.2, 1), height 0.6s cubic-bezier(0.4, 0, 0.2, 1), color 0.25s, box-shadow 0.25s, background 0.25s',
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
                    className="absolute transition-all duration-700 ease"
                    style={{
                      top: '50%',
                      left: '50%',
                      width: '100vw',
                      height: 5,
                      background: '#e0e0e0',
                      mixBlendMode: 'screen',
                      pointerEvents: 'none',
                      transform: 'translateY(-50%)',
                      transition: shouldTransition ? 'top 600ms cubic-bezier(0.4, 0, 0.2, 1), left 600ms cubic-bezier(0.4, 0, 0.2, 1), width 600ms cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
                      opacity: 0.2,
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
                onClick={interactionsEnabled && isLandscapeTablet ? () => {
                  setCurrentVideo(i);
                  setIsPaused(true);
                  setBarKey((k) => k + 1);
                  setHoveredIndex(i);
                  setTimeout(() => {
                    setIsPaused(false);
                    setHoveredIndex(null);
                  }, 100);
                } : undefined}
                onTouchStart={interactionsEnabled && isLandscapeTablet ? () => {
                  setCurrentVideo(i);
                  setIsPaused(true);
                  setBarKey((k) => k + 1);
                  setHoveredIndex(i);
                } : undefined}
                onTouchEnd={interactionsEnabled && isLandscapeTablet ? () => {
                  setTimeout(() => {
                    setIsPaused(false);
                    setHoveredIndex(null);
                  }, 100);
                } : undefined}
                className="relative text-right py-3 rounded-xl transition-all duration-700 ease"
                style={{
                  display: 'block',
                  maxWidth: isTabletLayout ? '100%' : 480,
                  minWidth: isTabletLayout ? '0px' : 320,
                  width: isTabletLayout ? '100%' : 'auto',
                  paddingLeft: 24,
                  paddingRight: 24,
                  margin: '0 auto',
                  zIndex: 40,
                  cursor: interactionsEnabled ? 'pointer' : 'default',
                  transition: shouldTransition ? 'all 700ms ease' : 'none'
                }}
              >
                <p className="m-0 text-right text-2xl leading-tight" style={{
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
          right: 'calc(50% + 20px)',
          top: collectionTop,
          width: 480,
          background: 'none',
          zIndex: 20,
          transition: shouldTransition ? (headerVisible ? 'opacity 2.25s ease' : 'none') : 'none',
          opacity: headerVisible ? 1 : 0,
        }}
      >
        <div style={{ width: 480, display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-start', marginRight: 0 }}>
          <h2 style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 48,
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
            alignSelf: 'flex-start',
            paddingLeft: 0,
            textAlign: 'left',
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
              In the moment,
            </span>
            <br />
            <span 
              style={{
                transition: shouldTransition ? 'opacity 2.25s ease 1.125s' : 'none',
                opacity: headerVisible ? 1 : 0,
                color: '#3fd1c7'
              }}
            >
              only
            </span>
            <span 
              style={{
                transition: shouldTransition ? 'opacity 2.25s ease 1.125s' : 'none',
                opacity: headerVisible ? 1 : 0,
              }}
            >
              {' '}the patient
            </span>
            <br />
            <span 
              style={{
                transition: shouldTransition ? 'opacity 2.25s ease 1.125s' : 'none',
                opacity: headerVisible ? 1 : 0,
              }}
            >
              matters
            </span>
          </h2>
        </div>
      </div>
    </div>
  );
};

export default MedicalSectionV2; 