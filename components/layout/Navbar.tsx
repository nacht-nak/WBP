"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Menu, Moon, Sun, X, ArrowUpRight } from "lucide-react";
const links = [
  { label: "Projects", id: "projects" },
  { label: "Experience", id: "experience" },
  { label: "Certificates", id: "certifications" },
  { label: "Contact", id: "contact" },
];
export function Navbar() {
  const pathname = usePathname();
  const [active, setActive] = useState("");
  const [open, setOpen] = useState(false);
  const [dark, setDark] = useState(true);
  const menuButton = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    setDark(document.documentElement.dataset.theme === "dark");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: "-15% 0px -55% 0px", threshold: 0 },
    );
    links.forEach(({ id }) => {
      const section = document.getElementById(id);
      if (section) observer.observe(section);
    });
    return () => observer.disconnect();
  }, [pathname]);
  useEffect(() => {
    const escape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        setOpen(false);
        menuButton.current?.focus();
      }
    };
    window.addEventListener("keydown", escape);
    return () => window.removeEventListener("keydown", escape);
  }, [open]);
  function toggleTheme() {
    const next = !dark;
    setDark(next);
    document.documentElement.dataset.theme = next ? "dark" : "light";
    try {
      localStorage.setItem("portfolio-theme", next ? "dark" : "light");
    } catch {}
  }
  return (
    <header className="site-header">
      <div className="nav-inner">
        <Link
          href="/"
          aria-label="Welquim Panogaling"
          className="monogram"
          onClick={() => setOpen(false)}
        >
          WBP
        </Link>
        <div className="nav-right">
          <nav aria-label="Main navigation" className="desktop-nav">
            {links
              .filter(({ id }) => id !== "contact")
              .map(({ label, id }) => (
                <Link
                  key={label}
                  className={
                    (pathname === "/" && active === id) ||
                    (id === "projects" && pathname.startsWith("/projects")) ||
                    (id === "certifications" && pathname === "/certifications")
                      ? "active"
                      : ""
                  }
                  href={`/#${id}`}
                >
                  {label}
                </Link>
              ))}
          </nav>
          <span className="nav-divider" />
          <button
            className="icon-button"
            onClick={toggleTheme}
            aria-label={`Switch to ${dark ? "light" : "dark"} theme`}
          >
            {dark ? <Moon size={17} /> : <Sun size={17} />}
          </button>
          <button
            ref={menuButton}
            className="icon-button mobile-toggle"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-navigation"
            onClick={() => setOpen(!open)}
          >
            {open ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>
      </div>
      {open && (
        <nav
          className="mobile-nav"
          id="mobile-navigation"
          aria-label="Mobile navigation"
        >
          {links.map(({ label, id }) => (
            <Link
              key={label}
              href={`/#${id}`}
              onClick={() => setOpen(false)}
            >
              {label}
              <ArrowUpRight size={16} />
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
