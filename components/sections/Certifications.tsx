import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { AnimatedReveal } from "@/components/ui/AnimatedReveal";
import { CredentialsList } from "@/components/ui/CredentialsList";
export function Certifications() {
  return (
    <section
      id="certifications"
      className="detail-section certifications-section"
      aria-labelledby="certifications-heading"
    >
      <AnimatedReveal>
        <div className="detail-heading">
          <h2 id="certifications-heading">Certifications</h2>
          <Link href="/certifications" className="text-link">
            View All
            <ChevronRight size={12} />
          </Link>
        </div>
        <CredentialsList preview />
      </AnimatedReveal>
    </section>
  );
}
