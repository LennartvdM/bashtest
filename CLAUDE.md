# Project Overview

React SPA (Vite + Tailwind) — tablet-first portfolio site with full-screen scroll-snapping sections, video backgrounds, and animated transitions. Deployed on Netlify.

## Architecture

```
App.jsx                     → Router: /, /neoflix, /blog, /toolbox, /map-editor, /admin
  └─ Home.jsx               → Main page (5 scroll-snap sections)
       ├─ ScrollSnap.jsx     → Scroll-snap container + navigation dots
       ├─ SectionManager.jsx → IntersectionObserver orchestration
       ├─ ScrollSection.jsx  → Individual section viewport tracking
       └─ Sections:
            HeroSection         (eagerly loaded)
            MedicalSectionV2    (lazy, wraps MedicalSection with variant="v2")
            MedicalSectionV3    (lazy, wraps MedicalSection with variant="v3")
            WorldMapSection     (lazy)
            ContactSection      (lazy)
```

MedicalSection.jsx (1486 LOC) is the largest and most complex component — it handles dual desktop/tablet layouts, video carousels, captions, and animated transitions.

## File Tiers

### Tier 1 — Architecture (read first for any task)
- `src/App.jsx` — Routing, shell layout
- `src/pages/Home.jsx` — Section composition, lazy loading
- `src/components/ScrollSnap.jsx` — Scroll-snap engine + nav dots
- `src/components/SectionManager.jsx` — Section observer
- `src/components/ScrollSection.jsx` — Section viewport tracking

### Tier 2 — Page Sections (read when working on a specific section)
- `src/components/sections/MedicalSection.jsx` — Core medical carousel (V2+V3 base)
- `src/components/sections/MedicalSectionV2.jsx` — V2 variant wrapper
- `src/components/sections/MedicalSectionV3.jsx` — V3 variant wrapper
- `src/components/sections/HeroSection.jsx` — Hero/landing section
- `src/components/sections/WorldMapSection.jsx` — Interactive world map
- `src/components/sections/ContactSection.jsx` — Contact form section
- `src/components/sections/SkillsSection.jsx` — Skills display
- `src/components/sections/ProjectsSection.jsx` — Projects showcase

### Tier 3 — Shared Components & Hooks (read when debugging layout/behavior)
- `src/hooks/useTabletLayout.js` — Tablet detection + layout state
- `src/hooks/useViewport.js` — Viewport dimensions + orientation
- `src/hooks/useSectionLifecycle.js` — Section mount/unmount lifecycle
- `src/hooks/useScrollSpy.js` — Scroll position tracking
- `src/hooks/useDebounce.js` — Debounce utility
- `src/components/Navbar.jsx` — Top navigation bar
- `src/components/MobileNav.jsx` — Mobile navigation
- `src/components/MedicalCarousel.jsx` — Desktop video carousel
- `src/components/TabletMedicalCarousel.jsx` — Tablet video carousel
- `src/components/TabletBlurBackground.jsx` — Blurred video backgrounds
- `src/components/TabletTravellingBar.jsx` — Tablet progress indicator
- `src/components/AutoFitHeading.jsx` — Auto-sizing headings
- `src/components/VideoManager.jsx` — Video playback management
- `src/components/shared/` — ContentSection, SidebarLayout, SidebarItem, animations

### Tier 4 — Secondary Pages & Config (usually skip)
- `src/pages/Blog.jsx`, `src/pages/Toolbox.jsx`, `src/pages/CMSAdmin.jsx`
- `src/components/Sidebar.jsx` — Neoflix page sidebar
- `src/components/BlogSection.jsx` — Blog cards
- `src/components/ToolboxEmbed.jsx` — Toolbox iframe embeds
- `src/components/WorldMapEditor/` — Map location editor
- `src/components/SimpleCookieCutterBand.jsx`, `MirroredCookieCutterBand.jsx` — Decorative bands
- `src/data/` — Static content data (blog.js, contact.js, neoflix.js)
- `src/styles/`, `src/index.css` — Global styles
- Config files: `vite.config.js`, `tailwind.config.js`, `netlify.toml`, `postcss.config.js`

### Tier 5 — Unused / Dev-only (safe to ignore)
- `src/components/MedicalCarousel.tsx` — TSX duplicate, not imported
- `src/components/Table/Table.tsx` — Not imported anywhere
- `src/components/SectionDebugger.jsx` — Debug overlay, not imported
- `src/components/examples/TabletOptimizedSection.example.jsx` — Example code
- `src/components/Section.jsx` — Generic section shell, not used by Home
- `src/version.js`, `src/version.txt` — Build-time generated
- `TABLET_BEST_PRACTICES.md` — Reference docs

## Key Patterns
- **Tablet-first**: Most components branch on `useTabletLayout()` for separate desktop/tablet rendering paths
- **Scroll-snap sections**: Each full-screen section is a `ScrollSection` inside `ScrollSnap`
- **Lazy loading**: All sections except Hero are `React.lazy()` with dark fallback backgrounds
- **Video strategy**: Original + blur variants in `public/videos/`, managed by `VideoManager`

## Commands
- `npm run dev` — Start dev server (Vite)
- `npm run build` — Production build
- `npm run preview` — Preview production build
