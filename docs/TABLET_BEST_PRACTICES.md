# Tablet Best Practices: Fluid Full-Screen Sections with Frequent Rotation

> **Critical Principle**: Treat tablet rotation as a **state change**, not just a resize. Portrait vs landscape changes available height, UI chrome behavior, interaction style, and reading distance. Your app should anticipate deliberate layout shifts and manage scroll position intentionally.

## Core Principles

### 1. Viewport Units Strategy (CRITICAL)

**`100vh` is a common source of tablet Safari chaos** because it historically included browser UI and changes during rotation/scroll. Modern viewport units fix this.

**Best Practice Pattern:**
```css
/* Always provide fallback for older browsers */
.page { 
  height: 100dvh; 
  height: 100vh; /* Fallback */
  overflow-y: auto; 
}

.section { 
  min-height: 100dvh; 
  min-height: 100vh; /* Fallback */
}

/* If you need "never smaller than visible but can grow" */
.growable-section {
  min-height: 100svh; /* Small viewport - guaranteed visible */
  min-height: 100vh; /* Fallback */
}
```

**Viewport Unit Guide:**
- **`100dvh`** (Dynamic Viewport Height) - **Best for tablets** ⭐
  - Tracks real viewport as UI expands/collapses
  - Adjusts when browser UI appears/disappears
  - Prevents content jumping during scroll
  - Works well with frequent orientation changes
  
- **`100svh`** (Small Viewport Height) - Smallest possible viewport
  - Use when you need guaranteed visibility (e.g., modals, CTAs)
  - "Never smaller than visible area but can grow"
  
- **`100lvh`** (Large Viewport Height) - Largest possible viewport
  - Use for fixed headers/footers that should always be visible
  
- **`100vh`** - Static, doesn't account for browser UI
  - Fine for desktop, **problematic on mobile/tablet**
  - Use only as fallback for older browsers

### 2. Orientation Change Handling (CRITICAL)

**Pattern: During rotation/resize burst:**
1. **Temporarily disable scroll-snap + smooth scroll**
2. **Let layout settle**
3. **Snap once to nearest/active section**

This prevents snap oscillation loops and crashes.

**Three-Phase Approach:**

```javascript
// Phase 1: Lock (prevent operations during change)
const isResizingRef = useRef(false);

const handleOrientationStart = () => {
  isResizingRef.current = true;
  // Disable scroll snap via CSS class
  document.documentElement.classList.add('is-resizing');
  // Cancel animations, scroll operations, etc.
};

// Phase 2: Preserve State
// Remember current section, scroll position, active elements
const currentSectionIndex = findCurrentSection();

// Phase 3: Restore (after layout stabilizes)
setTimeout(() => {
  isResizingRef.current = false;
  document.documentElement.classList.remove('is-resizing');
  restoreScrollPosition(currentSectionIndex);
}, 300); // Wait for browser to complete orientation change
```

**CSS Pattern:**
```css
.page {
  scroll-snap-type: y mandatory;
  scroll-behavior: smooth;
}

html.is-resizing .page {
  scroll-snap-type: none;
  scroll-behavior: auto;
}
```

**Critical Timing:**
- **0-50ms**: Browser is rotating, layout is unstable
- **50-200ms**: Layout recalculating, avoid DOM reads/writes
- **200-300ms**: Safe to restore state
- **300ms+**: Fully stable, resume normal operations

### 3. Single Scroll Container (CRITICAL)

**Rule: Keep exactly one scroll container.**

Pick one:
- `body/html` scrolls, OR
- A `.page` wrapper scrolls

**Nested vertical scroll areas + scroll-snap + dynamic heights = iOS bug farm.**

**Checklist:**
- ✅ Only outer container has `overflow-y: auto`
- ✅ Only outer container has `scroll-snap-type`
- ✅ Inner sections don't have `hidden/auto` overflow unless intentional

