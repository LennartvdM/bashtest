// SidebarScrollSpyDemo.jsx (plain JS)
// React 18 · Tailwind CSS 3 · framer-motion 10
// Refactored to use shared CMS-ready components
import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';

// Shared components
import useScrollSpy from '../hooks/useScrollSpy';
import MobileNav from './MobileNav';
import SidebarItem from './shared/SidebarItem';
import ContentSection from './shared/ContentSection';
import { createSidebarMotion, createSectionVariants, scrollToSection, smoothScrollTo } from './shared/animations';

// CMS-ready data
import {
  sections as SECTIONS,
  sectionToVideo as SECTION_TO_VIDEO,
  deckSources as DECK_SOURCES,
  animationConfig,
  pageStyle,
} from '../data/neoflix';

// Prepare sections with content
const sectionsWithContent = SECTIONS.map((s) => ({
  ...s,
  rawContent: s.content,
}));

export default function SidebarScrollSpyDemo() {
  // Force remount detection
  useEffect(() => {
    const expectedVersion = '2025-01-06-neoflix-v3-shared';
    const stored = sessionStorage.getItem('neoflix-version');
    if (stored && stored !== expectedVersion) {
      sessionStorage.setItem('neoflix-version', expectedVersion);
      window.location.reload();
      return;
    }
    if (!stored) {
      sessionStorage.setItem('neoflix-version', expectedVersion);
    }
  }, []);

  const sectionIds = sectionsWithContent.map((s) => s.id);
  const active = useScrollSpy(sectionIds);
  const location = useLocation();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [loadedSources, setLoadedSources] = useState(() => new Set());
  const backdropRef = useRef(null);

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

  // Load all videos immediately for deck carousel
  useEffect(() => {
    setLoadedSources(new Set(DECK_SOURCES));
    console.log('Deck carousel: Loading videos', DECK_SOURCES);
  }, []);

  // Enforce half-speed playback on all backdrop videos (only once after load)
  useEffect(() => {
    const root = backdropRef.current;
    if (!root) return;
    const videos = root.querySelectorAll('video');
    videos.forEach((vid, idx) => {
      try {
        vid.defaultPlaybackRate = 0.5;
        vid.playbackRate = 0.5;
        if (vid.paused) {
          vid.play().catch(() => {});
        }
      } catch (err) {
        console.log(`Video ${idx} error:`, err);
      }
    });
  }, [loadedSources]);

  // Unified scroll function
  const scrollToSectionHandler = useCallback((id) => {
    window.dispatchEvent(new CustomEvent('nav-activate', { detail: id }));
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      history.replaceState(null, '', `#${id}`);
    }
  }, []);

  // Force base background while on Neoflix
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const prevHtmlBg = html.style.backgroundColor;
    const prevBodyBg = body.style.backgroundColor;
    html.style.backgroundColor = pageStyle.backgroundColor;
    body.style.backgroundColor = pageStyle.backgroundColor;
    return () => {
      html.style.backgroundColor = prevHtmlBg;
      body.style.backgroundColor = prevBodyBg;
    };
  }, []);

  // Auto-scroll on mount
  useEffect(() => {
    const hasHash = !!window.location.hash;
    const prefersDesktop = window.innerWidth >= 768;
    if (!hasHash && prefersDesktop) {
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('nav-activate', { detail: sectionsWithContent[0].id }));
        document.getElementById(sectionsWithContent[0].id)?.scrollIntoView({ behavior: 'auto', block: 'start' });
        history.replaceState(null, '', `#${sectionsWithContent[0].id}`);
        window.dispatchEvent(new Event('scroll'));
      }, 3500);
    } else if (hasHash) {
      const targetId = window.location.hash.replace('#', '');
      window.scrollTo({ top: 0, behavior: 'auto' });
      setTimeout(() => {
        const el = document.getElementById(targetId);
        if (el) {
          void el.offsetHeight;
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              scrollToSectionHandler(targetId);
            });
          });
        }
      }, 3500);
    }
  }, [scrollToSectionHandler]);

  // Handle hash changes while staying on the same page
  const hashEffectRef = useRef(true);
  useEffect(() => {
    if (location.pathname !== '/neoflix') return;
    if (hashEffectRef.current) {
      hashEffectRef.current = false;
      return;
    }

    const targetId = location.hash ? location.hash.replace('#', '') : sectionsWithContent[0].id;
    const scrollAfterLayout = () => {
      const el = document.getElementById(targetId);
      if (el) {
        scrollToSectionHandler(targetId);
      } else {
        requestAnimationFrame(scrollAfterLayout);
      }
    };

    requestAnimationFrame(() => {
      requestAnimationFrame(scrollAfterLayout);
    });
  }, [location.pathname, location.hash, scrollToSectionHandler]);

  const handleSectionClick = (id) => {
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
  };

  // Animation configs from shared
  const sidebarMotion = createSidebarMotion(animationConfig.sidebar);
  const sectionVariants = createSectionVariants(animationConfig.section);

  // Get target video for current active section
  const targetVideo = SECTION_TO_VIDEO[active];
  const targetIndex = DECK_SOURCES.indexOf(targetVideo);

  // Dim foreground text during video crossfade so it doesn't compete
  const [bgTransitioning, setBgTransitioning] = useState(false);
  const prevTargetIndex = useRef(targetIndex);
  useEffect(() => {
    if (targetIndex !== prevTargetIndex.current) {
      prevTargetIndex.current = targetIndex;
      setBgTransitioning(true);
      // 0.2s fade-out + 0.2s hold + 0.2s fade-in
      const timer = setTimeout(() => setBgTransitioning(false), 400);
      return () => clearTimeout(timer);
    }
  }, [targetIndex]);

  return (
    <>
      {/* Video deck carousel backdrop */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          zIndex: 0,
          backgroundColor: '#6d625d',
        }}
      >
        <motion.div
          ref={backdropRef}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.0, ease: 'easeOut' }}
        >
          {/* Deck: all videos stacked, fade out cards above target */}
          {DECK_SOURCES.map((src, idx) => {
            const isVisible = targetIndex >= 0 ? idx <= targetIndex : true;

            return (
              <motion.video
                key={src}
                className="absolute inset-0 w-full h-full object-cover"
                src={src}
                autoPlay={isVisible}
                muted
                loop
                playsInline
                preload={isVisible ? 'auto' : 'metadata'}
                initial={{ opacity: isVisible ? 1 : 0 }}
                animate={{ opacity: isVisible ? 1 : 0 }}
                transition={{ duration: 0.6, ease: 'easeInOut' }}
                style={{
                  transform: 'scale(1.06)',
                  zIndex: idx,
                }}
                onAnimationStart={(definition) => {
                  // Resume playback before fade-in starts
                  if (definition?.opacity === 1) {
                    const vid = backdropRef.current?.querySelectorAll('video')[idx];
                    if (vid?.paused) {
                      vid.playbackRate = 0.5;
                      vid.play().catch(() => {});
                    }
                  }
                }}
                onAnimationComplete={(definition) => {
                  // Pause after fade-out completes to free GPU decode
                  if (definition?.opacity === 0) {
                    const vid = backdropRef.current?.querySelectorAll('video')[idx];
                    if (vid && !vid.paused) vid.pause();
                  }
                }}
                onLoadedData={(e) => {
                  const vid = e.target;
                  vid.playbackRate = 0.5;
                  vid.defaultPlaybackRate = 0.5;
                  if (isVisible) vid.play().catch(() => {});
                }}
                onCanPlay={(e) => {
                  const vid = e.target;
                  vid.playbackRate = 0.5;
                  vid.defaultPlaybackRate = 0.5;
                  if (isVisible) vid.play().catch(() => {});
                }}
              />
            );
          })}
          {/* Readability overlay */}
          <div className="absolute inset-0 bg-slate-900/20" />
        </motion.div>
      </div>

      {/* Foreground content */}
      <div className="relative min-h-screen" style={{ position: 'relative', zIndex: 1 }}>
        <main className="mx-auto max-w-6xl px-4 pb-24 pt-16" style={{ scrollPaddingTop: '6rem' }}>
          {isMobile && (
            <MobileNav
              isOpen={isMobileNavOpen}
              onClose={() => setIsMobileNavOpen(!isMobileNavOpen)}
              activeSection={active}
              onSectionClick={handleSectionClick}
            />
          )}
          <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-12 md:gap-8 sm:gap-4 items-start max-w-6xl mx-auto">
            <AnimatePresence>
              {!isMobile && (
                <motion.aside
                  {...sidebarMotion}
                  className={`sticky top-24 w-72 px-6 pr-10 py-8 rounded-lg shadow-lg select-none ${pageStyle.sidebarClassName}`}
                >
                  <ul role="list" className="space-y-1">
                    {sectionsWithContent.map((s, idx) => (
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
            <article className="space-y-16 rounded-lg px-4 py-14 md:px-10 md:pt-8" style={{ opacity: bgTransitioning ? 0.2 : 1, transition: 'opacity 0.2s ease' }}>
              {sectionsWithContent.map((section, idx) => (
                <ContentSection
                  key={section.id}
                  section={section}
                  index={idx}
                  variants={sectionVariants}
                  className=""
                  style={pageStyle.sectionStyle}
                />
              ))}
              <div className="h-screen" aria-hidden="true"></div>
            </article>
          </div>
        </main>
      </div>
    </>
  );
}
