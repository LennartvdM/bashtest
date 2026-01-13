import { useState, useEffect, useRef } from 'react';

// Video options matching the actual neoflix.js configuration
const VIDEO_OPTIONS = [
  { id: '/videos/blurteam.mp4', label: 'Team - Collaboration & Teamwork' },
  { id: '/videos/blururgency.mp4', label: 'Urgency - Critical Care' },
  { id: '/videos/blursskills.mp4', label: 'Skills - Professional Development' },
  { id: '/videos/blurperspectives.mp4', label: 'Perspectives - Multiple Views' },
  { id: '/videos/blurfocus.mp4', label: 'Focus - Research & Analysis' },
  { id: '/videos/blurcoordination.mp4', label: 'Coordination - Working Together' },
];

const GITBOOK_PATTERN = /docs\.neoflix\.care/i;

const DEFAULT_SECTIONS = [
  { id: 'preface', title: 'Preface', textBlock1: '', video: '/videos/blurteam.mp4', textBlock2: null },
  { id: 'narrative', title: 'Narrative Review', textBlock1: '', video: '/videos/blururgency.mp4', textBlock2: null },
  { id: 'provider', title: "Provider's Perspective", textBlock1: '', video: '/videos/blurteam.mp4', textBlock2: null },
  { id: 'reflect', title: 'Record, Reflect, Refine', textBlock1: '', video: '/videos/blursskills.mp4', textBlock2: null },
  { id: 'guidance', title: 'Practical Guidance', textBlock1: '', video: '/videos/blurperspectives.mp4', textBlock2: null },
  { id: 'research', title: 'Driving Research', textBlock1: '', video: '/videos/blurfocus.mp4', textBlock2: null },
  { id: 'collab', title: 'International Collaboration', textBlock1: '', video: '/videos/blurcoordination.mp4', textBlock2: null },
];

const STORAGE_KEY = 'neoflix-cms-sections';

// Extract all GitBook links from markdown text
const extractGitBookLinks = (text) => {
  if (!text) return [];
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  const links = [];
  let match;
  while ((match = linkRegex.exec(text)) !== null) {
    const [, label, url] = match;
    if (GITBOOK_PATTERN.test(url)) {
      // Extract meaningful slug from GitBook path
      // e.g., "level-1-fundamentals/2.-planning-your-initiative" -> "Planning_Your_Initiative"
      const pathParts = url.replace(/^https?:\/\/docs\.neoflix\.care\/?/, '').split('/');
      const lastPart = pathParts[pathParts.length - 1] || pathParts[pathParts.length - 2] || 'page';
      // Clean up: remove leading numbers/dots, convert to Title_Case
      const cleanSlug = lastPart
        .replace(/^\d+\.-?/, '') // remove leading "2.-" etc
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join('_');
      links.push({ label, url, slug: cleanSlug, route: `/Toolbox-${cleanSlug}` });
    }
  }
  return links;
};

// Render markdown with link handling
const renderMarkdown = (text) => {
  if (!text) return '';
  return text
    .replace(/\n/g, '<br/>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, label, url) => {
      const isGitBook = GITBOOK_PATTERN.test(url);
      if (isGitBook) {
        // Generate Toolbox route from GitBook URL
        const pathParts = url.replace(/^https?:\/\/docs\.neoflix\.care\/?/, '').split('/');
        const lastPart = pathParts[pathParts.length - 1] || pathParts[pathParts.length - 2] || 'page';
        const cleanSlug = lastPart
          .replace(/^\d+\.-?/, '')
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join('_');
        return `<a href="/Toolbox-${cleanSlug}" class="text-teal-400 underline" title="Opens embedded">${label}</a>`;
      }
      return `<a href="${url}" target="_blank" rel="noopener" class="text-blue-400 underline" title="Opens new tab">${label} ↗</a>`;
    });
};

