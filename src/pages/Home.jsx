import React from 'react';
import ScrollSnap from '../components/ScrollSnap';
import HeroSection from '../components/sections/HeroSection';
import SkillsSection from '../components/sections/SkillsSection';
import ProjectsSection from '../components/sections/ProjectsSection';
import ContactSection from '../components/sections/ContactSection';

const Home = () => {
  return (
    <ScrollSnap>
      <HeroSection />
      <SkillsSection />
      <ProjectsSection />
      <ContactSection />
    </ScrollSnap>
  );
};

export default Home; 