import React, { useRef, useEffect, useState } from 'react';
import ScrollSection from './ScrollSection';

export default function SectionManager({ sections }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const sectionRefs = useRef([]);

  useEffect(() => {
    const observers = sectionRefs.current.map((ref, idx) => {
      if (!ref || !(ref instanceof Element)) return null;
      return new window.IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setCurrentIdx(idx);
        },
        { threshold: 0.5 }
      );
    });
    
    sectionRefs.current.forEach((ref, idx) => {
      if (ref && observers[idx] && ref instanceof Element) {
        observers[idx].observe(ref);
      }
    });
    
    return () => {
      observers.forEach(observer => observer?.disconnect());
    };
  }, [sections.length]);

  return (
    <>
      {sections.map((section, idx) => {
        // Always render all sections for scroll-snap
        // Let the section itself handle visibility
        return (
          <ScrollSection
            key={section.name}
            name={section.name}
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