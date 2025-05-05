import React, { useLayoutEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Section metadata
const SECTIONS = [
  { id: 'preface',   raw: 'Preface' },
  { id: 'narrative', raw: 'Narrative Review' },
  { id: 'provider',  raw: "Provider's Perspective" },
  { id: 'reflect',   raw: 'Record, Reflect, Refine' },
  { id: 'guidance',  raw: 'Practical Guidance' },
  { id: 'research',  raw: 'Driving Research' },
  { id: 'collab',    raw: 'International Collaboration' },
];

// Scroll-spy hook
function useScrollSpy(ids) {
  const [active, setActive] = useState(ids[0]);

  useLayoutEffect(() => {
    const els = ids.map((id) => document.getElementById(id)).filter(Boolean);
    if (!els.length) return;

    let ticking = false;
    const OFFSET = 100; // px from top of viewport (adjust as needed)

    const calc = () => {
      ticking = false;
      // Find the last section whose top is above the reference line
      const tops = els.map(el => el.getBoundingClientRect().top);
      let idx = 0;
      for (let i = 0; i < tops.length; i++) {
        if (tops[i] - OFFSET <= 0) {
          idx = i;
        }
      }
      setActive(els[idx].id);
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(calc);
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', calc);
    calc();
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', calc);
    };
  }, [ids]);

  useLayoutEffect(() => {
    const handler = (e) => setActive(e.detail);
    window.addEventListener('nav-activate', handler);
    return () => window.removeEventListener('nav-activate', handler);
  }, []);

  return active;
}

// Indicator variants
const INDICATOR = {
  rest:   { width: 4,  height: 2, borderRadius: 1, backgroundColor: '#475569' },
  hover:  { width: 14, height: 2, borderRadius: 1, backgroundColor: '#94a3b8' },
  active: { width: 22, height: 2, borderRadius: 1, backgroundColor: '#ffffff' },
};

// Sidebar item component
function SidebarItem({ id, title, active }) {
  const [hovered, setHovered] = useState(false);
  const state = active ? 'active' : hovered ? 'hover' : 'rest';

  const handleClick = (e) => {
    e.preventDefault();
    window.dispatchEvent(new CustomEvent('nav-activate', { detail: id }));
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    history.replaceState(null, '', `#${id}`);
  };

  return (
    <li
      className="flex items-center gap-3 py-1"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <motion.span
        layout="size"
        variants={INDICATOR}
        animate={state}
        transition={{
          layout: {
            type: 'spring',
            stiffness: active || hovered ? 130 : 260,
            damping: active || hovered ? 44 : 22,
          },
          backgroundColor: { duration: 0.4, ease: 'easeInOut' },
        }}
        className="block shrink-0"
      />

      <a
        href={`#${id}`}
        onClick={handleClick}
        className={`block text-sm transition-colors ${active ? 'text-white font-semibold' : 'text-slate-300 hover:text-white'}`}
        aria-current={active ? 'location' : undefined}
      >
        {title}
      </a>
    </li>
  );
}

// Placeholder content
const LONG_LOREM = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer in mi quis risus vehicula pretium. Sed luctus nibh et libero aliquet, quis maximus arcu pellentesque. Suspendisse potenti. Mauris sed sagittis purus. Curabitur ullamcorper, tortor sed cursus dictum, libero nisi interdum nulla, vel ultrices quam erat quis leo.`;

export default function BlogSection() {
  const active = useScrollSpy(SECTIONS.map((s) => s.id));
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  React.useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setIsSidebarOpen(false);
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Sidebar animation config
  const sidebarMotion = {
    initial: { x: -300, opacity: 0 },
    animate: { x: 0, opacity: 1, transition: { delay: 1.2, duration: 1.1, type: 'spring', stiffness: 120, damping: 30 } },
    exit: { x: -300, opacity: 0, transition: { duration: 0.7 } },
  };

  // Section fade-in animation config
  const sectionVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i === 0 ? 0 : 0.25 + i * 0.18,
        duration: 0.7,
        ease: 'easeOut',
      },
    }),
  };

  // Centered toggle button with arrow (flush to left edge)
  const buttonIcon = isSidebarOpen ? (
    // Left arrow
    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
  ) : (
    // Right arrow
    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900/40 to-slate-800/40">
      <main className="mx-auto max-w-6xl px-4 pb-24 pt-16" style={{ scrollPaddingTop: '6rem' }}>
        {/* Toggle Button */}
        {isMobile && (
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="fixed left-0 top-1/2 z-50 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-r-full bg-slate-900/80 text-white shadow-lg backdrop-blur-md transition-transform hover:scale-110 md:hidden"
            aria-label="Toggle sidebar"
            style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
          >
            {buttonIcon}
          </button>
        )}

        <div className="grid grid-cols-1 gap-8 md:grid-cols-[260px_1fr]">
          {/* sidebar */}
          <AnimatePresence>
            {(!isMobile || isSidebarOpen) && (
              <motion.aside
                {...sidebarMotion}
                className={`fixed left-0 top-24 z-40 h-[calc(100vh-6rem)] w-64 overflow-y-auto rounded-r-lg bg-slate-900/80 px-6 py-8 backdrop-blur-md md:sticky md:left-auto md:top-24 md:h-max md:w-64 select-none`}
              >
                <ul role="list" className="space-y-1">
                  {SECTIONS.map((s, idx) => (
                    <SidebarItem key={s.id} id={s.id} title={idx === 0 ? s.raw : `${idx}. ${s.raw}`} active={active === s.id} />
                  ))}
                </ul>
              </motion.aside>
            )}
          </AnimatePresence>

          {/* article */}
          <article className="space-y-16 rounded-lg px-4 py-14 md:px-10">
            {SECTIONS.map((s, idx) => (
              <motion.section
                key={s.id}
                id={s.id}
                className="scroll-mt-24 mb-8 rounded-xl bg-white/20 shadow-lg p-6 md:p-8"
                variants={sectionVariants}
                initial="hidden"
                animate="visible"
                custom={idx}
              >
                <h2 className="mb-6 text-3xl font-extrabold text-white">{idx === 0 ? s.raw : `${idx}. ${s.raw}`}</h2>
                <p className="prose prose-invert max-w-none whitespace-pre-wrap">{LONG_LOREM}</p>
              </motion.section>
            ))}
            {/* Spacer for scroll-spy alignment */}
            <div className="h-screen" aria-hidden="true"></div>
          </article>
        </div>
      </main>
    </div>
  );
} 