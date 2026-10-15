import { Github } from "@/components/ui/BrandIcons";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { TechnologyIcon } from "@/components/ui/TechnologyBadge";
import type { Project } from "@/types";

export function ProjectCard({ project }: { project: Project }) {
  return (
    <article className="project-card">
      <Link
        href={`/projects/${project.slug}`}
        className="project-image"
        aria-label={`View ${project.title} details`}
      >
        <Image
          src={project.image}
          alt={`${project.title} — ${project.imageIsConcept ? "illustrative interface preview" : "application screenshot"}`}
          fill
          sizes="(max-width: 650px) 90vw, 220px"
        />
        {project.imageIsConcept && (
          <span className="project-image-label">CONCEPT PREVIEW</span>
        )}
      </Link>
      <div className="project-info">
        <h3>
          <Link href={`/projects/${project.slug}`}>{project.title}</Link>
        </h3>
        <span className="project-kind">
          {project.category === "AI & tools"
            ? "AI & text analysis"
            : "Full-stack web application"}
        </span>
        <p>{project.description}</p>
        {project.status === "In development" && (
          <span className="project-status development">
            <i />
            In development
          </span>
        )}
        <div className="project-technologies" aria-label="Project technologies">
          {project.technologies.map((name) => (
            <span
              className="project-tech-icon"
              role="img"
              aria-label={name}
              title={name}
              key={name}
            >
              <TechnologyIcon name={name} size={16} />
            </span>
          ))}
        </div>
        <div className="project-card-links">
          <Link
            href={`/projects/${project.slug}`}
            className="project-details-link"
          >
            Project details
          </Link>
          <div>
            {project.github && (
              <a
                href={project.github}
                aria-label={`${project.title} source code`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Github size={14} />
              </a>
            )}
            {project.url && (
              <a href={project.url} target="_blank" rel="noopener noreferrer">
                Visit site
                <ArrowUpRight size={11} />
              </a>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
