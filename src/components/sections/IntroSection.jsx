import React, { useState, useCallback } from 'react';
import { IntroSlide, CalibrationToolbox } from 'neoflix-intro-card';
import { useTabletLayout } from '../../hooks/useTabletLayout';

const DEV_MODE = import.meta.env.DEV;

const IntroSection = () => {
  const { isDesktop, isTablet, isTouchDevice, width } = useTabletLayout();
  const [calibration, setCalibration] = useState(null);
  const [replayKey, setReplayKey] = useState(0);

  const handleCalibrationChange = useCallback((params) => {
    const { _replayKey, ...rest } = params;
    if (_replayKey !== undefined && _replayKey !== replayKey) {
      setReplayKey(_replayKey);
    }
    setCalibration(rest);
  }, [replayKey]);

  let variant = 'desktop';
  if (isTouchDevice && width < 600) {
    variant = 'mobile';
  } else if (isTablet) {
    variant = 'tablet';
  }

  return (
    <>
      <IntroSlide
        key={replayKey}
        variant={variant}
        fullHeight={false}
        style={{ width: '100%', height: '100%' }}
        calibration={calibration}
      />
      {DEV_MODE && <CalibrationToolbox onChange={handleCalibrationChange} />}
    </>
  );
};

export default IntroSection;
