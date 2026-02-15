import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getPageBySlug } from '../data/toolboxPages';

export default function ToolboxEmbed() {
  const { slug } = useParams();
  const currentPage = getPageBySlug(slug);

  // Auto-open the GitBook page in the same tab after a short delay
  useEffect(() => {
    if (currentPage) {
      const timer = setTimeout(() => {
        window.location.href = currentPage.url;
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [currentPage]);

  if (!currentPage) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-slate-200 mb-4">Page Not Found</h1>
          <p className="text-slate-400 mb-6">
            The embedded page "{slug}" could not be found.
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
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="text-center max-w-md px-6">
        <h1 className="text-2xl font-semibold text-slate-200 mb-3">{currentPage.label}</h1>
        <p className="text-slate-400 mb-8">
          Redirecting to the Neoflix Toolbox…
        </p>
        <div className="flex flex-col gap-4 items-center">
          <a
            href={currentPage.url}
            className="px-6 py-3 bg-teal-600 hover:bg-teal-500 rounded-lg text-white font-medium transition-colors"
          >
            Open in Toolbox
          </a>
          <Link
            to="/neoflix"
            className="text-slate-400 hover:text-slate-200 text-sm transition-colors"
          >
            &larr; Back to Neoflix
          </Link>
        </div>
      </div>
    </div>
  );
}
