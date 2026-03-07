import React, { useState, useEffect, useRef } from 'react';
import { IntroSlide } from 'neoflix-intro-card';
import { useTabletLayout } from '../../hooks/useTabletLayout';

const IntroSection = ({ inView }) => {
  const { isTablet, isTouchDevice, width } = useTabletLayout();
  const [mountKey, setMountKey] = useState(0);
  const hasLeft = useRef(false);

  // Increment key each time the slide re-enters view after having left
  useEffect(() => {
    if (!inView) {
      hasLeft.current = true;
    } else if (inView && hasLeft.current) {
      hasLeft.current = false;
      setMountKey((k) => k + 1);
    }
  }, [inView]);

  let variant = 'desktop';
  if (isTouchDevice && width < 600) {
    variant = 'mobile';
  } else if (isTablet) {
    variant = 'tablet';
  }

  return (
    <IntroSlide
      key={mountKey}
      variant={variant}
      fullHeight={false}
      style={{ width: '100%', height: '100%' }}
    />
  );
};

export default IntroSection;
