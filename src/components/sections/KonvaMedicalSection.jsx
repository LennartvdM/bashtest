import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Stage, Layer, Rect, Text, Image as KonvaImage, Group } from 'react-konva';
import { useSectionLifecycle } from '../../hooks/useSectionLifecycle';
import { useTabletLayout } from '../../hooks/useTabletLayout';

// Variant configurations matching V2 and V3
const VARIANTS = {
  v4: {
    id: 'medical-v4',
    blurVideos: [
      { id: "0", video: "/videos/blururgency.mp4", alt: "Blurred medical urgency" },
      { id: "1", video: "/videos/blurcoordination.mp4", alt: "Blurred team coordination" },
      { id: "2", video: "/videos/blurfocus.mp4", alt: "Blurred medical focus" },
    ],
    headlines: [
      { firstLine: "Medical interventions demand", secondLine: "precision and urgency." },
      { firstLine: "Which makes coordination within", secondLine: "teams vital for success." },
      { firstLine: "Task‑driven focus can lead to", secondLine: "tunnel vision and misalignment." },
    ],
    mainVideos: [
      { id: "0", video: "/videos/urgency.mp4", alt: "Medical urgency demonstration" },
      { id: "1", video: "/videos/coordination.mp4", alt: "Medical team coordination" },
      { id: "2", video: "/videos/focus.mp4", alt: "Medical focus and precision" },
    ],
    orientation: 'video-right',
    headerTitle: ['In the moment,', 'only the patient', 'matters'],
    accentWord: 'only'
  },
  v5: {
    id: 'medical-v5',
    blurVideos: [
      { id: "0", video: "/videos/blursskills.mp4", alt: "Blurred skills demonstration" },
      { id: "1", video: "/videos/blurteam.mp4", alt: "Blurred team coordination" },
      { id: "2", video: "/videos/blurperspectives.mp4", alt: "Blurred perspectives" },
    ],
    headlines: [
      { firstLine: "Quiet reflection allows for", secondLine: "sharpening skills." },
      { firstLine: "Further video debriefs foster", secondLine: "cohesion amongst peers." },
      { firstLine: "Shared understanding enhances", secondLine: "decisiveness." },
    ],
    mainVideos: [
      { id: "0", video: "/videos/skills.mp4", alt: "Sharpening skills" },
      { id: "1", video: "/videos/team.mp4", alt: "Team cohesion" },
      { id: "2", video: "/videos/perspectives.mp4", alt: "Shared perspectives" },
    ],
    orientation: 'video-left',
    headerTitle: ['In the moment,', 'only the patient', 'matters'],
    accentWord: 'only'
  }
};

const BASE_INDEX = 2;
const AUTOPLAY_MS = 7000;

// Custom hook for video element with canvas rendering
const useVideoElement = (src, shouldPlay) => {
  const videoRef = useRef(null);
  const [imageNode, setImageNode] = useState(null);

  useEffect(() => {
    const video = document.createElement('video');
    video.src = src;
    video.crossOrigin = 'anonymous';
    video.loop = true;
    video.muted = true;
    video.playsInline = true;
    video.preload = 'auto';
    videoRef.current = video;

    video.addEventListener('loadeddata', () => {
      setImageNode(video);
    });

    return () => {
      video.pause();
      video.src = '';
      videoRef.current = null;
    };
  }, [src]);

  useEffect(() => {
    if (videoRef.current) {
      if (shouldPlay) {
        videoRef.current.play().catch(() => {});
      } else {
        videoRef.current.pause();
      }
    }
  }, [shouldPlay]);

  return { videoRef, imageNode };
};

