# Project Overview

React SPA (Vite + Tailwind) — tablet-first portfolio site with full-screen scroll-snapping sections, video backgrounds, and animated transitions. Deployed on Netlify.

## GitHub Context Selection Guide

When including this repo in a Claude project, **always uncheck these** (they waste context and provide no value):

- `package-lock.json` (~39% of context — auto-generated, never useful)
- `docs/` (~4% — reference docs, only needed for tablet layout decisions)
- `public/` (~1% — binary video assets)

**For a typical task**, include only what you need:

| Task | Include these folders | ~Context |
|------|-----------------------|----------|
| Architecture / routing | `CLAUDE.md` + `src/App.jsx` + `src/pages/` + `src/components/ScrollSnap.jsx` | ~5% |
| Medical section work | Above + `src/components/sections/medical/` + `src/components/sections/MedicalSection*.jsx` | ~20% |
| World map work | Architecture + `src/components/sections/worldmap/` | ~15% |
| Tablet layout bugs | Architecture + `src/hooks/` + the relevant section folder | ~12% |
| Full codebase review | Everything except `package-lock.json`, `docs/`, `public/`, `src/components/dev/` | ~55% |

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

### sections/ folder structure

Each section that has internals gets its own subfolder — one uncheck in the file picker excludes all of it:

```
sections/
  MedicalSection.jsx              → 17-line shell (picks tablet vs desktop)
  MedicalSectionV2.jsx            → V2 variant wrapper
  MedicalSectionV3.jsx            → V3 variant wrapper
  HeroSection.jsx                 → Hero/landing
  ContactSection.jsx              → Contact form
  SkillsSection.jsx               → Skills display
  ProjectsSection.jsx             → Projects showcase
  medical/                        → Uncheck = shed ALL medical internals + components
    ├─ useMedicalSection.jsx      → Orchestration hook (state, effects, handlers)
    ├─ MedicalTabletLayout.jsx    → Tablet portrait render path
    ├─ MedicalDesktopLayout.jsx   → Desktop render path
    ├─ MedicalSection.data.js     → VARIANTS config (video URLs, headlines)
    ├─ MedicalSection.styles.js   → Style constants + CSS
    ├─ MedicalSection.reducers.js → State reducers
    ├─ MedicalCarousel.jsx        → Desktop video carousel
    ├─ TabletMedicalCarousel.jsx  → Tablet video carousel
    ├─ TabletBlurBackground.jsx   → Blurred video backgrounds
    ├─ TabletTravellingBar.jsx    → Tablet progress indicator
    └─ VideoManager.jsx           → Video playback management
  worldmap/                       → Uncheck = shed world map section (largest single file)
    └─ WorldMapSection.jsx        → Interactive world map (~45KB)
```

## File Tiers

### Tier 1 — Architecture (read first for any task)
- `src/App.jsx` — Routing, shell layout
- `src/pages/Home.jsx` — Section composition, lazy loading
- `src/components/ScrollSnap.jsx` — Scroll-snap engine + nav dots
- `src/components/SectionManager.jsx` — Section observer
- `src/components/ScrollSection.jsx` — Section viewport tracking

### Tier 2 — Page Sections (read when working on a specific section)
- `src/components/sections/MedicalSection.jsx` — Slim shell, picks tablet vs desktop
- `src/components/sections/MedicalSectionV2.jsx` — V2 variant wrapper
- `src/components/sections/MedicalSectionV3.jsx` — V3 variant wrapper
- `src/components/sections/HeroSection.jsx` — Hero/landing section
- `src/components/sections/worldmap/WorldMapSection.jsx` — Interactive world map
- `src/components/sections/ContactSection.jsx` — Contact form section
- `src/components/sections/SkillsSection.jsx` — Skills display
- `src/components/sections/ProjectsSection.jsx` — Projects showcase

### Tier 2b — MedicalSection internals (`sections/medical/` — one uncheck sheds everything)
- `src/components/sections/medical/useMedicalSection.jsx` — All state, effects, handlers (the "brain")
- `src/components/sections/medical/MedicalTabletLayout.jsx` — Tablet portrait animation JSX
- `src/components/sections/medical/MedicalDesktopLayout.jsx` — Desktop animation JSX
- `src/components/sections/medical/MedicalSection.data.js` — Video URLs, headlines, header text
- `src/components/sections/medical/MedicalSection.styles.js` — Style constants + injected CSS
- `src/components/sections/medical/MedicalSection.reducers.js` — Visibility, measurements, interaction reducers
- `src/components/sections/medical/MedicalCarousel.jsx` — Desktop video carousel
- `src/components/sections/medical/TabletMedicalCarousel.jsx` — Tablet video carousel
- `src/components/sections/medical/TabletBlurBackground.jsx` — Blurred video backgrounds
- `src/components/sections/medical/TabletTravellingBar.jsx` — Tablet progress indicator
- `src/components/sections/medical/VideoManager.jsx` — Video playback management

### Tier 3 — Shared Components & Hooks (read when debugging layout/behavior)
- `src/hooks/useTabletLayout.js` — Tablet detection + layout state
- `src/hooks/useViewport.js` — Viewport dimensions + orientation
- `src/hooks/useSectionLifecycle.js` — Section mount/unmount lifecycle
- `src/hooks/useScrollSpy.js` — Scroll position tracking
- `src/hooks/useDebounce.js` — Debounce utility
- `src/components/Navbar.jsx` — Top navigation bar
- `src/components/MobileNav.jsx` — Mobile navigation
- `src/components/AutoFitHeading.jsx` — Auto-sizing headings
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

### Tier 5 — Dev-only (`src/components/dev/` — safe to ignore)
- `src/components/dev/FPSCounter.jsx` — Performance overlay (dev tool)
- `src/components/dev/examples/` — Example code
- `src/components/Section.jsx` — Generic section shell, only used by Toolbox
- `src/version.js`, `src/version.txt` — Build-time generated
- `docs/TABLET_BEST_PRACTICES.md` — Reference docs

## Key Patterns
- **Tablet-first**: Most components branch on `useTabletLayout()` for separate desktop/tablet rendering paths
- **Scroll-snap sections**: Each full-screen section is a `ScrollSection` inside `ScrollSnap`
- **Lazy loading**: All sections except Hero are `React.lazy()` with dark fallback backgrounds
- **Video strategy**: Original + blur variants in `public/videos/`, managed by `VideoManager`

## Commands
- `npm run dev` — Start dev server (Vite)
- `npm run build` — Production build
- `npm run preview` — Preview production build
