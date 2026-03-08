# Neoflix — Site Overview

## What This Site Is

A research communication platform for Dr. Veerle Heesters' PhD work on video review in neonatal intensive care. Built as a React SPA (Vite + Tailwind), tablet-first, deployed on Netlify. It tells a story through cinematic scroll-snap sections, animated video backgrounds, and a progressive narrative arc — from problem framing through research evidence to a practical implementation toolkit.

---

## The Story Arc

### Act 1 — The Problem (Home page, Medical V2 section)
Medical procedures are time-sensitive, demanding precision and urgency. But individual task focus creates tunnel vision — communication breaks down, teams misalign. The site opens with three video beats:
1. "Medical interventions demand precision and urgency"
2. "Which makes coordination within teams vital for success"
3. "Task-driven focus can lead to tunnel vision and misalignment"

Each beat plays with a synced video (urgency, coordination, focus). Desktop: video right, content left.

### Act 2 — The Solution (Home page, Medical V3 section)
Reflection strengthens the next encounter. Three more video beats mirror the first set:
1. "Quiet reflection allows for sharpening skills"
2. "Further video debriefs foster cohesion amongst peers"
3. "Shared understanding enhances decisiveness"

Videos: skills, team, perspectives. Desktop: video left, content right (mirrored layout from V2).

### Act 3 — The Research (Neoflix page + Publications page)
The evidence base. Seven research sections on the Neoflix page, six narrative sections on Publications.

### Act 4 — The Toolkit (Toolbox page)
A full GitBook (`docs.neoflix.care`) with three progressive levels: Fundamentals, In Action, Growth. Practical guidance for implementing video review in any NICU.

### Act 5 — Connection (Contact section + navbar link)
Email, GitHub, LinkedIn. "I'm always open to discussing new projects, creative ideas or opportunities to be part of your visions."

---

## Routes & Pages

| Route | What it is |
|-------|------------|
| `/` | Home — 5 full-screen scroll-snap sections |
| `/neoflix` | Research publications hub — 7 sections with video backdrops |
| `/publications` | Narrative publication summaries — 6 sections |
| `/toolbox` | Embedded GitBook (docs.neoflix.care) |
| `/toolbox/:slug` | Individual toolbox article embeds |
| `/map-editor` | Dev tool — world map location editor |
| `/admin` | Dev tool — CMS admin |

---

## Home Page — 5 Scroll-Snap Sections

Each section fills the entire viewport and snaps into place on scroll.

