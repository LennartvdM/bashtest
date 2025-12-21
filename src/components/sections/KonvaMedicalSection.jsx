import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Stage, Layer, Rect, Text, Image as KonvaImage, Group, Line, Shape } from 'react-konva';
import { useSectionLifecycle } from '../../hooks/useSectionLifecycle';
import { useTabletLayout } from '../../hooks/useTabletLayout';

// Easing functions matching CSS cubic-bezier
const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
const easeInOutCubic = (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const easeOutBack = (t) => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};

// Custom hook for animated values
const useAnimatedValue = (targetValue, duration = 300, easing = easeOutCubic) => {
  const [value, setValue] = useState(targetValue);
  const animationRef = useRef(null);
  const startValueRef = useRef(targetValue);
  const startTimeRef = useRef(null);

  useEffect(() => {
    if (animationRef.current) cancelAnimationFrame(animationRef.current);

    startValueRef.current = value;
    startTimeRef.current = null;

    const animate = (timestamp) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easing(progress);

      const newValue = startValueRef.current + (targetValue - startValueRef.current) * easedProgress;
      setValue(newValue);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [targetValue, duration, easing]);

  return value;
};

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
const KonvaVideo = ({ src, x, y, width, height, opacity = 1, cornerRadius = 0, shouldPlay, brightness = 1 }) => {
  const { imageNode } = useVideoElement(src, shouldPlay);
  const imageRef = useRef(null);
  const layerRef = useRef(null);

  useEffect(() => {
    if (!imageNode) return;

    let frameId;
    const anim = () => {
      if (imageRef.current) {
        const layer = imageRef.current.getLayer();
        if (layer && layer !== layerRef.current) {
          layerRef.current = layer;
        }
        layerRef.current?.batchDraw();
      }
      frameId = requestAnimationFrame(anim);
    };

    frameId = requestAnimationFrame(anim);
    return () => cancelAnimationFrame(frameId);
  }, [imageNode]);

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
        filters={brightness !== 1 ? [Konva.Filters.Brighten] : undefined}
        brightness={brightness - 1}
      />
    </Group>
  );
};

// Cookie Cutter Band component rendered on canvas
const CookieCutterBand = ({ x, y, bandWidth, bandHeight, cutoutX, cutoutY, cutoutWidth, cutoutHeight, cornerRadius, opacity, isVideoLeft }) => {
  return (
    <Shape
      x={x}
      y={y}
      opacity={opacity * 0.4}
      sceneFunc={(context, shape) => {
        context.beginPath();

        if (isVideoLeft) {
          // Mirrored: rounded left corners, straight right corners
          context.moveTo(cornerRadius, 0);
          context.lineTo(bandWidth, 0);
          context.lineTo(bandWidth, bandHeight);
          context.lineTo(cornerRadius, bandHeight);
          context.quadraticCurveTo(0, bandHeight, 0, bandHeight - cornerRadius);
          context.lineTo(0, cornerRadius);
          context.quadraticCurveTo(0, 0, cornerRadius, 0);
        } else {
          // Original: straight left corners, rounded right corners
          context.moveTo(0, 0);
          context.lineTo(bandWidth - cornerRadius, 0);
          context.quadraticCurveTo(bandWidth, 0, bandWidth, cornerRadius);
          context.lineTo(bandWidth, bandHeight - cornerRadius);
          context.quadraticCurveTo(bandWidth, bandHeight, bandWidth - cornerRadius, bandHeight);
          context.lineTo(0, bandHeight);
        }
        context.closePath();

        // Create cutout
        context.moveTo(cutoutX + cornerRadius, cutoutY);
        context.lineTo(cutoutX + cutoutWidth - cornerRadius, cutoutY);
        context.quadraticCurveTo(cutoutX + cutoutWidth, cutoutY, cutoutX + cutoutWidth, cutoutY + cornerRadius);
        context.lineTo(cutoutX + cutoutWidth, cutoutY + cutoutHeight - cornerRadius);
        context.quadraticCurveTo(cutoutX + cutoutWidth, cutoutY + cutoutHeight, cutoutX + cutoutWidth - cornerRadius, cutoutY + cutoutHeight);
        context.lineTo(cutoutX + cornerRadius, cutoutY + cutoutHeight);
        context.quadraticCurveTo(cutoutX, cutoutY + cutoutHeight, cutoutX, cutoutY + cutoutHeight - cornerRadius);
        context.lineTo(cutoutX, cutoutY + cornerRadius);
        context.quadraticCurveTo(cutoutX, cutoutY, cutoutX + cornerRadius, cutoutY);
        context.closePath();

        context.fillStrokeShape(shape);
      }}
      fill="#f0f4f6"
      globalCompositeOperation="screen"
    />
  );
};