function TextEditor({ value, onChange, placeholder, rows = 6 }) {
  const textareaRef = useRef(null);
  const [showPreview, setShowPreview] = useState(false);

  const insertLink = () => {
    const label = prompt('Link text:');
    if (!label) return;
    const url = prompt('URL (GitBook URLs will embed, others open new tab):');
    if (!url) return;

    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = value || '';
    const before = text.substring(0, start);
    const after = text.substring(end);
    const markdown = `[${label}](${url})`;

    onChange(before + markdown + after);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + markdown.length, start + markdown.length);
    }, 0);
  };

  const insertBold = () => {
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = value || '';
    const selected = text.substring(start, end);
    const before = text.substring(0, start);
    const after = text.substring(end);
    const markdown = selected ? `**${selected}**` : '**bold text**';

    onChange(before + markdown + after);
  };

  const insertItalic = () => {
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = value || '';
    const selected = text.substring(start, end);
    const before = text.substring(0, start);
    const after = text.substring(end);
    const markdown = selected ? `*${selected}*` : '*italic text*';

    onChange(before + markdown + after);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1 text-sm">
        <button onClick={insertLink} className="px-2 py-1 bg-slate-700 hover:bg-slate-600 rounded" title="Insert link">
          Link
        </button>
        <button onClick={insertBold} className="px-2 py-1 bg-slate-700 hover:bg-slate-600 rounded font-bold" title="Bold">
          B
        </button>
        <button onClick={insertItalic} className="px-2 py-1 bg-slate-700 hover:bg-slate-600 rounded italic" title="Italic">
          I
        </button>
        <div className="flex-1" />
        <button
          onClick={() => setShowPreview(!showPreview)}
          className={`px-2 py-1 rounded ${showPreview ? 'bg-teal-600' : 'bg-slate-700 hover:bg-slate-600'}`}
        >
          {showPreview ? 'Edit' : 'Preview'}
        </button>
      </div>

      {showPreview ? (
        <div
          className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 min-h-[150px] prose prose-invert prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(value) || '<span class="text-slate-500">Nothing to preview</span>' }}
        />
      ) : (
        <textarea
          ref={textareaRef}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          rows={rows}
          className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 focus:outline-none focus:border-teal-500 resize-y font-mono text-sm"
          placeholder={placeholder}
        />
      )}
    </div>
  );
}

