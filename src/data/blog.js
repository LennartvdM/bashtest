/**
 * Blog Section Data
 * CMS-ready structure for the Blog page content
 */

// Section definitions
export const sections = [
  { id: 'init', title: 'Initialization Sequence' },
  { id: 'matrix', title: 'Matrix Uplink' },
  { id: 'cyber', title: 'Cybernetic Reflections' },
  { id: 'console', title: 'Console Logs' },
  { id: 'protocol', title: 'Protocol Guidance' },
  { id: 'datastream', title: 'Datastream Research' },
  { id: 'collective', title: 'The Collective' },
];

// Gibson-style placeholder content
export const defaultContent = `The sky above the port was the color of television, tuned to a dead channel. Case was twenty-four. At night, when the bars closed, the matrix would light up with a million neon dreams. Chrome and data, flesh and code, all blurred in the afterimage of cyberspace. He'd never seen the sprawl from above, only the endless grids of light, the hum of the console, the ghost in the machine.

He jacked in, felt the ice, the static, the pulse of distant AIs. The street found its own uses for things.

Wintermute, Neuromancer, the tessellated shadows of the future.

All he could do was run. All he could do was survive.`;

// Animation timing config
export const animationConfig = {
  sidebar: {
    delay: 1.2,
    duration: 1.1,
    stiffness: 120,
    damping: 30,
  },
  section: {
    initialDelay: 0.25,
    stagger: 0.27,
    duration: 1.05,
    firstSectionDelay: 0,
  },
};

// Page-level styling
export const pageStyle = {
  backgroundClassName: 'bg-gradient-to-br from-slate-900/40 to-slate-800/40',
  sidebarClassName: 'bg-[#112038]',
  sectionClassName: 'bg-gradient-to-br from-stone-50 to-fuchsia-50',
};
