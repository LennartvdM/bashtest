import React from 'react';

const ContactSection = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-600 to-slate-500 text-slate-200 flex items-center justify-center">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <h2 className="text-4xl font-bold mb-8">Get In Touch</h2>
        <p className="text-xl text-slate-300 mb-12">
          I'm always open to discussing new projects, creative ideas or opportunities to be part of your visions.
        </p>
        <div className="flex flex-col md:flex-row gap-6 justify-center">
          <a href="mailto:your.email@example.com" className="px-8 py-4 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
            Email Me
          </a>
          <a href="https://github.com/yourusername" target="_blank" rel="noopener noreferrer" className="px-8 py-4 border border-slate-400 hover:border-slate-300 rounded-lg transition-colors">
            GitHub
          </a>
          <a href="https://linkedin.com/in/yourusername" target="_blank" rel="noopener noreferrer" className="px-8 py-4 border border-slate-400 hover:border-slate-300 rounded-lg transition-colors">
            LinkedIn
          </a>
        </div>
      </div>
    </div>
  );
};

export default ContactSection; 