import { profile } from "@/data/profile";
import { AnimatedReveal } from "@/components/ui/AnimatedReveal";
import { ContactInquiry } from "@/components/ui/ContactInquiry";
export function Contact() {
  return (
    <section
      id="contact"
      className="detail-section contact-section"
      aria-labelledby="contact-heading"
    >
      <AnimatedReveal>
        <div className="detail-heading">
          <h2 id="contact-heading">Let’s work together.</h2>
        </div>
        <div className="contact-grid">
          <div className="contact-copy">
            <p>
              Available for freelance web development and full-stack projects,
              from new builds to existing websites. Let’s bring your ideas to
              life with thoughtful, reliable web experiences.
            </p>
          </div>
          <ContactInquiry email={profile.email} />
        </div>
      </AnimatedReveal>
    </section>
  );
}