**Example:**
```css
/* ✅ GOOD: Single scroll container */
.page {
  height: 100dvh;
  overflow-y: auto;
  scroll-snap-type: y mandatory;
}

.section {
  min-height: 100dvh;
  /* No overflow here */
}

/* ❌ BAD: Nested scroll containers */
.page { overflow-y: auto; }
.section { overflow-y: auto; } /* DON'T DO THIS */
```

### 4. Don't Re-mount Sections Across Breakpoints (CRITICAL)

**Rotation triggers breakpoint changes. If that causes your 4 sections to unmount/remount (different trees, different keys), Safari:**
- Loses snap targets
- Jumps scroll
- Re-snaps
- Loops

**Rule: Keep the four sections mounted with stable keys. Let CSS handle the layout change inside each section.**

```javascript
// ✅ GOOD: Stable keys, CSS handles layout
{sections.map((section, idx) => (
  <Section key={section.id} /> // Stable ID
))}

// ❌ BAD: Keys change on breakpoint
{sections.map((section, idx) => (
  <Section key={`${breakpoint}-${idx}`} /> // Changes on rotation!
))}
```

### 5. Prefer CSS Over JS for Layout (CRITICAL)

**Every JS "measure → set state → re-render" during resize is a chance to create a feedback loop.**

**Use:**
- CSS Grid with `auto-fit`/`minmax`
- Flex wrapping
- `clamp()` for responsive sizing
- Container queries where useful

**Only measure in JS when you must, and then debounce hard.**

```css
/* ✅ GOOD: CSS handles responsiveness */
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
}

.heading {
  font-size: clamp(2rem, 4vw, 4rem);
}
```

```javascript
// ❌ BAD: JS measures and sets state on every resize
useEffect(() => {
  const update = () => {
    const width = container.offsetWidth;
    setColumns(Math.floor(width / 300));
  };
  window.addEventListener('resize', update); // Fires constantly!
}, []);
```

### 6. Use visualViewport API (CRITICAL)

**`window.innerHeight` can be wrong during rotation/UI transitions. `visualViewport.height` reflects the true visible area on mobile Safari.**

```javascript
// ✅ GOOD: Use visualViewport API
const getViewportHeight = () => {
  return window.visualViewport?.height ?? window.innerHeight;
};

// Store in ref, not state (avoids re-renders)
const viewportHeightRef = useRef(getViewportHeight());

useEffect(() => {
  const update = debounce(() => {
    viewportHeightRef.current = getViewportHeight();
  }, 100);
  
  window.visualViewport?.addEventListener('resize', update);
  return () => window.visualViewport?.removeEventListener('resize', update);
}, []);
```

**Never set React state on every tick. Debounce or store in a ref.**

### 7. Layout Patterns

#### Vertical Stack (Your Current Pattern)

**Best For:**
- Storytelling/narrative content
- Sequential information
- Scroll-snap experiences
- Mobile-first designs

**Implementation:**
```javascript
// Container
{
  height: '100dvh',
  overflowY: 'auto',
  scrollSnapType: 'y mandatory', // Desktop
  // Use JS snap for tablets (more reliable)
}

// Sections
{
  height: '100dvh',
  minHeight: '100dvh', // Prevent collapse
  maxHeight: '100dvh', // Prevent expansion
  scrollSnapAlign: 'start',
}
```

#### Grid Layout (Alternative)

**Best For:**
- Dashboard interfaces
- Content browsing
- Multi-column information
- Landscape-optimized experiences

**Implementation:**
```javascript
// Portrait: 1 column
// Landscape: 2-3 columns
const gridColumns = isPortrait ? 1 : isTablet ? 2 : 3;

{
  display: 'grid',
  gridTemplateColumns: `repeat(${gridColumns}, 1fr)`,
  gap: '1rem',
  height: '100dvh',
  overflowY: 'auto',
}
```

### 8. Snap Gently: Use Mandatory Only If It Helps