export default function CMSAdmin() {
  const [sections, setSections] = useState([]);
  const [activeSection, setActiveSection] = useState(null);
  const [copied, setCopied] = useState(false);
  const [showExport, setShowExport] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setSections(JSON.parse(saved));
    } else {
      setSections(DEFAULT_SECTIONS);
    }
  }, []);

  useEffect(() => {
    if (sections.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sections));
    }
  }, [sections]);

  // Extract all GitBook links from all sections
  const embeddedPages = sections.flatMap(s => [
    ...extractGitBookLinks(s.textBlock1),
    ...extractGitBookLinks(s.textBlock2)
  ]).filter((v, i, a) => a.findIndex(t => t.slug === v.slug) === i);

  const updateSection = (id, field, value) => {
    setSections(prev => prev.map(s =>
      s.id === id ? { ...s, [field]: value || null } : s
    ));
  };

  const moveSection = (id, dir) => {
    const idx = sections.findIndex(s => s.id === id);
    if ((dir === -1 && idx === 0) || (dir === 1 && idx === sections.length - 1)) return;
    const newSections = [...sections];
    [newSections[idx], newSections[idx + dir]] = [newSections[idx + dir], newSections[idx]];
    setSections(newSections);
  };

  const addSection = () => {
    const newId = `section-${Date.now()}`;
    setSections([...sections, { id: newId, title: 'New Section', textBlock1: '', video: null, textBlock2: null }]);
    setActiveSection(newId);
  };

  const deleteSection = (id) => {
    if (confirm('Delete this section?')) {
      setSections(sections.filter(s => s.id !== id));
      if (activeSection === id) setActiveSection(null);
    }
  };

  const getExportData = () => ({
    sections,
    embeddedPages,
    exportedAt: new Date().toISOString()
  });

  const exportJSON = () => {
    const json = JSON.stringify(getExportData(), null, 2);
    navigator.clipboard.writeText(json);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadJSON = () => {
    const json = JSON.stringify(getExportData(), null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'neoflix-content.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const resetToDefault = () => {
    if (confirm('Reset all sections to default? This cannot be undone.')) {
      setSections(DEFAULT_SECTIONS);
      setActiveSection(null);
    }
  };

  const active = sections.find(s => s.id === activeSection);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex">
      {/* Sidebar */}
      <div className="w-72 bg-slate-800 border-r border-slate-700 flex flex-col">
        <div className="p-4 border-b border-slate-700">
          <h1 className="text-lg font-semibold">Neoflix CMS</h1>
          {embeddedPages.length > 0 && (
            <p className="text-xs text-slate-400 mt-1">{embeddedPages.length} embedded page{embeddedPages.length !== 1 ? 's' : ''}</p>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {sections.map((section, idx) => (
            <div
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`p-3 rounded-lg mb-1 cursor-pointer flex items-center justify-between group ${
                activeSection === section.id ? 'bg-slate-600' : 'hover:bg-slate-700'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-slate-500 text-sm w-5">{idx + 1}</span>
                <span className="truncate">{section.title}</span>
                {section.video && <span className="text-xs bg-teal-600 px-1.5 py-0.5 rounded">V</span>}
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100">
                <button onClick={(e) => { e.stopPropagation(); moveSection(section.id, -1); }} className="p-1 hover:bg-slate-600 rounded text-xs">Up</button>
                <button onClick={(e) => { e.stopPropagation(); moveSection(section.id, 1); }} className="p-1 hover:bg-slate-600 rounded text-xs">Dn</button>
              </div>
            </div>
          ))}
        </div>

        {/* Embedded Pages List */}
        {embeddedPages.length > 0 && (
          <div className="border-t border-slate-700 p-3">
            <p className="text-xs text-slate-400 mb-2 font-medium">Embedded Pages (auto-detected)</p>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {embeddedPages.map(page => (
                <div key={page.slug} className="text-xs bg-slate-700 rounded px-2 py-1 flex items-center gap-2">
                  <span className="text-teal-400 shrink-0">{page.route}</span>
                  <span className="text-slate-500 truncate flex-1">{page.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="p-3 border-t border-slate-700 space-y-2">
          <button onClick={addSection} className="w-full py-2 bg-teal-600 hover:bg-teal-500 rounded-lg text-sm font-medium">
            + Add Section
          </button>
          <button onClick={() => setShowExport(true)} className="w-full py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm">
            Export JSON
          </button>
          <button onClick={resetToDefault} className="w-full py-2 bg-slate-700 hover:bg-red-600 rounded-lg text-sm text-slate-400 hover:text-white">
            Reset to Default
          </button>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 p-8 overflow-y-auto">
        {active ? (
          <div className="max-w-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold">{active.title}</h2>
              <button onClick={() => deleteSection(active.id)} className="px-3 py-1 text-red-400 hover:bg-red-400/20 rounded text-sm">
                Delete Section
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm text-slate-400 mb-2">Section Title</label>
                <input
                  type="text"
                  value={active.title}
                  onChange={(e) => updateSection(active.id, 'title', e.target.value)}
                  className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-2">Text Block 1</label>
                <TextEditor
                  value={active.textBlock1}
                  onChange={(val) => updateSection(active.id, 'textBlock1', val)}
                  placeholder="Main content text... Use [text](url) for links"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-2">Video Clip <span className="text-slate-500">(optional)</span></label>
                <select
                  value={active.video || ''}
                  onChange={(e) => updateSection(active.id, 'video', e.target.value)}
                  className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 focus:outline-none focus:border-teal-500"
                >
                  <option value="">None</option>
                  {VIDEO_OPTIONS.map(v => (
                    <option key={v.id} value={v.id}>{v.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-2">Text Block 2 <span className="text-slate-500">(optional)</span></label>
                <TextEditor
                  value={active.textBlock2}
                  onChange={(val) => updateSection(active.id, 'textBlock2', val)}
                  placeholder="Additional text after video..."
                  rows={4}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-slate-500">
            <div className="text-center">
              <p>Select a section to edit</p>
              <p className="text-sm mt-2">Use <code className="bg-slate-800 px-1 rounded">[text](url)</code> for links</p>
              <p className="text-xs text-slate-600 mt-1">GitBook links (docs.neoflix.care) = embedded pages | Others = new tab</p>
            </div>
          </div>
        )}
      </div>

      {/* Export Modal */}
      {showExport && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowExport(false)}>
          <div className="bg-slate-800 rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Export Content</h3>
              <button onClick={() => setShowExport(false)} className="text-slate-400 hover:text-white">X</button>
            </div>
            <pre className="flex-1 overflow-auto bg-slate-900 rounded-lg p-4 text-xs font-mono">
              {JSON.stringify(getExportData(), null, 2)}
            </pre>
            <div className="flex gap-2 mt-4">
              <button onClick={exportJSON} className="flex-1 py-2 bg-teal-600 hover:bg-teal-500 rounded-lg text-sm font-medium">
                {copied ? 'Copied!' : 'Copy to Clipboard'}
              </button>
              <button onClick={downloadJSON} className="flex-1 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm">
                Download File
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
