# Medical Sections V2 & V3 Interactivity Guide

This document explains the interactive features and behavior of the Medical Sections V2 and V3 components.

## Overview

Medical Sections V2 and V3 are interactive video carousel components that showcase medical-related content. Both variants share the same underlying architecture (`MedicalSection.jsx`) but differ in content and visual orientation.

**Component Files:**
- `src/components/sections/MedicalSection.jsx` - Main implementation
- `src/components/sections/MedicalSectionV2.jsx` - Wrapper with `variant="v2"`
- `src/components/sections/MedicalSectionV3.jsx` - Wrapper with `variant="v3"`

---

## Key Differences Between V2 and V3

| Feature | V2 | V3 |
|---------|-----|-----|
| **Section ID** | `medical-v2` | `medical-v3` |
| **Video Orientation** | Video on right | Video on left |
| **Cookie Band Style** | `SimpleCookieCutterBand` | `MirroredCookieCutterBand` |
| **Theme** | Urgency, coordination, focus | Skills, team, perspectives |

### Content Comparison

**V2 Headlines:**
1. "Medical interventions demand precision and urgency."
2. "Which makes coordination within teams vital for success."
3. "Task-driven focus can lead to tunnel vision and misalignment."

**V3 Headlines:**
1. "Quiet reflection allows for sharpening skills."
2. "Further video debriefs foster cohesion amongst peers."
3. "Shared understanding enhances decisiveness."

---

## Interaction Modes

The components adapt to three layout modes, each with distinct interaction patterns:

### 1. Desktop Mode

**Detection:** Screen width > 1400px or non-touch device

**Interactions:**
- **Hover Captions** - Hovering over a caption pauses autoplay and switches to that video
- **Hover Video** - Creates a subtle "nudge" animation (12px upward lift with shadow)
- **Outline Animations** - Visual feedback scales from 1.08 to 1.0 on hover

**Behavior Flow:**
```
Mouse enters caption → Video pauses → Index updates → Outline animates
Mouse leaves caption → 50ms delay → Autoplay resumes → Outline fades
```

### 2. Tablet Portrait Mode

**Detection:** Width 600-1400px AND portrait orientation (height > width)

**Interactions:**
- **Travelling Bar** - Tap captions in the bottom bar to select videos
- **Progress Animation** - 7-second animated progress bar shows autoplay timing
- **Carousel Swipe** - Touch swipe navigation between videos
- **Pause on Interaction** - Autoplay pauses when user interacts

**Behaviour Flow:**
```
Autoplay runs (7000ms per slide) → Progress bar fills
User taps caption → Video changes → Progress bar resets
User pauses → Animation freezes → Resumes on unpause
```

### 3. Landscape Tablet Mode

**Detection:** Width 600-1400px AND landscape orientation (width > height)

**Interactions:**
- **Touch Captions** - Tap captions to switch videos (similar to desktop hover)
- **Touch Video** - Tap left/right edges (15% zones) to navigate
- **Touch Start/End** - Mimics hover states for visual feedback

**Behavior Flow:**
```
Touch starts on caption → Video pauses → Index updates
Touch ends → Autoplay resumes after delay
Tap video edge → Navigate prev/next
```

---

## State Management

The component uses three specialized reducers for optimal performance:

### Visibility State
Controls the entrance animation sequence:
- `SHOW_HEADER` - Display header text
- `SHOW_VIDEO` - Display video container
- `SHOW_CAPTIONS` - Display caption section
- `RESET` / `SHOW_ALL` - Batch visibility changes

### Measurements State
Tracks layout dimensions for positioning:
- Navbar height
- Video container position and dimensions
- Caption positions
- Highlighter position and width

### Interaction State
Manages user interaction:
- `SET_PAUSED` - Video pause state
- `SET_HOVERED_INDEX` - Currently hovered/selected caption
- `SET_VIDEO_HOVER` - Video hover state
- `ENABLE_INTERACTIONS` / `DISABLE_INTERACTIONS` - Toggle interactivity

---

## Animation System

### Entrance Ceremony

When a section enters the viewport, animations play in sequence:

| Timing | Event |
|--------|-------|
| 0ms | Section enters viewport |
| 450ms | Header fades in |
| 2925ms | Video fades in with transform |
| 3225ms | Captions fade in with transform |
| 6000ms | Interactions enabled, autoplay begins |

### Video Transitions

- **Standard transition:** 2.25s with `cubic-bezier(0.4, 0, 0.2, 1)`
- **Nudge animation:** 0.3s with spring easing `cubic-bezier(0.34, 1.56, 0.64, 1)`
- **Off-screen position:** `translateX(±200px)` (desktop) or `translateY(200px)` (tablet)

### Progress Bar Animations