**Scroll snap is great for four "slides," but on iOS it can glitch when you programmatically adjust layout or scroll.**

**Recommendations:**
- `scroll-snap-type: y mandatory` on stable screens
- During transitions/resizes, set it to `none`
- Use `scroll-snap-stop: always` on sections if you want to avoid skipping
- If content becomes longer than a screen, consider `proximity` instead of `mandatory`

```css
/* ✅ GOOD: Conditional snap */
.page {
  scroll-snap-type: y mandatory;
}

html.is-resizing .page {
  scroll-snap-type: none; /* Disable during rotation */
}

.section {
  scroll-snap-align: start;
  scroll-snap-stop: always; /* Prevent skipping */
}
```

### 9. Respect Safe Areas and UI Intrusion

**On iPad with gestures/bars, CTAs at the very bottom can be partially occluded.**

```css
/* ✅ GOOD: Safe area insets */
.section {
  padding-bottom: env(safe-area-inset-bottom);
  padding-top: env(safe-area-inset-top);
  padding-left: env(safe-area-inset-left);
  padding-right: env(safe-area-inset-right);
}

/* Avoid critical controls within bottom ~64px unless padded */
.cta {
  margin-bottom: max(1rem, env(safe-area-inset-bottom));
}
```

### 10. Make Orientation-Specific Reading Decisions

**Use `@media (orientation: portrait)` / `(orientation: landscape)` for behavioral shifts, not just minor spacing.**

**Examples:**
- **Portrait**: Single-column, bigger type, more vertical rhythm
- **Landscape**: 2-column grid, side-by-side comparisons, persistent nav

**Think of landscape as a "desktop lite," portrait as a "phone plus."**

```css
/* ✅ GOOD: Orientation-specific layouts */
@media (orientation: portrait) {
  .content {
    font-size: 1.25rem;
    line-height: 1.8;
    max-width: 600px;
  }
}

@media (orientation: landscape) {
  .content {
    font-size: 1rem;
    line-height: 1.6;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
  }
}
```

### 11. Performance Optimizations

#### Debounce Everything

```javascript
// ✅ GOOD: Debounced resize handler
const debouncedResize = debounce(updateLayout, 100);

// ❌ BAD: Immediate resize handler
window.addEventListener('resize', updateLayout); // Fires 60+ times!
```

#### Use Passive Event Listeners

```javascript
// ✅ GOOD: Passive listeners for scroll/resize
window.addEventListener('resize', handler, { passive: true });
container.addEventListener('scroll', handler, { passive: true });

// Benefits:
// - Better scroll performance
// - Browser can optimize
// - Prevents blocking main thread
```

#### RequestAnimationFrame Batching

```javascript
// ✅ GOOD: Batch DOM reads/writes
requestAnimationFrame(() => {
  // Read all DOM properties
  const heights = sections.map(s => s.offsetHeight);
  
  requestAnimationFrame(() => {
    // Write all DOM changes
    sections.forEach((s, i) => {
      s.style.height = heights[i] + 'px';
    });
  });
});
```

#### IntersectionObserver Optimization

```javascript
// ✅ GOOD: Recreate observer on orientation change
useEffect(() => {
  if (observerRef.current) {
    observerRef.current.disconnect();
  }
  
  observerRef.current = new IntersectionObserver(callback, {
    threshold: isTablet ? 0.3 : 0.5,
    rootMargin: isTablet ? '-10% 0px' : '0px',
  });
  
  return () => observerRef.current?.disconnect();
}, [isTablet, isPortrait]); // Recreate when viewport changes
```

### 12. Performance Containment for Big Sections

**Four full-bleed sections can be heavy. On rotation, Safari may repaint more than you expect.**

**Good defaults:**
```css
.section {
  contain: layout paint style;
  content-visibility: auto; /* if sections are complex */
  will-change: transform; /* only if animating */
}
```

**And avoid:**
- ❌ Giant fixed background attachments
- ❌ Large video canvases all running at once
- ❌ Heavy shadows/filters on whole-screen containers

