# Medical Sections V2 & V3 - User Experience Guide

This document describes what users see and how they interact with the Medical Sections on the website.

---

## What Are These Sections?

Medical Sections V2 and V3 are two video showcases that appear on the homepage. Each section displays a video alongside three clickable captions that let users explore different themes.

**Section V2** focuses on the challenges of medical work:
- The urgency of medical interventions
- The importance of team coordination
- How intense focus can cause tunnel vision

**Section V3** focuses on learning and improvement:
- Developing skills through reflection
- Building team cohesion through video debriefs
- How shared understanding improves decision-making

The two sections are visually mirrored - V2 shows the video on the right side, while V3 shows it on the left.

---

## What Users See When Scrolling to a Section

When a user scrolls down and the section comes into view, elements appear in a choreographed sequence:

1. **First** - The headline text fades in at the top
2. **Then** - The video smoothly slides into view
3. **Finally** - The three caption options appear below/beside the video
4. **After about 6 seconds** - The section becomes fully interactive and videos start auto-playing

This entrance animation creates a polished, professional feel as users discover each section.

---

## How Users Interact

The sections behave differently depending on what device you're using:

### On a Desktop Computer

**Hovering over captions:**
- When you move your mouse over one of the three caption texts, the video instantly switches to match that topic
- A subtle highlight outline appears around the caption you're hovering on
- The video pauses while you're hovering, giving you time to read

**Hovering over the video:**
- The video gently lifts up slightly (a "nudge" effect)
- A soft shadow appears underneath, making it feel elevated

**Automatic playback:**
- When you're not hovering, the videos cycle through automatically
- Each video plays for about 7 seconds before moving to the next

### On a Tablet (Held Vertically)

**The layout changes:**
- The video appears stacked above the captions
- A progress bar appears showing how long until the next video

**Tapping captions:**
- Tap any of the three captions at the bottom to jump to that video
- The progress bar resets when you make a selection

**Swiping the video:**
- You can swipe left or right on the video to navigate between clips

**The progress bar:**
- Shows a filling animation (7 seconds) indicating when the next video will play
- Pauses if you interact with the section

### On a Tablet (Held Horizontally)

**Similar to desktop:**
- The video and captions appear side-by-side like on desktop
- But instead of hovering, you tap the captions to switch videos

**Tap zones on the video:**
- Tapping the left edge of the video goes to the previous clip
- Tapping the right edge goes to the next clip

---

## Visual Feedback Users Receive

| What You Do | What You See |
|-------------|--------------|
| Hover/tap a caption | A rounded outline smoothly appears around it |
| Hover over the video | Video lifts up slightly with a shadow |
| Switch between videos | Smooth crossfade transition (~2 seconds) |
| Wait without interacting | Videos auto-advance every 7 seconds |
| On tablet: current caption | Progress bar fills up beneath it |

---

## The Two Section Themes

### Section V2 - "The Challenge"

This section uses more intense, action-oriented videos showing:
- **Video 1:** The pressure and urgency of medical situations
- **Video 2:** Teams working together under pressure
- **Video 3:** The risk of losing sight of the bigger picture

The messaging emphasizes problems that need solving.

### Section V3 - "The Solution"

This section uses calmer, reflective videos showing:
- **Video 1:** Practitioners developing their skills
- **Video 2:** Teams reviewing footage together
- **Video 3:** Groups building shared understanding

The messaging emphasizes how these challenges can be addressed.

Together, the two sections tell a story: V2 presents the problem, V3 presents the path forward.

---

## Responsive Behavior Summary

| Device | Video Position | How to Switch Videos | Auto-advance |
|--------|---------------|---------------------|--------------|
| Desktop (wide screen) | Side by side with captions | Hover over captions | Yes, 7 seconds |
| Tablet - Portrait | Stacked above captions | Tap captions or swipe | Yes, with progress bar |
| Tablet - Landscape | Side by side | Tap captions or tap video edges | Yes, 7 seconds |

---

## Accessibility Notes

- Videos play automatically but without sound
- All videos have alternative text descriptions
- Caption text is readable and provides context even without videos
- The sections work with both mouse and touch input
- Animations are smooth and not jarring

---

## Technical Reference

For developers who need implementation details, see the component files:
- `src/components/sections/MedicalSection.jsx` - Main logic
- `src/components/sections/MedicalSectionV2.jsx` - V2 wrapper
- `src/components/sections/MedicalSectionV3.jsx` - V3 wrapper
- `src/components/MedicalCarousel.jsx` - Desktop video carousel
- `src/components/TabletMedicalCarousel.jsx` - Tablet video carousel
- `src/components/TabletTravellingBar.jsx` - Tablet caption selector with progress bar
