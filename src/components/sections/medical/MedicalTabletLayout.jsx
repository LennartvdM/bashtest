import React from 'react';
import TabletBlurBackground from '../../TabletBlurBackground';
import TabletMedicalCarousel from '../../TabletMedicalCarousel';
import TabletTravellingBar from '../../TabletTravellingBar';
import AutoFitHeading from '../../AutoFitHeading';

export default function MedicalTabletLayout({
  sectionRef,
  layoutKey,
  isTabletLandscape,
  isRotating,
  sectionState,
  disableTransitions,
  shouldTransition,
  // config
  blurVideos,
  mainVideos,
  header,
  // visibility
  headerVisible,
  videoVisible,
  captionsVisible,
  // state
  currentVideo,
  isPaused,
  barKey,
  // derived
  videoOffscreenTransform,
  TABLET_AUTOPLAY_MS,
  // handlers
  handleTabletCarouselChange,
  handleTabletPauseChange,
  handleTabletBarSelect,
  tabletCaptions,
}) {
  const isActive = sectionState === 'active';
    // During rotation, disable all transitions for smooth experience
  const transitionsDisabled = disableTransitions || isRotating;

  // Responsive sizing based on orientation
  // Portrait: taller viewport, use height-based sizing
  // Landscape: wider viewport, constrain width more
  const contentWidth = isTabletLandscape
    ? 'min(75vw, 520px)' // Landscape: narrower to leave room
    : 'min(92vw, clamp(260px, 60vh, 480px))'; // Portrait: use more width
  const captionWidth = isTabletLandscape
    ? 'min(75vw, 520px)'
    : 'min(520px, 90vw)';
  const contentGap = isTabletLandscape ? 16 : 24;

  return (
    <div
      key={layoutKey}
      ref={sectionRef}
      className="w-full h-screen relative overflow-hidden"
      style={{
        background: '#1c3424',
        // Smooth transition when NOT rotating
        transition: isRotating ? 'none' : 'all 0.3s ease-out',
      }}
    >
      <TabletBlurBackground blurVideos={blurVideos} current={currentVideo} fadeDuration={1.2} />

      {/* Foreground content wrapper - CSS Grid for smooth orientation adaptation */}
      <div style={{
        paddingTop: 'var(--nav-h, 60px)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        minHeight: 'calc(100dvh - var(--nav-h, 60px))',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: contentGap,
        position: 'relative',
        zIndex: 1,
        // Smooth gap/sizing transition (disabled during rotation)
        transition: isRotating ? 'none' : 'gap 0.3s ease-out',
      }}>

        {/* Header */}
        <div style={{
          width: contentWidth,
          margin: '0 auto',
          textAlign: 'left',
          opacity: headerVisible ? 1 : 0,
          transition: transitionsDisabled ? 'none' : (shouldTransition ? 'opacity 2.25s ease, width 0.3s ease-out' : 'width 0.3s ease-out'),
        }}>
          <div style={{ width: '70%', margin: 0 }}>
            <AutoFitHeading
              lines={[
                header.line1suffix ? (
                  <span key="combined-line">{header.line1}{header.line1suffix}<span style={{ color: '#3fd1c7' }}>{header.line2highlight}</span>{header.line2suffix}</span>
                ) : header.line1,
                header.line1suffix ? header.line3 : (
                  <span key="highlight-line">{header.line2prefix}<span style={{ color: '#3fd1c7' }}>{header.line2highlight}</span>{header.line2suffix}</span>
                ),
                header.line1suffix ? header.line4 : header.line3
              ].filter(Boolean)}
              minPx={isTabletLandscape ? 22 : 26}
              maxPx={isTabletLandscape ? 36 : 44}
              lineHeight={1.2}
              lineAligns={['left','left','left']}
              visible={headerVisible}
              commaStagger
              staggerDelayMs={1125}
              postGroupStartIndex={1}
            />
          </div>
        </div>

        {/* Video Container */}
        <div style={{
          width: contentWidth,
          transition: isRotating ? 'none' : 'width 0.3s ease-out',
        }}>
          <div style={{
            width: '100%',
            aspectRatio: '3 / 2',
            borderRadius: 16,
            overflow: 'hidden',
            position: 'relative',
            opacity: videoVisible ? 1 : 0,
            transition: transitionsDisabled
              ? 'none'
              : (videoVisible ? 'opacity 2.25s ease, transform 2.25s cubic-bezier(0.4,0,0.2,1)' : 'none'),
            transform: videoVisible ? 'translate3d(0,0,0)' : videoOffscreenTransform,
          }}>
            <TabletMedicalCarousel
              videos={mainVideos}
              current={currentVideo}
              onChange={handleTabletCarouselChange}
              onPauseChange={handleTabletPauseChange}
              style={{ width: '100%', height: '100%' }}
            />
          </div>
        </div>

        {/* Captions */}
        <div style={{
          width: captionWidth,
          margin: '0 auto',
          textAlign: 'center',
          position: 'relative',
          opacity: captionsVisible ? 1 : 0,
          transition: transitionsDisabled
            ? 'none'
            : (captionsVisible ? 'opacity 0.5s ease, width 0.3s ease-out' : 'width 0.3s ease-out'),
        }}>
          <TabletTravellingBar
            captions={tabletCaptions}
            current={currentVideo}
            onSelect={handleTabletBarSelect}
            style={{ margin: '0 auto', background: 'none' }}
            durationMs={TABLET_AUTOPLAY_MS}
            paused={isPaused}
            animationKey={barKey}
            captionsVisible={captionsVisible}
            shouldTransition={!transitionsDisabled}
          />
        </div>
      </div>
    </div>
  );
}
