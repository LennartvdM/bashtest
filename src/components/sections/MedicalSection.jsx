import React, { useState } from 'react';
import MedicalCarousel from '../MedicalCarousel';

const blurVideos = [
  { id: "0", video: "/videos/blururgency.mp4" },
  { id: "1", video: "/videos/blurcoordination.mp4" },
  { id: "2", video: "/videos/blurfocus.mp4" },
];

const MedicalSection = () => {
  const [currentVideo, setCurrentVideo] = useState(0);

  const handleSlideChange = (index) => {
    setCurrentVideo(index);
  };

  return (
    <div className="h-screen w-full relative overflow-hidden bg-[#f5f8fa]">
      {/* Section-local blurred background videos */}
      {blurVideos.map((video, index) => (
        <div
          key={video.id}
          className={`absolute inset-0 w-full h-full transition-opacity duration-700 ease pointer-events-none select-none ${
            index === currentVideo ? "opacity-100" : "opacity-0"
          }`}
          style={{
            zIndex: 0,
            filter: 'blur(24px) brightness(0.7)',
            transform: 'scale(1.1)',
            willChange: 'opacity'
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
      ))}
      {/* Foreground content */}
      <div className="relative z-10 flex items-center justify-center h-screen">
        <MedicalCarousel onSlideChange={handleSlideChange} />
      </div>
    </div>
  );
};

export default MedicalSection; 