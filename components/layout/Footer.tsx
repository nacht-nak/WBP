import { ArrowUp } from "lucide-react";
import Link from "next/link";
import { SocialLinks } from "@/components/ui/SocialLinks";
import { VisitorCount } from "@/components/ui/VisitorCount";
import { profile } from "@/data/profile";
import { cacheLife } from "next/cache";
export async function Footer() {
  "use cache";
  cacheLife("days");
  const year = new Date().toLocaleDateString("en", {
    year: "numeric",
    timeZone: "Asia/Manila",
  });
  return (
    <footer className="site-footer page-shell">
      <div className="footer-identity">
        <p className="footer-motto">Repetition until it becomes technique.</p>
        <div className="footer-meta">
          <Link href="/">{profile.name}</Link>
          <span>/</span>
          <span>Philippines</span>
          <span>/</span>
          <span>© {year}</span>
        </div>
      </div>
      <div className="footer-right">
        <SocialLinks />
        <VisitorCount />
        <a className="footer-top" href="#top" aria-label="Back to top">
          <ArrowUp size={13} />
        </a>
      </div>
    </footer>
  );
}
