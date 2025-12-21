import React, { useState, useEffect, useRef, useCallback } from 'react';

/**
 * FPS Counter with Historical Graph
 * Displays real-time FPS, frame time, and a visual history ticker
 * Only renders in development mode
 */
const FPSCounter = ({
  historyLength = 60,  // Number of historical frames to display
  updateInterval = 100, // How often to update the display (ms)
  position = 'bottom-left' // Position on screen
}) => {
  const [fps, setFps] = useState(0);
  const [avgFps, setAvgFps] = useState(0);
  const [minFps, setMinFps] = useState(Infinity);
  const [maxFps, setMaxFps] = useState(0);
  const [frameTime, setFrameTime] = useState(0);
  const [history, setHistory] = useState([]);
  const [isMinimized, setIsMinimized] = useState(false);

  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());
  const fpsHistoryRef = useRef([]);
  const animationFrameRef = useRef(null);
  const lastUpdateRef = useRef(performance.now());
  const allFpsValuesRef = useRef([]);

  // Measure frames using requestAnimationFrame
  const measureFrame = useCallback((currentTime) => {
    frameCountRef.current++;

    const deltaTime = currentTime - lastTimeRef.current;

    // Calculate instantaneous FPS every frame for accuracy
    if (deltaTime > 0) {
      const instantFps = 1000 / deltaTime;
      fpsHistoryRef.current.push(instantFps);

      // Keep only the last 60 values for averaging
      if (fpsHistoryRef.current.length > 60) {
        fpsHistoryRef.current.shift();
      }
    }

    lastTimeRef.current = currentTime;

    // Update display at specified interval
    if (currentTime - lastUpdateRef.current >= updateInterval) {
      const recentFps = fpsHistoryRef.current.slice(-10);
      const currentFps = recentFps.length > 0
        ? recentFps.reduce((a, b) => a + b, 0) / recentFps.length
        : 0;

      const avgFpsValue = fpsHistoryRef.current.length > 0
        ? fpsHistoryRef.current.reduce((a, b) => a + b, 0) / fpsHistoryRef.current.length
        : 0;

      // Track all-time min/max
      allFpsValuesRef.current.push(currentFps);
      if (allFpsValuesRef.current.length > 600) {
        allFpsValuesRef.current.shift();
      }

      const validValues = allFpsValuesRef.current.filter(v => v > 0 && v < 1000);
      const minVal = validValues.length > 0 ? Math.min(...validValues) : 0;
      const maxVal = validValues.length > 0 ? Math.max(...validValues) : 0;

      setFps(Math.round(currentFps));
      setAvgFps(Math.round(avgFpsValue));
      setMinFps(Math.round(minVal));
      setMaxFps(Math.round(maxVal));
      setFrameTime(deltaTime.toFixed(2));

      // Update history for the graph
      setHistory(prev => {
        const newHistory = [...prev, Math.round(currentFps)];
        if (newHistory.length > historyLength) {
          newHistory.shift();
        }
        return newHistory;
      });

      lastUpdateRef.current = currentTime;
    }

    animationFrameRef.current = requestAnimationFrame(measureFrame);
  }, [historyLength, updateInterval]);

  useEffect(() => {
    animationFrameRef.current = requestAnimationFrame(measureFrame);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [measureFrame]);

  // Only render in development
  if (process.env.NODE_ENV !== 'development') return null;

  // Get color based on FPS value
  const getFpsColor = (value) => {
    if (value >= 55) return '#22c55e'; // green
    if (value >= 30) return '#eab308'; // yellow
    return '#ef4444'; // red
  };

  // Get position styles
  const getPositionStyles = () => {
    switch (position) {
      case 'top-left':
        return 'top-20 left-4';
      case 'top-right':
        return 'top-20 right-4';
      case 'bottom-right':
        return 'bottom-4 right-4';
      case 'bottom-left':
      default:
        return 'bottom-4 left-4';
    }
  };

  // Graph dimensions
  const graphWidth = 180;
  const graphHeight = 40;
  const maxGraphFps = 120;

  // Generate SVG path for the history graph
  const generatePath = () => {
    if (history.length < 2) return '';

    const points = history.map((value, index) => {
      const x = (index / (historyLength - 1)) * graphWidth;
      const y = graphHeight - (Math.min(value, maxGraphFps) / maxGraphFps) * graphHeight;
      return `${x},${y}`;
    });

    return `M ${points.join(' L ')}`;
  };

  // Generate filled area path
  const generateAreaPath = () => {
    if (history.length < 2) return '';

    const points = history.map((value, index) => {
      const x = (index / (historyLength - 1)) * graphWidth;
      const y = graphHeight - (Math.min(value, maxGraphFps) / maxGraphFps) * graphHeight;
      return `${x},${y}`;
    });

    return `M 0,${graphHeight} L ${points.join(' L ')} L ${graphWidth},${graphHeight} Z`;
  };

  return (
    <div
      className={`fixed ${getPositionStyles()} z-[9999] select-none`}
      style={{ fontFamily: 'ui-monospace, monospace' }}
    >
      <div
        className="bg-black/85 backdrop-blur-sm text-white rounded-lg shadow-lg overflow-hidden"
        style={{ minWidth: isMinimized ? 'auto' : '200px' }}
      >
        {/* Header - always visible */}
        <div
          className="flex items-center justify-between px-3 py-1.5 cursor-pointer hover:bg-white/10 transition-colors"
          onClick={() => setIsMinimized(!isMinimized)}
        >
          <div className="flex items-center gap-2">
            <div
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ backgroundColor: getFpsColor(fps) }}
            />
            <span className="text-xs font-semibold">FPS</span>
          </div>
          <div className="flex items-center gap-2">
            <span
              className="text-sm font-bold"
              style={{ color: getFpsColor(fps) }}
            >
              {fps}
            </span>
            <span className="text-[10px] text-gray-400">
              {isMinimized ? '▶' : '▼'}
            </span>
          </div>
        </div>

        {/* Expanded content */}
        {!isMinimized && (
          <div className="px-3 pb-3 pt-1 border-t border-white/10">
            {/* Stats row */}
            <div className="flex justify-between text-[10px] text-gray-400 mb-2">
              <span>Avg: <span className="text-white">{avgFps}</span></span>
              <span>Min: <span className="text-red-400">{minFps === Infinity ? '-' : minFps}</span></span>
              <span>Max: <span className="text-green-400">{maxFps}</span></span>
            </div>

            {/* Frame time */}
            <div className="text-[10px] text-gray-400 mb-2">
              Frame: <span className="text-white">{frameTime}ms</span>
              <span className="text-gray-500 ml-2">
                ({(1000 / fps || 0).toFixed(1)}ms target)
              </span>
            </div>

            {/* Historical graph */}
            <div className="relative bg-black/50 rounded overflow-hidden">
              <svg
                width={graphWidth}
                height={graphHeight}
                className="block"
              >
                {/* Grid lines */}
                <line x1="0" y1={graphHeight * 0.5} x2={graphWidth} y2={graphHeight * 0.5} stroke="#333" strokeWidth="1" strokeDasharray="2,2" />
                <line x1="0" y1={graphHeight * 0.25} x2={graphWidth} y2={graphHeight * 0.25} stroke="#333" strokeWidth="1" strokeDasharray="2,2" />

                {/* 60 FPS line */}
                <line
                  x1="0"
                  y1={graphHeight - (60 / maxGraphFps) * graphHeight}
                  x2={graphWidth}
                  y2={graphHeight - (60 / maxGraphFps) * graphHeight}
                  stroke="#22c55e"
                  strokeWidth="1"
                  strokeDasharray="4,2"
                  opacity="0.5"
                />

                {/* Filled area */}
                <path
                  d={generateAreaPath()}
                  fill="url(#fpsGradient)"
                  opacity="0.3"
                />

                {/* Line */}
                <path
                  d={generatePath()}
                  fill="none"
                  stroke={getFpsColor(fps)}
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />

                {/* Gradient definition */}
                <defs>
                  <linearGradient id="fpsGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor={getFpsColor(fps)} />
                    <stop offset="100%" stopColor="transparent" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Labels */}
              <div className="absolute right-1 top-0 text-[8px] text-gray-500">120</div>
              <div className="absolute right-1 bottom-0 text-[8px] text-gray-500">0</div>
            </div>

            {/* Legend */}
            <div className="flex justify-center gap-3 mt-2 text-[9px] text-gray-500">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                ≥55
              </span>
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-yellow-500"></span>
                30-54
              </span>
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                &lt;30
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FPSCounter;
