// redeploy marker: 2025-10-31T00:00:00Z
import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import MedicalCarousel from '../MedicalCarousel';
import TabletMedicalCarousel from '../TabletMedicalCarousel';
import ReactDOM from 'react-dom';
import MirroredCookieCutterBand from '../MirroredCookieCutterBand';
import { useSectionLifecycle } from '../../hooks/useSectionLifecycle';
import VideoManager from '../VideoManager';
import TabletTravellingBar from '../TabletTravellingBar';
import TabletBlurBackground from '../TabletBlurBackground';
import AutoFitHeading from '../AutoFitHeading';

const blurVideos = [
  { id: "0", video: "/videos/blursskills.mp4", alt: "Blurred skills demonstration" },
  { id: "1", video: "/videos/blurteam.mp4", alt: "Blurred team coordination" },
  { id: "2", video: "/videos/blurperspectives.mp4", alt: "Blurred perspectives" },
];

const BASE_INDEX = 2; // index of the always-visible base video

const headlines = [
  {
    firstLine: "Quiet reflection allows for",
    secondLine: "sharpening skills."
  },
  {
    firstLine: "Further video debriefs foster",
    secondLine: "cohesion amongst peers."
  },
  {
    firstLine: "Shared understanding enhances",
    secondLine: "decisiveness."
  }
];

const mainVideos = [
  { id: "0", video: "/videos/skills.mp4", alt: "Sharpening skills" },
  { id: "1", video: "/videos/team.mp4", alt: "Team cohesion" },
  { id: "2", video: "/videos/perspectives.mp4", alt: "Shared perspectives" },
];

