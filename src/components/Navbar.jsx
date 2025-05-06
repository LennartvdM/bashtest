import React, { useRef, useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const NAV_LINKS = [
  { label: 'Neoflix', to: '/neoflix' },
  { label: 'Blog', to: '/blog' },
  { label: 'Contact', to: '/neoflix#collab' },
  { label: 'Toolbox', to: '/toolbox' },
];

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const linkRefs = useRef([]);
  const [blob, setBlob] = useState(null); // { left, width, height }
  const [blobHeight, setBlobHeight] = useState(40); // px
  const [blobOpacity, setBlobOpacity] = useState(0.5);
  const [hoverTimer, setHoverTimer] = useState(null);
  const [hoveredIdx, setHoveredIdx] = useState(null);

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

  // On hover/focus, update blob position/size and animate height/opacity
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
      setBlobHeight(32); // Flubber: shrink height on hover
      setHoveredIdx(idx);
      setBlobOpacity(0.5);
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
    setBlobHeight(40); // Reset to default height
    setBlobOpacity(0.5);
    setHoveredIdx(null);
    if (hoverTimer) clearInterval(hoverTimer);
  };
  useEffect(() => () => { if (hoverTimer) clearInterval(hoverTimer); }, [hoverTimer]);

  return (
    <nav className="fixed inset-x-0 top-0 z-40 h-16 bg-white/90 backdrop-blur border-b border-[#e7dfd7] flex items-center">
      {/* Logo */}
      <div className="flex items-center h-full pl-6 pr-4 cursor-pointer" onClick={() => navigate('/')}> 
        <span className="sr-only">Home</span>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12L12 3l9 9"/><path d="M9 21V9h6v12"/></svg>
      </div>
      {/* Center nav - right-aligned */}
      <div className="flex-1 flex justify-end items-center gap-2 md:gap-10 text-base font-medium">
        <div
          ref={containerRef}
          className="relative flex items-center gap-6 md:gap-10"
          onMouseLeave={handleMouseLeave}
          style={{ alignItems: 'center', height: '64px', position: 'relative' }}
        >
          {/* Animated blob */}
          <AnimatePresence>
            {blob && (
              <motion.div
                key="blob"
                initial={{ opacity: 0, left: blob.left, width: blob.width, height: blobHeight, top: 12 }}
                animate={{
                  opacity: blobOpacity,
                  left: blob.left,
                  width: blob.width,
                  height: blobHeight,
                  top: 12, // Center vertically under the links
                  transition: {
                    opacity: { duration: 0.18 },
                    left: { type: 'spring', stiffness: 90, damping: 10, mass: 1.2, velocity: 1.5 },
                    width: { type: 'spring', stiffness: 90, damping: 10, mass: 1.2, velocity: 1.5 },
                    height: { type: 'spring', stiffness: 60, damping: 8, mass: 1.2 },
                    top: { type: 'spring', stiffness: 60, damping: 8, mass: 1.2 },
                  },
                }}
                exit={{ opacity: 0, transition: { duration: 0.18 } }}
                style={{
                  borderRadius: '9999px',
                  background: '#b0b8c1',
                  position: 'absolute',
                  zIndex: 1,
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
                    className={`absolute inset-0 z-20 rounded-full ${isToolbox ? 'bg-[#232324]' : 'bg-[#4fa6a6]'}`}
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
                    pointerEvents: active ? 'none' : undefined,
                  }}
                >
                  {link.label}
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
