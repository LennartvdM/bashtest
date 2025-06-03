import { useRef, useEffect } from 'react';

const VideoManager = ({ src, isPlaying, style, ...props }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.play().catch(() => {
          // Video play failed, likely due to user interaction requirement
          console.debug('Video autoplay prevented:', src);
        });
      } else {
        videoRef.current.pause();
      }
    }
  }, [isPlaying, src]);

  return (
    <video
      ref={videoRef}
      src={src}
      style={{
        ...style,
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
      }}
      {...props}
      autoPlay={false} // We control playback
      muted
      loop
      playsInline
    />
  );
};

export default VideoManager; 