**Lazy-load media per section.**

### 13. Input + Hit-Target Ergonomics

**Tablet users scroll and tap with thumbs/fingers:**
- ✅ Min 44px targets
- ✅ Generous spacing between CTAs
- ✅ Avoid edge-only gestures that conflict with OS swipe zones

**Full-screen layouts especially need "breathing room" so users don't fat-finger while mid-scroll.**

```css
.button {
  min-height: 44px;
  min-width: 44px;
  padding: 0.75rem 1.5rem;
  margin: 0.5rem; /* Breathing room */
}
```

### 14. Preserve User Context Through Rotation

**Rotation is often "same task, different grip," not "new task."**

**So:**
- ✅ Keep them in the same section
- ✅ Keep focus (inputs) if possible
- ✅ Avoid automatic cross-section jumps unless necessary
- ✅ If layout changes a lot, animate subtly (fade/slide) to maintain continuity

```javascript
// ✅ GOOD: Preserve scroll position
const handleOrientationChange = () => {
  const currentSection = findCurrentSection();
  // ... rotation handling ...
  restoreToSection(currentSection);
};

// ✅ GOOD: Preserve focus
const handleOrientationChange = () => {
  const activeElement = document.activeElement;
  // ... rotation handling ...
  activeElement?.focus(); // Restore focus
};
```

### 15. Touch Interaction Patterns

#### Scroll Snap Alternatives

**Desktop:** CSS scroll-snap (reliable, performant)
```css
scroll-snap-type: y mandatory;
scroll-snap-align: start;
```

**Tablet:** JavaScript-assisted snap (more control)
```javascript
// Why? CSS scroll-snap can be janky on tablets during rotation
const handleScrollEnd = debounce(() => {
  const closestSection = findClosestSection();
  closestSection.scrollIntoView({ behavior: 'smooth' });
}, 150);
```

#### Swipe Gestures

```javascript
// ✅ GOOD: Use touch events for custom gestures
let touchStartY = 0;

container.addEventListener('touchstart', (e) => {
  touchStartY = e.touches[0].clientY;
}, { passive: true });

container.addEventListener('touchend', (e) => {
  const touchEndY = e.changedTouches[0].clientY;
  const deltaY = touchStartY - touchEndY;
  
  if (Math.abs(deltaY) > 50) { // Minimum swipe distance
    if (deltaY > 0) scrollToNextSection();
    else scrollToPrevSection();
  }
}, { passive: true });
```

#### Touch Action Hints

```css
/* Prevent default touch behaviors when needed */
.touch-scroll {
  touch-action: pan-y; /* Only vertical scrolling */
}

.touch-zoom {
  touch-action: pinch-zoom; /* Only pinch zoom */
}

.touch-none {
  touch-action: none; /* Custom gesture handling */
}
```

### 6. Content Adaptation Strategies

#### Fluid Typography

```css
/* Use clamp() for fluid scaling */
.heading {
  font-size: clamp(2rem, 4vw + 1rem, 4rem);
}

/* Or container queries (modern browsers) */
@container (min-width: 600px) {
  .content {
    font-size: 1.25rem;
  }
}
```

#### Aspect Ratio Preservation

```css
/* Maintain aspect ratios during rotation */
.video-container {
  aspect-ratio: 16 / 9;
  width: 100%;
  height: auto;
}

/* Or use object-fit for media */
img, video {
  width: 100%;
  height: 100%;
  object-fit: cover; /* or contain */
}
```

#### Responsive Images

```html
<!-- Serve appropriate images for orientation -->
<picture>
  <source 
    media="(orientation: landscape) and (min-width: 1024px)" 
    srcset="landscape-large.jpg"
  />
  <source 
    media="(orientation: portrait)" 
    srcset="portrait.jpg"
  />
  <img src="default.jpg" alt="..." />
</picture>
```

