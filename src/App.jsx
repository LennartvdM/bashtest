// src/App.jsx — SPA with Home and Blog routes
import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Blog from './pages/Blog';
import Toolbox from './pages/Toolbox';
import SidebarScrollSpyDemo from './components/Sidebar';
import Home from './pages/Home';
import WorldMapEditor from './components/WorldMapEditor';
import ViewTransition from './components/ViewTransition';
import FPSCounter from './components/FPSCounter';
import CMSAdmin from './pages/CMSAdmin';
import ToolboxEmbed from './components/ToolboxEmbed';

function AppShell() {
  const location = useLocation();
  const isNeoflix = location.pathname === '/neoflix' || location.pathname.startsWith('/neoflix/');
  const isAdmin = location.pathname === '/admin';
  const isToolboxEmbed = location.pathname.startsWith('/Toolbox-');
  const showMapEditor = new URLSearchParams(window.location.search).get('editor') === 'true';
  const hideNavbar = showMapEditor || isAdmin || isToolboxEmbed;

  return (
    <ViewTransition>
      <div className={`min-h-screen ${isNeoflix || isAdmin || isToolboxEmbed ? '' : 'bg-[#F5F9FC]'}`}>
        {!hideNavbar && <Navbar />}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/neoflix" element={<SidebarScrollSpyDemo />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/toolbox" element={<Toolbox />} />
          <Route path="/map-editor" element={<WorldMapEditor />} />
          <Route path="/admin" element={<CMSAdmin />} />
          <Route path="/Toolbox-:slug" element={<ToolboxEmbed />} />
        </Routes>
        {/* FPS Counter - only visible in development */}
        <FPSCounter position="bottom-left" />
      </div>
    </ViewTransition>
  );
}

export default function App() {
  return (
    <Router>
      <AppShell />
    </Router>
  );
}
