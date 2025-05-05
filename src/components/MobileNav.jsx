import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const SECTIONS = [
  { id: 'preface',   raw: 'Preface' },
  { id: 'narrative', raw: 'Narrative Review' },
  { id: 'provider',  raw: "Provider's Perspective" },
  { id: 'reflect',   raw: 'Record, Reflect, Refine' },
  { id: 'guidance',  raw: 'Practical Guidance' },
  { id: 'research',  raw: 'Driving Research' },
  { id: 'collab',    raw: 'International Collaboration' },
];

function MobileNavItem({ id, title, active, onClick }) {
  return (
    <li className="flex items-center gap-3 py-1">
      <span className={`block h-2 rounded-full ${active ? 'w-6 bg-white' : 'w-2 bg-slate-400'}`} />
      <button
        onClick={() => onClick(id)}
        className={`block text-sm transition-colors ${active ? 'text-white font-semibold' : 'text-slate-300 hover:text-white'}`}
      >
        {title}
      </button>
    </li>
  );
}

export default function MobileNav({ isOpen, onClose, activeSection, onSectionClick }) {
  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={onClose}
        className="fixed left-0 top-1/2 z-50 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-r-full bg-slate-900/80 text-white shadow-lg backdrop-blur-md transition-transform hover:scale-110 md:hidden"
        aria-label="Toggle navigation"
        style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
      >
        {isOpen ? (
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        ) : (
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        )}
      </button>

      {/* Mobile Navigation Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-40 flex items-center justify-center backdrop-blur-md md:hidden"
          >
            <div className="bg-slate-900/95 rounded-2xl shadow-2xl px-6 py-8 w-11/12 max-w-sm mx-auto">
              <ul role="list" className="space-y-1">
                {SECTIONS.map((s, idx) => (
                  <MobileNavItem
                    key={s.id}
                    id={s.id}
                    title={idx === 0 ? s.raw : `${idx}. ${s.raw}`}
                    active={activeSection === s.id}
                    onClick={onSectionClick}
                  />
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
} 