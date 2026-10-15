"use client";
import { useState } from "react";
import { ChevronRight, Pause, Play } from "lucide-react";
import { technologies } from "@/data/technologies";
import { TechnologyBadge } from "@/components/ui/TechnologyBadge";
import { AnimatedReveal } from "@/components/ui/AnimatedReveal";

const rows = [
  { label: "Frontend", items: technologies[0].items },
  {
    label: "Backend and databases",
    items: [...technologies[1].items, ...technologies[2].items],
  },
  { label: "Development tools", items: technologies[3].items },
];

export function Technologies() {
  const [paused, setPaused] = useState(false);
  const [expanded, setExpanded] = useState(false);
  return (
    <section
      id="technologies"
      className="section technologies-section"
      aria-labelledby="technologies-heading"
    >
      <AnimatedReveal>
        <div className="technologies-heading">
          <h2 id="technologies-heading" className="compact-section-title">
            Technologies
          </h2>
          <div className="technologies-controls">
            {!expanded && (
              <button
                className="carousel-toggle icon-button"
                onClick={() => setPaused(!paused)}
                aria-label={
                  paused
                    ? "Play technology carousel"
                    : "Pause technology carousel"
                }
                aria-pressed={paused}
              >
                {paused ? <Play size={13} /> : <Pause size={13} />}
              </button>
            )}
            <button
              className="technology-view-all text-link"
              onClick={() => setExpanded(!expanded)}
              aria-expanded={expanded}
              aria-controls="technology-content"
            >
              {expanded ? "Show carousel" : "View All"}
              <ChevronRight size={13} />
            </button>
          </div>
        </div>
        <div id="technology-content">
          {expanded ? (
            <div className="technology-catalog">
              {technologies.map((group) => (
                <div className="technology-row" key={group.category}>
                  <h3>{group.category}</h3>
                  <div>
                    {group.items.map((name) => (
                      <TechnologyBadge key={name} name={name} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="technology-carousel" data-paused={paused}>
              {rows.map((row, index) => (
                <div
                  className="technology-lane"
                  tabIndex={0}
                  role="region"
                  aria-label={`${row.label} technologies; focus to pause scrolling`}
                  key={row.label}
                >
                  <div className={`technology-track track-${index}`}>
                    {[0, 1].map((copy) => (
                      <div
                        className="technology-group"
                        aria-hidden={copy === 1 ? true : undefined}
                        key={copy}
                      >
                        {row.items.map((name) => (
                          <TechnologyBadge key={name} name={name} />
                        ))}
                        <div className="carousel-repeat" aria-hidden="true">
                          {row.items.map((name) => (
                            <TechnologyBadge key={name} name={name} />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </AnimatedReveal>
    </section>
  );
}
