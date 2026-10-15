import Image from "next/image";
import { ArrowUpRight, FileBadge2 } from "lucide-react";
import { certifications, training } from "@/data/profile";

export function CredentialsList({ preview = false }: { preview?: boolean }) {
  const credentials = preview ? certifications.slice(0, 1) : certifications;
  const courses = preview ? training.slice(0, 2) : training;
  return (
    <div className="credentials-list">
      <div className="credential-group">
        <h3 className="credential-label">
          Professional credential{credentials.length > 1 ? "s" : ""}
        </h3>
        {credentials.length ? (
          credentials.map((item) => (
            <article className="credential-entry" key={item.title}>
              <span className="credential-date">{item.date}</span>
              <div className="credential-thumbnail">
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={`${item.title} certificate`}
                    width={94}
                    height={60}
                  />
                ) : (
                  <FileBadge2 size={28} strokeWidth={1} />
                )}
              </div>
              <div className="credential-copy">
                <h4>{item.title}</h4>
                <p>{item.issuer}</p>
                {item.url && (
                  <a
                    className="credential-link"
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View credential
                    <ArrowUpRight size={11} />
                  </a>
                )}
              </div>
            </article>
          ))
        ) : (
          <article className="credential-entry placeholder-entry">
            <span className="credential-date">To be added</span>
            <div
              className="credential-thumbnail placeholder-certificate"
              aria-hidden="true"
            >
              <FileBadge2 size={26} strokeWidth={1} />
              <span>CREDENTIAL</span>
            </div>
            <div className="credential-copy">
              <h4>Professional certification</h4>
              <p>Verified credentials will appear here.</p>
              <span className="credential-placeholder-label">
                Details coming soon
              </span>
            </div>
          </article>
        )}
      </div>
      <div className="credential-group training-group">
        <h3 className="credential-label">Recent training</h3>
        {courses.length ? (
          courses.map((item) => (
            <article className="training-entry" key={item.title}>
              <span className="credential-date">{item.date}</span>
              <div className="credential-copy">
                <h4>{item.title}</h4>
                <p>{item.issuer}</p>
                {item.url && (
                  <a
                    className="credential-link"
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View training
                    <ArrowUpRight size={11} />
                  </a>
                )}
              </div>
            </article>
          ))
        ) : (
          <div className="training-entry placeholder-entry">
            <span className="credential-date">To be added</span>
            <div className="credential-copy">
              <h4>Workshops &amp; continued learning</h4>
              <p>Training details will be added here.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
