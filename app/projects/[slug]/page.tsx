import { Github } from "@/components/ui/BrandIcons";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { projects } from "@/data/projects";
export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);
  return {
    title: project?.title || "Project not found",
    description: project?.description,
  };
}
export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);
  if (!project) notFound();
  return (
    <main id="main-content" className="page-shell subpage">
      <Link href="/projects" className="text-link back-link">
        <ArrowLeft size={15} />
        All projects
      </Link>
      <div className="page-intro">
        <span className="eyebrow">
          {project.category.toUpperCase()} / {project.status.toUpperCase()}
        </span>
        <h1 className="project-detail-title">
          {project.title}
          <span className="green-period">.</span>
        </h1>
        <p>{project.description}</p>
      </div>
      <div className={`detail-image ${project.tone}`}>
        <Image
          src={project.image}
          alt={`${project.title} ${project.imageIsConcept ? "concept artwork" : "screenshot"}`}
          fill
          sizes="(max-width: 1000px) 90vw, 960px"
          preload
        />
      </div>
      {project.imageIsConcept && (
        <p className="preview-note">
          Illustrative concept preview. The live application may look different.
        </p>
      )}
      <section className="project-detail-body">
        <div>
          <h2>About the project</h2>
          <p>{project.details}</p>
          <div className="hero-actions">
            {project.url ? (
              <a
                className="button button-dark"
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                Visit live project
                <ArrowUpRight size={16} />
              </a>
            ) : (
              <span className="status-pill">
                In development — preview coming later
              </span>
            )}
            {project.github && (
              <a
                className="text-link"
                href={project.github}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Github size={16} />
                View source
              </a>
            )}
          </div>
        </div>
        <aside>
          <span className="eyebrow">BUILT WITH</span>
          <div className="technology-tags">
            {project.technologies.map((t) => (
              <span key={t}>{t}</span>
            ))}
          </div>
          <span className="eyebrow">STATUS</span>
          <p>{project.status}</p>
        </aside>
      </section>
    </main>
  );
}
