// Neoflix page — video backdrop + shared sidebar layout
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';

import { SidebarLayout } from './shared';
import { renderMarkdown } from '../utils/renderMarkdown';
import {
  sections as SECTIONS,
  sectionToVideo as SECTION_TO_VIDEO,
  deckSources as DECK_SOURCES,
  pageStyle,
} from '../data/neoflix';

const sectionsWithContent = SECTIONS.map((s) => ({
  ...s,
  rawContent: s.content,
}));

export default function SidebarScrollSpyDemo() {
  // Force remount detection
  useEffect(() => {
    const expectedVersion = '2026-02-16-neoflix-v4-crossfade-dim';
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

  const location = useLocation();
  const backdropRef = useRef(null);
  const [activeSection, setActiveSection] = useState(null);

  // Load all videos immediately for deck carousel
  const [loadedSources] = useState(() => new Set(DECK_SOURCES));

  // Enforce half-speed playback on all backdrop videos
  useEffect(() => {
    const root = backdropRef.current;
    if (!root) return;
    const videos = root.querySelectorAll('video');
    videos.forEach((vid) => {
      try {
        vid.defaultPlaybackRate = 0.5;
        vid.playbackRate = 0.5;
        if (vid.paused) vid.play().catch(() => {});
      } catch (err) {
        // ignore
      }
    });
  }, [loadedSources]);

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

  // Handle hash changes while staying on the same page
  const hashEffectRef = useRef(true);
  useEffect(() => {
    if (location.pathname !== '/neoflix') return;
    if (hashEffectRef.current) {
      hashEffectRef.current = false;
      return;
    }
    const targetId = location.hash
      ? location.hash.replace('#', '')
      : sectionsWithContent[0].id;
    const scrollAfterLayout = () => {
      const el = document.getElementById(targetId);
      if (el) {
        window.dispatchEvent(new CustomEvent('nav-activate', { detail: targetId }));
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        history.replaceState(null, '', `#${targetId}`);
      } else {
        requestAnimationFrame(scrollAfterLayout);
      }
    };
    requestAnimationFrame(() => requestAnimationFrame(scrollAfterLayout));
  }, [location.pathname, location.hash]);

  // Video deck: determine which card is on top based on active section
  const targetVideo = SECTION_TO_VIDEO[activeSection];
  const targetIndex = DECK_SOURCES.indexOf(targetVideo);

  // Soften text during video crossfade
  const [bgTransitioning, setBgTransitioning] = useState(false);
  const prevTargetIndex = useRef(targetIndex);
  const journeyStartRef = useRef(null);
  useLayoutEffect(() => {
    if (targetIndex !== prevTargetIndex.current) {
      prevTargetIndex.current = targetIndex;
      setBgTransitioning(true);
      if (!journeyStartRef.current) journeyStartRef.current = Date.now();
      const elapsed = Date.now() - journeyStartRef.current;
      const delay = elapsed > 500 ? 200 : 450;
      const timer = setTimeout(() => {
        setBgTransitioning(false);
        journeyStartRef.current = null;
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [targetIndex]);

  // Video deck backdrop layer
  const videoDeck = (
    <div
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0, backgroundColor: '#6d625d' }}
    >
      <motion.div
        ref={backdropRef}
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.0, ease: 'easeOut' }}
      >
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
              style={{ transform: 'scale(1.06)', zIndex: idx }}
              onAnimationStart={(def) => {
                if (def?.opacity === 1) {
                  const vid = backdropRef.current?.querySelectorAll('video')[idx];
                  if (vid?.paused) {
                    vid.playbackRate = 0.5;
                    vid.play().catch(() => {});
                  }
                }
              }}
              onAnimationComplete={(def) => {
                if (def?.opacity === 0) {
                  const vid = backdropRef.current?.querySelectorAll('video')[idx];
                  if (vid && !vid.paused) vid.pause();
                }
              }}
              onLoadedData={(e) => {
                e.target.playbackRate = 0.5;
                e.target.defaultPlaybackRate = 0.5;
                if (isVisible) e.target.play().catch(() => {});
              }}
              onCanPlay={(e) => {
                e.target.playbackRate = 0.5;
                e.target.defaultPlaybackRate = 0.5;
                if (isVisible) e.target.play().catch(() => {});
              }}
            />
          );
        })}
        <div className="absolute inset-0 bg-slate-900/20" />
      </motion.div>
    </div>
  );

  // Custom section renderer that applies content dimming during video transitions
  const renderNeoflixSection = (section, idx) => {
    const displayContent = renderMarkdown(section.rawContent || section.content || '');
    return (
      <section
        key={section.id}
        id={section.id}
        className="sb-section-card"
        style={pageStyle.sectionStyle}
      >
        <div
          style={
            bgTransitioning
              ? { opacity: 0.65, transition: 'opacity 0.15s ease-in' }
              : { opacity: 1, transition: 'opacity 0.12s ease-out' }
          }
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
            {section.title}
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
        </div>
      </section>
    );
  };

  return (
    <SidebarLayout
      sections={sectionsWithContent}
      backgroundLayer={videoDeck}
      renderSection={renderNeoflixSection}
      onActiveChange={setActiveSection}
      autoScrollDelay={3500}
    />
  );
}
