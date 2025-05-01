#!/usr/bin/env bash
set -euo pipefail

# 1) Overwrite Home.jsx
cat > src/pages/Home.jsx << 'EOP'
import React from 'react'
import Navbar from '../components/Navbar'
import ScrollSpySidebar from '../components/ScrollSpySidebar'
import Section from '../components/Section'

export default function Home() {
  return (
    <>
      <Navbar />
      <div
        className="min-h-screen
          bg-gradient-to-br from-cyan-900 via-sky-800 to-teal-700
          relative before:pointer-events-none before:absolute before:inset-0
          before:bg-[radial-gradient(transparent,rgba(0,0,0,0.6))] before:opacity-40
          pt-28 px-4 lg:px-10
          flex lg:grid lg:grid-cols-[260px_1fr] lg:gap-14 xl:gap-20
          max-w-screen-2xl mx-auto"
      >
        <ScrollSpySidebar />
        <main className="flex-1 space-y-32">
          <Section id="intro"     title="Intro">    <p>Lorem ipsum dolor sit amet…</p>  </Section>
          <Section id="features"  title="Features"><p>A few bullet points on why we rock…</p></Section>
          <Section id="gallery"   title="Gallery"> <p>Pictures or cards go here…</p></Section>
          <Section id="contact"   title="Contact"> <p>Get in touch via email@example.com</p></Section>
        </main>
      </div>
    </>
  )
}
EOP

# 2) Overwrite Section.jsx
cat > src/components/Section.jsx << 'EOP'
import React from 'react'

export default function Section({ id, title, children }) {
  return (
    <section id={id} className="scroll-mt-28 py-24">
      <div
        className="mx-auto w-full max-w-3xl min-h-[85vh]
          rounded-3xl bg-gradient-to-br from-white/80 to-white/60
          backdrop-blur-xl shadow-xl border border-white/40
          p-10 md:p-14 lg:p-16 space-y-8"
      >
        <h2 className="text-3xl font-bold">{title}</h2>
        {children}
      </div>
    </section>
  )
}
EOP

# 3) Overwrite ScrollSpySidebar.jsx
cat > src/components/ScrollSpySidebar.jsx << 'EOP'
import React, { useEffect, useState } from 'react'

const sections = [
  { id: 'intro',    label: 'Intro' },
  { id: 'features', label: 'Features' },
  { id: 'gallery',  label: 'Gallery' },
  { id: 'contact',  label: 'Contact' },
]

export default function ScrollSpySidebar() {
  const [active, setActive] = useState('intro')

  useEffect(() => {
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => e.isIntersecting && setActive(e.target.id)),
      { threshold: 0.4, rootMargin: '-80px 0px -50% 0px' }
    )
    sections.forEach(({ id }) => {
      const el = document.getElementById(id)
      el && obs.observe(el)
    })
    return () => obs.disconnect()
  }, [])

  return (
    <aside
      className="sticky top-32 self-start w-64
        rounded-2xl bg-slate-900/90 ring-1 ring-white/10
        p-8 text-sm leading-relaxed text-slate-300 space-y-5"
    >
      {sections.map(({ id, label }) => (
        <a
          key={id}
          href={`#${id}`}
          className={`block rounded-md px-2 py-1 duration-150 ${
            active === id
              ? 'bg-cyan-600/90 text-white font-semibold'
              : 'hover:text-white/90'
          }`}
        >
          {label}
        </a>
      ))}
    </aside>
  )
}
EOP

# 4) Commit & push
git add src/pages/Home.jsx src/components/Section.jsx src/components/ScrollSpySidebar.jsx
git commit -m "refine: match Framer layout & styling"
git push