const MedicalSectionV3 = ({ inView, sectionRef }) => {
  const { 
    sectionState, 
    shouldAnimate, 
    isActive,
    isPreserved 
  } = useSectionLifecycle('medical-v3', inView);

  // All useState hooks first
  const [currentVideo, setCurrentVideo] = useState(0);
  const [videoCenter, setVideoCenter] = useState({ x: 0, y: 0 });
  const [highlighterLeft, setHighlighterLeft] = useState({ x: 0, y: 0 });
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
  const [leftRect, setLeftRect] = useState({ top: 0, height: 0 });
  const [leftReady, setLeftReady] = useState(false);
  const [captionTop, setCaptionTop] = useState(0);
  const [headerHeight, setHeaderHeight] = useState(0);
  const [videoTop, setVideoTop] = useState('0px');
  const [collectionTop, setCollectionTop] = useState('60px');
  const [videoAndCaptionTop, setVideoAndCaptionTop] = useState('0px');
  const [biteRect, setBiteRect] = useState({ x: 0, y: 0, width: 0, height: 0, rx: 0 });
  const [outlineFullOpacity, setOutlineFullOpacity] = useState(false);
  const [highlightOutlineFullOpacity, setHighlightOutlineFullOpacity] = useState(false);
  const [tabletHeaderStyle, setTabletHeaderStyle] = useState({});

  // All useRef hooks next
  const rowRefs = useRef({});
  const captionsRef = useRef();
  const videoContainerRef = useRef();
  const hoverTimeoutRef = useRef(null);
  const leftRowRefs = useRef({});
  const leftCaptionsRef = useRef();
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
  console.log('MedicalSectionV3 - Section state:', sectionState, 'Should transition:', shouldTransition, 'Video visible:', videoVisible);

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
  const [isTabletLayout, setIsTabletLayout] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < 1200;
  });
  const videoContainerWidth = isTabletLayout ? 'min(480px, 90vw)' : 480;
  const captionContainerWidth = isTabletLayout ? 'min(520px, 90vw)' : 444;
  const videoOffscreenTransform = isTabletLayout ? 'translateY(200px)' : 'translateX(200px)';
  const captionOffscreenTransform = isTabletLayout ? 'translateY(200px)' : 'translateX(-200px)';
  const TABLET_AUTOPLAY_MS = 7000;

  // Calculate the right offset so the cutout aligns with the video container
  const bandRight = `calc(50% - ${(bandWidth + cutoutWidth) / 2}px + 20px)`;
  const bandTop = '50%';

  // --- Gantry Frame dimensions and animation ---
  const isNudging = safeVideoHover;
  const gantryFrameStyle = {
    position: isTabletLayout ? 'relative' : 'absolute',
    left: isTabletLayout ? 'auto' : 0,
    top: isTabletLayout ? 'auto' : 0,
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
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleResize = () => setIsTabletLayout(window.innerWidth < 1200);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Modified entrance animation effect
  useEffect(() => {
    if (shouldAnimate) {
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

  // Tablet autoplay loop and progress sync
  useEffect(() => {
    if (!isTabletLayout) return;
    console.log('[Tablet V3] autoplay init');
    const id = setInterval(() => {
      if (!isPaused) {
        setBarKey((k) => k + 1);
        setCurrentVideo((c) => (c + 1) % 3);
      }
    }, TABLET_AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [isTabletLayout, isPaused]);

  useEffect(() => {
    if (isTabletLayout) {
      setBarKey((k) => k + 1);
    }
  }, [isTabletLayout]);

  // Gentle cleanup when preserved
  useEffect(() => {
    if (isPreserved) {
      setIsPaused(true);
      setInteractionsEnabled(false);
      setVideoHover(false);
      setHoveredIndex(null);
    }
  }, [isPreserved]);



  // Full cleanup when section becomes inactive
  useEffect(() => {
    if (sectionState === 'preserving' || sectionState === 'cleaned' || sectionState === 'idle') {
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
      console.log('🔴 Section becoming idle - forcing immediate reset');
      
      // Force remove all transitions on media elements
      const mediaElements = document.querySelectorAll('.video-gantry-frame, .video-frame');
      mediaElements.forEach(el => {
        console.log('🔴 Removing transition from:', el);
        el.style.transition = 'none';
        el.style.animation = 'none';
        el.style.transform = 'translateX(200px)';
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

  // Measure left highlighter position
  useLayoutEffect(() => {
    const node = leftRowRefs.current[currentVideo];
    if (node) {
      const { offsetTop, offsetHeight } = node;
      setLeftRect({ top: offsetTop, height: offsetHeight });
      setLeftReady(true);
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

  useLayoutEffect(() => {
    const totalHeight = headerHeight + gap + videoHeight;
    const viewportHeight = window.innerHeight;
    const nav = document.querySelector('nav');
    const navbarHeight = nav ? (nav.getBoundingClientRect().height || 60) : 60;
    const top = navbarHeight + (viewportHeight - navbarHeight - totalHeight) / 2;
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
    if (typeof index === 'number' && index >= 0 && index < headlines.length) {
      if (index !== currentVideo) setBarKey((k) => k + 1);
      setCurrentVideo(index);
      setIsPaused(true);
      setHoveredIndex(index);
    }
  };

  const handleHoverEnd = () => {
    if (!interactionsEnabled) return;
    setIsPaused(false);
    setHoveredIndex(null);
  };

  const handleBarEnd = () => {
    if (!isPaused) {
      setBarKey((k) => k + 1);
      setCurrentVideo((c) => (c + 1) % 3);
    }
  };

  // Tablet Portrait: simplified render path
  if (isTabletLayout) {
    const renderActive = sectionState === 'entering' || sectionState === 'active' || sectionState === 'preserving';
    return (
      <div ref={sectionRef} className="w-full relative overflow-hidden" style={{ paddingTop: 'clamp(32px, 6vh, 72px)', paddingBottom: 16 }}>
        <style>{`@keyframes tablet-progress { from { width: 0%; } to { width: 100%; } }`}</style>
        {/* Local blurred background for this section */}
        {renderActive && (
          <TabletBlurBackground blurVideos={blurVideos} current={currentVideo} fadeDuration={1.2} />
        )}
        <div style={{
          minHeight: '100dvh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-start',
          gap: 24,
          paddingTop: 24,
          paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 24px)',
          position: 'relative',
          zIndex: 1
        }}>
        <div style={{
          width: 'min(92vw, clamp(260px, 60vh, 480px))',
          margin: '0 auto',
          textAlign: 'left',
          opacity: headerVisible ? 1 : 0,
          transition: shouldTransition ? (headerVisible ? 'opacity 2.25s ease' : 'none') : 'none'
        }}>
          <div style={{ width: '70%', margin: 0 }}>
            <AutoFitHeading
              lines={[
              'Yet, reflection',
                'strengthens',
                'the next'
              ]}
              minPx={26}
              maxPx={44}
              lineHeight={1.2}
            lineAligns={['left','left','left','left']}
            visible={headerVisible}
            commaStagger
            staggerDelayMs={1125}
            postGroupStartIndex={0}
            afterCommaStyle={{ color: '#3fd1c7' }}
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
            transition: shouldTransition ? 'opacity 2.25s ease, transform 2.25s cubic-bezier(0.4,0,0.2,1)' : 'none',
            transform: videoVisible ? 'translate3d(0,0,0)' : videoOffscreenTransform
          }}>
            {renderActive && (
            <TabletMedicalCarousel
              videos={mainVideos}
              current={currentVideo}
              onChange={(idx) => {
                console.log('[Tablet V3] onChange to', idx);
                setCurrentVideo(idx);
                setIsPaused(true);
                setBarKey((k) => k + 1);
              }}
              onPauseChange={(p) => setIsPaused(!!p)}
              style={{ width: '100%', height: '100%' }}
            />
            )}
            {/* Progress moved to active caption highlight */}
          </div>
        </div>
        <div style={{
          width: 'min(520px, 90vw)',
          margin: '0 auto',
          textAlign: 'center',
          position: 'relative',
          opacity: captionsVisible ? 1 : 0,
          transition: shouldTransition ? 'opacity 2.25s ease, transform 2.25s cubic-bezier(0.4,0,0.2,1)' : 'none',
          transform: captionsVisible ? 'translate3d(0,0,0)' : captionOffscreenTransform
        }}>
          {renderActive && (
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
          )}
        </div>
        </div>
      </div>
    );
  }

  return (
    <div 
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
          <div style={{ width: '100%', display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-start' }}>
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
              <span style={{ opacity: headerVisible ? 1 : 0, transition: shouldTransition ? 'opacity 1.2s ease' : 'none' }}>Yet, </span>
              <span style={{ opacity: headerVisible ? 1 : 0, color: '#3fd1c7', transition: shouldTransition ? 'opacity 1.2s ease 0.6s' : 'none' }}>reflection</span>
              <br />
              <span style={{ opacity: headerVisible ? 1 : 0, transition: shouldTransition ? 'opacity 1.2s ease 0.6s' : 'none' }}>strengthens</span>
              <br />
              <span style={{ opacity: headerVisible ? 1 : 0, transition: shouldTransition ? 'opacity 1.2s ease 0.6s' : 'none' }}>the next</span>
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
            left: isTabletLayout ? 'auto' : 'calc(50% + 20px)',
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
              left: isTabletLayout ? '50%' : 0,
              top: 0,
              width: isTabletLayout ? '100%' : bandWidth,
              height: bandHeight,
              zIndex: 1,
              pointerEvents: 'none',
              transition: isNudging
                ? 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) 0.3s'
                : 'transform 1.5s cubic-bezier(0.4,0,0.2,1), opacity 1.5s ease',
              transform: (isTabletLayout ? 'translateX(-50%) ' : '') + (safeVideoHover
                ? 'translateY(-12px)'
                : videoVisible
                  ? 'translate3d(0,0,0)'
                  : videoOffscreenTransform),
              opacity: videoVisible ? 0.4 : 0,
              mixBlendMode: 'screen'
            }}>
              <MirroredCookieCutterBand
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
                left: isTabletLayout ? 'auto' : 0,
                top: isTabletLayout ? 'auto' : 0,
                zIndex: 3,
                pointerEvents: 'auto',
                transform: isTabletLayout ? 'translate(-50%, 0)' : gantryFrameStyle.transform
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
                    ? 'opacity 0.33s cubic-bezier(.4,0,.2,1) 0.2s'
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
                position: 'absolute',
                left: 0,
                top: 0,
                width: '100%',
                height: '100%',
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
              />
            </div>
          </div>
          )}
        </div>
        {/* Caption Anchor with entrance animation */}
        <div
          className="caption-anchor"
          style={{
            position: isTabletLayout ? 'relative' : 'absolute',
            right: isTabletLayout ? 'auto' : 'calc(50% + 20px)',
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
            className="MedicalSection-caption-area flex flex-col items-start justify-start"
            data-testid="MedicalSection-caption-area"
            style={{
              maxWidth: isTabletLayout ? '100%' : 520,
              width: isTabletLayout ? '100%' : 'auto',
              marginRight: 0, // CHANGED: was marginLeft
              paddingRight: 0, // CHANGED: was paddingLeft
            }}
          >
            <div className="relative flex flex-col gap-2 items-start justify-start" style={{ width: 'auto', marginRight: 0, paddingRight: 0 }}>
              {leftReady && Number.isFinite(currentVideo) && Number.isFinite(leftRect.top) && Number.isFinite(leftRect.height) && (
                <>
                  {/* Second highlighter: animated line protruding to the left */}
                  <div
                    className="absolute transition-all duration-700 ease"
                    style={{
                      top: leftRect.top + leftRect.height / 2,
                      right: `calc(50% + ${444 / 2}px)`,
                      width: '100vw',
                      height: 5,
                      background: '#e0e0e0',
                      mixBlendMode: 'screen',
                      zIndex: 40,
                      pointerEvents: 'none',
                      transform: 'translateY(-50%)',
                      transition: shouldTransition ? 'top 600ms cubic-bezier(0.4, 0, 0.2, 1), right 600ms cubic-bezier(0.4, 0, 0.2, 1), width 600ms cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
                      opacity: 0.2,
                      display: isTabletLayout ? 'none' : undefined,
                    }}
                  />
                  {/* Targeting outline container */}
                  <div
                    className="absolute transition-all duration-700 ease"
                    style={{
                      top: leftRect.top,
                      left: '50%',
                      width: 444,
                      height: leftRect.height,
                      transform: 'translateX(-50%)',
                      zIndex: 5,
                      pointerEvents: 'none',
                      transition: shouldTransition ? 'all 700ms ease' : 'none',
                      display: isTabletLayout ? 'none' : undefined,
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
                            ? 'opacity 0.2s cubic-bezier(.4,0,.2,1) 0.2s'
                            : 'opacity 0.13s'
                        ].join(', ') : 'none',
                        opacity: safeHoveredIndex === currentVideo ? (highlightOutlineFullOpacity ? 0.9 : 0.4) : 0
                      }}
                    />
                    {/* Duplicated Highlighter rectangle for left section */}
                    <div
                      className="absolute rounded-xl transition-all duration-700 ease pointer-events-none overflow-hidden"
                      style={{
                        top: 0,
                        height: leftRect.height,
                        width: 444,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        paddingLeft: 24,
                        paddingRight: 24,
                        background: safeHoveredIndex === currentVideo ? 'rgba(228,228,228,1)' : 'rgba(232,232,232,1)',
                        borderRadius: 10,
                        boxShadow: safeHoveredIndex === currentVideo ? '1px 1px 2px 0px rgba(0,0,0,0.5)' : '1px 1px 2px 0px rgba(0,0,0,0.25)',
                        transition: shouldTransition ? 'top 600ms cubic-bezier(0.4, 0, 0.2, 1), height 600ms cubic-bezier(0.4, 0, 0.2, 1), /* hover effects */ color 100ms cubic-bezier(0.4, 0, 0.2, 1), box-shadow 100ms cubic-bezier(0.4, 0, 0.2, 1), background 100ms cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
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
                  </div>
                </>
              )}
              {headlines.map((headline, i) => (
                <button
                  key={i}
                  ref={(el) => (leftRowRefs.current[i] = el)}
                  onMouseEnter={interactionsEnabled ? () => handleHover(i) : undefined}
                  onMouseLeave={interactionsEnabled ? handleHoverEnd : undefined}
                  className="relative text-left py-3 rounded-xl transition-all duration-700 ease"
                  style={{
                    display: 'block',
                    maxWidth: 480,
                    minWidth: 320,
                    paddingLeft: 24,
                    paddingRight: 24,
                    margin: 0,
                    zIndex: 40,
                    cursor: interactionsEnabled ? 'pointer' : 'default',
                    transition: shouldTransition ? 'all 700ms ease' : 'none'
                  }}
                >
                  <p className="m-0 text-left text-2xl leading-tight" style={{
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
      </div>
      {/* Header Frame with entrance animation (desktop only) */}
      <div
        ref={headerRef}
        data-testid="header-frame"
        className="header-frame"
        style={{
          display: isTabletLayout ? 'none' : 'block',
          position: 'absolute',
          left: 'calc(50% + 20px)',
          top: collectionTop,
          width: 480,
          background: 'none',
          zIndex: 20,
          transition: shouldTransition ? (headerVisible ? 'opacity 2.25s ease' : 'none') : 'none',
          opacity: headerVisible ? 1 : 0,
        }}
      >
        <div style={{ width: 480, display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end', marginRight: 0 }}>
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
            alignSelf: 'flex-end',
            paddingRight: 0,
            textAlign: 'right',
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
              Yet, 
            </span>
            <span 
              style={{
                transition: shouldTransition ? 'opacity 2.25s ease 1.125s' : 'none',
                opacity: headerVisible ? 1 : 0,
                color: '#3fd1c7'
              }}
            >
              reflection
            </span>
            <br />
            <span 
              style={{
                transition: shouldTransition ? 'opacity 2.25s ease 1.125s' : 'none',
                opacity: headerVisible ? 1 : 0,
              }}
            >
              strengthens
            </span>
            <br />
            <span 
              style={{
                transition: shouldTransition ? 'opacity 2.25s ease 1.125s' : 'none',
                opacity: headerVisible ? 1 : 0,
              }}
            >
              the next
            </span>
          </h2>
        </div>
      </div>
    </div>
  );
};

export default MedicalSectionV3; 