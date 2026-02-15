import { Link } from 'react-router-dom';

export default function Toolbox() {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="text-center max-w-md px-6">
        <h1 className="text-2xl font-semibold text-slate-200 mb-3">Neoflix Toolbox</h1>
        <p className="text-slate-400 mb-8">
          The Neoflix Toolbox is hosted externally on GitBook.
        </p>
        <div className="flex flex-col gap-4 items-center">
          <a
            href="https://docs.neoflix.care"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 bg-teal-600 hover:bg-teal-500 rounded-lg text-white font-medium transition-colors"
          >
            Open Toolbox
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