// Video component that renders on Konva canvas
const KonvaVideo = ({ src, x, y, width, height, opacity = 1, cornerRadius = 0, shouldPlay, onFrame }) => {
  const { imageNode } = useVideoElement(src, shouldPlay);
  const imageRef = useRef(null);

  useEffect(() => {
    if (!imageNode) return;

    const anim = () => {
      if (imageRef.current) {
        imageRef.current.getLayer()?.batchDraw();
      }
      onFrame?.();
      requestAnimationFrame(anim);
    };

    const frameId = requestAnimationFrame(anim);
    return () => cancelAnimationFrame(frameId);
  }, [imageNode, onFrame]);

  if (!imageNode) return null;

  return (
    <Group
      clipFunc={cornerRadius > 0 ? (ctx) => {
        ctx.beginPath();
        ctx.moveTo(x + cornerRadius, y);
        ctx.lineTo(x + width - cornerRadius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + cornerRadius);
        ctx.lineTo(x + width, y + height - cornerRadius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - cornerRadius, y + height);
        ctx.lineTo(x + cornerRadius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - cornerRadius);
        ctx.lineTo(x, y + cornerRadius);
        ctx.quadraticCurveTo(x, y, x + cornerRadius, y);
        ctx.closePath();
      } : undefined}
    >
      <KonvaImage
        ref={imageRef}
        image={imageNode}
        x={x}
        y={y}
        width={width}
        height={height}
        opacity={opacity}
      />
    </Group>
  );
};

// Animated progress bar component
const ProgressBar = ({ x, y, width, height, progress, color = 'rgba(82, 156, 156, 1)' }) => {
  return (
    <Rect
      x={x}
      y={y}
      width={width * progress}
      height={height}
      fill={color}
      cornerRadius={2}
    />
  );
};

// Caption button component
const CaptionButton = ({
  x, y, width, height,
  firstLine, secondLine,
  isActive, isHovered,
  onMouseEnter, onMouseLeave, onClick,
  textAlign = 'right'
}) => {
  const textColor = isHovered ? '#2D6A6A' : isActive ? '#2a2323' : '#bdbdbd';
  const bgOpacity = isActive ? 1 : 0;

  return (
    <Group
      x={x}
      y={y}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
      onTap={onClick}
    >
      {/* Background highlight for active item */}
      <Rect
        width={width}
        height={height}
        fill="rgba(228, 228, 228, 1)"
        cornerRadius={10}
        opacity={bgOpacity}
        shadowColor="rgba(0,0,0,0.25)"
        shadowBlur={2}
        shadowOffset={{ x: 1, y: 1 }}
      />

      {/* First line */}
      <Text
        x={24}
        y={12}
        width={width - 48}
        text={firstLine}
        fontSize={24}
        fontFamily="Inter, sans-serif"
        fontStyle="500"
        fill={textColor}
        align={textAlign}
        letterSpacing={-0.5}
      />

      {/* Second line */}
      <Text
        x={24}
        y={42}
        width={width - 48}
        text={secondLine}
        fontSize={24}
        fontFamily="Inter, sans-serif"
        fontStyle="500"
        fill={textColor}
        align={textAlign}
        letterSpacing={-0.5}
      />
    </Group>
  );
};