### 7. Memory Management

#### Lazy Loading Strategy

```javascript
// ✅ GOOD: Load content based on proximity
const useProximityLoading = (threshold = 2) => {
  // Load current section + N sections ahead/behind
  const visibleRange = [
    Math.max(0, currentIndex - threshold),
    Math.min(sections.length, currentIndex + threshold + 1)
  ];
  
  sections.forEach((section, idx) => {
    const shouldLoad = idx >= visibleRange[0] && idx < visibleRange[1];
    section.setLoading(shouldLoad);
  });
};
```

#### Video Management

```javascript
// ✅ GOOD: Pause/play based on visibility
useEffect(() => {
  if (inView) {
    videoRef.current?.play();
  } else {
    videoRef.current?.pause();
    videoRef.current.currentTime = 0; // Reset for next view
  }
}, [inView]);
```

#### Cleanup on Orientation Change

```javascript
// Clean up heavy resources during rotation
const handleOrientationChange = () => {
  // Pause all videos
  videos.forEach(v => v.pause());
  
  // Clear expensive animations
  cancelAnimationFrames();
  
  // Release memory
  if (largeImageCache) {
    largeImageCache.clear();
  }
};
```

### 8. CSS Best Practices

#### Prevent Layout Shifts

```css
/* ✅ GOOD: Lock dimensions */
.section {
  height: 100dvh;
  min-height: 100dvh;
  max-height: 100dvh;
  /* Prevents reflow during rotation */
}

/* ✅ GOOD: Use will-change sparingly */
.scrolling-container {
  will-change: scroll-position;
  /* Only on elements that will animate */
}
```

#### Hardware Acceleration

```css
/* ✅ GOOD: Use transform/opacity for animations */
.animated {
  transform: translateY(0);
  transition: transform 0.3s;
  /* GPU-accelerated */
}

/* ❌ AVOID: Animating layout properties */
.animated {
  top: 0;
  transition: top 0.3s;
  /* Causes reflow, janky */
}
```

#### Container Queries (Modern)

```css
/* Responsive based on container, not viewport */
.card-container {
  container-type: inline-size;
}

@container (min-width: 600px) {
  .card {
    display: grid;
    grid-template-columns: 1fr 2fr;
  }
}
```

### 9. JavaScript Patterns

#### Shared Viewport State

```javascript
// ✅ GOOD: Single source of truth
const useViewport = () => {
  const [state, setState] = useState(calculateViewport());
  
  useEffect(() => {
    // Debounced updates
    const update = debounce(() => setState(calculateViewport()), 100);
    window.addEventListener('resize', update, { passive: true });
    return () => window.removeEventListener('resize', update);
  }, []);
  
  return state;
};

// All components use same hook = consistent state
```

#### Orientation Lock (When Needed)

```javascript
// Lock orientation for specific experiences
const lockOrientation = async () => {
  try {
    await screen.orientation.lock('portrait');
  } catch (err) {
    // Fallback: Show message to user
    showOrientationPrompt();
  }
};
```

#### Safe Area Insets

```css
/* Account for notches, home indicators */
.safe-area {
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
  padding-left: env(safe-area-inset-left);
  padding-right: env(safe-area-inset-right);
}
```

### 10. Testing Checklist

- [ ] Rotate device 5+ times rapidly (should not crash)
- [ ] Scroll during rotation (should preserve position)
- [ ] Test with browser UI visible/hidden (dvh should adjust)
- [ ] Check memory usage during extended use
- [ ] Verify touch gestures work in both orientations
- [ ] Test with slow 3G connection (lazy loading)
- [ ] Verify videos pause/play correctly
- [ ] Check for layout shifts (use Chrome DevTools)
- [ ] Test with different tablet sizes (iPad, Android tablets)
- [ ] Verify scroll snap works smoothly

### 11. Common Pitfalls to Avoid

❌ **Mixing viewport units inconsistently**
```javascript
// BAD
container: '100vh'
section: '100dvh'
```

