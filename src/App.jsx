// src/App.jsx — SPA with Home and Blog routes
import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Blog from './pages/Blog';
import Toolbox from './pages/Toolbox';
import SidebarScrollSpyDemo from './components/Sidebar';
import Home from './pages/Home';
import WorldMapEditor from './components/WorldMapEditor';

function AppShell() {
  const location = useLocation();
  const isNeoflix = location.pathname === '/neoflix' || location.pathname.startsWith('/neoflix/');
  const showMapEditor = new URLSearchParams(window.location.search).get('editor') === 'true';

  return (
    <div className={`min-h-screen ${isNeoflix ? '' : 'bg-[#F5F9FC]'}`}>
      {!showMapEditor && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/neoflix" element={<SidebarScrollSpyDemo key="neoflix" />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/toolbox" element={<Toolbox />} />
        <Route path="/map-editor" element={<WorldMapEditor />} />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppShell />
    </Router>
  );
}
