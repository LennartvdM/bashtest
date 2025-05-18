import React, { useState, useEffect, useRef } from 'react';
import MedicalCarousel from '../MedicalCarousel';

const blurVideos = [
  { id: "0", video: "/videos/blururgency.mp4" },
  { id: "1", video: "/videos/blurcoordination.mp4" },
  { id: "2", video: "/videos/blurfocus.mp4" },
];

const MedicalSection = () => {
  const [currentVideo, setCurrentVideo] = useState(0);
  const [videosLoaded, setVideosLoaded] = useState(false);
  const videoRefs = useRef([]);

  useEffect(() => {
    // Preload all videos
    const loadPromises = blurVideos.map((_, index) => {
      return new Promise((resolve, reject) => {
        if (videoRefs.current[index]) {
          videoRefs.current[index].load();
          videoRefs.current[index].onloadeddata = () => resolve();
          videoRefs.current[index].onerror = () => reject();
        }
      });
    });

    Promise.all(loadPromises)
      .then(() => setVideosLoaded(true))
      .catch((error) => {
        console.error('Error loading videos:', error);
        setVideosLoaded(true); // Still set to true to show content even if videos fail
      });
  }, []);

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
            index === currentVideo && videosLoaded ? "opacity-100" : "opacity-0"
          }`}
          style={{ zIndex: 0 }}
        >
          <video
            ref={el => videoRefs.current[index] = el}
            src={video.video}
            className="w-full h-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            onError={(e) => console.error(`Error loading video ${video.video}:`, e)}
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