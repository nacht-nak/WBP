import { ArrowUpRight, Code2, Globe2 } from "lucide-react";
import { AnimatedReveal } from "@/components/ui/AnimatedReveal";
export function Community() {
  return (
    <section className="section community-section">
      <AnimatedReveal className="community-copy">
        <h2>
          Good code starts
          <br />
          with good connections.
        </h2>
        <p>
          A space for the communities, conversations, and shared learning that
          shape the way I build.
        </p>
        <span className="muted text-xs">
          Community memberships to be added.
        </span>
      </AnimatedReveal>
      <AnimatedReveal delay={0.1}>
        <div className="membership-card">
          <div className="membership-top">
            <Code2 size={25} />
            <span>THE DEVELOPER’S MINDSET</span>
            <ArrowUpRight size={19} />
          </div>
          <div className="membership-title">
            Keep learning.
            <br />
            Keep building.
          </div>
          <div className="membership-bottom">
            <div>
              <strong>Welquim Panogaling</strong>
              <span>Full-Stack Web Developer</span>
            </div>
            <Globe2 size={29} strokeWidth={1} />
          </div>
        </div>
        <div className="card-caption">
          A little curiosity goes a long way. <span>↗</span>
        </div>
      </AnimatedReveal>
    </section>
  );
}
