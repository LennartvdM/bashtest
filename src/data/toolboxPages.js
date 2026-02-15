// toolboxPages.js
// Single source of truth: slug -> GitBook URL mapping
// Used by: ToolboxEmbed.jsx (iframe URL lookup), CMS /admin (link insertion dropdown)
//
// Convention: slugs use hyphens, match the route /Toolbox-{slug}
// All URLs point to docs.neoflix.care

const BASE = "https://docs.neoflix.care";

const toolboxPages = [
  // -- Welcome --
  { slug: "Welcome", label: "Welcome", url: `${BASE}` },
  { slug: "Who-Is-This-For", label: "Who is this for?", url: `${BASE}/welcome/who-is-this-for` },
  { slug: "Quick-Start", label: "Quick-start", url: `${BASE}/welcome/quick-start` },
  { slug: "FAQs", label: "FAQ's", url: `${BASE}/welcome/quick-start/faqs` },
  { slug: "Neoflix", label: "Neoflix", url: `${BASE}/welcome/neoflix` },
  { slug: "Every-Clinical-Encounter", label: "Make every clinical encounter a learning opportunity", url: `${BASE}/welcome/neoflix/make-every-clinical-encounter-a-learning-opportunity` },
  { slug: "Success-Story", label: "Streamlining neonatal care: a success story", url: `${BASE}/welcome/neoflix/streamlining-neonatal-care-a-success-story` },
  { slug: "How-It-Works", label: "How it works", url: `${BASE}/welcome/neoflix/how-it-works` },

  // -- Level 1: Fundamentals --
  { slug: "Level-1-Fundamentals", label: "Level 1: Fundamentals", url: `${BASE}/level-1-fundamentals/level-1-fundamentals` },

  // 1. Preproduction
  { slug: "Preproduction", label: "1. Preproduction", url: `${BASE}/level-1-fundamentals/1.-preproduction` },
  { slug: "Beyond-The-Procedure", label: "1.1 Beyond the procedure", url: `${BASE}/level-1-fundamentals/1.-preproduction/1.1-beyond-the-procedure` },
  { slug: "Use-Cases", label: "1.2 Use cases", url: `${BASE}/level-1-fundamentals/1.-preproduction/1.2-use-cases` },
  { slug: "History-Of-Video", label: "1.3 History of videorecording in healthcare", url: `${BASE}/level-1-fundamentals/1.-preproduction/1.3-history-of-videorecording-in-healthcare` },
  { slug: "Unburdening-The-Process", label: "1.4 Unburdening the process", url: `${BASE}/level-1-fundamentals/1.-preproduction/1.4-unburdening-the-process` },

  // 2. Planning your initiative
  { slug: "Planning-Your-Initiative", label: "2. Planning your initiative", url: `${BASE}/level-1-fundamentals/2.-planning-your-initiative` },
  { slug: "Pioneer-Team", label: "2.1 Pioneer team", url: `${BASE}/level-1-fundamentals/2.-planning-your-initiative/2.1-pioneer-team` },
  { slug: "Gaining-Team-Buy-In", label: "2.2 Gaining team buy-in", url: `${BASE}/level-1-fundamentals/2.-planning-your-initiative/2.2-gaining-team-buy-in` },
  { slug: "Resources", label: "2.3 Resources", url: `${BASE}/level-1-fundamentals/2.-planning-your-initiative/2.3-tips-and-tricks` },

  // 3. Safe, Simple & Small
  { slug: "Safe-Simple-Small", label: "3. Safe, Simple & Small", url: `${BASE}/level-1-fundamentals/3.-safe-simple-and-small` },
  { slug: "Safe", label: "3.1 Safe", url: `${BASE}/level-1-fundamentals/3.-safe-simple-and-small/3.1-safe` },
  { slug: "Simple", label: "3.2 Simple", url: `${BASE}/level-1-fundamentals/3.-safe-simple-and-small/3.2-simple` },
  { slug: "Small", label: "3.3 Small", url: `${BASE}/level-1-fundamentals/3.-safe-simple-and-small/3.3-small` },

  // 4. Learning from success stories
  { slug: "Learning-From-Success-Stories", label: "4. Learning from success stories", url: `${BASE}/level-1-fundamentals/4.-learning-from-success-stories` },
  { slug: "NICU-Philadelphia", label: "NICU in Philadelphia, Pennsylvania, USA", url: `${BASE}/level-1-fundamentals/4.-learning-from-success-stories/nicu-in-philadelphia-pennsylvania-usa` },
  { slug: "NICU-Vienna", label: "NICU in Vienna, Austria", url: `${BASE}/level-1-fundamentals/4.-learning-from-success-stories/nicu-in-vienna-austria` },
  { slug: "NICU-Melbourne", label: "NICU in Melbourne, Australia", url: `${BASE}/level-1-fundamentals/4.-learning-from-success-stories/nicu-in-melbourne-australia` },
  { slug: "NICU-Leiden", label: "NICU in Leiden, the Netherlands", url: `${BASE}/level-1-fundamentals/4.-learning-from-success-stories/nicu-in-leiden-the-netherlands` },
  { slug: "Share-Your-Experience", label: "4.1 Share your experience", url: `${BASE}/level-1-fundamentals/4.-learning-from-success-stories/4.1-share-your-experience` },

  // -- Level 2: In Action --
  { slug: "Level-2-In-Action", label: "Level 2: In Action", url: `${BASE}/level-2-in-action/level-2-in-action` },
  { slug: "Record", label: "Record", url: `${BASE}/level-2-in-action/record` },

  // 5. Preparation and Consent
  { slug: "Preparation-And-Consent", label: "5. Preparation and Consent", url: `${BASE}/level-2-in-action/5.-preparation-and-consent` },
  { slug: "Obtain-Consent", label: "5.1 Obtain Consent", url: `${BASE}/level-2-in-action/5.-preparation-and-consent/5.1-obtain-consent` },
  { slug: "Case-Selection", label: "5.2 Case selection", url: `${BASE}/level-2-in-action/5.-preparation-and-consent/5.2-case-selection` },
  { slug: "Privacy-Considerations", label: "5.3 Privacy Considerations", url: `${BASE}/level-2-in-action/5.-preparation-and-consent/5.3-privacy-considerations` },

  // 6. Recording equipment
  { slug: "Recording-Equipment", label: "6. Recording equipment", url: `${BASE}/level-2-in-action/6.-recording-equipment` },
  { slug: "Fixed-Cameras", label: "6.1 Fixed cameras", url: `${BASE}/level-2-in-action/6.-recording-equipment/6.1-fixed-cameras` },
  { slug: "Mobile-Cameras", label: "6.2 Mobile cameras", url: `${BASE}/level-2-in-action/6.-recording-equipment/6.2-mobile-cameras` },
  { slug: "Wearable-Cameras", label: "6.3 Wearable cameras", url: `${BASE}/level-2-in-action/6.-recording-equipment/6.3-wearable-cameras` },
  { slug: "Patient-Monitoring-Systems", label: "6.4 Patient monitoring systems", url: `${BASE}/level-2-in-action/6.-recording-equipment/6.4-patient-monitoring-systems` },
  { slug: "Motion-Detecting-Cameras", label: "6.5 Motion-detecting cameras", url: `${BASE}/level-2-in-action/6.-recording-equipment/6.5-motion-detecting-cameras` },

  // 7. Creating footage
  { slug: "Creating-Footage", label: "7. Creating footage", url: `${BASE}/level-2-in-action/7.-creating-footage` },
  { slug: "Steady-Footage", label: "7.1 Steady Footage", url: `${BASE}/level-2-in-action/7.-creating-footage/7.1-steady-footage` },
  { slug: "Clear-Audio", label: "7.2 Clear Audio", url: `${BASE}/level-2-in-action/7.-creating-footage/7.2-clear-audio` },
  { slug: "Lighting", label: "7.3 Lighting", url: `${BASE}/level-2-in-action/7.-creating-footage/7.3-lighting` },

  // 8. Recording during the Intervention
  { slug: "Recording-During-Intervention", label: "8. Recording during the Intervention", url: `${BASE}/level-2-in-action/8.-recording-during-the-intervention` },
  { slug: "Positioning", label: "8.1 Positioning", url: `${BASE}/level-2-in-action/8.-recording-during-the-intervention/8.1-positioning` },
  { slug: "Settings", label: "8.2 Settings", url: `${BASE}/level-2-in-action/8.-recording-during-the-intervention/8.2-settings` },
  { slug: "During-Recording", label: "8.3 During recording", url: `${BASE}/level-2-in-action/8.-recording-during-the-intervention/8.3-during-recording` },

  // 9. After the Intervention
  { slug: "After-The-Intervention", label: "9. After the Intervention", url: `${BASE}/level-2-in-action/9.-after-the-intervention` },
  { slug: "File-Transfer-And-Backup", label: "9.1 File Transfer and Backup", url: `${BASE}/level-2-in-action/9.-after-the-intervention/9.1-file-transfer-and-backup` },
  { slug: "Simple-Video-Editing", label: "9.2 Simple Video Editing", url: `${BASE}/level-2-in-action/9.-after-the-intervention/9.2-simple-video-editing` },
  { slug: "Metadata-And-Archiving", label: "9.3 Metadata and Archiving", url: `${BASE}/level-2-in-action/9.-after-the-intervention/9.3-metadata-and-archiving` },

  // Reflect
  { slug: "Reflect", label: "Reflect", url: `${BASE}/level-2-in-action/reflect` },

  // 10. Previewing
  { slug: "Previewing", label: "10. Previewing", url: `${BASE}/level-2-in-action/10.-previewing` },
  { slug: "Questions-During-Previewing", label: "10.1 Questions to ask during previewing", url: `${BASE}/level-2-in-action/10.-previewing/10.1-questions-to-ask-during-previewing` },

  // 11. Let's Neoflix
  { slug: "Lets-Neoflix", label: "11. Let's Neoflix", url: `${BASE}/level-2-in-action/11.-lets-neoflix` },
  { slug: "Getting-The-Most-Out", label: "11.1 Getting the most out of your Neoflix session", url: `${BASE}/level-2-in-action/11.-lets-neoflix/11.1-getting-the-most-out-of-your-neoflix-session` },
  { slug: "Safe-Learning-Environment", label: "11.2 A Safe Learning Environment", url: `${BASE}/level-2-in-action/11.-lets-neoflix/11.2-a-safe-learning-environment` },
  { slug: "Tasks-Of-The-Chair", label: "11.3 Tasks of the chair", url: `${BASE}/level-2-in-action/11.-lets-neoflix/11.3-tasks-of-the-chair` },
  { slug: "Unlocking-Insights", label: "11.4 Unlocking Insights", url: `${BASE}/level-2-in-action/11.-lets-neoflix/11.4-unlocking-insights` },

  // Refine
  { slug: "Refine", label: "Refine", url: `${BASE}/level-2-in-action/refine` },

  // 12. Improving Care
  { slug: "Improving-Care", label: "12. Improving Care Through the Neoflix approach", url: `${BASE}/level-2-in-action/12.-improving-care-through-the-neoflix-approach` },

  // 13. The Neoflix approach
  { slug: "Neoflix-Approach", label: "13.1 The Neoflix approach", url: `${BASE}/level-2-in-action/13.1-the-neoflix-approach` },
  { slug: "Protocol-Or-Equipment-Adjustment", label: "13.1 Protocol or equipment adjustment", url: `${BASE}/level-2-in-action/13.1-the-neoflix-approach/13.1-protocol-or-equipment-adjustment` },
  { slug: "Input-For-Research", label: "13.2 Input for research", url: `${BASE}/level-2-in-action/13.1-the-neoflix-approach/13.2-input-for-research` },
  { slug: "Learning-From-Variety", label: "13.3 Learning from variety or best practices", url: `${BASE}/level-2-in-action/13.1-the-neoflix-approach/13.3-learning-from-variety-or-best-practices` },
  { slug: "Training-Programs", label: "13.4 Development of training programs", url: `${BASE}/level-2-in-action/13.1-the-neoflix-approach/13.4-development-of-training-programs-or-educational-material` },

  // 14-16
  { slug: "Education-And-Training", label: "14. Education and training", url: `${BASE}/level-2-in-action/14.-education-and-training` },
  { slug: "Recordings-For-Research", label: "15. Recordings for research", url: `${BASE}/level-2-in-action/15.-recordings-for-research` },
  { slug: "Implementing-New-Practices", label: "16. Tool for implementing new practices", url: `${BASE}/level-2-in-action/16.-tool-for-implementing-new-practices` },

  // -- Level 3: Growth --
  { slug: "Level-3-Growth", label: "Level 3: Growth", url: `${BASE}/level-3-growth/level-3-growth` },
  { slug: "Continuous-Improvement", label: "17. Continuous Improvement", url: `${BASE}/level-3-growth/17.-continuous-improvement` },
  { slug: "Expanding-Your-Video-Program", label: "18. Expanding Your Video Program", url: `${BASE}/level-3-growth/18.-expanding-your-video-program` },
  { slug: "Join-The-Network", label: "18.1 Join the Network", url: `${BASE}/level-3-growth/18.-expanding-your-video-program/18.1-revolutionize-reflection-in-medical-care-join-the-network` },
];

// -- Helpers --

/** Look up a page by slug (case-insensitive) */
export function getPageBySlug(slug) {
  return toolboxPages.find(
    (p) => p.slug.toLowerCase() === slug.toLowerCase()
  );
}

/** Get the iframe-ready GitBook URL for a slug */
export function getEmbedUrl(slug) {
  const page = getPageBySlug(slug);
  return page ? page.url : null;
}

/** Grouped by level -- useful for the CMS dropdown */
export function getGroupedPages() {
  const groups = {
    "Welcome": [],
    "Level 1: Fundamentals": [],
    "Level 2: In Action": [],
    "Level 3: Growth": [],
  };

  for (const page of toolboxPages) {
    if (page.url.includes("/welcome/")) groups["Welcome"].push(page);
    else if (page.url.includes("/level-1-")) groups["Level 1: Fundamentals"].push(page);
    else if (page.url.includes("/level-2-")) groups["Level 2: In Action"].push(page);
    else if (page.url.includes("/level-3-")) groups["Level 3: Growth"].push(page);
    else groups["Welcome"].push(page); // root Welcome page
  }

  return groups;
}

export default toolboxPages;
