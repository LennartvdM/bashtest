import React from 'react';
import { Link } from 'react-router-dom';

export default function Toolbox() {
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col" style={{ paddingTop: 60 }}>
      {/* Header bar */}
      <div className="bg-slate-800 border-b border-slate-700 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            to="/neoflix"
            className="text-slate-400 hover:text-white transition-colors"
          >
            &larr; Back
          </Link>
          <h1 className="text-lg font-medium text-slate-200">Toolbox</h1>
        </div>
        <a
          href="https://docs.neoflix.care"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-teal-400 hover:text-teal-300"
        >
          Open in GitBook
        </a>
      </div>

      {/* Full-screen GitBook iframe */}
      <div className="flex-1 relative">
        <iframe
          src="https://docs.neoflix.care"
          className="absolute inset-0 w-full h-full border-0"
          title="Neoflix Toolbox"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          loading="lazy"
        />
      </div>
    </div>
  );
}