### 1. Intro Section (eagerly loaded)
An animated introduction card using the `neoflix-intro-card` library. Sets the tone. Light gradient background (#F5F9FC → white).

### 2. Medical V2 — "In the moment, only the patient matters"
Three video beats establishing the problem. Video carousel synced with headlines. Dark green fallback (#1c3424) during lazy load. Decorative animated cookie-cutter band.

### 3. Medical V3 — "Yet, reflection strengthens the next"
Three video beats proposing the solution. Mirrored layout from V2. Same lazy-load pattern. Mirrored cookie-cutter band.

### 4. World Map Section
Interactive SVG world map with pan/zoom, country selection, and hover effects. Communicates the global reach of neonatal care research.

### 5. Contact Section
"Get In Touch" — email (primary CTA), GitHub and LinkedIn (secondary). Slate gradient background.

---

## Neoflix Page (`/neoflix`)

Sidebar-based scrolling layout. Dark navy sidebar (#112038) on the left with section titles. Content cards on the right. Brown-toned background (#483226). Each section has an animated background video that crossfades as you scroll. Content text dims during video transitions.

### 7 Research Sections:

**1. Preface** (video: blurteam.mp4)
Veerle introduces her PhD trajectory and the discovery of video review's transformative potential. This toolbox is the culmination of years of research.

**2. Narrative Review** (video: blururgency.mp4)
"Video recording emergency care and video-reflection to improve patient care" — Evidence base for video recording in critical care. NICU case study. Video provides an objective record vs. memory-based debriefing.

**3. Provider's Perspective** (video: blurteam.mp4)
"Using the providers' perspective on video review..." — Qualitative study capturing healthcare provider voices. Initial apprehension → recognition of value. Psychological safety, structured facilitation, clear protocols. Outcome: a practical roadmap.

**4. Record, Reflect, Refine** (video: blurskills.mp4)
3-phase framework. Record (equipment, positioning, consent) → Reflect (structured review, facilitation) → Refine (action plans, protocol adjustments, training). Iterative cycle for sustained improvement.

**5. Practical Guidance** (video: blurperspectives.mp4)
"Quality improvement initiative: implementing video review using action research" — Action research methodology (plan → act → observe → reflect). Leadership engagement, dedicated time, governance, facilitator training.

**6. Driving Research** (video: blurfocus.mp4)
"The vocal cords are predominantly closed in preterm infants <30 weeks..." — Video recording as research tool. Implications for respiratory support in neonatal resuscitation. Dual benefit: improve practice + advance knowledge.

**7. International Collaboration** (video: blurcoordination.mp4)
Pending publication. Multi-country collaboration on video review adaptation across diverse clinical/cultural contexts. Contact info for Dr. Heesters, Prof. te Pas, Dr. Witlox.

---

## Publications Page (`/publications`)

Same sidebar layout as Neoflix but with a different narrative voice. Light background (#F5F9FC). Six sections that tell the story more abstractly, with inline links to specific Toolbox pages:

1. **Medical procedures are time-sensitive** — Precision, urgency, adaptability. High stakes.
2. **Like a dance** — Teams as well-oiled machines. Coordination, communication, trust. Extends to entire system (lab, pharmacy, admin).
3. **But this comes at a cost** — Division of labor creates information silos. Task focus diminishes cohesion. Subtle communication breakdowns.
4. **Sharpening skills** — Complex cases as learning opportunities. Self-reflection enhances decision-making. Continuous learning.
5. **Strengthening team dynamics** — Video debriefs as collaborative analysis. Safe space for open communication without judgment.
6. **Broadening perspectives** — Collaborative reviews build shared confidence. Minimize hesitation. Proactive challenge-addressing.

---

## Toolbox Page (`/toolbox`)

Full embedded GitBook at `docs.neoflix.care`. Three progressive levels:

**Level 1: Fundamentals** — Concept building. Preproduction, planning, the "Safe, Simple & Small" pillars, success stories from NICUs in Philadelphia, Vienna, Melbourne, Leiden.

**Level 2: In Action** — Hands-on execution following the Record → Reflect → Refine framework. Covers consent, equipment (fixed/mobile/wearable), creating footage, recording during intervention, previewing, facilitating sessions, improving care.

**Level 3: Growth** — Scaling and sustainability. Continuous improvement, expanding the program, joining the network.

124 individual pages mapped by slug to GitBook URLs.

---

## Navigation

### Navbar (sticky, 60px)
- **Logo**: Animated spinning favicon → home
- **Neoflix** → `/neoflix`
- **Publications** → `/publications`
- **Contact** → `/neoflix#collab` (scrolls to collaboration section)
- **Toolbox** → `/toolbox` (visually distinct dark background)
- Active page: teal pill (#4fa6a6) with white text
- Hover: animated blob underline with spring physics
- Collapses to hamburger below 768px

### Mobile Nav (Neoflix page only)
Side drawer with numbered section list. Animated indicators (long bar = active, dot = inactive).

---

## Visual Design

### Colors
- **Teal accent**: #4fa6a6 (nav active state)
- **Home background**: #F5F9FC (light blue-gray)
- **Neoflix background**: #483226 (brown)
- **Neoflix sidebar**: #112038 (dark navy)
- **Medical fallback**: #1c3424 (dark green)
- **Contact**: slate gradient

### Animation
- Scroll-snap with full-screen sections
- Spring-based navbar blob
- Video crossfades with content dimming
- Staggered section entry animations (Framer Motion)
- Lazy-load dark fallback backgrounds

### Typography
- Headers: Inter, bold, 40px+, tight tracking
- Nav: Montserrat
- Body: medium weight, high contrast

---

## The Six Video Beats (Home Page)

These are the cinematic moments on the home page. Each gets a full-screen presentation with synced video:

| # | Beat | Video | Section |
|---|------|-------|---------|
| 1 | Medical interventions demand precision and urgency | urgency.mp4 | V2 (Problem) |
| 2 | Coordination within teams is vital for success | coordination.mp4 | V2 (Problem) |
| 3 | Task-driven focus can lead to tunnel vision | focus.mp4 | V2 (Problem) |
| 4 | Quiet reflection allows for sharpening skills | skills.mp4 | V3 (Solution) |
| 5 | Video debriefs foster cohesion amongst peers | team.mp4 | V3 (Solution) |
| 6 | Shared understanding enhances decisiveness | perspectives.mp4 | V3 (Solution) |

---

## Current Design Question

The six beats on the home page each get a cinematic full-screen moment. But the Publications and Neoflix pages present their content as sidebar-scrollable article lists — all visible at once, competing for attention. The progressive disclosure that works on the home page is abandoned on the content pages.

Options being considered:
- Individual pages per beat (maintain "one thing at a time" energy)
- Tabbed/stepper layout (one article visible at a time, with navigation)
- Keep sidebar but redesign hierarchy (lead with visuals, toolbox links as cards not inline text)
