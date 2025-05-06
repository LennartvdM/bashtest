import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();

  // Determine current route for active styling
  const isActive = (path) => {
    if (path === '/contact') {
      return location.pathname === '/contact' || location.hash === '#contact';
    }
    return location.pathname === path;
  };

  return (
    <nav className="fixed inset-x-0 top-0 z-40 h-16 bg-white/90 backdrop-blur border-b border-[#e7dfd7] flex items-center">
      {/* Logo */}
      <div className="flex items-center h-full pl-6 pr-4 cursor-pointer" onClick={() => navigate('/')}> 
        <span className="sr-only">Home</span>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12L12 3l9 9"/><path d="M9 21V9h6v12"/></svg>
      </div>
      {/* Center nav - now right-aligned */}
      <div className="flex-1 flex justify-end items-center gap-2 md:gap-6 text-base font-medium">
        <ul className="flex items-center gap-2 md:gap-6">
          <li>
            <Link
              to="/neoflix"
              className={`px-3 py-1 rounded transition-colors duration-150 ${isActive('/neoflix') ? 'text-[#383437] font-bold underline underline-offset-8' : 'text-[#6e7783] hover:text-[#383437]'}`}
            >
              Neoflix
            </Link>
          </li>
          <li>
            <Link
              to="/blog"
              className={`px-3 py-1 rounded transition-colors duration-150 ${isActive('/blog') ? 'text-[#383437] font-bold underline underline-offset-8' : 'text-[#6e7783] hover:text-[#383437]'}`}
            >
              Blog
            </Link>
          </li>
          <li>
            <Link
              to="/neoflix#collab"
              className={`px-3 py-1 rounded transition-colors duration-150 ${location.pathname === '/neoflix' && location.hash === '#collab' ? 'text-[#383437] font-bold underline underline-offset-8' : 'text-[#6e7783] hover:text-[#383437]'}`}
            >
              Contact
            </Link>
          </li>
        </ul>
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
