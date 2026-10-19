import { Hero } from "@/components/sections/Hero";
import { Experience } from "@/components/sections/Experience";
import { Community } from "@/components/sections/Community";
import { FeaturedWork } from "@/components/sections/FeaturedWork";
import { Projects } from "@/components/sections/Projects";
import { Technologies } from "@/components/sections/Technologies";
import { Education } from "@/components/sections/Education";
import { Certifications } from "@/components/sections/Certifications";
import { GithubActivity } from "@/components/sections/GithubActivity";
import { Contact } from "@/components/sections/Contact";
import { OutsideIDE } from "@/components/sections/OutsideIDE";
export default function Home() {
  return (
    <main id="main-content" className="page-shell">
      <Hero />
      <Experience />
      <Community />
      <FeaturedWork />
      <Projects />
      <Technologies />
      <Certifications />
      <Education />
      <OutsideIDE />
      <GithubActivity />
      <Contact />
    </main>
  );
}
