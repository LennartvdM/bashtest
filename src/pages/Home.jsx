import React from 'react';
import ScrollSnap from '../components/ScrollSnap';
import SectionManager from '../components/SectionManager';
import HeroSection from '../components/sections/HeroSection';
import ProjectsSection from '../components/sections/ProjectsSection';
import ContactSection from '../components/sections/ContactSection';
import MedicalSectionV2 from '../components/sections/MedicalSectionV2';
import MedicalSectionV3 from '../components/sections/MedicalSectionV3';

const sections = [
  { name: 'one', component: HeroSection },
  { name: 'two', component: MedicalSectionV2 },
  { name: 'three', component: MedicalSectionV3 },
  { name: 'four', component: ProjectsSection },
  { name: 'five', component: ContactSection },
];

const Home = () => {
  return (
    <ScrollSnap>
      <SectionManager sections={sections} />
    </ScrollSnap>
  );
};

export default Home; 