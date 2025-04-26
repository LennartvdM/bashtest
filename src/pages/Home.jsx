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
