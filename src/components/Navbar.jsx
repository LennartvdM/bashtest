import React, { useRef, useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useMotionValue, animate } from 'framer-motion';
import version from '../version';

const NAV_LINKS = [
  { label: 'Neoflix', to: '/neoflix' },
  { label: 'Blog', to: '/blog' },
  { label: 'Contact', to: '/neoflix#collab' },
  { label: 'Toolbox', to: '/toolbox' },
];

const BLOB_HEIGHT_FULL = 32;
const BLOB_HEIGHT_FLAT = 8;
const NAV_CELL_HEIGHT = 28;

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const linkRefs = useRef([]);
  const [blob, setBlob] = useState(null); // { left, width, height }
  const [blobOpacity, setBlobOpacity] = useState(0.5);
  const [hoverTimer, setHoverTimer] = useState(null);
  const [hoveredIdx, setHoveredIdx] = useState(null);
  const [traveling, setTraveling] = useState(false);
  const [blobHeight, setBlobHeight] = useState(0);
  const settleTimeout = useRef(null);
  const prevIdx = useRef(null);
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
      setBlobOpacity(1.0);
      if (settleTimeout.current) clearTimeout(settleTimeout.current);
      settleTimeout.current = setTimeout(() => {}, 80);
      if (hoverTimer) clearInterval(hoverTimer);
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

  // Traveling logic for shrink/expand
  useEffect(() => {
    if (hoveredIdx !== null && prevIdx.current !== null && hoveredIdx !== prevIdx.current) {
      setTraveling(true);
      setBlobHeight(blob?.height || 0);
      setTimeout(() => {
        setBlobHeight(blob?.height ? blob.height * 0.50 : 0);
        setTimeout(() => {
          setBlobHeight(blob?.height || 0);
          setTraveling(false);
        }, 90); // half duration
      }, 1);
    } else if (blob?.height) {
      setBlobHeight(blob.height);
    }
    prevIdx.current = hoveredIdx;
    // eslint-disable-next-line
  }, [hoveredIdx, blob?.height]);

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
    <nav className="fixed inset-x-0 top-0 z-40 bg-white/90 backdrop-blur border-b border-[#e7dfd7] flex items-center shadow-[0_2px_2px_0_rgba(0,0,0,0.08)]" style={{height: 60}}>
      {/* Logo */}
      <div className="flex items-center h-full pl-6 pr-4 cursor-pointer" onClick={() => navigate('/')}> 
        <span className="sr-only">Home</span>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12L12 3l9 9"/><path d="M9 21V9h6v12"/></svg>
      </div>
      {/* Nav links moved closer to right edge */}
      <div className="flex-1 flex justify-end items-center h-full pr-16">
        <div
          ref={containerRef}
          className="relative flex items-center gap-[3.75rem]"
          onMouseLeave={handleMouseLeave}
          style={{ alignItems: 'center', height: '60px', position: 'relative' }}
        >
          {/* Animated blob */}
          <AnimatePresence>
            {blob && (
              <motion.div
                key="blob"
                initial={{ opacity: 0, left: blob.left, width: blob.width, height: NAV_CELL_HEIGHT }}
                animate={{
                  opacity: blobOpacity,
                  left: blob.left,
                  width: blob.width,
                  height: traveling ? NAV_CELL_HEIGHT * 0.75 : NAV_CELL_HEIGHT,
                  transition: {
                    opacity: { duration: 0.18 },
                    left: { type: 'spring', stiffness: 360, damping: 50, mass: 1.2, velocity: 6 },
                    width: { type: 'spring', stiffness: 360, damping: 50, mass: 1.2, velocity: 6 },
                    height: { duration: 0.18, ease: [0.42, 0, 0.58, 1] },
                  },
                }}
                exit={{ opacity: 0, transition: { duration: 0.18 } }}
                className="absolute flex items-center"
                style={{
                  borderRadius: '9999px',
                  background: '#d1d5db',
                  zIndex: 1,
                  pointerEvents: 'none',
                  margin: 'auto 0',
                  left: blob.left,
                  width: blob.width,
                  height: traveling ? NAV_CELL_HEIGHT * 0.75 : NAV_CELL_HEIGHT,
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
                className="relative flex items-center justify-center"
                onMouseEnter={() => handleMouseEnter(idx)}
                onFocus={() => handleMouseEnter(idx)}
                tabIndex={-1}
                style={{ minHeight: NAV_CELL_HEIGHT, height: NAV_CELL_HEIGHT, zIndex: isToolbox ? 2 : 2 }}
              >
                {/* Active pill (always on top) */}
                {active && (
                  <span
                    className="absolute inset-0 z-20 rounded-full bg-[#4fa6a6]"
                    style={{
                      boxShadow: '0 2px 8px 0 rgba(79,166,166,0.10)',
                      pointerEvents: 'none',
                      height: NAV_CELL_HEIGHT,
                      minHeight: NAV_CELL_HEIGHT,
                      maxHeight: NAV_CELL_HEIGHT,
                    }}
                  />
                )}
                <Link
                  to={link.to}
                  className={`relative z-30 flex items-center justify-center px-6 py-2 rounded-full transition-colors duration-150 transform-gpu
                    hover:scale-105 focus:scale-105 transition-transform duration-240
                    ${active ? 'text-white font-bold' : isToolbox ? 'text-white font-semibold' : 'text-[#232324] font-semibold'}
                    ${isToolbox && !active ? 'bg-[#232324]' : ''}
                  `}
                  style={{
                    pointerEvents: 'auto',
                    fontFamily: 'Montserrat, sans-serif',
                    fontWeight: 500,
                    fontSize: 18,
                    height: NAV_CELL_HEIGHT,
                    lineHeight: NAV_CELL_HEIGHT + 'px',
                    userSelect: 'none',
                    WebkitUserSelect: 'none'
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
