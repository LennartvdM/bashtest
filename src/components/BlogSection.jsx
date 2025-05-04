import React, { useLayoutEffect, useState } from 'react';
import { motion } from 'framer-motion';

// Section metadata
const SECTIONS = [
  { id: 'preface',   raw: 'Preface' },
  { id: 'narrative', raw: 'Narrative Review' },
  { id: 'provider',  raw: "Provider's Perspective" },
  { id: 'reflect',   raw: 'Record, Reflect, Refine' },
  { id: 'guidance',  raw: 'Practical Guidance' },
  { id: 'research',  raw: 'Driving Research' },
  { id: 'collab',    raw: 'International Collaboration' },
] as const;

type SectionId = (typeof SECTIONS)[number]['id'];

// Scroll-spy hook
function useScrollSpy(ids: readonly SectionId[]) {
  const [active, setActive] = useState<SectionId>(ids[0]);

  useLayoutEffect(() => {
    const els = ids.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    if (!els.length) return;

    const TRIGGER = 0;
    let ticking = false;

    const calc = () => {
      ticking = false;
      const y = window.innerHeight * TRIGGER;
      const past = els.filter((h) => h.getBoundingClientRect().top - y <= 0);
      const current = (past.at(-1) ?? els[0]).id as SectionId;
      setActive(current);
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
    const handler = (e: Event) => setActive((e as CustomEvent<SectionId>).detail);
    window.addEventListener('nav-activate', handler as EventListener);
    return () => window.removeEventListener('nav-activate', handler as EventListener);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900/40 to-slate-800/40">
      <main className="mx-auto grid max-w-6xl grid-cols-[260px_1fr] gap-8 px-4 pb-24 pt-16">
        {/* sidebar */}
        <aside className="sticky top-24 hidden h-max w-64 rounded-lg bg-slate-900/80 px-6 py-8 backdrop-blur-md md:block">
          <ul role="list" className="space-y-1">
            {SECTIONS.map((s, idx) => (
              <SidebarItem key={s.id} id={s.id} title={idx === 0 ? s.raw : `${idx}. ${s.raw}`} active={active === s.id} />
            ))}
          </ul>
        </aside>

        {/* article */}
        <article className="space-y-24 rounded-lg bg-white/10 px-10 py-14 shadow-lg backdrop-blur-md" itemScope itemType="https://schema.org/Article">
          {SECTIONS.map((s, idx) => (
            <section key={s.id} id={s.id} className="scroll-mt-28">
              <h2 className="mb-6 text-3xl font-extrabold text-white">{idx === 0 ? s.raw : `${idx}. ${s.raw}`}</h2>
              <p className="prose prose-invert max-w-none whitespace-pre-wrap">{LONG_LOREM}</p>
            </section>
          ))}
        </article>
      </main>
    </div>
  );
} 