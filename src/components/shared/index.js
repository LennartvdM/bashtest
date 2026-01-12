// Shared components for CMS-ready sidebar sections
export { default as SidebarLayout } from './SidebarLayout';
export { default as SidebarItem } from './SidebarItem';
export { default as ContentSection } from './ContentSection';

// Animation utilities
export {
  INDICATOR_VARIANTS,
  indicatorTransition,
  createSectionVariants,
  createSidebarMotion,
  smoothScrollTo,
  scrollToSection,
} from './animations';
