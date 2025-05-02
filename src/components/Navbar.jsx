<<<<<<< HEAD
import React from 'react';
=======
import React from "react";

>>>>>>> f1b8d9f (wip: commit before rebase)
import { Link } from 'react-router-dom';

export default function Navbar() {
  const links = ["intro", "features", "gallery", "contact"];
  return (
    <nav className="fixed inset-x-0 top-0 z-40 h-16 bg-slate-900/80 backdrop-blur">
      <ul className="mx-auto flex h-full max-w-5xl items-center gap-8 px-8 text-sm font-medium text-slate-200">
        {links.map(id => (
          <li key={id}>
            <a href={`#${id}`} className="hover:text-white duration-150">
              {id.toUpperCase()}
            </a>
          </li>
        ))}
        <li>
          <Link to="/sidebar" className="hover:text-white duration-150">SIDEBAR</Link>
        </li>
      </ul>
    </nav>
  );
}
