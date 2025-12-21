import React, { useRef, useEffect, useState } from 'react';
import { useFPSMonitor } from '../hooks/useFPSMonitor';

/**
 * FPS Counter with historical graph for performance monitoring
 * Only renders in development mode by default
 */
const FPSCounter = ({
  enabled = process.env.NODE_ENV === 'development',
  position = 'top-right', // 'top-right', 'top-left', 'bottom-right', 'bottom-left'
  historyLength = 60,
  sampleInterval = 100,
  showGraph = true,
  showStats = true,
  compact = false
}) => {
  const canvasRef = useRef(null);
  const [isMinimized, setIsMinimized] = useState(false);

  const { fps, avgFps, minFps, maxFps, history, isMonitoring } = useFPSMonitor({
    historyLength,
    sampleInterval,
    enabled
  });

  // Draw the FPS history graph
  useEffect(() => {
    if (!showGraph || isMinimized || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(0, 0, width, height);

    // Draw reference lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;

    // 60 FPS line
    const fps60Y = height - (60 / 120) * height;
    ctx.beginPath();
    ctx.moveTo(0, fps60Y);
    ctx.lineTo(width, fps60Y);
    ctx.stroke();

    // 30 FPS line
    const fps30Y = height - (30 / 120) * height;
    ctx.beginPath();
    ctx.moveTo(0, fps30Y);
    ctx.lineTo(width, fps30Y);
    ctx.stroke();

    // Draw FPS history graph
    if (history.length > 0) {
      const barWidth = width / history.length;

      history.forEach((value, index) => {
        const barHeight = (value / 120) * height;
        const x = index * barWidth;
        const y = height - barHeight;

        // Color based on FPS value
        let color;
        if (value >= 55) {
          color = '#22c55e'; // Green - good
        } else if (value >= 30) {
          color = '#eab308'; // Yellow - acceptable
        } else if (value > 0) {
          color = '#ef4444'; // Red - poor
        } else {
          color = 'rgba(100, 100, 100, 0.3)'; // Gray - no data
        }

        ctx.fillStyle = color;
        ctx.fillRect(x, y, barWidth - 1, barHeight);
      });
    }

    // Draw current FPS indicator line
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    const currentY = height - (fps / 120) * height;
    ctx.moveTo(width - 2, currentY - 3);
    ctx.lineTo(width - 2, currentY + 3);
    ctx.stroke();

  }, [history, fps, showGraph, isMinimized]);

  if (!enabled) return null;

  // Position classes
  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4'
  };

  // Color for FPS value
  const getFPSColor = (value) => {
    if (value >= 55) return 'text-green-400';
    if (value >= 30) return 'text-yellow-400';
    return 'text-red-400';
  };

  // Compact view (just FPS number)
  if (compact) {
    return (
      <div
        className={`fixed ${positionClasses[position]} z-[9999] font-mono text-xs cursor-pointer select-none`}
        onClick={() => setIsMinimized(!isMinimized)}
        title="Click to expand"
      >
        <div className={`px-2 py-1 rounded bg-black/80 ${getFPSColor(fps)}`}>
          {fps} FPS
        </div>
      </div>
    );
  }

  return (
    <div
      className={`fixed ${positionClasses[position]} z-[9999] font-mono text-xs select-none`}
    >
      <div className="bg-black/85 backdrop-blur-sm rounded-lg overflow-hidden shadow-lg border border-white/10">
        {/* Header */}
        <div
          className="flex items-center justify-between px-3 py-1.5 bg-white/5 cursor-pointer"
          onClick={() => setIsMinimized(!isMinimized)}
        >
          <span className="text-white/60 text-[10px] uppercase tracking-wider">Performance</span>
          <span className="text-white/40 text-[10px]">{isMinimized ? '+' : '-'}</span>
        </div>

        {!isMinimized && (
          <div className="p-2">
            {/* Main FPS Display */}
            <div className="flex items-baseline gap-2 mb-2">
              <span className={`text-2xl font-bold tabular-nums ${getFPSColor(fps)}`}>
                {fps}
              </span>
              <span className="text-white/50 text-[10px]">FPS</span>
            </div>

            {/* Stats Row */}
            {showStats && (
              <div className="flex gap-3 mb-2 text-[10px]">
                <div>
                  <span className="text-white/40">AVG </span>
                  <span className="text-white/80 tabular-nums">{avgFps}</span>
                </div>
                <div>
                  <span className="text-white/40">MIN </span>
                  <span className={`tabular-nums ${getFPSColor(minFps)}`}>{minFps}</span>
                </div>
                <div>
                  <span className="text-white/40">MAX </span>
                  <span className="text-green-400/80 tabular-nums">{maxFps}</span>
                </div>
              </div>
            )}

            {/* History Graph */}
            {showGraph && (
              <div className="relative">
                <canvas
                  ref={canvasRef}
                  width={120}
                  height={40}
                  className="rounded"
                />
                {/* Reference labels */}
                <div className="absolute right-1 top-0 text-[8px] text-white/30">60</div>
                <div className="absolute right-1 bottom-0 text-[8px] text-white/30">0</div>
              </div>
            )}

            {/* Frame time */}
            <div className="mt-1.5 text-[10px] text-white/40">
              Frame: {fps > 0 ? (1000 / fps).toFixed(1) : '—'}ms
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FPSCounter;
