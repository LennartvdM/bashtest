import React from 'react';
import { IntroSlide } from 'neoflix-intro-card';
import { useTabletLayout } from '../../hooks/useTabletLayout';

const IntroSection = () => {
  const { isDesktop, isTablet, isTouchDevice, width } = useTabletLayout();

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
