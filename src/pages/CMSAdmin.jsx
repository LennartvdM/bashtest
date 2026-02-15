import { useState, useEffect, useRef } from 'react';
import { renderMarkdown } from '../utils/renderMarkdown';
import { getGroupedPages } from '../data/toolboxPages';

// Video options matching the actual neoflix.js configuration
const VIDEO_OPTIONS = [
  { id: '/videos/blurteam.mp4', label: 'Team - Collaboration & Teamwork' },
  { id: '/videos/blururgency.mp4', label: 'Urgency - Critical Care' },
  { id: '/videos/blursskills.mp4', label: 'Skills - Professional Development' },
  { id: '/videos/blurperspectives.mp4', label: 'Perspectives - Multiple Views' },
  { id: '/videos/blurfocus.mp4', label: 'Focus - Research & Analysis' },
  { id: '/videos/blurcoordination.mp4', label: 'Coordination - Working Together' },
];

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

function TextEditor({ value, onChange, placeholder, rows = 6 }) {
  const textareaRef = useRef(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showLinkPicker, setShowLinkPicker] = useState(false);

  const insertMarkdownLink = (label, url) => {
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

  const insertLink = () => {
    setShowLinkPicker(true);
  };

  const handleGitBookSelect = (e) => {
    const slug = e.target.value;
    if (!slug) return;
    const grouped = getGroupedPages();
    let page = null;
    for (const pages of Object.values(grouped)) {
      page = pages.find(p => p.slug === slug);
      if (page) break;
    }
    if (page) {
      insertMarkdownLink(page.label, `/Toolbox-${page.slug}`);
    }
    setShowLinkPicker(false);
  };

  const handleExternalLink = () => {
    setShowLinkPicker(false);
    const label = prompt('Link text:');
    if (!label) return;
    const url = prompt('URL:');
    if (!url) return;
    insertMarkdownLink(label, url);
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

  const grouped = getGroupedPages();

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1 text-sm">
        <div className="relative">
          <button onClick={insertLink} className="px-2 py-1 bg-slate-700 hover:bg-slate-600 rounded" title="Insert link">
            Link
          </button>
          {showLinkPicker && (
            <div className="absolute top-full left-0 mt-1 bg-slate-700 rounded-lg shadow-xl p-3 z-50 w-72">
              <p className="text-xs text-slate-400 mb-2">Choose link type:</p>
              <select
                onChange={handleGitBookSelect}
                defaultValue=""
                className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1.5 text-sm mb-2 focus:outline-none focus:border-teal-500"
              >
                <option value="">-- GitBook Page --</option>
                {Object.entries(grouped).map(([group, pages]) => (
                  <optgroup key={group} label={group}>
                    {pages.map(page => (
                      <option key={page.slug} value={page.slug}>{page.label}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
              <button
                onClick={handleExternalLink}
                className="w-full px-2 py-1.5 bg-slate-800 hover:bg-slate-600 rounded text-sm text-left"
              >
                External URL...
              </button>
              <button
                onClick={() => setShowLinkPicker(false)}
                className="w-full px-2 py-1 mt-1 text-xs text-slate-500 hover:text-slate-300"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
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
              <p className="text-xs text-slate-600 mt-1">Use the Link button to insert GitBook or external links</p>
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
