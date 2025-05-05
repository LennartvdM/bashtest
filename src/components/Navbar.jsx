import React from 'react';
import { Link } from 'react-router-dom';

export default function Navbar() {
  const links = [
    { id: "intro", path: "/#intro" },
    { id: "features", path: "/#features" },
    { id: "blog", path: "/blog#preface" },
    { id: "contact", path: "/#contact" }
  ];

  return (
    <nav className="fixed inset-x-0 top-0 z-40 h-16 bg-slate-900/80 backdrop-blur">
      <ul className="mx-auto flex h-full max-w-5xl items-center gap-8 px-8 text-sm font-medium text-slate-200">
        {links.map(link => (
          <li key={link.id}>
            <Link 
              to={link.path} 
              className="hover:text-white duration-150"
            >
              {link.id.toUpperCase()}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
