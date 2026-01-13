import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

// This will be populated from the CMS export or can be stored in localStorage
const STORAGE_KEY = 'neoflix-cms-sections';

// Fallback embedded pages if no CMS data is available
const DEFAULT_EMBEDDED_PAGES = [];

export default function ToolboxEmbed() {
  const { slug } = useParams();
  const [embeddedPages, setEmbeddedPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Extract embedded pages from CMS data in localStorage
    const extractEmbeddedPages = () => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const sections = JSON.parse(saved);
          const pages = [];
          const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
          const gitbookPattern = /docs\.neoflix\.care/i;

          sections.forEach(section => {
            [section.textBlock1, section.textBlock2].forEach(text => {
              if (!text) return;
              let match;
              while ((match = linkRegex.exec(text)) !== null) {
                const [, label, url] = match;
                if (gitbookPattern.test(url)) {
                  const pathParts = url.replace(/^https?:\/\/docs\.neoflix\.care\/?/, '').split('/');
                  const lastPart = pathParts[pathParts.length - 1] || pathParts[pathParts.length - 2] || 'page';
                  const cleanSlug = lastPart
                    .replace(/^\d+\.-?/, '')
                    .split('-')
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                    .join('_');

                  // Avoid duplicates
                  if (!pages.find(p => p.slug === cleanSlug)) {
                    pages.push({ label, url, slug: cleanSlug, route: `/Toolbox-${cleanSlug}` });
                  }
                }
              }
            });
          });

          return pages;
        }
        return DEFAULT_EMBEDDED_PAGES;
      } catch (e) {
        console.error('Error loading embedded pages:', e);
        return DEFAULT_EMBEDDED_PAGES;
      }
    };

    const pages = extractEmbeddedPages();
    setEmbeddedPages(pages);
    setLoading(false);
  }, []);

  // Find the current page by slug
  const currentPage = embeddedPages.find(p => p.slug === slug);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-slate-400">Loading...</div>
      </div>
    );
  }

  if (!currentPage) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-slate-200 mb-4">Page Not Found</h1>
          <p className="text-slate-400 mb-6">
            The embedded page "{slug}" could not be found.
          </p>
          <p className="text-slate-500 text-sm mb-6">
            Make sure you have added GitBook links in the CMS and saved your content.
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
          src={currentPage.url}
          className="absolute inset-0 w-full h-full border-0"
          title={currentPage.label}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          loading="lazy"
        />
      </div>
    </div>
  );
}
