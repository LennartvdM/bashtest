import React, { useState, useEffect, useCallback, useRef } from 'react';
import useScrollSpy from '../../hooks/useScrollSpy';
import { smoothScrollTo } from './animations';
import { renderMarkdown } from '../../utils/renderMarkdown';
import '../../styles/sidebar.css';

/**
 * Shared layout for sidebar-based article pages.
 * Ported visual style: CSS-based highlighter, passing effect, mobile drawer.
 */
export default function SidebarLayout({
  sections,
  sidebarTitle = null,
  backgroundLayer = null,
  renderSection = null,
  onActiveChange = null,
  autoScrollDelay = 1500,
  sectionStyle = {},
  sectionClassName = '',
}) {
  const sectionIds = sections.map((s) => s.id);
  const active = useScrollSpy(sectionIds);
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  );
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Refs for highlighter positioning
  const sidebarRef = useRef(null);
  const highlighterRef = useRef(null);
  const highlighterInitialized = useRef(false);
  const prevActiveRef = useRef(active);

  // Responsive handler
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setDrawerOpen(false);
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Notify parent of active section changes
  useEffect(() => {
    if (onActiveChange) onActiveChange(active);
  }, [active, onActiveChange]);

  // Auto-scroll to first section on mount (desktop only)
  useEffect(() => {
    if (autoScrollDelay > 0 && !window.location.hash && window.innerWidth >= 768) {
      const timer = setTimeout(() => {
        const el = document.getElementById(sections[0]?.id);
        if (el) {
          el.scrollIntoView({ behavior: 'auto', block: 'start' });
          window.dispatchEvent(new Event('scroll'));
        }
      }, autoScrollDelay);
      return () => clearTimeout(timer);
    }
  }, [autoScrollDelay, sections]);

  // ---------- Highlighter positioning ----------
  useEffect(() => {
    if (isMobile) return;
    const sidebar = sidebarRef.current;
    const hl = highlighterRef.current;
    if (!sidebar || !hl) return;

    const activeEl =
      sidebar.querySelector('.sb-item.active') ||
      sidebar.querySelector('.sb-divider-clickable.active');

    if (activeEl) {
      const sidebarRect = sidebar.getBoundingClientRect();
      const itemRect = activeEl.getBoundingClientRect();
      const topPos = itemRect.top - sidebarRect.top + sidebar.scrollTop;

      if (!highlighterInitialized.current) {
        hl.style.transition = 'none';
        hl.style.top = topPos + 'px';
        hl.style.height = itemRect.height + 'px';
        void hl.offsetHeight; // force reflow
        hl.style.transition = '';
        highlighterInitialized.current = true;
      } else {
        hl.style.top = topPos + 'px';
        hl.style.height = itemRect.height + 'px';
      }
      hl.classList.add('active', 'highlighter-item');
    } else {
      hl.classList.remove('active', 'highlighter-item');
    }
  }, [active, isMobile]);

  // ---------- Passing effect ----------
  useEffect(() => {
    if (isMobile) return;
    const prev = prevActiveRef.current;
    prevActiveRef.current = active;
    if (!prev || prev === active) return;

    const fromIdx = sectionIds.indexOf(prev);
    const toIdx = sectionIds.indexOf(active);
    if (fromIdx === -1 || toIdx === -1) return;

    const direction = toIdx > fromIdx ? 1 : -1;
    const start = Math.min(fromIdx, toIdx) + 1;
    const end = Math.max(fromIdx, toIdx);
    const itemCount = end - start;
    if (itemCount <= 0) return;

    const travelTime = 350;
    const passingDuration = 40;
    const delayPerItem = travelTime / (itemCount + 1);
    const sidebar = sidebarRef.current;
    if (!sidebar) return;

    for (let i = start; i < end; i++) {
      const id = sectionIds[i];
      const item = sidebar.querySelector(`[data-section-id="${id}"]`);
      if (!item) continue;

      const position = direction > 0 ? (i - start) : (end - 1 - i);
      const delay = delayPerItem * (position + 1);

      setTimeout(() => {
        item.classList.add('passing');
        setTimeout(() => item.classList.remove('passing'), passingDuration);
      }, delay);
    }
  }, [active, isMobile, sectionIds]);

  // ---------- Section click handler ----------
  const handleSectionClick = useCallback(
    (id) => {
      window.dispatchEvent(new CustomEvent('nav-activate', { detail: id }));
      const el = document.getElementById(id);
      if (el) {
        const rect = el.getBoundingClientRect();
        const navbarOffset = 96;
        const targetY = rect.top + window.scrollY - navbarOffset;
        smoothScrollTo(targetY);
      }
      history.replaceState(null, '', `#${id}`);
      if (drawerOpen) closeDrawer();
    },
    [drawerOpen]
  );

  // ---------- Mobile drawer ----------
  const openDrawer = useCallback(() => {
    document.body.dataset.scrollY = String(window.scrollY);
    document.body.style.top = `-${window.scrollY}px`;
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    document.body.classList.add('sb-drawer-open');
    setDrawerOpen(true);
  }, []);

  const closeDrawer = useCallback(() => {
    document.body.classList.remove('sb-drawer-open');
    const scrollY = parseInt(document.body.dataset.scrollY || '0', 10);
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.width = '';
    window.scrollTo(0, scrollY);
    setDrawerOpen(false);
  }, []);

  const toggleDrawer = useCallback(() => {
    if (drawerOpen) closeDrawer();
    else openDrawer();
  }, [drawerOpen, openDrawer, closeDrawer]);

  // Swipe gestures
  useEffect(() => {
    if (!isMobile) return;

    let touchStartX = 0;
    let touchEndX = 0;

    const onTouchStart = (e) => {
      touchStartX = e.changedTouches[0].screenX;
    };
    const onTouchEnd = (e) => {
      touchEndX = e.changedTouches[0].screenX;
      const diff = touchEndX - touchStartX;
      const threshold = 50;
      if (diff > threshold && touchStartX < 50) openDrawer();
      if (diff < -threshold && drawerOpen) closeDrawer();
    };

    document.addEventListener('touchstart', onTouchStart, { passive: true });
    document.addEventListener('touchend', onTouchEnd, { passive: true });
    return () => {
      document.removeEventListener('touchstart', onTouchStart);
      document.removeEventListener('touchend', onTouchEnd);
    };
  }, [isMobile, drawerOpen, openDrawer, closeDrawer]);

  // Escape key closes drawer
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape' && drawerOpen) closeDrawer();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [drawerOpen, closeDrawer]);

  // ---------- Render ----------
  return (
    <>
      {backgroundLayer}

      <div
        className="relative min-h-screen"
        style={{ position: 'relative', zIndex: backgroundLayer ? 1 : 'auto' }}
      >
        {/* Mobile menu button */}
        <button
          type="button"
          className={`sb-mobile-menu-btn ${drawerOpen ? 'active' : ''}`}
          onClick={toggleDrawer}
          aria-label="Open menu"
        >
          <span className="sb-hamburger-line" />
          <span className="sb-hamburger-line" />
          <span className="sb-hamburger-line" />
        </button>

        {/* Mobile overlay */}
        <div
          className={`sb-mobile-overlay ${drawerOpen ? 'active' : ''}`}
          onClick={closeDrawer}
        />

        <div className="sb-page-grid">
          {/* Sidebar */}
          <div
            ref={sidebarRef}
            className={`sb-sidebar ${drawerOpen ? 'mobile-open' : ''}`}
          >
            <div ref={highlighterRef} className="sb-highlighter" />

            {sidebarTitle && (
              <>
                <h2>{sidebarTitle}</h2>
                <div className="sb-divider-full" />
              </>
            )}

            {sections.map((s, idx) => (
              <div
                key={s.id}
                className={`sb-item ${active === s.id ? 'active' : ''}`}
                data-section-id={s.id}
                onClick={() => handleSectionClick(s.id)}
              >
                <span className="sb-status" />
                <span className="sb-label">
                  {idx === 0 ? s.title : `${idx}. ${s.title}`}
                </span>
              </div>
            ))}
          </div>

          {/* Content column */}
          <div className="sb-content-column">
            <article>
              {sections.map((section, idx) =>
                renderSection ? (
                  renderSection(section, idx)
                ) : (
                  <SidebarContentSection
                    key={section.id}
                    section={section}
                    style={sectionStyle}
                    className={sectionClassName}
                  />
                )
              )}
              <div className="sb-scroll-spacer" aria-hidden="true" />
            </article>
          </div>
        </div>
      </div>
    </>
  );
}

/**
 * Default content section renderer with outcrop styling.
 */
function SidebarContentSection({ section, style = {}, className = '' }) {
  const { id, title, content, rawContent, children } = section;

  // Support both pre-rendered and raw markdown content
  let displayContent = null;
  if (rawContent || content) {
    displayContent = renderMarkdown(rawContent || content);
  }

  return (
    <section
      id={id}
      className={`sb-section-card ${className}`}
      style={style}
    >
      <h2
        style={{
          fontFamily: 'Inter, sans-serif',
          fontWeight: 900,
          fontSize: '40px',
          color: '#383437',
          letterSpacing: '-0.01em',
          marginBottom: '1.5rem',
        }}
      >
        {title}
      </h2>
      {displayContent && (
        <div
          style={{
            fontFamily: 'Inter, sans-serif',
            fontWeight: 500,
            fontSize: '16px',
            color: '#666666',
            maxWidth: '28rem',
            whiteSpace: 'pre-wrap',
          }}
          dangerouslySetInnerHTML={{ __html: displayContent }}
        />
      )}
      {children}
    </section>
  );
}
