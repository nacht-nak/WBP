import { BriefcaseBusiness } from "lucide-react";
import { experience } from "@/data/experience";
import { AnimatedReveal } from "@/components/ui/AnimatedReveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
export function Experience() {
  return (
    <section id="experience" className="section">
      <AnimatedReveal>
        <SectionHeading
          number=""
          title="Experience"
          description="The work, the learning, and everything in between."
        />
      </AnimatedReveal>
      <div className="timeline">
        {experience.map((item, i) => (
          <AnimatedReveal
            key={item.title}
            delay={i * 0.08}
            className="timeline-entry"
          >
            <div className="timeline-date">
              {item.date}
              {item.placeholder && (
                <span className="tiny-label">EDITABLE PLACEHOLDER</span>
              )}
            </div>
            <div className="timeline-content">
              <span className="timeline-marker">
                <BriefcaseBusiness size={13} />
              </span>
              <h3>{item.title}</h3>
              <span className="muted text-sm">{item.organization}</span>
              <p>{item.description}</p>
            </div>
          </AnimatedReveal>
        ))}
      </div>
    </section>
  );
}
