import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getPageBySlug } from '../data/toolboxPages';

export default function ToolboxEmbed() {
  const { slug } = useParams();
  const currentPage = getPageBySlug(slug);
  const [loading, setLoading] = useState(true);

  if (!currentPage) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-slate-200 mb-4">Page Not Found</h1>
          <p className="text-slate-400 mb-6">
            The page "{slug}" could not be found.
          </p>
          <Link
            to="/neoflix"
            className="px-4 py-2 bg-teal-600 hover:bg-teal-500 rounded-lg text-white"
          >
            Back to Neoflix
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      {/* Header bar */}
      <div className="bg-slate-800 border-b border-slate-700 px-4 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <Link
            to="/neoflix"
            className="text-slate-400 hover:text-white transition-colors"
          >
            &larr; Back
          </Link>
          <h1 className="text-lg font-medium text-slate-200">{currentPage.label}</h1>
        </div>
        <a
          href={currentPage.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-teal-400 hover:text-teal-300 transition-colors"
        >
          Open in GitBook &nearr;
        </a>
      </div>

      {/* Iframe container */}
      <div className="flex-1 relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-slate-600 border-t-teal-400 rounded-full animate-spin mx-auto mb-4" />
              <p className="text-slate-400 text-sm">Loading {currentPage.label}…</p>
            </div>
          </div>
        )}
        <iframe
          src={currentPage.url}
          title={currentPage.label}
          className="absolute inset-0 w-full h-full border-0"
          onLoad={() => setLoading(false)}
        />
      </div>
    </div>
  );
}
