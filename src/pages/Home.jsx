import React, { lazy, Suspense } from 'react';
import ScrollSnap from '../components/ScrollSnap';
import SectionManager from '../components/SectionManager';

// Eagerly load the hero section for fast initial paint
import HeroSection from '../components/sections/HeroSection';

// Lazy load heavy sections to reduce initial bundle and defer loading
const MedicalSectionV2 = lazy(() => import('../components/sections/MedicalSectionV2'));
const MedicalSectionV3 = lazy(() => import('../components/sections/MedicalSectionV3'));
const WorldMapSection = lazy(() => import('../components/sections/WorldMapSection'));
const ContactSection = lazy(() => import('../components/sections/ContactSection'));

// Wrapper component that provides Suspense boundary for lazy sections
const LazySection = ({ component: Component, ...props }) => (
  <Suspense fallback={<div style={{ width: '100%', height: '100%', background: '#1c3424' }} />}>
    <Component {...props} />
  </Suspense>
);

// Create wrapped versions of lazy components
const LazyMedicalV2 = (props) => <LazySection component={MedicalSectionV2} {...props} />;
const LazyMedicalV3 = (props) => <LazySection component={MedicalSectionV3} {...props} />;
const LazyWorldMap = (props) => <LazySection component={WorldMapSection} {...props} />;
const LazyContact = (props) => <LazySection component={ContactSection} {...props} />;

const sections = [
  { name: 'one', component: HeroSection },
  { name: 'two', component: LazyMedicalV2 },
  { name: 'three', component: LazyMedicalV3 },
  { name: 'four', component: LazyWorldMap },
  { name: 'five', component: LazyContact },
];

const Home = () => {
  return (
    <ScrollSnap>
      <SectionManager sections={sections} />
    </ScrollSnap>
  );
};

export default Home; 