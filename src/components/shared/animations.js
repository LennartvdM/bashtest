/**
 * Shared animation configurations for sidebar sections
 */

// Sidebar indicator animation variants
export const INDICATOR_VARIANTS = {
  rest:   { width: 4,  height: 2, borderRadius: 1, backgroundColor: '#475569' },
  hover:  { width: 14, height: 2, borderRadius: 1, backgroundColor: '#94a3b8' },
  active: { width: 22, height: 2, borderRadius: 1, backgroundColor: '#ffffff' },
};

// Indicator spring transition
export const indicatorTransition = (isActiveOrHovered) => ({
  layout: {
    type: 'spring',
    stiffness: isActiveOrHovered ? 130 : 260,
    damping: isActiveOrHovered ? 44 : 22,
  },
  backgroundColor: { duration: 0.4, ease: 'easeInOut' },
});

// Section fade-in animation variants (staggered)
export const createSectionVariants = (options = {}) => {
  const {
    initialDelay = 0.25,
    stagger = 0.27,
    duration = 1.05,
    firstSectionDelay = 0,
  } = options;

  return {
    hidden: { opacity: 0, y: 24 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i === 0 ? firstSectionDelay : initialDelay + i * stagger,
        duration,
        ease: 'easeOut',
      },
    }),
  };
};

// Sidebar slide-in animation
export const createSidebarMotion = (options = {}) => {
  const {
    delay = 1.2,
    duration = 1.1,
    stiffness = 120,
    damping = 30,
  } = options;

  return {
    initial: { x: -300, opacity: 0 },
    animate: {
      x: 0,
      opacity: 1,
      transition: {
        delay,
        duration,
        type: 'spring',
        stiffness,
        damping,
      },
    },
    exit: { x: -300, opacity: 0, transition: { duration: 0.7 } },
  };
};

// Calculate scroll duration based on distance (square root scaling, clamped)
function getScrollDuration(distance) {
  const MIN_DURATION = 300;
  const MAX_DURATION = 1200;
  const COEFFICIENT = 30;
  return Math.max(MIN_DURATION, Math.min(MAX_DURATION, COEFFICIENT * Math.sqrt(Math.abs(distance))));
}

// Custom smooth scroll function with easing
export function smoothScrollTo(targetY, duration) {
  const startY = window.scrollY;
  const diff = targetY - startY;
  if (duration === undefined) duration = getScrollDuration(diff);
  let start;

  function easeInOut(t) {
    return 0.5 * (1 - Math.cos(Math.PI * t));
  }

  function step(timestamp) {
    if (!start) start = timestamp;
    const elapsed = timestamp - start;
    const t = Math.min(elapsed / duration, 1);
    const eased = easeInOut(t);
    window.scrollTo(0, startY + diff * eased);
    if (t < 1) {
      window.requestAnimationFrame(step);
    }
  }

  window.requestAnimationFrame(step);
}

// Scroll to section utility
export function scrollToSection(id, options = {}) {
  const { smooth = true, updateHash = true } = options;

  window.dispatchEvent(new CustomEvent('nav-activate', { detail: id }));
  const el = document.getElementById(id);

  if (el) {
    if (smooth) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      el.scrollIntoView({ behavior: 'auto', block: 'start' });
    }

    if (updateHash) {
      history.replaceState(null, '', `#${id}`);
    }
  }
}
