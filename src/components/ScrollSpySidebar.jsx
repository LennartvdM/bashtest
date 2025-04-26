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
