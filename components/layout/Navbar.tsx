"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Menu, Moon, Sun, X, ArrowUpRight } from "lucide-react";
const links = ["Projects", "Experience", "Highlights", "Contact"];
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
    links.forEach((label) => {
      const section = document.getElementById(label.toLowerCase());
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
              .filter((label) => label !== "Contact")
              .map((label) => (
                <Link
                  key={label}
                  className={
                    (pathname === "/" && active === label.toLowerCase()) ||
                    (label === "Projects" && pathname.startsWith("/projects"))
                      ? "active"
                      : ""
                  }
                  href={`/#${label.toLowerCase()}`}
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
          {links.map((label) => (
            <Link
              key={label}
              href={`/#${label.toLowerCase()}`}
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
