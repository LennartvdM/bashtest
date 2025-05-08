import React from 'react';
import ScrollSnap from '../components/ScrollSnap';
import HeroSection from '../components/sections/HeroSection';
import SkillsSection from '../components/sections/SkillsSection';
import ProjectsSection from '../components/sections/ProjectsSection';
import ContactSection from '../components/sections/ContactSection';
import MedicalSection from '../components/sections/MedicalSection';

const Home = () => {
  return (
    <ScrollSnap>
      <HeroSection />
      <SkillsSection />
      <MedicalSection />
      <ProjectsSection />
      <ContactSection />
    </ScrollSnap>
  );
};

export default Home; 