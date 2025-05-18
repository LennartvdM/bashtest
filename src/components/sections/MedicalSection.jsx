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
    <div className="min-h-screen relative flex items-center justify-center">
      {/* Background blur videos */}
      {blurVideos.map((video, index) => (
        <div
          key={video.id}
          className={`absolute inset-0 transition-opacity duration-700 ease ${
            index === currentVideo ? "opacity-100" : "opacity-0"
          }`}
          style={{ zIndex: 0 }}
        >
          <video
            src={video.video}
            className="w-full h-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
          />
        </div>
      ))}
      {/* Content */}
      <div className="relative z-10 w-full">
        <MedicalCarousel onSlideChange={handleSlideChange} />
      </div>
    </div>
  );
};

export default MedicalSection; 