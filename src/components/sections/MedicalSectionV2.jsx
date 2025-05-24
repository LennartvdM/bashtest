import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import MedicalCarousel from '../MedicalCarousel';

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

  const [videoHover, setVideoHover] = useState(false);

  const handleSlideChange = (index) => {
    setCurrentVideo(index);
  };

  const handleHover = (index) => {
    if (typeof index === 'number' && index >= 0 && index < headlines.length) {
      if (index !== currentVideo) setBarKey((k) => k + 1);
      setCurrentVideo(index);
      setIsPaused(true);
      setHoveredIndex(index);
    }
  };
  const handleHoverEnd = () => {
    setIsPaused(false);
    setHoveredIndex(null);
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
    if (!isPaused) {
      setBarKey((k) => k + 1);
      setCurrentVideo((c) => (c + 1) % headlines.length);
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

  return (
    <div ref={sectionRef} className="h-screen w-full relative overflow-hidden">
      {/* Grey line from video center to left edge of viewport */}
      {/* (Remove the following div) */}
      {/* <div
        style={{
          position: 'absolute',
          top: videoCenter.y,
          left: 0,
          width: videoCenter.x,
          height: 2,
          background: '#e0e0e0',
          mixBlendMode: 'screen',
          zIndex: 1, // behind carousel, above background
          pointerEvents: 'none',
        }}
      /> */}
      {/* Grey line from highlighter right edge to right edge of viewport */}
      <div
        style={{
          position: 'fixed',
          top: highlighterRight.y,
          left: highlighterRight.x,
          width: `calc(100vw - ${highlighterRight.x}px)`,
          height: 2,
          background: '#e0e0e0',
          mixBlendMode: 'screen',
          zIndex: 40,
          pointerEvents: 'none',
        }}
      />
      {/* Always-visible base blur video */}
      <div
        className="absolute inset-0 flex items-center justify-center opacity-100 z-0"
        style={{
          left: '-2vw',
          width: '104vw',
          filter: 'brightness(0.7) saturate(1)',
          willChange: 'opacity',
          pointerEvents: 'none',
          background: 'none',
        }}
      >
        <video
          src={blurVideos[BASE_INDEX].video}
          className="w-full h-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          tabIndex="-1"
          aria-hidden="true"
          draggable="false"
          style={{ background: 'none' }}
        />
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
              background: 'none',
            }}
          >
            <video
              src={video.video}
              className="w-full h-full object-cover"
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              tabIndex="-1"
              aria-hidden="true"
              draggable="false"
              style={{ background: 'none' }}
            />
          </div>
        )
      ))}
      {/* Foreground content: absolute spacer at center, left and right anchored to it */}
      <div className="relative z-20 w-full h-screen flex items-center justify-center">
        {/* Gantry band: visual element, starts left of browser edge, ends at left edge of spacer (center of header/video) */}
        <div
          data-testid="gantry-band"
          className="gantry-band"
          style={{
            position: 'absolute',
            left: '-1vw',
            top: videoAndCaptionTop,
            width: 'calc(50% - 20px - 240px + 1vw)',
            height: videoHeight,
            background: '#e0e0e0',
            zIndex: 1,
            pointerEvents: 'none',
          }}
        />
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
            background: 'rgba(255, 0, 0, 0.3)',
            pointerEvents: 'none',
            zIndex: 10,
          }}
        />
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
        {/* Video Gantry Frame: unifies grey band and video, applies hover transform */}
        <div
          className="video-gantry-frame"
          style={{
            position: 'absolute',
            right: 'calc(50% + 20px)',
            top: videoAndCaptionTop,
            width: 480,
            height: videoHeight,
            zIndex: 2,
            display: 'flex',
            alignItems: 'stretch',
            transition: 'transform 0.3s cubic-bezier(0.4,0,0.2,1)',
            transform: videoHover ? 'translateY(-12px)' : 'none',
            overflow: 'visible', // ensure no masking
          }}
        >
          {/* Gantry band as background, only under video container */}
          <div
            data-testid="gantry-band"
            className="gantry-band"
            style={{
              position: 'absolute',
              right: 0,
              top: 0,
              width: 'calc(480px + 1vw)',
              height: '100%',
              background: '#e0e0e0',
              zIndex: 0,
              borderTopLeftRadius: 0,
              borderBottomLeftRadius: 0,
              borderTopRightRadius: 16,
              borderBottomRightRadius: 16,
              pointerEvents: 'none',
            }}
          />
          {/* Video Frame (no hover transform or border) */}
          <div
            data-testid="video-frame"
            className="video-frame"
            style={{
              position: 'relative',
              width: '100%',
              height: '100%',
              zIndex: 2,
              background: 'none',
              // No transform or transition here
            }}
          >
            {/* Video container cropped 1px narrower on the right to prevent pixel bleed */}
            <div
              ref={videoContainerRef}
              style={{
                width: 'calc(100% - 1px)',
                height: '100%',
                margin: 0,
                marginLeft: '1px',
                alignSelf: 'flex-end',
                padding: 0,
                borderTopLeftRadius: 0,
                borderBottomLeftRadius: 0,
                borderTopRightRadius: 16,
                borderBottomRightRadius: 16,
                overflow: 'hidden',
                border: 'none',
              }}
            >
              <MedicalCarousel
                current={currentVideo}
                setVideoCenter={setVideoCenter}
                hoveredIndex={hoveredIndex}
                isActive={hoveredIndex === currentVideo || isPaused}
                videoHover={videoHover}
                setVideoHover={setVideoHover}
              />
            </div>
          </div>
        </div>
        {/* Caption Anchor (right of spacer) */}
        <div
          className="caption-anchor"
          style={{
            position: 'absolute',
            left: 'calc(50% + 20px)',
            top: videoAndCaptionTop,
            width: 480,
            height: videoHeight,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1,
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
                      background: hoveredIndex === currentVideo ? 'rgba(228,228,228,1)' : 'rgba(232,232,232,0.9)',
                      borderRadius: 10,
                      boxShadow: hoveredIndex === currentVideo ? '1px 1px 2px 0px rgba(0,0,0,0.5)' : '1px 1px 2px 0px rgba(0,0,0,0.25)',
                      transition: 'top 600ms cubic-bezier(0.4, 0, 0.2, 1), height 600ms cubic-bezier(0.4, 0, 0.2, 1), /* hover effects */ color 100ms cubic-bezier(0.4, 0, 0.2, 1), box-shadow 100ms cubic-bezier(0.4, 0, 0.2, 1), background 100ms cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                  >
                    <div className="w-full h-full rounded-xl relative pointer-events-none">
                      {/* Loading Bar */}
                      <div
                        key={barKey}
                        className="absolute left-0 bottom-0 h-[5px]"
                        style={{
                          background: 'rgba(82,156,156,0.5)',
                          animation: `grow 7000ms linear forwards`,
                          animationPlayState: isPaused ? 'paused' : 'running',
                          left: -24,
                          width: '100%'
                        }}
                        onAnimationEnd={handleBarEnd}
                      />
                    </div>
                  </div>
                  {/* Second highlighter: animated line protruding to the right */}
                  <div
                    className="absolute transition-all duration-700 ease"
                    style={{
                      top: rightRect.top + rightRect.height / 2,
                      left: `calc(50% + ${444 / 2}px)`,
                      width: '100vw',
                      height: 2,
                      background: '#e0e0e0',
                      mixBlendMode: 'screen',
                      zIndex: 40,
                      pointerEvents: 'none',
                      transform: 'translateY(-50%)',
                      transition: 'top 600ms cubic-bezier(0.4, 0, 0.2, 1), left 600ms cubic-bezier(0.4, 0, 0.2, 1), width 600ms cubic-bezier(0.4, 0, 0.2, 1)',
                    }}
                  />
                </>
              )}
              {headlines.map((headline, i) => (
                <button
                  key={i}
                  ref={(el) => (rightRowRefs.current[i] = el)}
                  onMouseEnter={() => handleHover(i)}
                  onMouseLeave={handleHoverEnd}
                  className="relative z-10 text-right py-3 rounded-xl transition-all duration-700 ease"
                  style={{
                    display: 'block',
                    maxWidth: 480,
                    minWidth: 320,
                    paddingLeft: 24,
                    paddingRight: 24,
                    margin: '0 auto',
                  }}
                >
                  <p className="m-0 text-right text-2xl leading-tight" style={{
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 500,
                    letterSpacing: '-0.5px',
                    color:
                      hoveredIndex === i
                        ? '#2D6A6A'
                        : currentVideo === i
                        ? '#2a2323'
                        : '#bdbdbd',
                    mixBlendMode:
                      hoveredIndex === i
                        ? 'normal'
                        : currentVideo === i
                        ? 'normal'
                        : 'screen',
                    transition: 'color 0.6s, transform 0.3s',
                    transform: hoveredIndex === i ? 'translateY(-1px)' : 'translateY(0)',
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
        {/* Header Frame (with visible outline, above video anchor) */}
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
            zIndex: 2,
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
              width: '100%'
            }}>
              In the moment,<br />
              <span style={{ color: '#3fd1c7' }}>only</span> the patient<br />
              matters
            </h2>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicalSection; 