import { useCallback, useRef, useEffect } from 'react';

/**
 * Returns a debounced version of the callback.
 * The debounced function delays invoking callback until after `delay` ms
 * have elapsed since the last time the debounced function was invoked.
 *
 * @param {Function} callback - The function to debounce
 * @param {number} delay - Delay in milliseconds (default: 150ms)
 * @returns {Function} - Debounced function
 */
export function useDebounce(callback, delay = 150) {
  const timeoutRef = useRef(null);
  const callbackRef = useRef(callback);

  // Keep callback ref up to date
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return useCallback((...args) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      callbackRef.current(...args);
    }, delay);
  }, [delay]);
}

/**
 * Returns a throttled version of the callback.
 * The throttled function only invokes callback at most once per `delay` ms.
 * Uses leading edge (first call executes immediately).
 *
 * @param {Function} callback - The function to throttle
 * @param {number} delay - Minimum time between invocations in ms (default: 100ms)
 * @returns {Function} - Throttled function
 */
export function useThrottle(callback, delay = 100) {
  const lastCallRef = useRef(0);
  const callbackRef = useRef(callback);

  // Keep callback ref up to date
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  return useCallback((...args) => {
    const now = Date.now();
    if (now - lastCallRef.current >= delay) {
      lastCallRef.current = now;
      callbackRef.current(...args);
    }
  }, [delay]);
}

/**
 * Returns a throttled version with trailing edge execution.
 * Ensures the last call in a burst is always executed.
 *
 * @param {Function} callback - The function to throttle
 * @param {number} delay - Minimum time between invocations in ms (default: 100ms)
 * @returns {Function} - Throttled function with trailing edge
 */
export function useThrottleWithTrailing(callback, delay = 100) {
  const lastCallRef = useRef(0);
  const timeoutRef = useRef(null);
  const callbackRef = useRef(callback);

  // Keep callback ref up to date
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return useCallback((...args) => {
    const now = Date.now();
    const timeSinceLastCall = now - lastCallRef.current;

    if (timeSinceLastCall >= delay) {
      // Execute immediately
      lastCallRef.current = now;
      callbackRef.current(...args);
    } else {
      // Schedule trailing edge execution
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        lastCallRef.current = Date.now();
        callbackRef.current(...args);
      }, delay - timeSinceLastCall);
    }
  }, [delay]);
}

export default useDebounce;
