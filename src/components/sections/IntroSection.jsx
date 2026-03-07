import React from 'react';
import { IntroSlide } from 'neoflix-intro-card';
import { useTabletLayout } from '../../hooks/useTabletLayout';

const IntroSection = ({ inView }) => {
  const { isTablet, isTouchDevice, width } = useTabletLayout();

  // Unmount entirely when off-screen so returning gives a fresh animation
  // instead of a jarring reset of the completed state.
  if (!inView) return null;

  let variant = 'desktop';
  if (isTouchDevice && width < 600) {
    variant = 'mobile';
  } else if (isTablet) {
    variant = 'tablet';
  }

  return (
    <IntroSlide
      variant={variant}
      fullHeight={false}
      style={{ width: '100%', height: '100%' }}
    />
  );
};

export default IntroSection;
