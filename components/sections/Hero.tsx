import Link from "next/link";
import {
  Atom,
  BadgeCheck,
  ChevronRight,
  Database,
  Layers,
  Triangle,
} from "lucide-react";
import { profile } from "@/data/profile";
import { SocialLinks } from "@/components/ui/SocialLinks";
import { AnimatedReveal } from "@/components/ui/AnimatedReveal";
import { ProfileMascot } from "@/components/ui/ProfileMascot";

export function Hero() {
  return (
    <section className="profile-intro" aria-labelledby="hero-title">
      <AnimatedReveal>
        <div className="intro-identity">
          <div className="intro-avatar">
            <ProfileMascot />
          </div>
          <div className="intro-name">
            <h1 id="hero-title">
              {profile.name}
              <BadgeCheck
                className="intro-badge"
                size={22}
                aria-hidden="true"
              />
            </h1>
            <SocialLinks />
          </div>
        </div>
      </AnimatedReveal>
      <AnimatedReveal delay={0.08}>
        <h2 className="intro-role">
          {profile.role}
          <span> — Laravel &amp; React</span>
        </h2>
      </AnimatedReveal>
      <AnimatedReveal delay={0.16}>
        <p className="intro-description">
          I’m a full-stack web developer building websites and backend systems
          with{" "}
          <span className="inline-tech tech-laravel">
            <Layers size={14} />
            Laravel
          </span>{" "}
          <span className="inline-tech tech-react">
            <Atom size={14} />
            React
          </span>{" "}
          <span className="inline-tech tech-next">
            <Triangle size={13} />
            Next.js
          </span>{" "}
          <span className="inline-tech tech-mysql">
            <Database size={14} />
            MySQL
          </span>
          . I turn complex problems into simple, thoughtful web experiences. I’m
          currently pursuing a Master of Information Technology while building
          practical applications for real-world needs.
        </p>
      </AnimatedReveal>
      <AnimatedReveal delay={0.24}>
        <div className="intro-actions">
          <Link
            href={profile.resume}
            className="button button-dark intro-resume"
          >
            View Resume
            <ChevronRight size={16} />
          </Link>
        </div>
      </AnimatedReveal>
    </section>
  );
}
