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
  const [blob, setBlob] = useState(null); // { left, width, height }
  const [blobOpacity, setBlobOpacity] = useState(0.5);
  const [hoverTimer, setHoverTimer] = useState(null);
  const [hoveredIdx, setHoveredIdx] = useState(null);
  const settleTimeout = useRef(null);
  const height = useMotionValue(0);
  const prevBlob = useRef({ left: null, width: null });

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
    const el = linkRefs.current[idx];
    if (el && containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const rect = el.getBoundingClientRect();
      setBlob({
        left: rect.left - containerRect.left,
        width: rect.width,
        height: rect.height,
      });
      setHoveredIdx(idx);
      setBlobOpacity(0.5);
      if (settleTimeout.current) clearTimeout(settleTimeout.current);
      settleTimeout.current = setTimeout(() => {}, 80);
      if (hoverTimer) clearInterval(hoverTimer);
      // Animate opacity up to 1.0 over 2 seconds
      const timer = setInterval(() => {
        setBlobOpacity((prev) => {
          if (prev >= 1.0) {
            clearInterval(timer);
            return 1.0;
          }
          return +(prev + 0.0125).toFixed(4);
        });
      }, 25);
      setHoverTimer(timer);
    }
  };
  const handleMouseLeave = () => {
    setBlob(null);
    setBlobOpacity(0.5);
    setHoveredIdx(null);
    if (hoverTimer) clearInterval(hoverTimer);
    if (settleTimeout.current) clearTimeout(settleTimeout.current);
  };
  useEffect(() => () => { if (hoverTimer) clearInterval(hoverTimer); if (settleTimeout.current) clearTimeout(settleTimeout.current); }, [hoverTimer]);

  useEffect(() => {
    if (!blob) return;
    // Only animate shrink/expand if moving between links
    if (
      prevBlob.current.left !== null &&
      (prevBlob.current.left !== blob.left || prevBlob.current.width !== blob.width)
    ) {
      animate(height, [blob.height, 0, blob.height], {
        times: [0, 0.5, 1],
        duration: 0.18,
        ease: [0.42, 0, 0.58, 1],
      });
    } else {
      height.set(blob.height);
    }
    prevBlob.current = { left: blob.left, width: blob.width };
    // eslint-disable-next-line
  }, [blob?.left, blob?.width, blob?.height]);

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
          className="relative flex items-center gap-14 md:gap-20"
          onMouseLeave={handleMouseLeave}
          style={{ alignItems: 'center', height: '64px', position: 'relative' }}
        >
          {/* Animated blob */}
          <AnimatePresence>
            {blob && (
              <motion.div
                key="blob"
                initial={{ opacity: 0, left: blob.left, width: blob.width, height: blob.height }}
                animate={{
                  opacity: blobOpacity,
                  left: blob.left,
                  width: blob.width,
                  height: height,
                  transition: {
                    opacity: { duration: 0.18 },
                    left: { type: 'spring', stiffness: 360, damping: 50, mass: 1.2, velocity: 6 },
                    width: { type: 'spring', stiffness: 360, damping: 50, mass: 1.2, velocity: 6 },
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
