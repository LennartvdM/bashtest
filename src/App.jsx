// src/App.jsx — SPA with Home and Blog routes
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Blog from './pages/Blog';
import Toolbox from './pages/Toolbox';
import SidebarScrollSpyDemo from './components/Sidebar';
import Home from './pages/Home';
import WorldMapEditor from './components/WorldMapEditor';

export default function App() {
  // Check for map editor access
  const showMapEditor = new URLSearchParams(window.location.search).get('editor') === 'true';

  return (
    <Router>
      <div className="min-h-screen bg-[#F5F9FC]">
        {!showMapEditor && <Navbar />}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/neoflix" element={<SidebarScrollSpyDemo />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/toolbox" element={<Toolbox />} />
          <Route path="/map-editor" element={<WorldMapEditor />} />
        </Routes>
      </div>
    </Router>
  );
}
