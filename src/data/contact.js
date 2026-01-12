/**
 * Contact Section Data
 * CMS-ready structure for the Contact page content
 */

// Page content
export const content = {
  title: 'Get In Touch',
  description: "I'm always open to discussing new projects, creative ideas or opportunities to be part of your visions.",
};

// Contact links/actions
export const actions = [
  {
    id: 'email',
    label: 'Email Me',
    href: 'mailto:your.email@example.com',
    type: 'primary', // primary button style
    external: false,
  },
  {
    id: 'github',
    label: 'GitHub',
    href: 'https://github.com/yourusername',
    type: 'secondary', // outline button style
    external: true,
  },
  {
    id: 'linkedin',
    label: 'LinkedIn',
    href: 'https://linkedin.com/in/yourusername',
    type: 'secondary',
    external: true,
  },
];

// Page-level styling
export const pageStyle = {
  backgroundClassName: 'bg-gradient-to-br from-slate-600 to-slate-500',
  textClassName: 'text-slate-200',
  primaryButtonClassName: 'bg-blue-600 hover:bg-blue-700',
  secondaryButtonClassName: 'border border-slate-400 hover:border-slate-300',
};
