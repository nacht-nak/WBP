export type Project = {
  slug: string;
  title: string;
  shortTitle: string;
  description: string;
  details: string;
  technologies: string[];
  status: "Live project" | "In development";
  category: "Web applications" | "AI & tools";
  url?: string;
  github?: string;
  image: string;
  imageIsConcept?: boolean;
  tone: string;
};
export type Highlight = {
  id: string;
  title: string;
  description: string;
  category: "Projects" | "Development" | "Education";
  date: string;
  year: string;
  image: string;
  href: string;
};
