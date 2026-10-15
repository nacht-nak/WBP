import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CredentialsList } from "@/components/ui/CredentialsList";
export const metadata: Metadata = { title: "Certifications & Training" };
export default function CertificationsPage() {
  return (
    <main id="main-content" className="page-shell subpage credentials-page">
      <Link href="/#certifications" className="text-link back-link">
        <ArrowLeft size={14} />
        Back to portfolio
      </Link>
      <div className="page-intro">
        <h1>Certifications &amp; training</h1>
        <p>
          A record of professional credentials and continued learning. Verified
          details will appear here as they are added.
        </p>
      </div>
      <CredentialsList />
    </main>
  );
}
