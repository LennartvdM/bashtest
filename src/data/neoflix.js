/**
 * Neoflix Section Data
 * CMS-ready structure for the Neoflix page content
 */

// Section definitions
export const sections = [
  { id: 'preface', title: 'Preface' },
  { id: 'narrative', title: 'Narrative Review' },
  { id: 'provider', title: "Provider's Perspective" },
  { id: 'reflect', title: 'Record, Reflect, Refine' },
  { id: 'guidance', title: 'Practical Guidance' },
  { id: 'research', title: 'Driving Research' },
  { id: 'collab', title: 'International Collaboration' },
];

// Default content for sections
export const defaultContent = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer in mi quis risus vehicula pretium. Sed luctus nibh et libero aliquet, quis maximus arcu pellentesque. Suspendisse potenti. Mauris sed sagittis purus. Curabitur ullamcorper, tortor sed cursus dictum, libero nisi interdum nulla, vel ultrices quam erat quis leo.`;

// Video backdrop mapping
export const sectionToVideo = {
  preface: '/videos/blurteam.mp4',
  narrative: '/videos/blururgency.mp4',
  provider: '/videos/blurteam.mp4',
  reflect: '/videos/blursskills.mp4',
  guidance: '/videos/blurperspectives.mp4',
  research: '/videos/blurfocus.mp4',
  collab: '/videos/blurcoordination.mp4',
};

// Video deck sources (bottom to top order)
export const deckSources = [
  '/videos/blurcoordination.mp4',
  '/videos/blurfocus.mp4',
  '/videos/blurperspectives.mp4',
  '/videos/blursskills.mp4',
  '/videos/blurteam.mp4',
  '/videos/blururgency.mp4',
];

// Animation timing config
export const animationConfig = {
  sidebar: {
    // Calculated based on section count
    delay: 2.9, // ~last section finish - 0.8s
    duration: 1.1,
    stiffness: 120,
    damping: 30,
  },
  section: {
    initialDelay: 0.5,
    stagger: 0.3,
    duration: 1.8,
    firstSectionDelay: 0.5,
  },
};

// Page-level styling
export const pageStyle = {
  backgroundColor: '#483226',
  sidebarClassName: 'bg-[#112038]',
  sectionStyle: {
    background: 'linear-gradient(135deg, rgba(250,250,249,0.85), rgba(253,244,255,0.85))',
  },
};
