import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useScrollSpy from '../../hooks/useScrollSpy';
import MobileNav from '../MobileNav';
import SidebarItem from './SidebarItem';
import ContentSection from './ContentSection';
import {
  createSidebarMotion,
  createSectionVariants,
  scrollToSection,
  smoothScrollTo,
} from './animations';

/**
 * Shared layout component for sidebar-based article pages
 *
 * @param {Object} props
 * @param {Array} props.sections - Array of section objects with id, title, and content
 * @param {Object} props.sidebarConfig - Optional sidebar animation config
 * @param {Object} props.sectionConfig - Optional section animation config
 * @param {React.ReactNode} props.backgroundLayer - Optional background layer (e.g., video deck)
 * @param {string} props.sidebarClassName - Optional custom sidebar class
 * @param {string} props.sectionClassName - Optional custom section class
 * @param {Function} props.renderSection - Optional custom section renderer
 * @param {Function} props.onActiveChange - Callback when active section changes
 * @param {number} props.autoScrollDelay - Delay before auto-scroll on mount (0 to disable)
 * @param {string} props.basePath - Base path for hash routing (e.g., '/neoflix')
 */
export default function SidebarLayout({
  sections,
  sidebarConfig = {},
  sectionConfig = {},
  backgroundLayer = null,
  sidebarClassName = 'bg-[#112038]',
  sectionClassName = 'bg-gradient-to-br from-stone-50 to-fuchsia-50',
  renderSection = null,
  onActiveChange = null,
  autoScrollDelay = 1500,
  basePath = null,
}) {
  const sectionIds = sections.map((s) => s.id);
  const active = useScrollSpy(sectionIds);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  );

  // Responsive handler
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setIsMobileNavOpen(false);
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Notify parent of active section changes
  useEffect(() => {
    if (onActiveChange) {
      onActiveChange(active);
    }
  }, [active, onActiveChange]);

  // Auto-scroll to first section on mount (desktop only)
  useEffect(() => {
    if (autoScrollDelay > 0 && !window.location.hash && window.innerWidth >= 768) {
      const timer = setTimeout(() => {
        scrollToSection(sections[0]?.id, { smooth: false });
        window.dispatchEvent(new Event('scroll'));
      }, autoScrollDelay);
      return () => clearTimeout(timer);
    }
  }, [autoScrollDelay, sections]);

  // Scroll handler with smooth easing
  const handleSectionClick = useCallback((id) => {
    window.dispatchEvent(new CustomEvent('nav-activate', { detail: id }));
    const el = document.getElementById(id);
    if (el) {
      const rect = el.getBoundingClientRect();
      // Account for navbar height (6rem = 96px, matching scroll-mt-24 and sticky top-24)
      const navbarOffset = 96;
      const targetY = rect.top + window.scrollY - navbarOffset;
      smoothScrollTo(targetY);
    }
    history.replaceState(null, '', `#${id}`);
    setIsMobileNavOpen(false);
  }, []);

  // Animation configurations
  const sidebarMotion = createSidebarMotion(sidebarConfig);
  const sectionVariants = createSectionVariants(sectionConfig);

  return (
    <>
      {/* Optional background layer (videos, gradients, etc.) */}
      {backgroundLayer}

      {/* Main content layer */}
      <div
        className="relative min-h-screen"
        style={{ position: 'relative', zIndex: backgroundLayer ? 1 : 'auto' }}
      >
        <main
          className="mx-auto max-w-6xl px-4 pb-24 pt-16"
          style={{ scrollPaddingTop: '6rem' }}
        >
          {/* Mobile Navigation */}
          {isMobile && (
            <MobileNav
              isOpen={isMobileNavOpen}
              onClose={() => setIsMobileNavOpen(!isMobileNavOpen)}
              activeSection={active}
              onSectionClick={handleSectionClick}
            />
          )}

          <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-12 md:gap-8 sm:gap-4 items-start max-w-6xl mx-auto">
            {/* Desktop Sidebar */}
            <AnimatePresence>
              {!isMobile && (
                <motion.aside
                  {...sidebarMotion}
                  className={`sticky top-24 w-72 px-6 pr-10 py-8 rounded-lg shadow-lg select-none ${sidebarClassName}`}
                >
                  <ul role="list" className="space-y-1">
                    {sections.map((s, idx) => (
                      <SidebarItem
                        key={s.id}
                        id={s.id}
                        title={idx === 0 ? s.title : `${idx}. ${s.title}`}
                        active={active === s.id}
                        onSectionClick={handleSectionClick}
                      />
                    ))}
                  </ul>
                </motion.aside>
              )}
            </AnimatePresence>

            {/* Article Content */}
            <article className="space-y-16 rounded-lg px-4 py-14 md:px-10 md:pt-8">
              {sections.map((section, idx) =>
                renderSection ? (
                  renderSection(section, idx, sectionVariants)
                ) : (
                  <ContentSection
                    key={section.id}
                    section={section}
                    index={idx}
                    variants={sectionVariants}
                    className={sectionClassName}
                  />
                )
              )}
              {/* Spacer for scroll-spy alignment */}
              <div className="h-screen" aria-hidden="true"></div>
            </article>
          </div>
        </main>
      </div>
    </>
  );
}
