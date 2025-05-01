// SidebarScrollSpyDemo.jsx (plain JS)
// React 18 · Tailwind CSS 3 · framer-motion 10
import React, { useLayoutEffect, useState } from 'react';
import { motion, Variants } from 'framer-motion';

const SECTIONS = [
  { id: 'preface', raw: 'Preface' },
  { id: 'narrative', raw: 'Narrative Review' },
  { id: 'provider', raw: \"Provider’s Perspective\" },
  { id: 'reflect', raw: 'Record, Reflect, Refine' },
  { id: 'guidance', raw: 'Practical Guidance' },
  { id: 'research', raw: 'Driving Research' },
  { id: 'collab', raw: 'International Collaboration' },
];

function useScrollSpy(ids) {
  const [active, setActive] = useState(ids[0]);
  useLayoutEffect(() => {
    const els = ids.map(id => document.getElementById(id)).filter(Boolean);
    if (!els.length) return;
    const TRIGGER_Y = 120; let ticking = false;
    const calc = () => {
      ticking = false;
      const past = els.filter(h => h.getBoundingClientRect().top <= TRIGGER_Y);
      setActive((past.at(-1) || els[0]).id);
    };
    const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(calc); } };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', calc);
    calc();
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', calc);
    };
  }, [ids]);
  useLayoutEffect(() => {
    const h = e => setActive(e.detail);
    window.addEventListener('nav-activate', h);
    return () => window.removeEventListener('nav-activate', h);
  }, []);
  return active;
}

const INDICATOR = /** @type {Variants} */ ({
  rest: { width:4, height:2, borderRadius:1, backgroundColor:'#475569' },
  hover:{ width:14,height:2, borderRadius:1, backgroundColor:'#94a3b8' },
  active:{ width:22,height:2, borderRadius:1, backgroundColor:'#ffffff' },
});

function SidebarItem({ id, title, active }) {
  const [hovered,setHovered]=useState(false);
  const state= active?'active':hovered?'hover':'rest';
  const handleClick=e=>{
    e.preventDefault();
    window.dispatchEvent(new CustomEvent('nav-activate',{detail:id}));
    document.getElementById(id)?.scrollIntoView({behavior:'smooth',block:'start'});
    history.replaceState(null,'',`#${id}`);
  };
  return (
    <li className="flex items-center gap-3 py-1"
        onMouseEnter={()=>setHovered(true)}
        onMouseLeave={()=>setHovered(false)}>
      <motion.span
        layout="size" variants={INDICATOR} animate={state}
        transition={{
          layout:{type:'spring',stiffness:active||hovered?130:260,damping:active||hovered?44:22},
          backgroundColor:{duration:0.4,ease:'easeInOut'}
        }}
        className="block shrink-0"/>
      <a href={`#${id}`} onClick={handleClick}
         className={`block text-sm transition-colors \
${active?'text-white font-semibold':'text-slate-300 hover:text-white'}`}
         aria-current={active?'location':undefined}>
        {title}
      </a>
    </li>
  );
}

const LONG_LOREM = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer in mi quis risus vehicula pretium. Sed luctus nibh et libero aliquet, quis maximus arcu pellentesque. Suspendisse potenti. Mauris sed sagittis purus. Curabitur ullamcorper, tortor sed cursus dictum, libero nisi interdum nulla, vel ultrices quam erat quis leo.`;

export default function SidebarScrollSpyDemo() {
  const active = useScrollSpy(SECTIONS.map(s=>s.id));
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0d0c44]/40 to-[#1488cc]/40">
      <header className="sticky top-0 z-30 flex h-12 items-center justify-center gap-8 bg-white/70 backdrop-blur-md">
        <span className="font-semibold text-[#0d0c44]">Neoflix</span>
      </header>
      <main className="mx-auto grid max-w-6xl grid-cols-[260px_1fr] gap-8 px-4 pb-24 md:pt-16">
        <aside className="sticky top-24 hidden h-max w-64 rounded-lg bg-[#061226] px-6 py-8 md:block">
          <ul role="list" className="space-y-1">
            {SECTIONS.map((s,i)=>(
              <SidebarItem key={s.id} id={s.id}
                title={i===0?s.raw:`\${i}. \${s.raw}`}
                active={active===s.id}/>
            ))}
          </ul>
        </aside>
        <article className="space-y-24 rounded-lg bg-white/[.85] px-10 py-14 shadow-lg backdrop-blur-md">
          {SECTIONS.map((s,i)=>(
            <section key={s.id} id={s.id} className="scroll-mt-28">
              <h2 className="mb-6 text-3xl font-extrabold text-[#0d0c44]">
                {i===0?s.raw:`\${i}. \${s.raw}`}
              </h2>
              <p className="prose prose-slate max-w-none whitespace-pre-wrap">{LONG_LOREM}</p>
            </section>
          ))}
        </article>
      </main>
    </div>
  );
}
