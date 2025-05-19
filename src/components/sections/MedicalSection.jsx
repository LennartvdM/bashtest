import React, { useState } from 'react';
import MedicalCarousel from '../MedicalCarousel';

const blurVideos = [
  { id: "0", video: "/videos/blururgency.mp4" },
  { id: "1", video: "/videos/blurcoordination.mp4" },
  { id: "2", video: "/videos/blurfocus.mp4" }, // base video
];

const BASE_INDEX = 2; // index of the always-visible base video

const MedicalSection = () => {
  const [currentVideo, setCurrentVideo] = useState(0);
  const [videoCenter, setVideoCenter] = useState({ x: 0, y: 0 });

  const handleSlideChange = (index) => {
    setCurrentVideo(index);
  };

  return (
    <div className="h-screen w-full relative overflow-hidden bg-[#f5f8fa]">
      {/* Yellow rectangle: top-right at video center, bottom-left at section bottom-left */}
      <div
        className="yellow-rect"
        style={{
          position: 'fixed',
          top: videoCenter.y,
          right: `calc(100vw - ${videoCenter.x}px)`,
          bottom: 0,
          left: 0,
          background: 'yellow',
          opacity: 0.5,
          zIndex: 10,
          pointerEvents: 'none',
          border: '2px solid orange',
        }}
      />
      {/* Always-visible base blur video */}
      <div
        className="absolute inset-0 flex items-center justify-center opacity-100 z-0"
        style={{
          filter: 'brightness(0.7)',
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
              filter: 'brightness(0.7)',
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
      {/* Foreground content */}
      <div className="relative z-20 flex items-center justify-center h-screen">
        <div className="glass-rect" />
        <MedicalCarousel onSlideChange={handleSlideChange} onCenterChange={setVideoCenter} />
      </div>
    </div>
  );
};

export default MedicalSection; 