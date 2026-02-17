// PublicationsSection.jsx — uses shared SidebarLayout
import React from 'react';
import { SidebarLayout } from './shared';
import {
  sections as SECTIONS,
  pageStyle,
} from '../data/publications';

const sectionsWithContent = SECTIONS.map((s) => ({
  ...s,
  rawContent: s.content,
}));

export default function PublicationsSection() {
  return (
    <div className={`min-h-screen ${pageStyle.backgroundClassName}`}>
      <SidebarLayout
        sections={sectionsWithContent}
        sectionClassName={pageStyle.sectionClassName || ''}
        autoScrollDelay={1500}
      />
    </div>
  );
}
