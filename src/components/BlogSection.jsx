// BlogSection.jsx
// React 18 · Tailwind CSS 3 · framer-motion 10
// Refactored to use shared CMS-ready components
import React from 'react';
import { SidebarLayout } from './shared';
import {
  sections as SECTIONS,
  animationConfig,
  pageStyle,
} from '../data/publications';

// Sections already have content included
const sectionsWithContent = SECTIONS.map((s) => ({
  ...s,
  rawContent: s.content,
}));

export default function BlogSection() {
  return (
    <div className={`min-h-screen ${pageStyle.backgroundClassName}`}>
      <SidebarLayout
        sections={sectionsWithContent}
        sidebarConfig={animationConfig.sidebar}
        sectionConfig={animationConfig.section}
        sidebarClassName={pageStyle.sidebarClassName}
        sectionClassName={pageStyle.sectionClassName}
        autoScrollDelay={1500}
      />
    </div>
  );
}
