import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
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
          Individual member · PSITE Region VI
        </span>
      </AnimatedReveal>
      <AnimatedReveal delay={0.1}>
        <a
          className="community-membership"
          href="https://psite.org/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Visit PSITE, our community (opens in a new tab)"
        >
          <span className="membership-card">
            <Image
              src="/images/psite-membership.png"
              alt="Welquim Panogaling’s PSITE Region VI membership card for 2026"
              width={2000}
              height={680}
              sizes="(max-width: 650px) 725px, 620px"
            />
          </span>
          <span className="card-caption">
            Visit our community <ArrowUpRight size={20} aria-hidden="true" />
          </span>
        </a>
      </AnimatedReveal>
    </section>
  );
}
