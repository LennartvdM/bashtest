import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Material Design 3 View Transition wrapper
 * Handles smooth transitions between different pages using the View Transition API
 */
export default function ViewTransition({ children }) {
  const location = useLocation();
  const prevPathname = useRef(location.pathname);
  const isInitialMount = useRef(true);

  useEffect(() => {
    // Skip transition on initial mount
    if (isInitialMount.current) {
      isInitialMount.current = false;
      prevPathname.current = location.pathname;
      return;
    }

    // Only transition if pathname actually changed (not just hash)
    if (prevPathname.current === location.pathname) {
      return;
    }

    // Check if View Transition API is supported
    if (!document.startViewTransition) {
      prevPathname.current = location.pathname;
      return;
    }

    // Start the view transition
    const transition = document.startViewTransition(() => {
      prevPathname.current = location.pathname;
    });

    // Update ref after transition completes
    transition.finished.finally(() => {
      prevPathname.current = location.pathname;
    });
  }, [location.pathname]);

  return children;
}

