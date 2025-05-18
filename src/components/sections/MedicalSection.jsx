import React, { useState, useRef } from 'react';
import MedicalCarousel from '../MedicalCarousel';

const blurVideos = [
  { id: "0", video: "/videos/blururgency.mp4" },
  { id: "1", video: "/videos/blurcoordination.mp4" },
  { id: "2", video: "/videos/blurfocus.mp4" },
];

const FADE_DURATION = 700; // ms, must match transition-opacity duration

const MedicalSection = () => {
  const [currentVideo, setCurrentVideo] = useState(0);
  const [prevVideo, setPrevVideo] = useState(null);
  const [isFading, setIsFading] = useState(false);
  const fadeTimeout = useRef();

  const handleSlideChange = (index) => {
    if (index !== currentVideo) {
      setPrevVideo(currentVideo);
      setCurrentVideo(index);
      setIsFading(true);
      if (fadeTimeout.current) clearTimeout(fadeTimeout.current);
      fadeTimeout.current = setTimeout(() => {
        setPrevVideo(null);
        setIsFading(false);
      }, FADE_DURATION);
    }
  };

  // Clean up timeout on unmount
  React.useEffect(() => () => fadeTimeout.current && clearTimeout(fadeTimeout.current), []);

  return (
    <div className="h-screen w-full relative overflow-hidden bg-[#f5f8fa]">
      {/* Carousel-style blur video fade */}
      {/* Previous video stays fully opaque and behind during fade */}
      {prevVideo !== null && (
        <div
          key={blurVideos[prevVideo].id + '-prev'}
          className="absolute inset-0 flex items-center justify-center opacity-100 z-0 transition-none"
          style={{
            filter: 'blur(24px) brightness(0.7)',
            transform: 'scale(1.1)',
            willChange: 'opacity',
            pointerEvents: 'none',
          }}
        >
          <video
            src={blurVideos[prevVideo].video}
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
      )}
      {/* Current video fades in on top */}
      <div
        key={blurVideos[currentVideo].id + '-current'}
        className={`absolute inset-0 flex items-center justify-center transition-opacity duration-700 ease z-10 ${
          isFading ? 'opacity-0' : 'opacity-100'
        }`}
        style={{
          filter: 'blur(24px) brightness(0.7)',
          transform: 'scale(1.1)',
          willChange: 'opacity',
          pointerEvents: 'none',
        }}
      >
        <video
          src={blurVideos[currentVideo].video}
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
      {/* Foreground content */}
      <div className="relative z-20 flex items-center justify-center h-screen">
        <MedicalCarousel onSlideChange={handleSlideChange} />
      </div>
    </div>
  );
};

export default MedicalSection; 