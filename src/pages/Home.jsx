import React from 'react';
import ScrollSnap from '../components/ScrollSnap';
import ScrollSection from '../components/ScrollSection';
import HeroSection from '../components/sections/HeroSection';
import SkillsSection from '../components/sections/SkillsSection';
import ProjectsSection from '../components/sections/ProjectsSection';
import ContactSection from '../components/sections/ContactSection';
import MedicalSection from '../components/sections/MedicalSection';

const Home = () => {
  return (
    <ScrollSnap>
      <ScrollSection name="one">{({ inView, ref }) => <HeroSection inView={inView} sectionRef={ref} />}</ScrollSection>
      <ScrollSection name="two">{({ inView, ref }) => <SkillsSection inView={inView} sectionRef={ref} />}</ScrollSection>
      <ScrollSection name="three">{({ inView, ref }) => <MedicalSection inView={inView} sectionRef={ref} />}</ScrollSection>
      <ScrollSection name="four">{({ inView, ref }) => <ProjectsSection inView={inView} sectionRef={ref} />}</ScrollSection>
      <ScrollSection name="five">{({ inView, ref }) => <ContactSection inView={inView} sectionRef={ref} />}</ScrollSection>
    </ScrollSnap>
  );
};

export default Home; 