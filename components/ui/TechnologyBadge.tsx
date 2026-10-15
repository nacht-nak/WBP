import { Github } from "@/components/ui/BrandIcons";
import {
  Atom,
  Braces,
  Code2,
  Database,
  GitBranch,
  Hexagon,
  Layers,
  Terminal,
  Triangle,
  Wind,
} from "lucide-react";
import type { CSSProperties } from "react";

const icons = {
  React: Atom,
  "Next.js": Triangle,
  TypeScript: Braces,
  JavaScript: Braces,
  "Tailwind CSS": Wind,
  Laravel: Layers,
  PHP: Code2,
  Django: Code2,
  "Node.js": Hexagon,
  MySQL: Database,
  PostgreSQL: Database,
  Git: GitBranch,
  GitHub: Github,
  "VS Code": Terminal,
  Vercel: Triangle,
  "Full-stack": Code2,
  "Management system": Database,
};
const colors: Record<string, string> = {
  React: "#20b8dc",
  "Next.js": "var(--foreground)",
  TypeScript: "#3178c6",
  JavaScript: "#c9a900",
  "Tailwind CSS": "#06b6d4",
  Laravel: "#f34c46",
  PHP: "#8b8fbf",
  Django: "#359970",
  "Node.js": "#76a94a",
  MySQL: "#3688a8",
  PostgreSQL: "#5080ad",
  Git: "#ef654a",
  GitHub: "var(--foreground)",
  "VS Code": "#28a5e9",
  Vercel: "var(--foreground)",
};
export function TechnologyIcon({
  name,
  size = 16,
}: {
  name: string;
  size?: number;
}) {
  const Icon = icons[name as keyof typeof icons] || Code2;
  return (
    <span
      className="technology-icon"
      style={
        {
          "--technology-color": colors[name] || "var(--muted)",
        } as CSSProperties
      }
      aria-hidden="true"
    >
      {name === "TypeScript" || name === "JavaScript" ? (
        <span
          className="technology-lettermark"
          style={{ width: size, height: size }}
        >
          {name === "TypeScript" ? "TS" : "JS"}
        </span>
      ) : (
        <Icon size={size} strokeWidth={1.8} />
      )}
    </span>
  );
}
export function TechnologyBadge({ name }: { name: string }) {
  return (
    <span className="technology-badge" title={name}>
      <TechnologyIcon name={name} />
      {name}
    </span>
  );
}
