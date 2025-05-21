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
      if (ref && observers[idx] && ref instanceof Element) observers[idx].observe(ref);
    });
    return () => {
      observers.forEach((observer, idx) => {
        if (observer && sectionRefs.current[idx] && sectionRefs.current[idx] instanceof Element) observer.disconnect();
      });
    };
  }, [sections.length]);

  return (
    <>
      {sections.map((section, idx) => {
        // Render all sections for scroll-snap, but only activate current/adjacent
        const active = Math.abs(idx - currentIdx) <= 1;
        return (
          <ScrollSection
            key={section.name}
            name={section.name}
          >
            {({ inView, ref }) => {
              sectionRefs.current[idx] = ref;
              const SectionComponent = section.component;
              return <SectionComponent inView={inView} sectionRef={ref} active={active} />;
            }}
          </ScrollSection>
        );
      })}
    </>
  );
} 