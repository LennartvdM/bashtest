import React, { useRef, useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useMotionValue, animate } from 'framer-motion';

const NAV_LINKS = [
  { label: 'Neoflix', to: '/neoflix' },
  { label: 'Blog', to: '/blog' },
  { label: 'Contact', to: '/neoflix#collab' },
  { label: 'Toolbox', to: '/toolbox' },
];

const BLOB_HEIGHT_FULL = 32;
const BLOB_HEIGHT_FLAT = 8;

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const linkRefs = useRef([]);
  const [blob, setBlob] = useState(null); // { left, width }
  const [blobOpacity, setBlobOpacity] = useState(0.5);
  const [hoverTimer, setHoverTimer] = useState(null);
  const [hoveredIdx, setHoveredIdx] = useState(null);
  const [isSettled, setIsSettled] = useState(true);
  const settleTimeout = useRef(null);

  // Section-based active logic
  const isActive = (to) => {
    if (to === '/neoflix') {
      return location.pathname === '/neoflix' && location.hash !== '#collab';
    }
    if (to === '/neoflix#collab') {
      return location.pathname === '/neoflix' && location.hash === '#collab';
    }
    return location.pathname === to;
  };

  // On hover/focus, update blob position/size and animate opacity
  const handleMouseEnter = (idx) => {
    if (isActive(NAV_LINKS[idx].to)) return; // Don't show blob for active
    const el = linkRefs.current[idx];
    if (el && containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const rect = el.getBoundingClientRect();
      setBlob({
        left: rect.left - containerRect.left,
        width: rect.width,
      });
      setHoveredIdx(idx);
      setBlobOpacity(0.5);
      setIsSettled(false);
      if (settleTimeout.current) clearTimeout(settleTimeout.current);
      settleTimeout.current = setTimeout(() => {
        setIsSettled(true);
      }, 80); // much faster settle
      if (hoverTimer) clearInterval(hoverTimer);
      // Animate opacity up to 1.0 over 2 seconds
      const timer = setInterval(() => {
        setBlobOpacity((prev) => {
          if (prev >= 1.0) {
            clearInterval(timer);
            return 1.0;
          }
          return +(prev + 0.0125).toFixed(4); // 0.5 -> 1.0 in 2s (40*0.0125=0.5)
        });
      }, 25);
      setHoverTimer(timer);
    }
  };
  const handleMouseLeave = () => {
    setBlob(null);
    setBlobOpacity(0.5);
    setHoveredIdx(null);
    setIsSettled(true);
    if (hoverTimer) clearInterval(hoverTimer);
    if (settleTimeout.current) clearTimeout(settleTimeout.current);
  };
  useEffect(() => () => { if (hoverTimer) clearInterval(hoverTimer); if (settleTimeout.current) clearTimeout(settleTimeout.current); }, [hoverTimer]);

  // Motion value for height
  const height = useMotionValue(BLOB_HEIGHT_FULL);
  // Animate height: full -> flat -> full during transition
  useEffect(() => {
    if (!blob) return;
    // Animate to flat, then to full
    const controls = animate(
      height,
      [BLOB_HEIGHT_FULL, BLOB_HEIGHT_FLAT, BLOB_HEIGHT_FULL], // pronounced shrink/expand
      {
        duration: 0.18, // slower for more visible shrink/expand
        ease: [0.42, 0, 0.58, 1],
      }
    );
    return controls.stop;
    // eslint-disable-next-line
  }, [blob?.left, blob?.width]);

  return (
    <nav className="fixed inset-x-0 top-0 z-40 h-16 bg-white/90 backdrop-blur border-b border-[#e7dfd7] flex items-center">
      {/* Logo */}
      <div className="flex items-center h-full pl-6 pr-4 cursor-pointer" onClick={() => navigate('/')}> 
        <span className="sr-only">Home</span>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12L12 3l9 9"/><path d="M9 21V9h6v12"/></svg>
      </div>
      {/* Center nav - right-aligned, with extra right padding using grid */}
      <div className="flex-1 grid grid-cols-[1fr_auto_0.5fr] items-center h-full">
        <div></div>
        <div
          ref={containerRef}
          className="relative flex items-center gap-12 md:gap-20"
          onMouseLeave={handleMouseLeave}
          style={{ alignItems: 'center', height: '64px', position: 'relative' }}
        >
          {/* Animated blob */}
          <AnimatePresence>
            {blob && (
              <motion.div
                key="blob"
                initial={{ opacity: 0, left: blob.left, width: blob.width, height: BLOB_HEIGHT_FULL }}
                animate={{
                  opacity: blobOpacity,
                  left: blob.left,
                  width: blob.width,
                  height: [BLOB_HEIGHT_FULL, BLOB_HEIGHT_FLAT, BLOB_HEIGHT_FULL],
                  transition: {
                    opacity: { duration: 0.18 },
                    left: { type: 'spring', stiffness: 360, damping: 50, mass: 1.2, velocity: 6 },
                    width: { type: 'spring', stiffness: 360, damping: 50, mass: 1.2, velocity: 6 },
                    height: { times: [0, 0.5, 1], duration: 0.18, ease: [0.42, 0, 0.58, 1] },
                  },
                }}
                exit={{ opacity: 0, transition: { duration: 0.18 } }}
                className="absolute inset-0 flex items-center"
                style={{
                  borderRadius: '9999px',
                  background: '#b0b8c1',
                  zIndex: 1,
                  pointerEvents: 'none',
                  margin: 'auto 0',
                  left: blob.left,
                  width: blob.width,
                }}
              />
            )}
          </AnimatePresence>
          {/* Nav links */}
          {NAV_LINKS.map((link, idx) => {
            const active = isActive(link.to);
            // Toolbox gets special styling
            const isToolbox = link.label === 'Toolbox';
            return (
              <div
                key={link.to}
                ref={el => linkRefs.current[idx] = el}
                className="relative flex items-center"
                onMouseEnter={() => handleMouseEnter(idx)}
                onFocus={() => handleMouseEnter(idx)}
                tabIndex={-1}
                style={{ minHeight: 40, zIndex: isToolbox ? 2 : 2 }}
              >
                {/* Active pill (always on top) */}
                {active && (
                  <span
                    className={`absolute inset-0 z-20 rounded-full flex items-center justify-center ${isToolbox ? 'bg-[#232324]' : 'bg-[#4fa6a6]'}`}
                    style={{
                      boxShadow: isToolbox
                        ? '0 2px 8px 0 rgba(35,35,36,0.10)'
                        : '0 2px 8px 0 rgba(79,166,166,0.10)',
                    }}
                  />
                )}
                <Link
                  to={link.to}
                  className={`relative z-30 px-4 py-2 rounded-full transition-colors duration-150
                    ${active ? 'text-white font-bold' : isToolbox ? 'text-white font-bold' : 'text-[#232324] font-semibold'}
                    ${isToolbox ? 'bg-[#232324] shadow' : ''}
                  `}
                  style={{
                    pointerEvents: 'auto',
                  }}
                >
                  {link.label}
                </Link>
              </div>
            );
          })}
        </div>
        <div></div>
      </div>
    </nav>
  );
}
