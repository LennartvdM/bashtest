import React from 'react';

const HeroSection = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-slate-200 flex items-center justify-center">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <h1 className="text-5xl md:text-7xl font-bold mb-6">Welcome to My Portfolio</h1>
        <p className="text-xl md:text-2xl text-slate-300 mb-8">
          Full-stack developer passionate about creating beautiful and functional web experiences
        </p>
        <div className="flex gap-4 justify-center">
          <a href="#projects" className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
            View Projects
          </a>
          <a href="#contact" className="px-6 py-3 border border-slate-400 hover:border-slate-300 rounded-lg transition-colors">
            Contact Me
          </a>
        </div>
      </div>
    </div>
  );
};

export default HeroSection; 