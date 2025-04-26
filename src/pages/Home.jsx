import Navbar from "../components/Navbar";
import ScrollSpySidebar from "../components/ScrollSpySidebar";
import Section from "../components/Section";

export default function Home() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-cyan-900 via-sky-800 to-teal-700
                      pt-24 flex gap-10 px-6">
        <ScrollSpySidebar />
        <main className="flex-1 space-y-32">
          <Section id="intro" title="Intro">
            <p>Lorem ipsum dolor sit amet…</p>
          </Section>
          <Section id="features" title="Features">
            <p>A few bullet points on why we rock…</p>
          </Section>
          <Section id="gallery" title="Gallery">
            <p>Pictures or cards go here…</p>
          </Section>
          <Section id="contact" title="Contact">
            <p>Get in touch via email@example.com</p>
          </Section>
        </main>
      </div>
    </>
  );
}
