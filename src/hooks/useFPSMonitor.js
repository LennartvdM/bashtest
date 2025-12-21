import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Hook for monitoring FPS (frames per second) with historical data
 * @param {Object} options
 * @param {number} options.historyLength - Number of FPS samples to keep (default: 60)
 * @param {number} options.sampleInterval - How often to sample FPS in ms (default: 100)
 * @param {boolean} options.enabled - Whether monitoring is active (default: true)
 * @returns {Object} { fps, avgFps, minFps, maxFps, history, isMonitoring }
 */
export function useFPSMonitor({
  historyLength = 60,
  sampleInterval = 100,
  enabled = true
} = {}) {
  const [fps, setFps] = useState(0);
  const [history, setHistory] = useState(() => new Array(historyLength).fill(0));
  const [stats, setStats] = useState({ avg: 0, min: 0, max: 0 });

  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());
  const rafIdRef = useRef(null);
  const intervalIdRef = useRef(null);

  // Frame counter - runs every animation frame
  const countFrame = useCallback(() => {
    frameCountRef.current++;
    rafIdRef.current = requestAnimationFrame(countFrame);
  }, []);

  // Calculate FPS from frame count
  const calculateFPS = useCallback(() => {
    const now = performance.now();
    const elapsed = now - lastTimeRef.current;

    if (elapsed > 0) {
      const currentFps = Math.round((frameCountRef.current * 1000) / elapsed);

      setFps(currentFps);
      setHistory(prev => {
        const newHistory = [...prev.slice(1), currentFps];

        // Calculate stats from history
        const validSamples = newHistory.filter(v => v > 0);
        if (validSamples.length > 0) {
          const avg = Math.round(validSamples.reduce((a, b) => a + b, 0) / validSamples.length);
          const min = Math.min(...validSamples);
          const max = Math.max(...validSamples);
          setStats({ avg, min, max });
        }

        return newHistory;
      });
    }

    frameCountRef.current = 0;
    lastTimeRef.current = now;
  }, []);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    // Start frame counting
    rafIdRef.current = requestAnimationFrame(countFrame);

    // Sample FPS at regular intervals
    intervalIdRef.current = setInterval(calculateFPS, sampleInterval);

    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
      }
    };
  }, [enabled, countFrame, calculateFPS, sampleInterval]);

  return {
    fps,
    avgFps: stats.avg,
    minFps: stats.min,
    maxFps: stats.max,
    history,
    isMonitoring: enabled
  };
}

export default useFPSMonitor;
