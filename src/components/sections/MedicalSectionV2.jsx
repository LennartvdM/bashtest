import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import MedicalCarousel from '../MedicalCarousel';
import ReactDOM from 'react-dom';
import SimpleCookieCutterBand from '../SimpleCookieCutterBand';

const blurVideos = [
  { id: "0", video: "/videos/blururgency.mp4" },
  { id: "1", video: "/videos/blurcoordination.mp4" },
  { id: "2", video: "/videos/blurfocus.mp4" }, // base video
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

const MedicalSection = ({ inView, sectionRef }) => {
  // All useState hooks first
  const [currentVideo, setCurrentVideo] = useState(0);
  const [videoCenter, setVideoCenter] = useState({ x: 0, y: 0 });
  const [highlighterRight, setHighlighterRight] = useState({ x: 0, y: 0 });
  const rowRefs = useRef({});
  const captionsRef = useRef();
  const [ready, setReady] = useState(false);
  const [barKey, setBarKey] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [rect, setRect] = useState({ top: 0, height: 0 });
  const videoContainerRef = useRef();
  const [interactionsEnabled, setInteractionsEnabled] = useState(false);
  const [videoHover, setVideoHover] = useState(false);
  const hoverTimeoutRef = useRef(null);

  // Animation states
  const [headerVisible, setHeaderVisible] = useState(false);
  const [videoVisible, setVideoVisible] = useState(false);
  const [captionsVisible, setCaptionsVisible] = useState(false);

  // Derived/computed values after all state declarations
  const safeVideoHover = interactionsEnabled && videoHover;
  const safeHoveredIndex = interactionsEnabled ? hoveredIndex : null;

  // Animation constants
  const NUDGE_TRANSITION = 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) 0.3s, outline 0.2s ease';
  const SLIDE_TRANSITION = 'transform 1.5s cubic-bezier(0.4,0,0.2,1), opacity 1.5s ease, outline 0.2s ease';

  // Handle entrance animations when section comes into view
  useEffect(() => {
    if (inView) {
      // Start the entrance animations with shorter delays
      setTimeout(() => setHeaderVisible(true), 300);
      setTimeout(() => setVideoVisible(true), 900); // 500 + 400
      setTimeout(() => setCaptionsVisible(true), 1100); // 700 + 400
      
      // Enable interactions after all animations complete (1100ms start + 1500ms duration)
      setTimeout(() => setInteractionsEnabled(true), 3000);
    }
  }, [inView]);

  // Handle exit separately for instant cleanup
  useEffect(() => {
    if (!inView) {
      // Instant reset when leaving viewport
      setHeaderVisible(false);
      setVideoVisible(false);
      setCaptionsVisible(false);
      setInteractionsEnabled(false);
    }
  }, [inView]);

  // Add debug logs for state changes
  useEffect(() => {
    console.log('Animation states:', { headerVisible, videoVisible, captionsVisible });
  }, [headerVisible, videoVisible, captionsVisible]);

  // Duplicated highlighter logic for right caption area
  const rightRowRefs = useRef({});
  const rightCaptionsRef = useRef();
  const [rightRect, setRightRect] = useState({ top: 0, height: 0 });
  const [rightReady, setRightReady] = useState(false);

  const [captionTop, setCaptionTop] = useState(0);

  const headerRef = useRef();
  const [headerHeight, setHeaderHeight] = useState(0);
  const [videoTop, setVideoTop] = useState('0px');
  const gap = 32;
  const videoHeight = 320;

  const videoAnchorRef = useRef();
  const captionRef = useRef();
  const contentAnchorRef = useRef();

  const [collectionTop, setCollectionTop] = useState('60px');
  const [videoAndCaptionTop, setVideoAndCaptionTop] = useState('0px');

  const shadedFrameRef = useRef();
  const [biteRect, setBiteRect] = useState({ x: 0, y: 0, width: 0, height: 0, rx: 0 });

  // Band and cutout dimensions
  const bandWidth = 900;
  const bandHeight = 320;
  const cutoutWidth = 480;
  const cutoutHeight = 320;
  const cornerRadius = 16;

  // Calculate the left offset so the cutout aligns with the video container
  // The video container is right: 'calc(50% + 20px)', so its left edge is at window.innerWidth/2 + 20px - 480px
  // The band should be positioned so its cutout's right edge matches the video container's left edge
  // We'll use left: calc(50% - (bandWidth + 480)/2 + 20px)
  const bandLeft = `calc(50% - ${(bandWidth + cutoutWidth) / 2}px + 20px)`;
  // The band is vertically centered, same as the video container
  const bandTop = '50%';

  // --- Gantry Frame dimensions and animation ---
  const isNudging = safeVideoHover;
  const gantryFrameStyle = {
    position: 'absolute',
    right: 'calc(50% + 20px)',
    top: videoAndCaptionTop,
    width: 480,
    height: 320,
    zIndex: 2,
    display: 'flex',
    alignItems: 'stretch',
    transition: isNudging ? NUDGE_TRANSITION : SLIDE_TRANSITION,
    transform: safeVideoHover 
      ? 'translateY(-12px)' 
      : videoVisible 
        ? 'translateX(0)' 
        : 'translateX(-200px)',
    opacity: videoVisible ? 1 : 0,
    overflow: 'visible',
    borderRadius: '16px',
    boxShadow: safeVideoHover ? 'inset 0 0 0 3px rgba(255, 255, 255, 0.5)' : 'none'
  };

  const handleSlideChange = (index) => {
    setCurrentVideo(index);
  };

  const handleHover = (index) => {
    if (!interactionsEnabled) return;
    
    // Clear any pending hover end
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
    
    // Clear any existing timeout
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    
    // Add a small delay before clearing hover state
    hoverTimeoutRef.current = setTimeout(() => {
      setIsPaused(false);
      setHoveredIndex(null);
    }, 50); // 50ms delay
  };

  // Measure right highlighter position
  useLayoutEffect(() => {
    const node = rightRowRefs.current[currentVideo];
    if (node) {
      const { offsetTop, offsetHeight } = node;
      setRightRect({ top: offsetTop, height: offsetHeight });
      setRightReady(true);
    }
  }, [currentVideo, hoveredIndex]);

  // Duplicated handleBarEnd for right highlighter
  const handleBarEnd = () => {
    console.log('handleBarEnd fired', { isPaused, currentVideo });
    if (!isPaused) {
      setBarKey((k) => k + 1);
      setCurrentVideo((c) => (c + 1) % 3);
    }
  };

  useLayoutEffect(() => {
    if (videoAnchorRef.current && captionRef.current && contentAnchorRef.current) {
      const videoRect = videoAnchorRef.current.getBoundingClientRect();
      const captionRect = captionRef.current.getBoundingClientRect();
      const parentRect = contentAnchorRef.current.getBoundingClientRect();

      // Position relative to the green frame
      const videoAnchorTop = videoRect.top - parentRect.top;
      const videoAnchorHeight = videoRect.height;
      const captionHeight = captionRect.height;

      // Center caption on video anchor
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
    const top = 60 + (viewportHeight - 60 - totalHeight) / 2;
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
          rx: 16 // or parse from style if needed
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

  const [outlineFullOpacity, setOutlineFullOpacity] = useState(false);
  const [highlightOutlineFullOpacity, setHighlightOutlineFullOpacity] = useState(false);

  // Animate outline opacity: fast to 1, then gently to 0.4
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

  // Animate highlighter outline opacity: fast to 1, then gently to 0.4
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

  // Add cleanup useEffect after other useEffect hooks
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div ref={sectionRef} className="h-screen w-full relative overflow-hidden bg-[#f5f8fa]">
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
          <video
            src={blurVideos[BASE_INDEX].video}
            className="w-full h-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            controls={false}
            preload="auto"
            tabIndex="-1"
            aria-hidden="true"
            draggable="false"
            disablePictureInPicture
            disableRemotePlayback
            controlsList="nodownload nofullscreen noremoteplayback"
            onContextMenu={(e) => e.preventDefault()}
            style={{
              display: 'block',
              position: 'relative',
              zIndex: 0,
              pointerEvents: 'none',
              userSelect: 'none',
              WebkitUserSelect: 'none',
              WebkitTouchCallout: 'none',
              transform: 'translateZ(0)',
              WebkitTransform: 'translateZ(0)',
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              perspective: '1000px',
              WebkitPerspective: '1000px',
              WebkitUserDrag: 'none',
              KhtmlUserDrag: 'none',
              MozUserDrag: 'none',
              OUserDrag: 'none',
              userDrag: 'none',
              WebkitUserSelect: 'none',
              KhtmlUserSelect: 'none',
              MozUserSelect: 'none',
              MsUserSelect: 'none',
              userSelect: 'none',
              WebkitTouchCallout: 'none'
            }}
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
              WebkitPerspective: '1000px'
            }}
          >
            <div style={{
              width: '100%',
              height: '100%',
              position: 'relative',
              display: 'inline-block'
            }}>
              <video
                src={video.video}
                className="w-full h-full object-cover"
                autoPlay
                muted
                loop
                playsInline
                controls={false}
                preload="auto"
                tabIndex="-1"
                aria-hidden="true"
                draggable="false"
                disablePictureInPicture
                disableRemotePlayback
                controlsList="nodownload nofullscreen noremoteplayback"
                onContextMenu={(e) => e.preventDefault()}
                style={{
                  display: 'block',
                  position: 'relative',
                  zIndex: 0,
                  pointerEvents: 'none',
                  userSelect: 'none',
                  WebkitUserSelect: 'none',
                  WebkitTouchCallout: 'none',
                  transform: 'translateZ(0)',
                  WebkitTransform: 'translateZ(0)',
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                  perspective: '1000px',
                  WebkitPerspective: '1000px',
                  WebkitUserDrag: 'none',
                  KhtmlUserDrag: 'none',
                  MozUserDrag: 'none',
                  OUserDrag: 'none',
                  userDrag: 'none',
                  WebkitUserSelect: 'none',
                  KhtmlUserSelect: 'none',
                  MozUserSelect: 'none',
                  MsUserSelect: 'none',
                  userSelect: 'none',
                  WebkitTouchCallout: 'none'
                }}
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
      {/* Foreground content: flex row, no card, just video | spacer | captions */}
      <div style={{
        position: 'relative',
        width: '100%',
        height: bandHeight,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
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
          }}
        />
        {/* Video Anchor (now contains cookiecutter and video container) */}
        <div
          ref={videoAnchorRef}
          data-testid="video-anchor"
          style={{
            position: 'absolute',
            right: 'calc(50% + 20px)',
            top: videoAndCaptionTop,
            width: 480,
            height: videoHeight,
            opacity: 1,
            pointerEvents: 'none',
            zIndex: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* CookieCutterBand: sibling to video container */}
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
          {/* Gantry Frame: contains only the video container now */}
          <div className="video-gantry-frame" style={{
            ...gantryFrameStyle,
            position: 'absolute',
            right: 0,
            top: 0,
            zIndex: 3,
            pointerEvents: 'auto'
          }}>
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
                transition: [
                  safeVideoHover 
                    ? 'transform 0.9s cubic-bezier(0.4, 0, 0.2, 1) 0.2s'
                    : 'transform 0.9s cubic-bezier(0.4, 0, 0.2, 1)',
                  outlineFullOpacity
                    ? 'opacity 0.1s cubic-bezier(.4,2,.6,1)'
                    : safeVideoHover
                    ? 'opacity 0.2s cubic-bezier(.4,0,.2,1) 0.2s'
                    : 'opacity 0.13s'
                ].join(', '),
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
                opacity: videoVisible ? 1 : 0,
                transition: 'opacity 1.5s ease'
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
              />
            </div>
          </div>
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
          position: 'absolute',
          left: 'calc(50% + 20px)',
          top: videoAndCaptionTop,
          width: 444,
          height: videoHeight,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 20,
          transition: captionsVisible ? 'transform 1.5s cubic-bezier(0.4,0,0.2,1), opacity 1.5s ease' : 'none',
          opacity: captionsVisible ? 1 : 0,
          transform: captionsVisible ? 'translateX(0)' : 'translateX(200px)',
        }}
      >
        {/* Caption Section (centered inside caption anchor) */}
        <div
          ref={captionRef}
          className="MedicalSection-caption-area flex flex-col items-start justify-center"
          data-testid="MedicalSection-caption-area"
          style={{
            maxWidth: 520,
            width: 'auto',
            marginLeft: 0,
            paddingLeft: 0,
          }}
        >
          <div className="relative flex flex-col gap-2 items-start" style={{ width: 'auto', marginLeft: 0, paddingLeft: 0 }}>
            {rightReady && Number.isFinite(currentVideo) && Number.isFinite(rightRect.top) && Number.isFinite(rightRect.height) && (
              <>
                {/* Targeting outline container */}
                <div
                  className="absolute transition-all duration-700 ease"
                  style={{
                    top: rightRect.top,
                    left: '50%',
                    width: 444,
                    height: rightRect.height,
                    transform: 'translateX(-50%)',
                    zIndex: 5,
                    pointerEvents: 'none'
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
                      transition: [
                        safeHoveredIndex === currentVideo 
                          ? 'transform 0.9s cubic-bezier(0.4, 0, 0.2, 1) 0.2s'
                          : 'transform 0.9s cubic-bezier(0.4, 0, 0.2, 1)',
                        highlightOutlineFullOpacity
                          ? 'opacity 0.1s cubic-bezier(.4,2,.6,1)'
                          : safeHoveredIndex === currentVideo
                          ? 'opacity 0.2s cubic-bezier(.4,0,.2,1) 0.2s'
                          : 'opacity 0.13s'
                      ].join(', '),
                      opacity: safeHoveredIndex === currentVideo ? (highlightOutlineFullOpacity ? 0.9 : 0.4) : 0
                    }}
                  />
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
                      transition: 'top 600ms cubic-bezier(0.4, 0, 0.2, 1), left 600ms cubic-bezier(0.4, 0, 0.2, 1), width 600ms cubic-bezier(0.4, 0, 0.2, 1)',
                      opacity: 0.2
                    }}
                  />
                </div>
                {/* Duplicated Highlighter rectangle for right section */}
                <div
                  className="absolute rounded-xl transition-all duration-700 ease pointer-events-none overflow-hidden"
                  style={{
                    top: rightRect.top,
                    height: rightRect.height,
                    width: 444,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    paddingLeft: 24,
                    paddingRight: 24,
                    background: safeHoveredIndex === currentVideo ? 'rgba(228,228,228,1)' : 'rgba(232,232,232,1)',
                    borderRadius: 10,
                    boxShadow: safeHoveredIndex === currentVideo ? '1px 1px 2px 0px rgba(0,0,0,0.5)' : '1px 1px 2px 0px rgba(0,0,0,0.25)',
                    transition: 'top 600ms cubic-bezier(0.4, 0, 0.2, 1), height 600ms cubic-bezier(0.4, 0, 0.2, 1), /* hover effects */ color 100ms cubic-bezier(0.4, 0, 0.2, 1), box-shadow 100ms cubic-bezier(0.4, 0, 0.2, 1), background 100ms cubic-bezier(0.4, 0, 0.2, 1)',
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
              </>
            )}
            {headlines.map((headline, i) => (
              <button
                key={i}
                ref={(el) => (rightRowRefs.current[i] = el)}
                onMouseEnter={interactionsEnabled ? () => handleHover(i) : undefined}
                onMouseLeave={interactionsEnabled ? handleHoverEnd : undefined}
                className="relative text-right py-3 rounded-xl transition-all duration-700 ease"
                style={{
                  display: 'block',
                  maxWidth: 480,
                  minWidth: 320,
                  paddingLeft: 24,
                  paddingRight: 24,
                  margin: '0 auto',
                  zIndex: 40,
                  cursor: interactionsEnabled ? 'pointer' : 'default'
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
                  transition: 'color 0.6s, transform 0.3s',
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
          transition: headerVisible ? 'opacity 1.5s ease' : 'none',
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
            In the moment,<br />
            <span style={{ color: '#3fd1c7' }}>only</span> the patient<br />
            matters
          </h2>
        </div>
      </div>
    </div>
  );
};

export default MedicalSection; 