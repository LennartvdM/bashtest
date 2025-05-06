import React, { useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const NAV_LINKS = [
  { label: 'Neoflix', to: '/neoflix' },
  { label: 'Blog', to: '/blog' },
  { label: 'Contact', to: '/neoflix#collab' },
];

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const linkRefs = useRef([]);
  const [blob, setBlob] = useState(null); // { left, width }

  // Determine current route for active styling
  const isActive = (to) => {
    if (to === '/neoflix#collab') {
      return location.pathname === '/neoflix' && location.hash === '#collab';
    }
    return location.pathname === to;
  };

  // On hover/focus, update blob position/size
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
    }
  };
  const handleMouseLeave = () => {
    setBlob(null);
  };

  return (
    <nav className="fixed inset-x-0 top-0 z-40 h-16 bg-white/90 backdrop-blur border-b border-[#e7dfd7] flex items-center">
      {/* Logo */}
      <div className="flex items-center h-full pl-6 pr-4 cursor-pointer" onClick={() => navigate('/')}> 
        <span className="sr-only">Home</span>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12L12 3l9 9"/><path d="M9 21V9h6v12"/></svg>
      </div>
      {/* Center nav - right-aligned */}
      <div className="flex-1 flex justify-end items-center gap-2 md:gap-6 text-base font-medium">
        <div
          ref={containerRef}
          className="relative flex items-center gap-2 md:gap-6"
          onMouseLeave={handleMouseLeave}
        >
          {/* Animated blob */}
          <AnimatePresence>
            {blob && (
              <motion.div
                key="blob"
                initial={{ opacity: 0, left: blob.left, width: blob.width }}
                animate={{
                  opacity: 1,
                  left: blob.left,
                  width: blob.width,
                  transition: { type: 'spring', stiffness: 340, damping: 32, mass: 0.6 },
                }}
                exit={{ opacity: 0, transition: { duration: 0.18 } }}
                style={{
                  top: 0,
                  height: '2.5rem',
                  borderRadius: '9999px',
                  background: '#6bb3b3',
                  position: 'absolute',
                  zIndex: 0,
                }}
              />
            )}
          </AnimatePresence>
          {/* Nav links */}
          {NAV_LINKS.map((link, idx) => {
            const active = isActive(link.to);
            return (
              <div
                key={link.to}
                ref={el => linkRefs.current[idx] = el}
                className="relative flex items-center"
                onMouseEnter={() => handleMouseEnter(idx)}
                onFocus={() => handleMouseEnter(idx)}
                tabIndex={-1}
              >
                {/* Active pill (always on top) */}
                {active && (
                  <span
                    className="absolute inset-0 z-10 rounded-full bg-[#4fa6a6]"
                    style={{
                      boxShadow: '0 2px 8px 0 rgba(79,166,166,0.10)',
                    }}
                  />
                )}
                <Link
                  to={link.to}
                  className={`relative z-20 px-4 py-2 rounded-full transition-colors duration-150
                    ${active ? 'text-white font-bold' : 'text-[#232324] font-semibold'}
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
        {/* Toolbox button */}
        <div className="flex items-center h-full pr-6 pl-4">
          <Link
            to="/toolbox"
            className="px-5 py-2 rounded-full bg-[#232324] text-white font-bold shadow transition-all duration-150 hover:bg-[#529C9C] hover:text-white"
          >
            Toolbox
          </Link>
        </div>
      </div>
    </nav>
  );
}
