// Replace empty values with verified details. Missing links render as unavailable.
export const profile = {
  name: "Welquim Panogaling",
  role: "Full-Stack Web Developer",
  email: "welpanogaling12@gmail.com",
  github: "https://github.com/nacht-nak",
  linkedin: "https://www.linkedin.com/in/welquim-panogaling-2b28b0437/",
  photo: "/mascots/welquim-avatar.webp",
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
export const certifications: {
  title: string;
  issuer: string;
  date: string;
  url?: string;
  image?: string;
}[] = [];

export const training: {
  title: string;
  issuer: string;
  date: string;
  url?: string;
}[] = [];
