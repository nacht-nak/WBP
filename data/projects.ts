import type { Project } from "@/types";
export const projects: Project[] = [
  {
    slug: "pageant-tabulation",
    title: "Pageant Tabulation System",
    shortTitle: "Every score. In harmony.",
    description:
      "A dedicated web application for pageant scoring and tabulation.",
    details:
      "A React and TypeScript interface paired with a Django backend, bringing pageant tabulation into a dedicated web application. Explore the live project to see the current experience.",
    technologies: ["React", "Django", "TypeScript"],
    status: "Live project",
    category: "Web applications",
    url: "https://ptsmpc.vercel.app/",
    image: "/projects/pageant.png",
    imageIsConcept: false,
    tone: "lavender",
  },
  {
    slug: "ai-text-detection",
    title: "AI Text Detection System",
    shortTitle: "A little more clarity.",
    description:
      "An approachable interface for exploring AI-generated text detection.",
    details:
      "Built with React, TypeScript and Tailwind CSS. This project explores how to present text analysis in a clear, focused interface. Detection results are indicators, not proof of authorship.",
    technologies: ["React", "TypeScript", "Tailwind CSS"],
    status: "Live project",
    category: "AI & tools",
    url: "https://ai-text-detector-frontend-black.vercel.app/",
    image: "/projects/detector.png",
    imageIsConcept: false,
    tone: "sage",
  },
  {
    slug: "barangay-management",
    title: "Barangay Management System",
    shortTitle: "Built for the everyday.",
    description:
      "A full-stack management application for barangay administration. Currently taking shape.",
    details:
      "An ongoing full-stack management application focused on barangay administration. The implementation is in development; a public demo and final technology details will be added when available.",
    technologies: ["Full-stack", "Management system"],
    status: "In development",
    category: "Web applications",
    image: "/projects/barangay.svg",
    imageIsConcept: true,
    tone: "sand",
  },
];
