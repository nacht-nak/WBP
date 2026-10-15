import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { MeetingBooking } from "@/components/meeting/MeetingBooking";
export const metadata: Metadata = {
  title: "Schedule a call",
  description:
    "Choose a preferred date and time for a 30-minute introduction, then email your request to Welquim Panogaling.",
};
export default function MeetingPage() {
  return (
    <main id="main-content" className="page-shell subpage">
      <Link href="/#contact" className="text-link back-link">
        <ArrowLeft size={15} />
        Back to portfolio
      </Link>
      <div className="page-intro meeting-intro">
        <span className="eyebrow">LET’S MAKE SOMETHING MEANINGFUL</span>
        <h1>
          A conversation away<span className="green-period">.</span>
        </h1>
        <p>A 30-minute introduction. A little room for possibility.</p>
      </div>
      <MeetingBooking />
    </main>
  );
}
