import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { projects } from "@/data/projects";
import { AnimatedReveal } from "@/components/ui/AnimatedReveal";
export function FeaturedWork() {
  return (
    <section
      className="section featured-section"
      aria-labelledby="featured-title"
    >
      <AnimatedReveal>
        <div className="featured-heading">
          <h2 id="featured-title">A few things I’ve put into the world.</h2>
          <span className="handwritten">built with care ↙</span>
        </div>
      </AnimatedReveal>
      <div className="featured-grid">
        {projects.map((project, i) => (
          <AnimatedReveal
            className={`featured-wrap featured-${i}`}
            delay={i * 0.07}
            key={project.slug}
          >
            <Link
              href={`/projects/${project.slug}`}
              className={`featured-card ${project.tone}`}
            >
              <Image
                src={project.image}
                alt={`${project.title} project preview`}
                fill
                sizes={
                  i === 0
                    ? "(max-width: 650px) 90vw, 550px"
                    : "(max-width: 650px) 90vw, 320px"
                }
              />
              <div className="featured-overlay" />
              <div className="featured-card-top">
                <span>
                  0{i + 1} / {i === 2 ? "IN THE WORKS" : "FEATURED WORK"}
                </span>
                <span className="featured-arrow">
                  <ArrowUpRight size={18} />
                </span>
              </div>
              <div className="featured-card-bottom">
                <span>{project.technologies.slice(0, 2).join(" / ")}</span>
                <h3>{project.shortTitle}</h3>
                <p>{project.title}</p>
              </div>
            </Link>
          </AnimatedReveal>
        ))}
      </div>
      <p className="preview-note">
        Live project screenshots. Barangay Management uses an illustrative
        concept preview.
      </p>
    </section>
  );
}
