import { outsideIDE } from "@/data/interests";
import { AnimatedReveal } from "@/components/ui/AnimatedReveal";
import { PhotoStack } from "@/components/ui/PhotoStack";
export function OutsideIDE() {
  return (
    <section
      id="outside-ide"
      className="detail-section outside-section"
      aria-labelledby="outside-heading"
    >
      <AnimatedReveal>
        <div className="detail-heading">
          <h2 id="outside-heading">Outside the IDE</h2>
        </div>
        <div className="outside-grid">
          <div className="outside-copy">
            <p>{outsideIDE.description}</p>
            <div className="interest-tags">
              {outsideIDE.interests.length ? (
                outsideIDE.interests.map((interest) => (
                  <span key={interest}>{interest}</span>
                ))
              ) : (
                <span className="interest-placeholder">
                  Personal interests coming soon
                </span>
              )}
            </div>
          </div>
          <div className="outside-photos">
            <PhotoStack photos={outsideIDE.photos} />
            {outsideIDE.photosAreIllustrative && (
              <p className="photo-disclosure">
                Illustrative photos · Tap Tap
              </p>
            )}
          </div>
        </div>
      </AnimatedReveal>
    </section>
  );
}