- **Desktop:** No visible progress bar
- **Tablet:** 7000ms linear fill animation (`grow-overflow` keyframes)
- **Spring effect:** Subtle Y-axis bounce on caption selection

---

## Event Handlers Reference

### Desktop Handlers

```javascript
handleHover(index)      // Caption mouse enter - pause and switch video
handleHoverEnd()        // Caption mouse leave - resume autoplay
handleVideoHover(bool)  // Video mouse enter/leave - nudge animation
```

### Tablet Handlers

```javascript
handleTabletCarouselChange(idx)      // Carousel slide changed
handleTabletPauseChange(paused)      // Pause state toggled
handleTabletBarSelect(index)         // Caption selected via travelling bar
handleLandscapeTabletCaptionClick(i) // Caption tapped (landscape)
handleLandscapeTabletTouchStart(i)   // Touch start on caption
handleLandscapeTabletTouchEnd()      // Touch end on caption
```

---

## Component Props

### MedicalSectionV2 / MedicalSectionV3

```typescript
{
  inView: boolean;      // Whether section is in viewport
  sectionRef: Ref;      // Reference to section container
  variant?: 'v2' | 'v3'; // Variant selection (internal)
}
```

### MedicalCarousel (Desktop)

```typescript
{
  current: number;              // Active video index (0-2)
  setVideoCenter: Function;     // Callback for center position updates
  hoveredIndex: number | null;  // Currently hovered caption
  isActive: boolean;            // Whether video should play
  videoHover: boolean;          // Mouse is over video
  setVideoHover: Function;      // Update video hover state
  interactionsEnabled: boolean; // Enable/disable interactions
  videos: VideoConfig[];        // Array of video configurations
  enableTouchNavigation: boolean; // Show touch navigation zones
  onTouchChange: Function;      // Handle touch navigation
}
```

### TabletMedicalCarousel

```typescript
{
  videos: VideoConfig[];  // Array of video configurations
  current: number;        // Active video index
  onChange: Function;     // Index change callback
  onPauseChange: Function; // Pause state callback
  className?: string;
  style?: object;
}
```

### TabletTravellingBar

```typescript
{
  captions: (string | JSX.Element)[]; // Caption content
  current: number;       // Currently selected index
  onSelect: Function;    // Selection callback
  style?: object;
  durationMs?: number;   // Autoplay duration (default: 7000)
  paused?: boolean;      // Animation pause state
  animationKey?: any;    // Force animation restart
}
```

---

## Section Lifecycle

The medical sections follow a defined lifecycle managed by `useSectionLifecycle`:

```
idle → entering → active → preserving → cleaned → idle
```

| State | Duration | Description |
|-------|----------|-------------|
| **idle** | - | Section not visible |
| **entering** | 0-4000ms | Entrance animations, interactions disabled |
| **active** | - | Full interactivity, autoplay enabled |
| **preserving** | 4000ms | Section leaving, maintaining state |
| **cleaned** | - | DOM preserved but invisible |

---

## Performance Optimizations

The components employ several performance strategies:

1. **State Grouping** - Three separate reducers minimize re-renders
2. **Memoization** - `useCallback`, `useMemo`, and `React.memo` prevent unnecessary updates
3. **Throttling** - Resize/scroll handlers throttled to 100ms
4. **GPU Acceleration** - `translateZ(0)`, `willChange`, `backfaceVisibility` for smooth animations
5. **Efficient Measurements** - Single consolidated measurement function with RAF batching

---

## Responsive Breakpoints

| Layout | Width Range | Additional Criteria |
|--------|-------------|---------------------|
| Desktop | > 1400px | Non-touch device |
| Tablet Portrait | 600-1400px | Portrait orientation (height > width) |
| Tablet Landscape | 600-1400px | Landscape orientation (width > height) |
| Mobile | < 600px | Touch device |

The `useTabletLayout` hook handles detection with 150ms debounce to prevent thrashing during orientation changes.

---

## Visual Feedback Summary

| Interaction | Visual Feedback |
|-------------|-----------------|
| Caption hover/tap | Highlight outline scales in |
| Video hover | 12px upward nudge + shadow |
| Active caption | Progress bar fills (tablet) |
| Video transition | 2.25s fade with transform |
| Entrance | Staggered fade-in sequence |

---

## Usage Example

```jsx
import MedicalSectionV2 from './components/sections/MedicalSectionV2';
import MedicalSectionV3 from './components/sections/MedicalSectionV3';

// In your page component
<MedicalSectionV2
  inView={isSection2Visible}
  sectionRef={section2Ref}
/>

<MedicalSectionV3
  inView={isSection3Visible}
  sectionRef={section3Ref}
/>
```

Both components are registered in `src/pages/Home.jsx` as sections "two" and "three" respectively.
