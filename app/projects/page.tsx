import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ProjectExplorer } from "@/components/projects/ProjectExplorer";
export const metadata: Metadata = { title: "Projects" };
export default function ProjectsPage() {
  return (
    <main id="main-content" className="page-shell subpage">
      <Link href="/" className="text-link back-link">
        <ArrowLeft size={15} />
        Back to home
      </Link>
      <div className="page-intro">
        <span className="eyebrow">THE PROJECT ARCHIVE</span>
        <h1>
          Ideas, made real<span className="green-period">.</span>
        </h1>
        <p>
          A collection of applications, experiments, and works in progress.
          <br />
          Each one is a chance to solve something meaningful.
        </p>
      </div>
      <ProjectExplorer />
    </main>
  );
}
