import { useParams, Link } from 'react-router-dom';
import { getEmbedUrl, getPageBySlug } from '../data/toolboxPages';

export default function ToolboxEmbed() {
  const { slug } = useParams();

  const currentPage = getPageBySlug(slug);
  const embedUrl = currentPage ? getEmbedUrl(slug) : null;

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
    <div className="min-h-screen bg-slate-900 flex flex-col">
      {/* Page header with back navigation */}
      <div className="bg-slate-800 border-b border-slate-700 px-4 py-3 flex items-center justify-between">
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
          className="text-sm text-teal-400 hover:text-teal-300"
        >
          Open in GitBook
        </a>
      </div>

      {/* GitBook iframe */}
      <div className="flex-1 relative">
        <iframe
          src={embedUrl}
          className="absolute inset-0 w-full h-full border-0"
          title={currentPage.label}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          loading="lazy"
        />
      </div>
    </div>
  );
}
