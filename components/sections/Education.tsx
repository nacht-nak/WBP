import { education } from "@/data/profile";
import { AnimatedReveal } from "@/components/ui/AnimatedReveal";
export function Education() {
  return (
    <section
      id="education"
      className="detail-section education-section"
      aria-labelledby="education-heading"
    >
      <AnimatedReveal>
        <div className="detail-heading">
          <h2 id="education-heading">Education</h2>
        </div>
        <div className="education-list">
          {education.map((item) => (
            <article className="education-entry" key={item.degree}>
              <span className="education-date">
                {item.dateRange ||
                  (item.status === "Ongoing" ? "Ongoing" : "Dates to be added")}
              </span>
              <div>
                <h3>{item.degree}</h3>
                <p>{item.school}</p>
              </div>
            </article>
          ))}
        </div>
      </AnimatedReveal>
    </section>
  );
}
