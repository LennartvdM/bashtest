// redeploy marker: 2025-10-31T00:00:00Z
import React from 'react';
import { useMedicalSection } from '../../hooks/useMedicalSection.jsx';
import MedicalTabletLayout from './MedicalTabletLayout';
import MedicalDesktopLayout from './MedicalDesktopLayout';

const MedicalSection = ({ inView, sectionRef, variant = 'v2' }) => {
  const state = useMedicalSection({ inView, variant });

  if (state.isTabletLayout) {
    return <MedicalTabletLayout {...state} sectionRef={sectionRef} />;
  }

  return <MedicalDesktopLayout {...state} sectionRef={sectionRef} />;
};

export default MedicalSection;
