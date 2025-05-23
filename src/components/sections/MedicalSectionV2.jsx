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
  const [videoTop, setVideoTop] = useState('0px');
  const gap = 32;

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
    function updateCaptionTop() {
      if (videoContainerRef.current && rightCaptionsRef.current) {
        const videoRect = videoContainerRef.current.getBoundingClientRect();
        const captionRect = rightCaptionsRef.current.getBoundingClientRect();
        const parentRect = videoContainerRef.current.parentElement.getBoundingClientRect();
        // Calculate the center Y of the video relative to the parent
        const videoCenterY = (videoRect.top - parentRect.top) + (videoRect.height / 2);
        // Set the caption's top so its center aligns with the video's center
        const top = videoCenterY - (captionRect.height / 2);
        setCaptionTop(top);
      }
    }
    updateCaptionTop();
    window.addEventListener('resize', updateCaptionTop);
    window.addEventListener('scroll', updateCaptionTop);
    return () => {
      window.removeEventListener('resize', updateCaptionTop);
      window.removeEventListener('scroll', updateCaptionTop);
    };
  }, [currentVideo]);

  useLayoutEffect(() => {
    if (headerRef.current) {
      const headerRect = headerRef.current.getBoundingClientRect();
      const parentRect = headerRef.current.parentElement.getBoundingClientRect();
      const headerTop = headerRect.top - parentRect.top;
      setVideoTop(`${headerTop + headerRect.height + gap}px`);
    }
  }, []);

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
            />
          </div>
        )
      ))}
      {/* Foreground content: absolute spacer at center, left and right anchored to it */}
      <div className="relative z-20 w-full h-screen flex items-center justify-center">
        {/* Spacer: absolute, fixed at horizontal center */}
        <div
          data-testid="spacer"
          className="spacer"
          style={{
            position: 'absolute',
            left: '50%',
            top: '10%',
            height: '80%',
            width: 40,
            minWidth: 40,
            transform: 'translateX(-50%)',
            zIndex: 10,
            background: 'rgba(255, 0, 0, 0.3)',
            pointerEvents: 'none',
          }}
        />
        {/* Invisible Anchor Frame (with visible outline for debugging) */}
        <div
          data-testid="video-anchor"
          style={{
            position: 'absolute',
            right: '50%',
            transform: 'translateX(-20px)',
            top: videoTop,
            width: 480,
            height: 320, // or whatever the video height is
            opacity: 0.5, // semi-transparent for debugging
            border: '2px dashed orange',
            pointerEvents: 'none',
            zIndex: 1,
          }}
        />

        {/* Header Frame (with visible outline) */}
        <div
          ref={headerRef}
          data-testid="header-frame"
          className="header-frame"
          style={{
            position: 'absolute',
            right: '50%',
            transform: 'translateX(-20px)',
            top: '10%', // restored to old value
            width: 480,
            zIndex: 2,
            border: '2px solid blue',
            background: 'rgba(0,0,255,0.05)',
          }}
        >
          {/* Header container, 480px wide, left-aligned, right edge flush to spacer */}
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

        {/* Video Frame (with visible outline) */}
        <div
          data-testid="video-frame"
          className="video-frame"
          style={{
            position: 'absolute',
            right: '50%',
            transform: 'translateX(-20px)',
            top: videoTop,
            width: 480,
            zIndex: 2,
            border: '2px solid red',
            background: 'rgba(255,0,0,0.05)',
            // Add animation styles here as needed
          }}
        >
          <div ref={videoContainerRef} style={{ width: 480, marginLeft: 0, marginRight: 0, alignSelf: 'flex-end', background: 'none', marginTop: 0 }}>
            <MedicalCarousel
              current={currentVideo}
              setVideoCenter={setVideoCenter}
              hoveredIndex={hoveredIndex}
              isActive={hoveredIndex === currentVideo || isPaused}
            />
          </div>
        </div>
        {/* Right: captions/highlighter, left edge flush to spacer, vertically center to video container only */}
        <div style={{
          position: 'absolute',
          left: '50%',
          transform: 'translateX(20px)', // half spacer width
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'center',
          height: 'auto',
          minWidth: 0,
          zIndex: 2,
        }}>
          <div
            className="MedicalSection-caption-area flex flex-col items-start justify-center"
            data-testid="MedicalSection-caption-area"
            style={{
              marginLeft: 0,
              paddingLeft: 0,
              position: 'absolute',
              width: 'auto',
              maxWidth: 520,
              top: captionTop,
              // No left/right/transform for horizontal positioning here
            }}
          >
            <div className="relative flex flex-col gap-2 items-start" ref={rightCaptionsRef} style={{ width: 'auto', marginLeft: 0, paddingLeft: 0 }}>
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
      </div>
    </div>
  );
};

export default MedicalSection; 