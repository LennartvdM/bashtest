import React from 'react';
import MedicalCarousel from '../MedicalCarousel';

const MedicalSection = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-700 to-slate-600 text-slate-200 flex items-center justify-center">
      <MedicalCarousel />
    </div>
  );
};

export default MedicalSection; 