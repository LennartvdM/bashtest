import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { INDICATOR_VARIANTS, indicatorTransition } from './animations';

/**
 * Individual sidebar navigation item with animated indicator
 */
export default function SidebarItem({ id, title, active, onSectionClick }) {
  const [hovered, setHovered] = useState(false);
  const state = active ? 'active' : hovered ? 'hover' : 'rest';

  const handleClick = (e) => {
    e.preventDefault();
    if (onSectionClick) {
      onSectionClick(id);
    }
  };

  return (
    <li
      className="flex items-center gap-3 py-1 font-medium"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <motion.span
        layout="size"
        variants={INDICATOR_VARIANTS}
        animate={state}
        transition={indicatorTransition(active || hovered)}
        className="block shrink-0"
      />
      <a
        href={`#${id}`}
        onClick={handleClick}
        className={`block text-sm transition-colors duration-150
          ${active ? 'text-[#ffffff] font-bold' : hovered ? 'text-[#cfd2d6]' : 'text-[#6e7783]'}
        `}
        aria-current={active ? 'location' : undefined}
      >
        {title}
      </a>
    </li>
  );
}
