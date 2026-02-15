import SimpleCookieCutterBand from '../SimpleCookieCutterBand';
import MirroredCookieCutterBand from '../MirroredCookieCutterBand';

export const BASE_INDEX = 2; // index of the always-visible base video

export const VARIANTS = {
  v2: {
    id: 'medical-v2',
    blurVideos: [
      { id: "0", video: "/videos/blururgency.mp4", alt: "Blurred medical urgency" },
      { id: "1", video: "/videos/blurcoordination.mp4", alt: "Blurred team coordination" },
      { id: "2", video: "/videos/blurfocus.mp4", alt: "Blurred medical focus" },
    ],
    headlines: [
      { firstLine: "Medical interventions demand", secondLine: "precision and urgency." },
      { firstLine: "Which makes coordination within", secondLine: "teams vital for success." },
      { firstLine: "Task\u2011driven focus can lead to", secondLine: "tunnel vision and misalignment." },
    ],
    mainVideos: [
      { id: "0", video: "/videos/urgency.mp4", alt: "Medical urgency demonstration" },
      { id: "1", video: "/videos/coordination.mp4", alt: "Medical team coordination" },
      { id: "2", video: "/videos/focus.mp4", alt: "Medical focus and precision" },
    ],
    cookieComponent: SimpleCookieCutterBand,
    orientation: 'video-right',
    header: {
      line1: 'In the moment,',
      line2prefix: '',
      line2highlight: 'only',
      line2suffix: ' the patient',
      line3: 'matters'
    }
  },
  v3: {
    id: 'medical-v3',
    blurVideos: [
      { id: "0", video: "/videos/blursskills.mp4", alt: "Blurred skills demonstration" },
      { id: "1", video: "/videos/blurteam.mp4", alt: "Blurred team coordination" },
      { id: "2", video: "/videos/blurperspectives.mp4", alt: "Blurred perspectives" },
    ],
    headlines: [
      { firstLine: "Quiet reflection allows for", secondLine: "sharpening skills." },
      { firstLine: "Further video debriefs foster", secondLine: "cohesion amongst peers." },
      { firstLine: "Shared understanding enhances", secondLine: "decisiveness." },
    ],
    mainVideos: [
      { id: "0", video: "/videos/skills.mp4", alt: "Sharpening skills" },
      { id: "1", video: "/videos/team.mp4", alt: "Team cohesion" },
      { id: "2", video: "/videos/perspectives.mp4", alt: "Shared perspectives" },
    ],
    cookieComponent: MirroredCookieCutterBand,
    orientation: 'video-left',
    header: {
      line1: 'Yet,',
      line1suffix: ' ',
      line2prefix: '',
      line2highlight: 'reflection',
      line2suffix: '',
      line3: 'strengthens',
      line4: 'the next'
    }
  }
};
