import React, { useRef, useEffect, useState } from 'react';
import ScrollSection from './ScrollSection';

export default function SectionManager({ sections }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const sectionRefs = useRef([]);

  useEffect(() => {
    // Single shared IntersectionObserver for all sections
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = sectionRefs.current.indexOf(entry.target);
            if (idx !== -1) setCurrentIdx(idx);
          }
        });
      },
      { threshold: 0.5 }
    );

    sectionRefs.current.forEach((ref) => {
      if (ref instanceof Element) {
        observer.observe(ref);
      }
    });

    return () => observer.disconnect();
  }, [sections.length]);

  return (
    <>
      {sections.map((section, idx) => {
        // Always render all sections so the manual navigation buttons can jump reliably
        // Set dark background for medical sections to prevent white flash
        const isMedicalSection = section.name === 'two' || section.name === 'three';
        const background = isMedicalSection ? '#1c3424' : undefined;
        
        return (
          <ScrollSection
            key={section.name}
            name={section.name}
            background={background}
          >
            {({ inView, ref }) => {
              sectionRefs.current[idx] = ref;
              const SectionComponent = section.component;
              return <SectionComponent inView={inView} sectionRef={ref} />;
            }}
          </ScrollSection>
        );
      })}
    </>
  );
} 