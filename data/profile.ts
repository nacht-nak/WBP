// Replace empty values with verified details. Missing links render as unavailable.
export const profile = {
  name: "Welquim Panogaling",
  role: "Full-Stack Web Developer",
  email: "welpanogaling12@gmail.com",
  github: "https://github.com/nacht-nak",
  linkedin: "https://www.linkedin.com/in/welquim-panogaling-2b28b0437/",
  photo: "/mascots/welquim-portrait-avatar.webp",
  availability: "Open to conversations",
  resume: "/resume",
};
export const education = [
  {
    degree: "Master of Information Technology",
    school: "State University of Northern Negros",
    status: "Ongoing",
    dateRange: "",
  },
  {
    degree: "Bachelor of Science in Information Technology",
    school: "Central Philippines State University — Hinoba-an Campus",
    status: "Undergraduate degree",
    dateRange: "",
  },
];
export type Credential = {
  title: string;
  issuer: string;
  date: string;
  image: string;
  fullImage: string;
  imageWidth: number;
  imageHeight: number;
  description: string;
};

export const certifications: Credential[] = [
  {
    title: "Research Publication — Network Attack Analysis",
    issuer:
      "International Journal of Computer Science and Mobile Computing (IJCSMC)",
    date: "Aug 2026",
    description:
      "Risk-Oriented Analysis and Classification of Network Attacks Affecting Hospital Information Systems: Evidence from a Patient-Monitoring Testbed. Volume 15, Issue 8.",
    image: "/certificates/ijcsmc-publication.webp",
    fullImage: "/certificates/ijcsmc-publication-full.webp",
    imageWidth: 2000,
    imageHeight: 1415,
  },
  {
    title: "PSITE Region VI — Individual Membership",
    issuer: "Philippine Society of IT Educators — Region VI",
    date: "2026",
    description: "Membership valid from January 1 to December 31, 2026.",
    image: "/certificates/psite-region-vi-membership.webp",
    fullImage: "/certificates/psite-region-vi-membership-full.webp",
    imageWidth: 2000,
    imageHeight: 1414,
  },
];

export const training: Credential[] = [
  {
    title: "Cybersecurity Awareness and Ethical AI in Education",
    issuer:
      "DICT Negros Island Region — ICT Literacy and Competency Development Bureau",
    date: "Apr 7, 2026",
    description: "Certificate of attendance · 8-hour information session.",
    image: "/certificates/dict-cybersecurity-ai.webp",
    fullImage: "/certificates/dict-cybersecurity-ai-full.webp",
    imageWidth: 1413,
    imageHeight: 2000,
  },
  {
    title: "On-the-Job Training Completion",
    issuer: "Technopal Software",
    date: "Nov 25, 2025",
    description: "486 hours of training · August 18–November 25, 2025.",
    image: "/certificates/technopal-ojt-completion.webp",
    fullImage: "/certificates/technopal-ojt-completion-full.webp",
    imageWidth: 2000,
    imageHeight: 1396,
  },
  {
    title: "Technical Support Team Training",
    issuer: "Technopal Software",
    date: "Nov 20, 2025",
    description:
      "August–November 2025 · HTML, CSS, JavaScript, jQuery, Bootstrap, Java/J2EE, MySQL, Laravel, and React.",
    image: "/certificates/technopal-support-training.webp",
    fullImage: "/certificates/technopal-support-training-full.webp",
    imageWidth: 2000,
    imageHeight: 1553,
  },
  {
    title:
      "International Webinar in Information Technology 2025: Breaking the Code to Endless Innovations",
    issuer:
      "Aurora State College of Technology · JSPS Alumni Association of the Philippines · Nueva Ecija University of Science and Technology",
    date: "Feb 13, 2025",
    description:
      "Certificate of participation in an international webinar exploring the latest advancements and future directions in information technology. Held at Aurora State College of Technology in Baler, Aurora, and via Zoom.",
    image: "/certificates/international-it-webinar-2025.webp",
    fullImage: "/certificates/international-it-webinar-2025-full.webp",
    imageWidth: 2000,
    imageHeight: 1417,
  },
];
