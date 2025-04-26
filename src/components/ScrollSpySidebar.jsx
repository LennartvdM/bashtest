import { useEffect, useState } from "react";

const sections = [
  { id: "intro",     label: "Intro" },
  { id: "features",  label: "Features" },
  { id: "gallery",   label: "Gallery" },
  { id: "contact",   label: "Contact" },
];

export default function ScrollSpySidebar() {
  const [active, setActive] = useState("intro");

  useEffect(() => {
    const opts = { threshold: 0.4, rootMargin: "-80px 0px -50% 0px" };
    const observer = new IntersectionObserver(entries => {
      entries.forEach(e => e.isIntersecting && setActive(e.target.id));
    }, opts);
    sections.forEach(({ id }) => {
      const el = document.getElementById(id);
      el && observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <aside
      className="sticky top-24 self-start w-56 rounded-xl bg-slate-900/90
                 p-6 text-sm text-slate-300 space-y-4">
      {sections.map(({ id, label }) => (
        <a
          key={id}
          href={`#${id}`}
          className={`block px-2 py-1 rounded-md duration-150
                     ${active === id ? "bg-cyan-600 text-white"
                                      : "hover:text-white"}`}>
          {label}
        </a>
      ))}
    </aside>
  );
}