❌ **Not debouncing resize handlers**
```javascript
// BAD: Fires 60+ times per second
window.addEventListener('resize', updateLayout);
```

❌ **Reading DOM during orientation change**
```javascript
// BAD: Layout is unstable
orientationchange → immediately read offsetHeight
```

❌ **Forgetting to cleanup observers**
```javascript
// BAD: Memory leaks
useEffect(() => {
  new IntersectionObserver(...);
  // No cleanup!
}, []);
```

❌ **Using CSS scroll-snap on tablets without fallback**
```css
/* BAD: Can be janky during rotation */
scroll-snap-type: y mandatory;
/* No JS fallback */
```

### 12. Advanced Patterns

#### Virtual Scrolling (For Many Sections)

```javascript
// Only render visible sections + buffer
const useVirtualScroll = (sections, containerRef) => {
  const [visibleRange, setVisibleRange] = useState([0, 3]);
  
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      // Update visible range based on scroll
    });
    // ...
  }, []);
  
  return sections.slice(visibleRange[0], visibleRange[1]);
};
```

#### Predictive Preloading

```javascript
// Preload next section when user is 80% through current
const usePredictivePreload = (currentIndex, sections) => {
  useEffect(() => {
    const scrollProgress = getScrollProgress();
    if (scrollProgress > 0.8) {
      preloadSection(sections[currentIndex + 1]);
    }
  }, [currentIndex]);
};
```

#### Orientation-Specific Layouts

```javascript
// Completely different layouts per orientation
const Layout = isPortrait ? PortraitLayout : LandscapeLayout;

// Or use CSS Grid with different templates
const gridTemplate = isPortrait 
  ? '1fr'           // Single column
  : '1fr 1fr 1fr';  // Three columns
```

## Summary: Your Current Implementation

Your codebase already implements many best practices:
- ✅ Shared viewport hook (`useViewport`)
- ✅ Debounced resize handlers
- ✅ Scroll position preservation
- ✅ Consistent use of `100dvh` for tablets
- ✅ IntersectionObserver for visibility

**Areas to enhance:**
1. Consider using `useViewport` in MedicalSectionV2/V3 (they have duplicate logic)
2. Add predictive preloading for smoother transitions
3. Consider container queries for component-level responsiveness
4. Add performance monitoring for rotation events

## Quick Reference

| Scenario | Solution |
|----------|----------|
| Frequent rotation | Debounce + preserve state + restore after 300ms |
| Layout shifts | Use `minHeight`/`maxHeight` with `dvh` |
| Scroll jank | Use JS snap for tablets, CSS for desktop |
| Memory issues | Lazy load + cleanup on rotation |
| Touch gestures | Use `touch-action` CSS + touch events |
| Browser UI changes | Use `dvh` instead of `vh` |

## Baseline Implementation: Tablet-Robust Full-Screen Stack

**A simple "tablet-robust full-screen stack" baseline:**

```css
.page {
  height: 100dvh;
  height: 100vh; /* Fallback */
  overflow-y: auto;
  scroll-snap-type: y mandatory;
  scroll-behavior: smooth;
}

html.is-resizing .page {
  scroll-snap-type: none;
  scroll-behavior: auto;
}

.section {
  min-height: 100dvh;
  min-height: 100vh; /* Fallback */
  scroll-snap-align: start;
  scroll-snap-stop: always;
  padding: env(safe-area-inset-top) 0 env(safe-area-inset-bottom);
  contain: layout paint style;
}
```

**Then add the "disable snap during resize, resnap once" JS pattern:**

```javascript
// Disable snap during resize
const handleResizeStart = () => {
  document.documentElement.classList.add('is-resizing');
  // ... preserve state ...
};

const handleResizeEnd = () => {
  setTimeout(() => {
    document.documentElement.classList.remove('is-resizing');
    // ... restore scroll position ...
  }, 300);
};
```

