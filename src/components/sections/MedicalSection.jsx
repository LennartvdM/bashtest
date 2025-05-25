import React, { useState, useRef } from 'react';
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

  return (
    <div ref={sectionRef} className="h-screen w-full relative overflow-hidden bg-[#f5f8fa]">
      {/* Gantry band with cutout mask for visual proof */}
      <div className="gantry-band" style={{ position: 'absolute', top: 40, left: 40, zIndex: 1000 }} />
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
      {/* Foreground content: flex row, no card, just video | spacer | captions */}
      <div className="relative z-20 flex flex-row items-center justify-center h-screen w-full px-12">
        {/* Left: video+band */}
        <div className="flex flex-col items-end justify-center" style={{ minWidth: 0 }}>
          <MedicalCarousel current={currentVideo} setVideoCenter={setVideoCenter} />
        </div>
        {/* Spacer: 40px invisible */}
        <div style={{ width: 40, minWidth: 40, flexShrink: 0, pointerEvents: 'none' }} />
        {/* Right: captions/highlighter */}
        <div className="MedicalSection-caption-area flex flex-col items-start justify-center" data-testid="MedicalSection-caption-area" style={{ minWidth: 0, flex: 1 }}>
          <div className="relative flex flex-col gap-2 items-start w-full" ref={captionsRef}>
            {ready && Number.isFinite(currentVideo) && (
              <>
                {/* Highlighter rectangle */}
                <div
                  className="absolute rounded-xl transition-all duration-700 ease pointer-events-none overflow-hidden"
                  style={{
                    top: rect.top,
                    height: rect.height,
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
                        animation: `grow-overflow 7000ms linear forwards`,
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
                    top: rect.top + rect.height / 2,
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
                ref={(el) => (rowRefs.current[i] = el)}
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
  );
};

export default MedicalSection; 