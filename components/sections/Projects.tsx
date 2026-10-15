import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { projects } from "@/data/projects";
import { ProjectCard } from "@/components/ui/ProjectCard";
import { AnimatedReveal } from "@/components/ui/AnimatedReveal";

export function Projects() {
  return (
    <section
      id="projects"
      className="section projects-section"
      aria-labelledby="projects-heading"
    >
      <AnimatedReveal>
        <h2 id="projects-heading" className="compact-section-title">
          Projects
        </h2>
      </AnimatedReveal>
      <div className="project-grid">
        {projects.map((project, i) => (
          <AnimatedReveal key={project.slug} delay={i * 0.06}>
            <ProjectCard project={project} />
          </AnimatedReveal>
        ))}
      </div>
      <div className="projects-explore">
        <Link href="/projects" className="button button-dark">
          Explore all projects
          <ChevronRight size={15} />
        </Link>
      </div>
    </section>
  );
}
