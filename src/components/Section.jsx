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
