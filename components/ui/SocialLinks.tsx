import { Github, Linkedin } from "@/components/ui/BrandIcons";
import { Mail } from "lucide-react";
import { profile } from "@/data/profile";
export function SocialLinks() {
  const links = [
    { label: "GitHub", Icon: Github, href: profile.github },
    { label: "LinkedIn", Icon: Linkedin, href: profile.linkedin },
    {
      label: "Email",
      Icon: Mail,
      href: profile.email ? `mailto:${profile.email}` : "",
    },
  ];
  return (
    <div className="social-links">
      {links.map(({ label, Icon, href }) =>
        href ? (
          <a
            key={label}
            href={href}
            aria-label={label}
            target={label !== "Email" ? "_blank" : undefined}
            rel="noopener noreferrer"
          >
            <Icon size={17} />
          </a>
        ) : (
          <span
            key={label}
            className="social-unavailable"
            tabIndex={0}
            aria-label={`${label} — details coming soon`}
            title={`${label} details coming soon`}
          >
            <Icon size={17} />
          </span>
        ),
      )}
    </div>
  );
}
