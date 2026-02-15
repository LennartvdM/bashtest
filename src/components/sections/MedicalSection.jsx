// redeploy marker: 2025-10-31T00:00:00Z
import React from 'react';
import { useMedicalSection } from './medical/useMedicalSection.jsx';
import MedicalTabletLayout from './medical/MedicalTabletLayout';
import MedicalDesktopLayout from './medical/MedicalDesktopLayout';

const MedicalSection = ({ inView, sectionRef, variant = 'v2' }) => {
  const state = useMedicalSection({ inView, variant });

  if (state.isTabletLayout) {
    return <MedicalTabletLayout {...state} sectionRef={sectionRef} />;
  }

  return <MedicalDesktopLayout {...state} sectionRef={sectionRef} />;
};

export default MedicalSection;