const KonvaMedicalSection = ({ inView, sectionRef, variant = 'v4' }) => {
  const config = useMemo(() => VARIANTS[variant] || VARIANTS.v4, [variant]);
  const { blurVideos, headlines, mainVideos, orientation, id: sectionId, headerTitle, accentWord } = config;

  const { sectionState, shouldAnimate, isActive } = useSectionLifecycle(sectionId, inView);
  const { isDesktop, isTablet, isTabletPortrait } = useTabletLayout();

  // State
  const [currentVideo, setCurrentVideo] = useState(0);
  const [isPaused, setIsPaused] = useState(true);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [progress, setProgress] = useState(0);
  const [headerVisible, setHeaderVisible] = useState(false);
  const [videoVisible, setVideoVisible] = useState(false);
  const [captionsVisible, setCaptionsVisible] = useState(false);
  const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });

  const progressRef = useRef(0);
  const lastTimeRef = useRef(null);
  const containerRef = useRef(null);

  const isVideoLeft = orientation === 'video-left';

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Entrance animations
  useEffect(() => {
    if (shouldAnimate) {
      setCurrentVideo(0);
      setIsPaused(true);
      setHeaderVisible(false);
      setVideoVisible(false);
      setCaptionsVisible(false);
      setProgress(0);
      progressRef.current = 0;

      const timers = [];
      timers.push(setTimeout(() => setHeaderVisible(true), 450));
      timers.push(setTimeout(() => setVideoVisible(true), 2925));
      timers.push(setTimeout(() => setCaptionsVisible(true), 3225));
      timers.push(setTimeout(() => setIsPaused(false), 6000));

      return () => timers.forEach(clearTimeout);
    }
  }, [shouldAnimate]);

  // Autoplay progress
  useEffect(() => {
    if (isPaused || sectionState !== 'active') {
      lastTimeRef.current = null;
      return;
    }

    const animate = (timestamp) => {
      if (!lastTimeRef.current) {
        lastTimeRef.current = timestamp;
      }

      const delta = timestamp - lastTimeRef.current;
      lastTimeRef.current = timestamp;

      progressRef.current += delta / AUTOPLAY_MS;

      if (progressRef.current >= 1) {
        progressRef.current = 0;
        setCurrentVideo((c) => (c + 1) % 3);
      }

      setProgress(progressRef.current);
      requestAnimationFrame(animate);
    };

    const frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [isPaused, sectionState]);

  // Reset on video change
  useEffect(() => {
    progressRef.current = 0;
    setProgress(0);
    lastTimeRef.current = null;
  }, [currentVideo]);

  // Cleanup when section becomes inactive
  useEffect(() => {
    if (sectionState === 'preserving' || sectionState === 'cleaned' || sectionState === 'idle') {
      setHeaderVisible(false);
      setVideoVisible(false);
      setCaptionsVisible(false);
      setCurrentVideo(0);
      setIsPaused(true);
      setProgress(0);
    }
  }, [sectionState]);

  // Handlers
  const handleCaptionHover = useCallback((index) => {
    if (typeof index === 'number') {
      setHoveredIndex(index);
      setCurrentVideo(index);
      setIsPaused(true);
    }
  }, []);

  const handleCaptionLeave = useCallback(() => {
    setHoveredIndex(null);
    setIsPaused(false);
  }, []);

  const handleCaptionClick = useCallback((index) => {
    setCurrentVideo(index);
    setIsPaused(true);
    setTimeout(() => setIsPaused(false), 100);
  }, []);

  // Layout calculations
  const navbarHeight = 60;
  const { width: stageWidth, height: stageHeight } = dimensions;

  const videoWidth = isTabletPortrait ? Math.min(480, stageWidth * 0.9) : 480;
  const videoHeight = isTabletPortrait ? videoWidth * (2/3) : 320;
  const captionWidth = isTabletPortrait ? Math.min(520, stageWidth * 0.9) : 444;
  const captionItemHeight = 80;
  const headerHeight = 180;
  const gap = 32;

  // Center calculations
  const totalContentHeight = headerHeight + gap + videoHeight;
  const contentTop = (stageHeight / 2) - (totalContentHeight / 2) + (navbarHeight / 2);

  const centerX = stageWidth / 2;

  // Position calculations based on orientation
  const videoX = isVideoLeft
    ? centerX + 20
    : centerX - 20 - videoWidth;
  const videoY = contentTop + headerHeight + gap;

  const captionX = isVideoLeft
    ? centerX - 20 - captionWidth
    : centerX + 20;
  const captionY = videoY;

  const headerX = isVideoLeft
    ? centerX + gap / 2
    : centerX - gap / 2 - videoWidth;
  const headerY = contentTop;

  // Animation interpolation
  const videoOpacity = videoVisible ? 1 : 0;
  const captionOpacity = captionsVisible ? 1 : 0;
  const headerOpacity = headerVisible ? 1 : 0;

  if (sectionState === 'idle' || sectionState === 'cleaned') {
    return (
      <div
        ref={(node) => {
          containerRef.current = node;
          if (typeof sectionRef === 'function') sectionRef(node);
          else if (sectionRef) sectionRef.current = node;
        }}
        className="w-full h-screen relative overflow-hidden"
        style={{ background: '#1c3424' }}
      />
    );
  }

  return (
    <div
      ref={(node) => {
        containerRef.current = node;
        if (typeof sectionRef === 'function') sectionRef(node);
        else if (sectionRef) sectionRef.current = node;
      }}
      className="w-full h-screen relative overflow-hidden"
      style={{ background: '#1c3424' }}
    >
      <Stage width={stageWidth} height={stageHeight}>
        {/* Background Layer - Blur Videos */}
        <Layer>
          {/* Base blur video (always visible) */}
          <KonvaVideo
            src={blurVideos[BASE_INDEX].video}
            x={-stageWidth * 0.02}
            y={0}
            width={stageWidth * 1.04}
            height={stageHeight}
            opacity={0.7}
            shouldPlay={isActive || shouldAnimate}
          />

          {/* Overlay blur videos */}
          {blurVideos.map((video, index) => (
            index !== BASE_INDEX && (
              <KonvaVideo
                key={video.id}
                src={video.video}
                x={-stageWidth * 0.02}
                y={0}
                width={stageWidth * 1.04}
                height={stageHeight}
                opacity={index === currentVideo ? 0.7 : 0}
                shouldPlay={(isActive || shouldAnimate) && (index === 0 ? currentVideo === 0 : currentVideo <= 1)}
              />
            )
          ))}

          {/* Darkening overlay */}
          <Rect
            x={0}
            y={0}
            width={stageWidth}
            height={stageHeight}
            fill="rgba(0, 0, 0, 0.3)"
          />
        </Layer>

        {/* Content Layer */}
        <Layer>
          {/* Header */}
          <Group x={headerX} y={headerY} opacity={headerOpacity}>
            {headerTitle.map((line, i) => {
              const isAccentLine = line.includes(accentWord);
              let textContent = line;

              return (
                <Text
                  key={i}
                  y={i * 58}
                  text={textContent}
                  fontSize={48}
                  fontFamily="Inter, sans-serif"
                  fontStyle="bold"
                  fill={isAccentLine && i === 1 ? '#3fd1c7' : '#ffffff'}
                  letterSpacing={-2}
                  align={isVideoLeft ? 'right' : 'left'}
                  width={videoWidth}
                  shadowColor="rgba(0,0,0,0.22)"
                  shadowBlur={32}
                  shadowOffset={{ x: 0, y: 4 }}
                />
              );
            })}
          </Group>

          {/* Main Video Container */}
          <Group x={videoX} y={videoY} opacity={videoOpacity}>
            {/* Video frame background */}
            <Rect
              width={videoWidth}
              height={videoHeight}
              fill="#000"
              cornerRadius={16}
            />

            {/* Main videos - stacked with opacity */}
            {mainVideos.map((video, index) => (
              <KonvaVideo
                key={video.id}
                src={video.video}
                x={0}
                y={0}
                width={videoWidth}
                height={videoHeight}
                opacity={index === currentVideo ? 1 : index === BASE_INDEX ? 1 : 0}
                cornerRadius={16}
                shouldPlay={(isActive || shouldAnimate) && (index === currentVideo || index === BASE_INDEX)}
              />
            ))}

            {/* Frame border */}
            <Rect
              width={videoWidth}
              height={videoHeight}
              stroke="rgba(255, 255, 255, 0.2)"
              strokeWidth={2}
              cornerRadius={16}
            />
          </Group>

          {/* Captions */}
          <Group x={captionX} y={captionY} opacity={captionOpacity}>
            {headlines.map((headline, i) => (
              <CaptionButton
                key={i}
                x={0}
                y={i * (captionItemHeight + 8)}
                width={captionWidth}
                height={captionItemHeight}
                firstLine={headline.firstLine}
                secondLine={headline.secondLine}
                isActive={i === currentVideo}
                isHovered={i === hoveredIndex}
                onMouseEnter={() => handleCaptionHover(i)}
                onMouseLeave={handleCaptionLeave}
                onClick={() => handleCaptionClick(i)}
                textAlign={isVideoLeft ? 'left' : 'right'}
              />
            ))}

            {/* Progress bar for active caption */}
            <ProgressBar
              x={0}
              y={currentVideo * (captionItemHeight + 8) + captionItemHeight - 5}
              width={captionWidth}
              height={5}
              progress={progress}
            />
          </Group>
        </Layer>
      </Stage>

      {/* Konva badge */}
      <div
        style={{
          position: 'absolute',
          bottom: 20,
          right: 20,
          background: 'rgba(0, 0, 0, 0.5)',
          color: '#3fd1c7',
          padding: '8px 16px',
          borderRadius: 8,
          fontSize: 14,
          fontFamily: 'Inter, sans-serif',
          fontWeight: 600,
          letterSpacing: 1,
          pointerEvents: 'none',
          zIndex: 100
        }}
      >
        KONVA {variant.toUpperCase()}
      </div>
    </div>
  );
};

export default KonvaMedicalSection;
