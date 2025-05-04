// src/App.jsx — SPA with Home and Blog routes
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Section from './components/Section';
import Blog from './pages/Blog';

function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-slate-200 pb-20">
      <Section id="intro" title="Welcome">
        <p className="text-lg">
          Your introduction content here...
        </p>
      </Section>

      <Section id="features" title="Features">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Feature 1</h3>
            <p>Feature 1 description...</p>
          </div>
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Feature 2</h3>
            <p>Feature 2 description...</p>
          </div>
        </div>
      </Section>

      <Section id="gallery" title="Gallery">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Add your gallery items here */}
        </div>
      </Section>

      <Section id="contact" title="Contact">
        <div className="space-y-6">
          <p>Your contact information here...</p>
        </div>
      </Section>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-slate-200">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/blog" element={<Blog />} />
        </Routes>
      </div>
    </Router>
  );
}
