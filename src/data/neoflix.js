/**
 * Neoflix Section Data
 * CMS-ready structure for the Neoflix page content
 */

// Section definitions with real content
export const sections = [
  {
    id: 'preface',
    title: 'Preface',
    content: `When I started my PhD trajectory on the Department of Neonatology, I learned about the complexities of caring for the tiniest and most vulnerable patients. I also saw firsthand how dedicated healthcare providers are to improving outcomes for these newborns and their families.

Through my research, I discovered the transformative potential of video review in neonatal care. Recording and reflecting on real-time procedures allows teams to identify opportunities for improvement that might otherwise go unnoticed in the fast-paced clinical environment.

This toolbox is the culmination of years of research, collaboration, and practical implementation. It is designed to guide healthcare professionals through the process of setting up and sustaining a video review program in their own clinical setting.

Whether you are just starting to explore video review or looking to expand an existing program, I hope this resource provides the practical guidance and inspiration you need to take the next step toward improving one step and one patient at a time.

Veerle`,
  },
  {
    id: 'narrative',
    title: 'Narrative Review',
    content: `Video recording emergency care and video-reflection to improve patient care; a narrative review and case-study of a neonatal intensive care unit.

This narrative review explores the growing body of evidence supporting the use of video recording and video-reflection in emergency and critical care settings. Drawing on published literature and a detailed case study from a neonatal intensive care unit (NICU), we examine how structured video review can enhance clinical performance, team communication, and patient safety.

The review highlights that video-based reflection enables healthcare teams to observe their own actions and interactions from a new perspective. Unlike traditional debriefing methods that rely on memory, video provides an objective record of events, capturing details that are often missed or misremembered in high-pressure situations.

Our case study from the NICU demonstrates the practical application of these principles, showing how a systematic approach to video recording and reflection was implemented, the challenges encountered, and the measurable improvements in care quality that resulted from this initiative.`,
  },
  {
    id: 'provider',
    title: "Provider's Perspective",
    content: `Using the providers' perspective on video review of neonatal procedures to create a roadmap: a qualitative study

This qualitative study captures the voices and experiences of healthcare providers who participated in video review of neonatal procedures. Through in-depth interviews and focus groups, we explored providers' attitudes, concerns, and suggestions regarding the implementation of video review in their clinical practice.

The findings reveal a complex landscape of emotions and perspectives. While many providers initially expressed apprehension about being recorded, the majority recognized the educational and quality improvement potential of video review after participating in the process.

Key themes emerged around the importance of creating a psychologically safe environment for review, the value of structured facilitation, and the need for clear protocols regarding consent, data storage, and confidentiality. Providers emphasized that the success of video review depends heavily on organizational culture and leadership support.

Based on these insights, we developed a practical roadmap for implementing video review programs that addresses the concerns and leverages the enthusiasm of clinical staff.`,
  },
  {
    id: 'reflect',
    title: 'Record, Reflect, Refine',
    content: `Record, reflect and refine: using video review as an initiative to improve neonatal care.

This study presents a comprehensive framework for using video review as a quality improvement tool in neonatal care. The Record, Reflect, and Refine approach provides a structured methodology that healthcare teams can follow to systematically analyze and improve their clinical practice.

The Record phase focuses on the practical aspects of capturing video footage during neonatal procedures, including equipment selection, positioning, and consent processes. The Reflect phase guides teams through structured review sessions, using evidence-based facilitation techniques to promote constructive discussion and learning.

The Refine phase translates insights from video review into concrete action plans for improving care. This includes protocol adjustments, targeted training interventions, and changes to equipment or workflow that address identified areas for improvement.

Our experience demonstrates that this iterative cycle of recording, reflecting, and refining leads to sustained improvements in both individual performance and team dynamics, ultimately benefiting patient outcomes.`,
  },
  {
    id: 'guidance',
    title: 'Practical Guidance',
    content: `Quality improvement initiative: implementing and re-defining video review of real-time neonatal procedures using action research

This paper describes a quality improvement initiative that used action research methodology to implement and continuously refine a video review program for neonatal procedures. Action research, with its cyclical process of planning, acting, observing, and reflecting, proved to be an ideal framework for developing a program that needed to be responsive to the complex and evolving needs of a clinical environment.

Over multiple cycles of implementation, we identified key factors that contribute to the success of video review programs. These include strong leadership engagement, dedicated time for review sessions, clear governance structures, and ongoing training for facilitators.

The action research approach allowed us to address challenges as they arose, adapting our methods based on feedback from participants and observations of the process. This iterative refinement resulted in a program that was well-integrated into the clinical workflow and valued by staff at all levels.

The practical guidance offered in this paper is intended to help other institutions navigate the complexities of setting up their own video review programs, learning from both our successes and our challenges.`,
  },
  {
    id: 'research',
    title: 'Driving Research',
    content: `The vocal cords are predominantly closed in preterm infants <30 weeks gestation during transition after birth; an observational study

This observational study demonstrates one of the most compelling applications of video recording in neonatal care: its use as a research tool to generate new clinical knowledge. By analyzing video recordings of preterm infants during the critical transition period after birth, we made an important discovery about vocal cord behavior.

Our findings showed that in preterm infants born before 30 weeks of gestation, the vocal cords are predominantly in a closed position during the transition after birth. This observation has significant implications for respiratory support strategies used during neonatal resuscitation.

This study illustrates how video recordings, originally captured for quality improvement purposes, can become valuable research datasets. The detailed visual information captured in these recordings allows researchers to observe phenomena that cannot be detected through other means, opening new avenues for understanding neonatal physiology and improving clinical interventions.

The success of this research highlights the dual benefit of video recording programs: improving current practice through reflection while simultaneously advancing medical knowledge through research.`,
  },
  {
    id: 'collab',
    title: 'International Collaboration',
    content: `PENDING PUBLICATION

This section will feature our upcoming publication on international collaboration in video review of neonatal care. The study brings together experiences and insights from multiple neonatal units across different countries, examining how video review practices have been adapted and implemented in diverse clinical and cultural contexts.

The international perspective reveals both universal challenges and context-specific solutions in implementing video review programs. Common themes include the importance of institutional support, staff engagement, and ethical frameworks, while the specific approaches to these challenges vary based on local regulations, cultural norms, and resource availability.

By sharing experiences across borders, we aim to accelerate the adoption of video review in neonatal care worldwide and promote a global community of practice dedicated to continuous improvement in newborn care.

For any questions, feedback, or ideas, please feel free to contact:

**Dr. Veerle Heesters**
Former PhD Student, Department of Neonatology
Leiden University Medical Center, the Netherlands

**Email:** [info@neoflix.care](mailto:info@neoflix.care)

This toolbox was developed under the guidance of **Professor Arjan te Pas** and **Dr. Ruben Witlox**.`,
  },
];

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
