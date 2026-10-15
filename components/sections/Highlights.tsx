"use client";
import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { highlights } from "@/data/highlights";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { AnimatedReveal } from "@/components/ui/AnimatedReveal";
export function Highlights() {
  const [filter, setFilter] = useState("All");
  const reduced = useReducedMotion();
  const filtered = highlights.filter(
    (item) => filter === "All" || item.category === filter,
  );
  const years = [...new Set(filtered.map((item) => item.year))];
  return (
    <section id="" className="section">
      <AnimatedReveal>
        <SectionHeading
          number=""
          title="Highlights"
          description="Small milestones. Meaningful moments."
        />
        <div
          className="filter-tabs"
          role="group"
          aria-label=""
        >
          {["All", "Projects", "Development", "Education"].map((item) => (
            <button
              key={item}
              onClick={() => setFilter(item)}
              aria-pressed={filter === item}
              className={filter === item ? "selected" : ""}
            >
              {item}
            </button>
          ))}
        </div>
        <div aria-live="polite" className="sr-only">
          {filtered.length} highlights shown
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={filter}
            initial={false}
            animate={
              reduced ? { opacity: 1, y: 0 } : { opacity: [0.5, 1], y: [6, 0] }
            }
            exit={{ opacity: reduced ? 1 : 0 }}
            transition={{ duration: reduced ? 0 : 0.25 }}
          >
            {years.map((year) => (
              <div key={year}>
                <div className="highlight-year">
                  {year}
                  <span />
                </div>
                <div className="highlights-grid">
                  {filtered
                    .filter((item) => item.year === year)
                    .map((item) => (
                      <article className="highlight-card" key={item.id}>
                        <Link href={item.href} className="highlight-image">
                          <Image
                            src={item.image}
                            alt={`Illustration for ${item.title}`}
                            fill
                            sizes="(max-width: 650px) 90vw, 300px"
                          />
                          <span className="highlight-arrow">
                            <ArrowUpRight size={17} />
                          </span>
                        </Link>
                        <div className="highlight-meta">
                          <span>{item.category}</span>
                          <span>{item.date}</span>
                        </div>
                        <h3>
                          <Link href={item.href}>{item.title}</Link>
                        </h3>
                        <p>{item.description}</p>
                      </article>
                    ))}
                </div>
              </div>
            ))}
          </motion.div>
        </AnimatePresence>
      </AnimatedReveal>
    </section>
  );
}
