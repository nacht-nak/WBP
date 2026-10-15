"use client";
import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { projects } from "@/data/projects";
import { ProjectCard } from "@/components/ui/ProjectCard";
export function ProjectExplorer() {
  const [filter, setFilter] = useState("All projects");
  const reduced = useReducedMotion();
  const visible = projects.filter(
    (p) =>
      filter === "All projects" ||
      p.category === filter ||
      (filter === "In development" && p.status === filter),
  );
  return (
    <>
      <div className="filter-tabs" role="group" aria-label="Filter projects">
        {[
          "All projects",
          "Web applications",
          "AI & tools",
          "In development",
        ].map((item) => (
          <button
            key={item}
            aria-pressed={item === filter}
            className={item === filter ? "selected" : ""}
            onClick={() => setFilter(item)}
          >
            {item}
          </button>
        ))}
      </div>
      <p className="result-count" aria-live="polite">
        {visible.length} {visible.length === 1 ? "project" : "projects"}
      </p>
      <div className="project-grid">
        {visible.map((p) => (
          <motion.div
            key={p.slug}
            initial={false}
            animate={
              reduced ? { opacity: 1, y: 0 } : { opacity: [0.5, 1], y: [8, 0] }
            }
            transition={{ duration: reduced ? 0 : 0.35 }}
          >
            <ProjectCard project={p} />
          </motion.div>
        ))}
      </div>
    </>
  );
}
