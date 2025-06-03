import { useState, useEffect, useRef } from 'react';

export const useSectionLifecycle = (sectionId, inView) => {
  const [sectionState, setSectionState] = useState('idle'); // idle, entering, active, preserving, cleaned
  const cleanupTimerRef = useRef(null);
  const entranceTimerRef = useRef(null);
  const entranceCompleteRef = useRef(false);

  useEffect(() => {
    if (inView && sectionState === 'idle') {
      // Section comes into view
      setSectionState('entering');
      entranceCompleteRef.current = false;
      
      // Clear any existing entrance timer
      if (entranceTimerRef.current) {
        clearTimeout(entranceTimerRef.current);
      }
      
      entranceTimerRef.current = setTimeout(() => {
        entranceCompleteRef.current = true;
        setSectionState('active');
      }, 4000);
    } else if (!inView && (sectionState === 'entering' || sectionState === 'active')) {
      // Section leaves view - start preservation period
      setSectionState('preserving');
      
      if (cleanupTimerRef.current) {
        clearTimeout(cleanupTimerRef.current);
      }
      
      cleanupTimerRef.current = setTimeout(() => {
        setSectionState('cleaned');
      }, 4000);
    } else if (inView && sectionState === 'preserving') {
      if (cleanupTimerRef.current) {
        clearTimeout(cleanupTimerRef.current);
        cleanupTimerRef.current = null;
      }
      setSectionState(entranceCompleteRef.current ? 'active' : 'entering');
    }

    return () => {
      if (cleanupTimerRef.current) {
        clearTimeout(cleanupTimerRef.current);
      }
      if (entranceTimerRef.current) {
        clearTimeout(entranceTimerRef.current);
      }
    };
  }, [inView, sectionState, sectionId]);

  return {
    sectionState,
    isVisible: sectionState !== 'idle' && sectionState !== 'cleaned',
    shouldAnimate: sectionState === 'entering',
    isActive: sectionState === 'active',
    isPreserved: sectionState === 'preserving'
  };
}; 