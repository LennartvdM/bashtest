import React from 'react';
import MedicalCarousel from '../MedicalCarousel';
import VideoManager from '../VideoManager';
import AutoFitHeading from '../AutoFitHeading';
import { BLUR_VIDEO_BASE_STYLE, VIDEO_OVERLAY_STYLE, VIDEO_INNER_CONTAINER_STYLE, VIDEO_CONTROLS_HIDDEN_CSS } from './MedicalSection.styles';
import { BASE_INDEX } from './MedicalSection.data';

export default function MedicalDesktopLayout({
  sectionRef,
  layoutKey,
  sectionState,
  isTabletLayout,
  isLandscapeTablet,
  isRotating,
  // config
  blurVideos,
  headlines,
  mainVideos,
  CookieCutterBand,
  header,
  // visibility
  headerVisible,
  videoVisible,
  captionsVisible,
  // measurements
  rightRect,
  rightReady,
  headerHeight,
  collectionTop,
  videoAndCaptionTop,
  navbarHeight,
  // interaction
  isPaused,
  hoveredIndex,
  interactionsEnabled,
  // state
  currentVideo,
  setVideoCenter,
  barKey,
  outlineFullOpacity,
  highlightOutlineFullOpacity,
  disableTransitions,
  // derived
  safeVideoHover,
  safeHoveredIndex,
  shouldTransition,
  shouldAnimate,
  isActive,
  isVideoLeft,
  bandWidth,
  bandHeight,
  cutoutWidth,
  gap,
  videoHeight,
  videoContainerWidth,
  captionContainerWidth,
  videoOffscreenTransform,
  captionOffscreenTransform,
  isNudging,
  gantryFrameStyle,
  // refs
  videoContainerRef,
  rightRowRefs,
  headerRef,
  videoAnchorRef,
  captionRef,
  contentAnchorRef,
  // handlers
  handleHover,
  handleHoverEnd,
  handleBarEnd,
  handleVideoHover,
  handleTabletCarouselChange,
  handleLandscapeTabletCaptionClick,
  handleLandscapeTabletTouchStart,
  handleLandscapeTabletTouchEnd,
}) {
  return (
    <div
      key={layoutKey}
      ref={sectionRef}
      className="h-screen w-full relative overflow-hidden"
      style={{
        opacity: sectionState === 'idle' || sectionState === 'cleaned' ? 0 : 1,
        transition: 'opacity 0.3s ease',
        paddingTop: isTabletLayout ? 16 : 0
      }}
    >
      <style>{VIDEO_CONTROLS_HIDDEN_CSS}</style>
      {/* Always-visible base blur video */}
      <div
        className="absolute inset-0 flex items-center justify-center opacity-100 z-0"
        style={BLUR_VIDEO_BASE_STYLE}
      >
        <div style={VIDEO_INNER_CONTAINER_STYLE}>
          <VideoManager
            src={blurVideos[BASE_INDEX].video}
            isPlaying={isActive || shouldAnimate}
            className="w-full h-full object-cover"
            controls={false}
            preload="metadata"
            tabIndex="-1"
            aria-hidden="true"
            draggable="false"
            disablePictureInPicture
            disableRemotePlayback
            controlsList="nodownload nofullscreen noremoteplayback"
            onContextMenu={(e) => e.preventDefault()}
          />
          <div style={VIDEO_OVERLAY_STYLE} />
        </div>
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
              ...BLUR_VIDEO_BASE_STYLE,
              transition: shouldTransition ? 'opacity 700ms ease' : 'none'
            }}
          >
            <div style={VIDEO_INNER_CONTAINER_STYLE}>
              <VideoManager
                src={video.video}
                isPlaying={(isActive || shouldAnimate) && (index === 0 ? currentVideo === 0 : currentVideo <= 1)}
                className="w-full h-full object-cover"
                controls={false}
                preload="metadata"
                tabIndex="-1"
                aria-hidden="true"
                draggable="false"
                disablePictureInPicture
                disableRemotePlayback
                controlsList="nodownload nofullscreen noremoteplayback"
                onContextMenu={(e) => e.preventDefault()}
              />
              <div style={VIDEO_OVERLAY_STYLE} />
            </div>
          </div>
        )
      ))}
      {/* Header on tablet: render above the carousel */}
      {isTabletLayout && (
        <div
          ref={headerRef}
          data-testid="header-frame-tablet"
          className="header-frame-tablet"
          style={{
            position: 'relative',
            width: 'min(92vw, clamp(260px, 60vh, 480px))',
            background: 'none',
            zIndex: 20,
            opacity: headerVisible ? 1 : 0,
            margin: '0 auto 24px',
            transition: shouldTransition ? (headerVisible ? 'opacity 1.2s ease' : 'none') : 'none'
          }}
        >
          <div style={{ width: '100%', display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-start' }}>
            <h2 style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 40,
              fontWeight: 700,
              letterSpacing: -2,
              lineHeight: 1.2,
              color: '#fff',
              margin: 0,
              textShadow: [
                '0 4px 32px rgba(0,0,0,0.22)',
                '0 2px 16px rgba(0,0,0,0.18)',
                '0 1px 2px rgba(0,0,0,0.12)',
                '0 0px 1px rgba(0,0,0,0.18)',
                '0 0px 8px rgba(82,156,156,0.10)'
              ].join(', '),
              textAlign: 'left',
              width: '100%'
            }}>
              <span style={{ opacity: headerVisible ? 1 : 0, transition: shouldTransition ? 'opacity 1.2s ease' : 'none' }}>{header.line1}</span>
              {header.line1suffix ? (
                <span style={{ opacity: headerVisible ? 1 : 0, transition: shouldTransition ? 'opacity 1.2s ease 0.6s' : 'none' }}>{header.line1suffix}</span>
              ) : (
                <br />
              )}
              <span style={{ opacity: headerVisible ? 1 : 0, color: '#3fd1c7', transition: shouldTransition ? 'opacity 1.2s ease 0.6s' : 'none' }}>{header.line2highlight}</span>
              <span style={{ opacity: headerVisible ? 1 : 0, transition: shouldTransition ? 'opacity 1.2s ease 0.6s' : 'none' }}>{header.line2suffix}</span>
              <br />
              <span style={{ opacity: headerVisible ? 1 : 0, transition: shouldTransition ? 'opacity 1.2s ease 0.6s' : 'none' }}>{header.line3}</span>
              {header.line4 && (
                <>
                  <br />
                  <span style={{ opacity: headerVisible ? 1 : 0, transition: shouldTransition ? 'opacity 1.2s ease 0.6s' : 'none' }}>{header.line4}</span>
                </>
              )}
            </h2>
          </div>
        </div>
      )}
      {/* Foreground content: flex row (desktop) or column (tablet) */}
      <div style={{
        position: 'relative',
        width: '100%',
        height: isTabletLayout ? 'auto' : bandHeight,
        display: 'flex',
        flexDirection: isTabletLayout ? 'column' : 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: isTabletLayout ? 32 : 0,
        zIndex: 20,
      }}>
        {/* Spacer (centered) */}
        <div
          data-testid="spacer"
          className="spacer"
          style={{
            position: 'absolute',
            left: '50%',
            top: collectionTop,
            width: 40,
            height: headerHeight + gap + videoHeight,
            transform: 'translateX(-50%)',
            background: 'rgba(255, 0, 0, 0)',
            pointerEvents: 'none',
            zIndex: 10,
            display: isTabletLayout ? 'none' : 'block',
          }}
        />
        {/* Video Anchor (now contains cookiecutter and video container) */}
        <div
          ref={videoAnchorRef}
          data-testid="video-anchor"
          style={{
            position: isTabletLayout ? 'relative' : 'absolute',
            ...(isTabletLayout
              ? {}
              : isVideoLeft
                ? { left: 'calc(50% + 20px)' }
                : { right: 'calc(50% + 20px)' }),
            top: isTabletLayout ? 'auto' : videoAndCaptionTop,
            width: videoContainerWidth,
            maxWidth: isTabletLayout ? '90vw' : 480,
            height: isTabletLayout ? 'auto' : videoHeight,
            aspectRatio: isTabletLayout ? '3 / 2' : undefined,
            opacity: 1,
            pointerEvents: 'none',
            zIndex: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: isTabletLayout ? '0 auto' : undefined,
          }}
        >
          {/* CookieCutterBand: sibling to video container */}
          {shouldTransition && (
            <div style={{
              position: 'absolute',
              ...(isVideoLeft ? { left: 0 } : { right: 0 }),
              top: 0,
              width: bandWidth,
              height: bandHeight,
              zIndex: 1,
              pointerEvents: 'none',
              transition: isNudging
                ? 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) 0.3s'
                : 'transform 1.5s cubic-bezier(0.4,0,0.2,1), opacity 1.5s ease',
              transform: safeVideoHover
                ? 'translateY(-12px)'
                : videoVisible
                  ? 'translateX(0)'
                  : videoOffscreenTransform,
              opacity: videoVisible ? 0.4 : 0,
              mixBlendMode: 'screen'
            }}>
              <CookieCutterBand
                bandColor="#f0f4f6"
                bandHeight={bandHeight}
                bandWidth={bandWidth}
              />
            </div>
          )}
          {/* Gantry Frame: contains only the video container now */}
          {shouldTransition && (
            <div
              className="video-gantry-frame"
              data-section-inactive={!shouldTransition}
              style={{
                ...gantryFrameStyle,
                position: isTabletLayout ? 'relative' : 'absolute',
                ...(isTabletLayout
                  ? {}
                  : isVideoLeft
                    ? { left: 0 }
                    : { right: 0 }),
                top: isTabletLayout ? 'auto' : 0,
                zIndex: 3,
                pointerEvents: 'auto'
              }}
            >
            {/* Targeting Outline Animation */}
            <div
              className="target-outline"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                border: '3px solid white',
                borderRadius: 16,
                pointerEvents: 'none',
                boxSizing: 'border-box',
                transform: safeVideoHover ? 'scale(1)' : 'scale(1.08)',
                opacity: safeVideoHover ? (outlineFullOpacity ? 0.9 : 0.4) : 0,
                transition: shouldTransition ? [
                  safeVideoHover
                    ? 'transform 0.9s cubic-bezier(0.4, 0, 0.2, 1) 0.2s'
                    : 'transform 0.9s cubic-bezier(0.4, 0, 0.2, 1)',
                  outlineFullOpacity
                    ? 'opacity 0.1s cubic-bezier(.4,2,.6,1)'
                    : safeVideoHover
                    ? 'opacity 0.2s cubic-bezier(.4,0,.2,1) 0.2s'
                    : 'opacity 0.13s'
                ].join(', ') : 'none',
                zIndex: 10
              }}
            />
            {/* Video Frame (no hover transform or border) */}
            <div
              data-testid="video-frame"
              className="video-frame"
              style={{
                position: isTabletLayout ? 'relative' : 'absolute',
                left: isTabletLayout ? 'auto' : 0,
                top: isTabletLayout ? 'auto' : 0,
                width: '100%',
                height: isTabletLayout ? 'auto' : '100%',
                aspectRatio: isTabletLayout ? '3 / 2' : undefined,
                zIndex: 3,
                background: 'none',
                borderRadius: 16,
                overflow: 'hidden',
                border: 'none',
                boxShadow: 'none',
                opacity: shouldTransition ? (videoVisible ? 1 : 0) : 0, // Always hide when not transitioning
                transition: shouldTransition ? 'opacity 1.5s ease' : 'none !important'
              }}
              ref={videoContainerRef}
            >
              <MedicalCarousel
                current={currentVideo}
                setVideoCenter={setVideoCenter}
                hoveredIndex={safeHoveredIndex}
                isActive={safeHoveredIndex === currentVideo || isPaused}
                videoHover={safeVideoHover}
                setVideoHover={handleVideoHover}
                interactionsEnabled={interactionsEnabled}
                videos={mainVideos}
                enableTouchNavigation={isLandscapeTablet}
                onTouchChange={handleTabletCarouselChange}
              />
            </div>
          </div>
          )}
        </div>
        {/* Video Anchor (positioning reference) */}
        <div
          data-testid="video-anchor-ref"
          style={{
            position: 'absolute',
            ...(isVideoLeft
              ? { left: 'calc(50% + 20px)' }
              : { right: 'calc(50% + 20px)' }),
            top: videoAndCaptionTop,
            width: 480,
            height: videoHeight,
            opacity: 0,
            pointerEvents: 'none',
            zIndex: 1,
          }}
        />
        {/* Caption Anchor with entrance animation */}
        <div
          className="caption-anchor"
          style={{
            position: isTabletLayout ? 'relative' : 'absolute',
            ...(isTabletLayout
              ? {}
              : isVideoLeft
                ? { right: 'calc(50% + 20px)' }
                : { left: 'calc(50% + 20px)' }),
            top: isTabletLayout ? 'auto' : videoAndCaptionTop,
            width: captionContainerWidth,
            maxWidth: isTabletLayout ? '90vw' : 444,
            height: isTabletLayout ? 'auto' : videoHeight,
            display: 'flex',
            alignItems: isTabletLayout ? 'stretch' : 'center',
            justifyContent: isTabletLayout ? 'flex-start' : 'center',
            zIndex: 20,
            transition: shouldTransition ? (captionsVisible ? 'opacity 0.5s ease' : 'none') : 'none',
            opacity: captionsVisible ? 1 : 0,
            margin: isTabletLayout ? '0 auto' : undefined,
          }}
        >
          {/* Caption Section (centered inside caption anchor) */}
          <div
            ref={captionRef}
            className="MedicalSection-caption-area flex flex-col items-start justify-center"
            data-testid="MedicalSection-caption-area"
            style={{
              maxWidth: isTabletLayout ? '100%' : 520,
              width: isTabletLayout ? '100%' : 'auto',
              marginLeft: 0,
              paddingLeft: 0,
            }}
          >
            <div className="relative flex flex-col gap-2 items-stretch" style={{ width: 'auto', marginLeft: 0, paddingLeft: 0 }}>
              {((rightReady && Number.isFinite(currentVideo) && Number.isFinite(rightRect.top) && Number.isFinite(rightRect.height)) || (isLandscapeTablet && sectionState !== 'idle')) && (
                <>
                  {/* Targeting outline container */}
                  <div
                    className="absolute transition-all duration-700 ease"
                    style={{
                      top: rightRect.top,
                      left: '50%',
                      width: isTabletLayout ? '100%' : 444,
                      height: rightRect.height,
                      transform: 'translateX(-50%)',
                      zIndex: 5,
                      pointerEvents: 'none',
                      transition: shouldTransition ? 'all 700ms ease' : 'none',
                      display: isTabletLayout ? 'none' : undefined, // Only hide for portrait tablet
                    }}
                  >
                    {/* Targeting outline */}
                    <div
                      className="absolute inset-0 transition-all duration-700 ease"
                      style={{
                        border: '3px solid white',
                        borderRadius: 10,
                        mixBlendMode: 'screen',
                        transform: safeHoveredIndex === currentVideo ? 'scale(1)' : 'scale(1.08, 1.3)',
                        transition: shouldTransition ? [
                          safeHoveredIndex === currentVideo
                            ? 'transform 0.9s cubic-bezier(0.4, 0, 0.2, 1) 0.2s'
                            : 'transform 0.9s cubic-bezier(0.4, 0, 0.2, 1)',
                          highlightOutlineFullOpacity
                            ? 'opacity 0.1s cubic-bezier(.4,2,.6,1)'
                            : safeHoveredIndex === currentVideo
                            ? 'opacity 0.33s cubic-bezier(.4,0,.2,1) 0.2s'
                            : 'opacity 0.13s'
                        ].join(', ') : 'none',
                        opacity: (safeHoveredIndex === currentVideo || (isLandscapeTablet && hoveredIndex === null)) ? (highlightOutlineFullOpacity ? 0.9 : 0.4) : 0
                      }}
                    />
                    {/* Highlighter rectangle with horizontal line */}
                    <div
                      className="absolute rounded-xl pointer-events-none"
                      style={{
                        top: 0,
                        height: rightRect.height,
                        width: isTabletLayout ? '100%' : 444,
                        left: 0,
                        paddingLeft: 24,
                        paddingRight: 24,
                        background: (safeHoveredIndex === currentVideo || (isLandscapeTablet && hoveredIndex === null)) ? 'rgba(228,228,228,1)' : 'rgba(232,232,232,1)',
                        borderRadius: 10,
                        boxShadow: (safeHoveredIndex === currentVideo || (isLandscapeTablet && hoveredIndex === null)) ? '1px 1px 2px 0px rgba(0,0,0,0.5)' : '1px 1px 2px 0px rgba(0,0,0,0.25)',
                        opacity: captionsVisible ? 1 : 0,
                        transform: captionsVisible ? 'translate3d(0,0,0)' : (isVideoLeft ? 'translateX(-200px)' : 'translateX(200px)'),
                        transition: shouldTransition
                          ? `top 0.6s cubic-bezier(0.4, 0, 0.2, 1), height 0.6s cubic-bezier(0.4, 0, 0.2, 1), color 0.25s, box-shadow 0.25s, background 0.25s, opacity 1.2s ease, transform 1.2s cubic-bezier(0.4,0,0.2,1)`
                          : 'none',
                        zIndex: 30
                      }}
                    >
                      <div
                        className="absolute pointer-events-none overflow-hidden"
                        style={{
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          borderRadius: 10,
                        }}
                      >
                        {/* Loading Bar */}
                        <div
                          key={barKey}
                          className="absolute left-0 bottom-0 h-[5px]"
                          style={{
                            background: 'rgba(82,156,156,1)',
                            animation: `grow-overflow 7000ms linear forwards`,
                            animationPlayState: isPaused ? 'paused' : 'running',
                            width: '115%',
                          }}
                          onAnimationEnd={handleBarEnd}
                        />
                      </div>
                      {/* Horizontal line - flush with highlighter edge */}
                      <div
                        className="absolute"
                        style={{
                          top: '50%',
                          left: isVideoLeft ? 0 : '100%',
                          width: '100vw',
                          height: 5,
                          background: '#e0e0e0',
                          mixBlendMode: 'screen',
                          pointerEvents: 'none',
                          transform: isVideoLeft ? 'translateY(-50%) translateX(-100%)' : 'translateY(-50%)',
                          opacity: 0.2,
                          display: (isTabletLayout || isLandscapeTablet) ? 'none' : undefined,
                        }}
                      />
                    </div>
                  </div>
                </>
              )}
              {headlines.map((headline, i) => (
                <button
                  key={i}
                  ref={(el) => (rightRowRefs.current[i] = el)}
                  onMouseEnter={interactionsEnabled && !isLandscapeTablet ? () => handleHover(i) : undefined}
                  onMouseLeave={interactionsEnabled && !isLandscapeTablet ? handleHoverEnd : undefined}
                  onClick={interactionsEnabled && isLandscapeTablet ? () => handleLandscapeTabletCaptionClick(i) : undefined}
                  onTouchStart={interactionsEnabled && isLandscapeTablet ? () => handleLandscapeTabletTouchStart(i) : undefined}
                  onTouchEnd={interactionsEnabled && isLandscapeTablet ? handleLandscapeTabletTouchEnd : undefined}
                  className={`relative ${isVideoLeft ? 'text-left' : 'text-right'} py-3 rounded-xl`}
                  style={{
                    display: 'block',
                    maxWidth: isTabletLayout ? '100%' : 480,
                    minWidth: isTabletLayout ? '0px' : 320,
                    width: '100%',
                    paddingLeft: 24,
                    paddingRight: 24,
                    zIndex: 40,
                    cursor: interactionsEnabled ? 'pointer' : 'default',
                    opacity: captionsVisible ? 1 : 0,
                    transform: captionsVisible ? 'translate3d(0,0,0)' : captionOffscreenTransform,
                    transition: shouldTransition
                      ? (captionsVisible
                        ? `transform 1.2s cubic-bezier(0.4,0,0.2,1) ${i * 600}ms, opacity 1.2s ease ${i * 600}ms`
                        : 'none')
                      : 'none'
                  }}
                >
                  <p className={`m-0 ${isVideoLeft ? 'text-left' : 'text-right'} text-2xl leading-tight`} style={{
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 500,
                    letterSpacing: '-0.5px',
                    color:
                      safeHoveredIndex === i
                        ? '#2D6A6A'
                        : currentVideo === i
                        ? '#2a2323'
                        : '#bdbdbd',
                    mixBlendMode:
                      safeHoveredIndex === i
                        ? 'normal'
                        : currentVideo === i
                        ? 'normal'
                        : 'screen',
                    transition: shouldTransition ? 'color 0.6s, transform 0.3s' : 'none',
                    transform: safeHoveredIndex === i ? 'translateY(-1px)' : 'translateY(0)',
                    userSelect: 'none',
                    WebkitUserSelect: 'none'
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
      {/* Header Frame with entrance animation */}
      <div
        ref={headerRef}
        data-testid="header-frame"
        className="header-frame"
        style={{
          position: 'absolute',
          ...(isVideoLeft
            ? { left: `calc(50% + ${gap / 2}px)` }
            : { right: `calc(50% + ${gap / 2}px)` }),
          top: collectionTop,
          width: cutoutWidth,
          background: 'none',
          zIndex: 20,
          transition: shouldTransition ? (headerVisible ? 'opacity 2.25s ease' : 'none') : 'none',
          opacity: headerVisible ? 1 : 0,
        }}
      >
        <div style={{ width: cutoutWidth, display: 'flex', alignItems: isVideoLeft ? 'flex-end' : 'flex-start', justifyContent: isVideoLeft ? 'flex-end' : 'flex-start', marginRight: 0 }}>
          <h2 style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: isLandscapeTablet ? 32 : 48,
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
            alignSelf: isVideoLeft ? 'flex-end' : 'flex-start',
            paddingLeft: 0,
            textAlign: isVideoLeft ? 'right' : 'left',
            width: '100%',
            userSelect: 'none',
            WebkitUserSelect: 'none'
          }}>
            <span
              style={{
                transition: shouldTransition ? 'opacity 2.25s ease' : 'none',
                opacity: headerVisible ? 1 : 0,
              }}
            >
              {header.line1}
            </span>
            {header.line1suffix ? (
              <span
                style={{
                  transition: shouldTransition ? 'opacity 2.25s ease 1.125s' : 'none',
                  opacity: headerVisible ? 1 : 0,
                }}
              >
                {header.line1suffix}
              </span>
            ) : (
              <br />
            )}
            <span
              style={{
                transition: shouldTransition ? 'opacity 2.25s ease 1.125s' : 'none',
                opacity: headerVisible ? 1 : 0,
                color: '#3fd1c7'
              }}
            >
              {header.line2highlight}
            </span>
            <span
              style={{
                transition: shouldTransition ? 'opacity 2.25s ease 1.125s' : 'none',
                opacity: headerVisible ? 1 : 0,
              }}
            >
              {header.line2suffix}
            </span>
            <br />
            <span
              style={{
                transition: shouldTransition ? 'opacity 2.25s ease 1.125s' : 'none',
                opacity: headerVisible ? 1 : 0,
              }}
            >
              {header.line3}
            </span>
            {header.line4 && (
              <>
                <br />
                <span
                  style={{
                    transition: shouldTransition ? 'opacity 2.25s ease 1.125s' : 'none',
                    opacity: headerVisible ? 1 : 0,
                  }}
                >
                  {header.line4}
                </span>
              </>
            )}
          </h2>
        </div>
      </div>
    </div>
  );
}