// Targeting outline component with scale animation
const TargetingOutline = ({ x, y, width, height, cornerRadius, isActive, scale, opacity }) => {
  const actualWidth = width * scale;
  const actualHeight = height * scale;
  const offsetX = (actualWidth - width) / 2;
  const offsetY = (actualHeight - height) / 2;

  return (
    <Rect
      x={x - offsetX}
      y={y - offsetY}
      width={actualWidth}
      height={actualHeight}
      stroke="white"
      strokeWidth={3}
      cornerRadius={cornerRadius}
      opacity={opacity}
    />
  );
};

// Caption button component with enhanced animations
const CaptionButton = ({
  x, y, width, height,
  firstLine, secondLine,
  isActive, isHovered,
  onMouseEnter, onMouseLeave, onClick,
  textAlign = 'right',
  highlighterY,
  progress,
  showProgress
}) => {
  // Animated color transitions
  const getTextColor = () => {
    if (isHovered) return '#2D6A6A';
    if (isActive) return '#2a2323';
    return '#bdbdbd';
  };

  return (
    <Group
      x={x}
      y={y}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
      onTap={onClick}
    >
      {/* First line */}
      <Text
        x={24}
        y={16}
        width={width - 48}
        text={firstLine}
        fontSize={24}
        fontFamily="Inter, sans-serif"
        fontStyle="500"
        fill={getTextColor()}
        align={textAlign}
        letterSpacing={-0.5}
      />

      {/* Second line */}
      <Text
        x={24}
        y={46}
        width={width - 48}
        text={secondLine}
        fontSize={24}
        fontFamily="Inter, sans-serif"
        fontStyle="500"
        fill={getTextColor()}
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
  const { isTabletPortrait } = useTabletLayout();

  // Core state
  const [currentVideo, setCurrentVideo] = useState(0);
  const [isPaused, setIsPaused] = useState(true);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [videoHover, setVideoHover] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });

  // Animation states for entrance
  const [headerLine1Visible, setHeaderLine1Visible] = useState(false);
  const [headerLine2Visible, setHeaderLine2Visible] = useState(false);
  const [headerLine3Visible, setHeaderLine3Visible] = useState(false);
  const [videoVisible, setVideoVisible] = useState(false);
  const [captionsVisible, setCaptionsVisible] = useState(false);
  const [interactionsEnabled, setInteractionsEnabled] = useState(false);

  // Animated values
  const videoNudgeY = useAnimatedValue(videoHover && interactionsEnabled ? -12 : 0, 300, easeOutBack);
  const videoOutlineScale = useAnimatedValue(videoHover && interactionsEnabled ? 1 : 1.08, 900, easeOutCubic);
  const videoOutlineOpacity = useAnimatedValue(videoHover && interactionsEnabled ? 0.5 : 0, 200, easeOutCubic);

  const captionOutlineScale = useAnimatedValue(
    hoveredIndex === currentVideo && interactionsEnabled ? 1 : 1.08,
    900,
    easeOutCubic
  );
  const captionOutlineOpacity = useAnimatedValue(
    (hoveredIndex === currentVideo || hoveredIndex === null) && interactionsEnabled ? 0.4 : 0,
    200,
    easeOutCubic
  );

  // Video entrance animation
  const videoSlideX = useAnimatedValue(
    videoVisible ? 0 : (orientation === 'video-left' ? 200 : -200),
    2250,
    easeInOutCubic
  );
  const videoOpacity = useAnimatedValue(videoVisible ? 1 : 0, 2250, easeInOutCubic);

  // Caption entrance animation
  const captionSlideX = useAnimatedValue(
    captionsVisible ? 0 : (orientation === 'video-left' ? -200 : 200),
    2250,
    easeInOutCubic
  );
  const captionOpacity = useAnimatedValue(captionsVisible ? 1 : 0, 2250, easeInOutCubic);

  // Header line opacities
  const headerLine1Opacity = useAnimatedValue(headerLine1Visible ? 1 : 0, 2250, easeOutCubic);
  const headerLine2Opacity = useAnimatedValue(headerLine2Visible ? 1 : 0, 2250, easeOutCubic);
  const headerLine3Opacity = useAnimatedValue(headerLine3Visible ? 1 : 0, 2250, easeOutCubic);

  // Highlighter position animation
  const highlighterY = useAnimatedValue(currentVideo * 88, 600, easeOutCubic);

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

  // Entrance animations with staggered timing
  useEffect(() => {
    if (shouldAnimate) {
      // Reset all states
      setCurrentVideo(0);
      setIsPaused(true);
      setHeaderLine1Visible(false);
      setHeaderLine2Visible(false);
      setHeaderLine3Visible(false);
      setVideoVisible(false);
      setCaptionsVisible(false);
      setInteractionsEnabled(false);
      setProgress(0);
      progressRef.current = 0;

      const timers = [];

      // Staggered header lines
      timers.push(setTimeout(() => setHeaderLine1Visible(true), 450));
      timers.push(setTimeout(() => setHeaderLine2Visible(true), 1575)); // 450 + 1125
      timers.push(setTimeout(() => setHeaderLine3Visible(true), 1575)); // Same as line 2

      // Video and captions
      timers.push(setTimeout(() => setVideoVisible(true), 2925));
      timers.push(setTimeout(() => setCaptionsVisible(true), 3225));

      // Enable interactions after entrance
      timers.push(setTimeout(() => {
        setInteractionsEnabled(true);
        setIsPaused(false);
      }, 6000));

      return () => timers.forEach(clearTimeout);
    }
  }, [shouldAnimate]);

  // Autoplay progress
  useEffect(() => {
    if (isPaused || sectionState !== 'active') {
      lastTimeRef.current = null;
      return;
    }

    let frameId;
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
      frameId = requestAnimationFrame(animate);
    };

    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [isPaused, sectionState]);

  // Reset progress on video change
  useEffect(() => {
    progressRef.current = 0;
    setProgress(0);
    lastTimeRef.current = null;
  }, [currentVideo]);

  // Cleanup when section becomes inactive
  useEffect(() => {
    if (sectionState === 'preserving' || sectionState === 'cleaned' || sectionState === 'idle') {
      setHeaderLine1Visible(false);
      setHeaderLine2Visible(false);
      setHeaderLine3Visible(false);
      setVideoVisible(false);
      setCaptionsVisible(false);
      setInteractionsEnabled(false);
      setCurrentVideo(0);
      setIsPaused(true);
      setProgress(0);
    }
  }, [sectionState]);

  // Handlers
  const handleCaptionHover = useCallback((index) => {
    if (!interactionsEnabled) return;
    if (typeof index === 'number') {
      setHoveredIndex(index);
      setCurrentVideo(index);
      setIsPaused(true);
    }
  }, [interactionsEnabled]);

  const handleCaptionLeave = useCallback(() => {
    if (!interactionsEnabled) return;
    setHoveredIndex(null);
    setIsPaused(false);
  }, [interactionsEnabled]);

  const handleCaptionClick = useCallback((index) => {
    if (!interactionsEnabled) return;
    setCurrentVideo(index);
    setIsPaused(true);
    setTimeout(() => setIsPaused(false), 100);
  }, [interactionsEnabled]);

  const handleVideoMouseEnter = useCallback(() => {
    if (interactionsEnabled) setVideoHover(true);
  }, [interactionsEnabled]);

  const handleVideoMouseLeave = useCallback(() => {
    if (interactionsEnabled) setVideoHover(false);
  }, [interactionsEnabled]);

  // Layout calculations
  const navbarHeight = 60;
  const { width: stageWidth, height: stageHeight } = dimensions;

  const videoWidth = isTabletPortrait ? Math.min(480, stageWidth * 0.9) : 480;
  const videoHeight = isTabletPortrait ? videoWidth * (2/3) : 320;
  const captionWidth = isTabletPortrait ? Math.min(520, stageWidth * 0.9) : 444;
  const captionItemHeight = 80;
  const headerHeight = 180;
  const gap = 32;
  const cornerRadius = 16;

  // Cookie cutter band dimensions
  const bandWidth = stageWidth * 0.55;
  const bandHeight = videoHeight;

  // Center calculations
  const totalContentHeight = headerHeight + gap + videoHeight;
  const contentTop = (stageHeight / 2) - (totalContentHeight / 2) + (navbarHeight / 2);

  const centerX = stageWidth / 2;

  // Position calculations based on orientation
  const videoBaseX = isVideoLeft
    ? centerX + 20
    : centerX - 20 - videoWidth;
  const videoY = contentTop + headerHeight + gap;

  const captionBaseX = isVideoLeft
    ? centerX - 20 - captionWidth
    : centerX + 20;
  const captionY = videoY;

  const headerX = isVideoLeft
    ? centerX + gap / 2
    : centerX - gap / 2 - videoWidth;
  const headerY = contentTop;

  // Apply slide animations
  const videoX = videoBaseX + videoSlideX;
  const captionX = captionBaseX + captionSlideX;

  // Cookie cutter band position
  const bandX = isVideoLeft ? 0 : stageWidth - bandWidth;
  const bandY = videoY;
  const cutoutX = isVideoLeft ? 0 : bandWidth - videoWidth;

  // Blur video opacities with smooth transitions
  const getBlurOpacity = (index) => {
    if (index === BASE_INDEX) return 0.7; // Base always visible
    if (index === currentVideo) return 0.7;
    return 0;
  };

  // Main video opacities (sequential card removal, not crossfade)
  const getVideoOpacity = (index) => {
    if (index === BASE_INDEX) return 1; // Base always visible
    if (currentVideo === 0) return 1; // State 0: all visible
    if (currentVideo === 1) return index === 0 ? 0 : 1; // State 1: remove first
    return 0; // State 2: remove all overlays
  };

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
            brightness={0.7}
            shouldPlay={isActive || shouldAnimate}
          />

          {/* Overlay blur videos with crossfade */}
          {blurVideos.map((video, index) => (
            index !== BASE_INDEX && (
              <KonvaVideo
                key={video.id}
                src={video.video}
                x={-stageWidth * 0.02}
                y={0}
                width={stageWidth * 1.04}
                height={stageHeight}
                opacity={getBlurOpacity(index)}
                brightness={0.7}
                shouldPlay={(isActive || shouldAnimate) && (index === 0 ? currentVideo === 0 : currentVideo <= 1)}
              />
            )
          ))}
        </Layer>

        {/* Content Layer */}
        <Layer>
          {/* Cookie Cutter Band */}
          <CookieCutterBand
            x={bandX}
            y={bandY + videoNudgeY}
            bandWidth={bandWidth}
            bandHeight={bandHeight}
            cutoutX={cutoutX}
            cutoutY={0}
            cutoutWidth={videoWidth}
            cutoutHeight={videoHeight}
            cornerRadius={20}
            opacity={videoOpacity}
            isVideoLeft={isVideoLeft}
          />

          {/* Header with staggered line animations */}
          <Group x={headerX} y={headerY}>
            {headerTitle.map((line, i) => {
              const lineOpacity = i === 0 ? headerLine1Opacity : i === 1 ? headerLine2Opacity : headerLine3Opacity;
              const isAccentLine = i === 1;

              return (
                <Text
                  key={i}
                  y={i * 58}
                  text={line}
                  fontSize={48}
                  fontFamily="Inter, sans-serif"
                  fontStyle="bold"
                  fill={isAccentLine ? '#3fd1c7' : '#ffffff'}
                  opacity={lineOpacity}
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

          {/* Main Video Container with hover effects */}
          <Group
            x={videoX}
            y={videoY + videoNudgeY}
            opacity={videoOpacity}
            onMouseEnter={handleVideoMouseEnter}
            onMouseLeave={handleVideoMouseLeave}
          >
            {/* Targeting outline */}
            <TargetingOutline
              x={0}
              y={0}
              width={videoWidth}
              height={videoHeight}
              cornerRadius={cornerRadius}
              isActive={videoHover && interactionsEnabled}
              scale={videoOutlineScale}
              opacity={videoOutlineOpacity}
            />

            {/* Video frame background */}
            <Rect
              width={videoWidth}
              height={videoHeight}
              fill="#000"
              cornerRadius={cornerRadius}
            />

            {/* Base video (always visible) */}
            <KonvaVideo
              src={mainVideos[BASE_INDEX].video}
              x={0}
              y={0}
              width={videoWidth}
              height={videoHeight}
              opacity={1}
              cornerRadius={cornerRadius}
              shouldPlay={isActive || shouldAnimate}
            />

            {/* Overlay videos - sequential removal */}
            {mainVideos.map((video, index) => (
              index !== BASE_INDEX && (
                <KonvaVideo
                  key={video.id}
                  src={video.video}
                  x={0}
                  y={0}
                  width={videoWidth}
                  height={videoHeight}
                  opacity={getVideoOpacity(index)}
                  cornerRadius={cornerRadius}
                  shouldPlay={(isActive || shouldAnimate) && getVideoOpacity(index) > 0}
                />
              )
            ))}

            {/* Frame border */}
            <Rect
              width={videoWidth}
              height={videoHeight}
              stroke={videoHover && interactionsEnabled ? "rgba(255, 255, 255, 0.5)" : "rgba(255, 255, 255, 0.2)"}
              strokeWidth={videoHover && interactionsEnabled ? 3 : 2}
              cornerRadius={cornerRadius}
            />
          </Group>

          {/* Horizontal connecting line */}
          {!isTabletPortrait && (
            <Line
              points={isVideoLeft
                ? [videoX, videoY + videoHeight / 2, captionX + captionWidth, videoY + videoHeight / 2]
                : [captionX, videoY + videoHeight / 2, videoX + videoWidth, videoY + videoHeight / 2]
              }
              stroke="#e0e0e0"
              strokeWidth={5}
              opacity={captionOpacity * 0.2}
            />
          )}

          {/* Captions with highlighter */}
          <Group x={captionX} y={captionY} opacity={captionOpacity}>
            {/* Sliding highlighter background */}
            <Group y={highlighterY}>
              {/* Targeting outline for caption */}
              <TargetingOutline
                x={0}
                y={0}
                width={captionWidth}
                height={captionItemHeight}
                cornerRadius={10}
                isActive={hoveredIndex === currentVideo}
                scale={captionOutlineScale}
                opacity={captionOutlineOpacity}
              />

              {/* Highlighter background */}
              <Rect
                width={captionWidth}
                height={captionItemHeight}
                fill="rgba(228, 228, 228, 1)"
                cornerRadius={10}
                shadowColor="rgba(0,0,0,0.25)"
                shadowBlur={2}
                shadowOffset={{ x: 1, y: 1 }}
              />

              {/* Progress bar */}
              <Rect
                x={0}
                y={captionItemHeight - 5}
                width={captionWidth * progress}
                height={5}
                fill="rgba(82, 156, 156, 1)"
              />
            </Group>

            {/* Caption buttons */}
            {headlines.map((headline, i) => (
              <CaptionButton
                key={i}
                x={0}
                y={i * 88}
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
          </Group>
        </Layer>
      </Stage>

      {/* Konva badge */}
      <div
        style={{
          position: 'absolute',
          bottom: 20,
          right: 20,
          background: 'rgba(0, 0, 0, 0.6)',
          color: '#3fd1c7',
          padding: '8px 16px',
          borderRadius: 8,
          fontSize: 14,
          fontFamily: 'Inter, sans-serif',
          fontWeight: 600,
          letterSpacing: 1,
          pointerEvents: 'none',
          zIndex: 100,
          backdropFilter: 'blur(4px)',
          border: '1px solid rgba(63, 209, 199, 0.3)'
        }}
      >
        ▲ KONVA {variant.toUpperCase()}
      </div>
    </div>
  );
};

export default KonvaMedicalSection;
