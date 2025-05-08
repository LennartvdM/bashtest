import React from 'react';

const ProjectsSection = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-700 to-slate-600 text-slate-200 flex items-center justify-center">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-4xl font-bold mb-12 text-center">Featured Projects</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-slate-800/50 rounded-xl overflow-hidden">
            <div className="aspect-video bg-slate-700"></div>
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-2">Project One</h3>
              <p className="text-slate-300 mb-4">A full-stack web application built with React and Node.js</p>
              <div className="flex gap-2">
                <span className="px-3 py-1 bg-blue-600/20 text-blue-400 rounded-full text-sm">React</span>
                <span className="px-3 py-1 bg-green-600/20 text-green-400 rounded-full text-sm">Node.js</span>
              </div>
            </div>
          </div>
          <div className="bg-slate-800/50 rounded-xl overflow-hidden">
            <div className="aspect-video bg-slate-700"></div>
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-2">Project Two</h3>
              <p className="text-slate-300 mb-4">An AI-powered application using Python and TensorFlow</p>
              <div className="flex gap-2">
                <span className="px-3 py-1 bg-purple-600/20 text-purple-400 rounded-full text-sm">Python</span>
                <span className="px-3 py-1 bg-orange-600/20 text-orange-400 rounded-full text-sm">TensorFlow</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectsSection; 