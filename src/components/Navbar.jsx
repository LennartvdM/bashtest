import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useMotionValue, animate } from 'framer-motion';
import version from '../version';

// Inline FPS Counter for Navbar
function NavbarFPSCounter() {
  const [fps, setFps] = useState(0);
  const [history, setHistory] = useState([]);
  const lastTimeRef = useRef(performance.now());
  const fpsHistoryRef = useRef([]);
  const animationFrameRef = useRef(null);
  const lastUpdateRef = useRef(performance.now());

  const measureFrame = useCallback((currentTime) => {
    const deltaTime = currentTime - lastTimeRef.current;
    if (deltaTime > 0) {
      const instantFps = 1000 / deltaTime;
      fpsHistoryRef.current.push(instantFps);
      if (fpsHistoryRef.current.length > 60) fpsHistoryRef.current.shift();
    }
    lastTimeRef.current = currentTime;

    if (currentTime - lastUpdateRef.current >= 100) {
      const recentFps = fpsHistoryRef.current.slice(-10);
      const currentFps = recentFps.length > 0
        ? recentFps.reduce((a, b) => a + b, 0) / recentFps.length
        : 0;
      setFps(Math.round(currentFps));
      setHistory(prev => {
        const newHistory = [...prev, Math.round(currentFps)];
        if (newHistory.length > 30) newHistory.shift();
        return newHistory;
      });
      lastUpdateRef.current = currentTime;
    }
    animationFrameRef.current = requestAnimationFrame(measureFrame);
  }, []);

  useEffect(() => {
    animationFrameRef.current = requestAnimationFrame(measureFrame);
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [measureFrame]);

  const getFpsColor = (value) => {
    if (value >= 55) return '#22c55e';
    if (value >= 30) return '#eab308';
    return '#ef4444';
  };

  const graphWidth = 60;
  const graphHeight = 20;
  const maxFps = 120;

  const generatePath = () => {
    if (history.length < 2) return '';
    const points = history.map((value, index) => {
      const x = (index / 29) * graphWidth;
      const y = graphHeight - (Math.min(value, maxFps) / maxFps) * graphHeight;
      return `${x},${y}`;
    });
    return `M ${points.join(' L ')}`;
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '4px 8px',
      background: 'rgba(0,0,0,0.85)',
      borderRadius: '6px',
      marginLeft: '8px'
    }}>
      <div style={{
        width: '6px',
        height: '6px',
        borderRadius: '50%',
        backgroundColor: getFpsColor(fps),
        animation: 'pulse 2s infinite'
      }} />
      <span style={{
        color: getFpsColor(fps),
        fontSize: '12px',
        fontWeight: 'bold',
        fontFamily: 'ui-monospace, monospace',
        minWidth: '28px'
      }}>
        {fps}
      </span>
      <svg width={graphWidth} height={graphHeight} style={{ display: 'block' }}>
        <line x1="0" y1={graphHeight - (60/maxFps)*graphHeight} x2={graphWidth} y2={graphHeight - (60/maxFps)*graphHeight} stroke="#22c55e" strokeWidth="1" strokeDasharray="2,2" opacity="0.4" />
        <path d={generatePath()} fill="none" stroke={getFpsColor(fps)} strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

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
  const navRef = useRef(null);
  const blobContainerRef = useRef(null);
  const linkRefs = useRef([]);
  const [blob, setBlob] = useState(null); // { left, width, height }
  const [blobOpacity, setBlobOpacity] = useState(0.5);
  const [hoverTimer, setHoverTimer] = useState(null);
  const [hoveredIdx, setHoveredIdx] = useState(null);
  const [traveling, setTraveling] = useState(false);
  const [blobHeight, setBlobHeight] = useState(0);
  const [isMobile, setIsMobile] = useState(() => (typeof window !== 'undefined' ? window.innerWidth < 768 : false));
  const [menuOpen, setMenuOpen] = useState(false);
  const settleTimeout = useRef(null);
  const prevIdx = useRef(null);
  const height = useMotionValue(0);
  const prevBlob = useRef({ left: null, width: null });
  const navCellHeight = isMobile ? 26 : NAV_CELL_HEIGHT;

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
    if (el && blobContainerRef.current) {
      const containerRect = blobContainerRef.current.getBoundingClientRect();
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

  // Responsive detection
  useEffect(() => {
    const onResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setMenuOpen(false);
    };
    window.addEventListener('resize', onResize);
    onResize();
    return () => window.removeEventListener('resize', onResize);
  }, []);

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

  // Expose nav height as CSS variable for layout consumers (e.g., tablet sections)
  useEffect(() => {
    const updateVar = () => {
      try {
        const navEl = navRef.current;
        const h = navEl?.getBoundingClientRect()?.height || 60;
        document.documentElement.style.setProperty('--nav-h', `${Math.round(h)}px`);
      } catch {}
    };
    updateVar();
    window.addEventListener('resize', updateVar);
    window.addEventListener('scroll', updateVar, { passive: true });
    return () => {
      window.removeEventListener('resize', updateVar);
      window.removeEventListener('scroll', updateVar);
    };
  }, []);

  // Ensure blob aligns with active route on mount / route change
  useEffect(() => {
    if (isMobile) return;
    const activeIdx = NAV_LINKS.findIndex(link => isActive(link.to));
    if (activeIdx === -1) {
      setBlob(null);
      return;
    }
    const el = linkRefs.current[activeIdx];
    const container = blobContainerRef.current;
    if (el && container) {
      const containerRect = container.getBoundingClientRect();
      const rect = el.getBoundingClientRect();
      setBlob({
        left: rect.left - containerRect.left,
        width: rect.width,
        height: rect.height,
      });
      setBlobOpacity(0.5);
      setHoveredIdx(null);
    }
  }, [location.pathname, location.hash, isMobile]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <nav ref={navRef} className="fixed inset-x-0 top-0 z-40 bg-white backdrop-blur border-b border-[#e7dfd7] flex items-center justify-between shadow-[0_2px_2px_0_rgba(0,0,0,0.08)]" style={{height: 60}}
      onLoadCapture={() => {
        try {
          const h = navRef.current?.getBoundingClientRect()?.height || 60;
          document.documentElement.style.setProperty('--nav-h', `${Math.round(h)}px`);
        } catch {}
      }}
    >
      {/* Logo + FPS Counter */}
      <div className="flex items-center h-full pl-6 pr-4">
        <div className="cursor-pointer" onClick={() => navigate('/')}>
          <span className="sr-only">Home</span>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12L12 3l9 9"/><path d="M9 21V9h6v12"/></svg>
        </div>
        <NavbarFPSCounter />
      </div>
      {/* Inline links (snug on tablet) */}
      <div className="flex flex-1 justify-end items-center h-full" style={{ paddingRight: isMobile ? 12 : 64 }}>
        <div
          ref={blobContainerRef}
          className="relative flex items-center"
          onMouseLeave={handleMouseLeave}
          style={{ alignItems: 'center', height: '60px', position: 'relative', gap: isMobile ? '1.5rem' : '3.75rem' }}
        >
          {/* Animated blob */}
          <AnimatePresence>
            {!isMobile && blob && (
              <motion.div
                key="blob"
                initial={{ opacity: 0, left: blob.left, width: blob.width, height: NAV_CELL_HEIGHT }}
                animate={{
                  opacity: blobOpacity,
                  left: blob.left,
                  width: blob.width,
                  height: traveling ? navCellHeight * 0.75 : navCellHeight,
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
                  height: traveling ? navCellHeight * 0.75 : navCellHeight,
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
                onMouseEnter={!isMobile ? () => handleMouseEnter(idx) : undefined}
                onFocus={!isMobile ? () => handleMouseEnter(idx) : undefined}
                tabIndex={-1}
                style={{ minHeight: navCellHeight, height: navCellHeight, zIndex: isToolbox ? 2 : 2 }}
              >
                {/* Active pill (always on top) */}
                {active && (
                  <span
                    className="absolute inset-0 z-20 rounded-full bg-[#4fa6a6]"
                    style={{
                      boxShadow: '0 2px 8px 0 rgba(79,166,166,0.10)',
                      pointerEvents: 'none',
                      height: navCellHeight,
                      minHeight: navCellHeight,
                      maxHeight: navCellHeight,
                    }}
                  />
                )}
                <Link
                  to={link.to}
                  className={`relative z-30 flex items-center justify-center rounded-full transition-colors duration-150 transform-gpu
                    hover:scale-105 focus:scale-105 transition-transform duration-240
                    ${active ? 'text-white font-bold' : isToolbox ? 'text-white font-semibold' : 'text-[#232324] font-semibold'}
                    ${isToolbox && !active ? 'bg-[#232324]' : ''}
                  `}
                  style={{
                    pointerEvents: 'auto',
                    fontFamily: 'Montserrat, sans-serif',
                    fontWeight: 500,
                    fontSize: isMobile ? 16 : 18,
                    padding: isMobile ? '6px 10px' : '8px 24px',
                    height: navCellHeight,
                    lineHeight: navCellHeight + 'px',
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
