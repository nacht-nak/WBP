import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { profile, education, certifications } from "@/data/profile";
import { projects } from "@/data/projects";
import { experience } from "@/data/experience";
import { technologies } from "@/data/technologies";
import { PrintButton } from "@/components/ui/PrintButton";
export const metadata: Metadata = { title: "Resume" };
export default function ResumePage() {
  return (
    <main id="main-content" className="page-shell subpage resume-page">
      <div className="resume-toolbar">
        <Link className="text-link back-link" href="/">
          <ArrowLeft size={15} />
          Back to portfolio
        </Link>
        <PrintButton />
      </div>
      <div className="page-intro">
        <span className="eyebrow">RESUME / PORTFOLIO SUMMARY</span>
        <h1>{profile.name}</h1>
        <p>{profile.role} · Laravel, React, Next.js & MySQL</p>
        {profile.email && (
          <a href={`mailto:${profile.email}`}>{profile.email}</a>
        )}
      </div>
      <section>
        <h2>Profile</h2>
        <p>
          Full-stack web developer focused on thoughtful web interfaces and
          useful applications. Currently pursuing a Master of Information
          Technology at State University of Northern Negros.
        </p>
      </section>
      <section>
        <h2>Selected projects</h2>
        {projects.map((p) => (
          <article key={p.slug}>
            <h3>
              {p.title} <span className="muted text-xs">/ {p.status}</span>
            </h3>
            <p>{p.description}</p>
            <p className="text-sm">{p.technologies.join(" · ")}</p>
            {p.url && (
              <a className="resume-url" href={p.url}>
                {p.url}
              </a>
            )}
          </article>
        ))}
      </section>
      {experience.filter((e) => !e.placeholder).length > 0 && (
        <section>
          <h2>Experience</h2>
          {experience
            .filter((e) => !e.placeholder)
            .map((e) => (
              <article key={e.title}>
                <h3>{e.title}</h3>
                <p>
                  {e.organization} · {e.date}
                </p>
                <p>{e.description}</p>
              </article>
            ))}
        </section>
      )}
      <section>
        <h2>Education</h2>
        {education.map((e) => (
          <article key={e.degree}>
            <h3>{e.degree}</h3>
            <p>
              {e.school} · {e.status}
            </p>
          </article>
        ))}
      </section>
      <section>
        <h2>Technologies</h2>
        {technologies.map((t) => (
          <p key={t.category}>
            <strong>{t.category}:</strong> {t.items.join(", ")}
          </p>
        ))}
      </section>
      {certifications.length > 0 && (
        <section>
          <h2>Certifications</h2>
          {certifications.map((c) => (
            <p key={c.title}>
              {c.title} — {c.issuer}, {c.date}
            </p>
          ))}
        </section>
      )}
    </main>
  );
}
