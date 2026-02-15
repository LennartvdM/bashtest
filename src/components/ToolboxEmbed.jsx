import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getPageBySlug } from '../data/toolboxPages';

const LOAD_TIMEOUT_MS = 20000;

export default function ToolboxEmbed() {
  const { slug } = useParams();
  const currentPage = getPageBySlug(slug);
  const [loading, setLoading] = useState(true);
  const [timedOut, setTimedOut] = useState(false);
  const timerRef = useRef(null);

  // Timeout: if iframe hasn't loaded after LOAD_TIMEOUT_MS, show fallback
  useEffect(() => {
    if (!currentPage) return;
    timerRef.current = setTimeout(() => {
      setTimedOut(true);
      setLoading(false);
    }, LOAD_TIMEOUT_MS);
    return () => clearTimeout(timerRef.current);
  }, [currentPage]);

  if (!currentPage) {
    return (
      <div className="h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-slate-200 mb-4">Page Not Found</h1>
          <p className="text-slate-400 mb-6">
            The toolbox page &ldquo;{slug}&rdquo; could not be found.
          </p>
          <Link
            to="/neoflix"
            className="px-4 py-2 bg-teal-600 hover:bg-teal-500 rounded-lg text-white transition-colors"
          >
            Back to Neoflix
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-slate-900 flex flex-col overflow-hidden">
      {/* Iframe container — fills remaining height */}
      <div className="flex-1 relative min-h-0">
        {/* Loading overlay */}
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-900">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-slate-600 border-t-teal-400 rounded-full animate-spin mx-auto mb-4" />
              <p className="text-slate-400 text-sm">Loading {currentPage.label}&hellip;</p>
            </div>
          </div>
        )}

        {/* Timeout message */}
        {timedOut && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-900">
            <div className="text-center max-w-md px-6">
              <p className="text-slate-300 text-lg mb-2">This page is taking a while to load.</p>
              <p className="text-slate-400 text-sm mb-6">
                The GitBook content may be temporarily unavailable.
              </p>
              <a
                href={currentPage.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-5 py-2.5 bg-teal-600 hover:bg-teal-500 rounded-lg text-white transition-colors"
              >
                Open directly in GitBook &nearr;
              </a>
            </div>
          </div>
        )}

        {/* The iframe itself */}
        <iframe
          src={currentPage.url}
          title={currentPage.label}
          className="absolute inset-0 w-full h-full border-0"
          onLoad={() => {
            clearTimeout(timerRef.current);
            setLoading(false);
            setTimedOut(false);
          }}
        />
      </div>
    </div>
  );
}
