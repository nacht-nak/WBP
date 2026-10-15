import type { Metadata } from "next";
import localFont from "next/font/local";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ContactChat } from "@/components/ui/ContactChat";
import "./globals.css";
import "./profile.css";
import "./showcase.css";
import "./details.css";
import "./chat.css";
import "./inquiry.css";
const lato = localFont({
  src: [
    {
      path: "../public/fonts/lato-light.woff2",
      weight: "300",
      style: "normal",
    },
    {
      path: "../public/fonts/lato-regular.woff2",
      weight: "400",
      style: "normal",
    },
    { path: "../public/fonts/lato-bold.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-lato",
  display: "swap",
});
export const metadata: Metadata = {
  metadataBase: new URL(process.env.SITE_URL || "http://localhost:3000"),
  title: {
    default: "Welquim Panogaling — Full-Stack Developer",
    template: "%s | Welquim Panogaling",
  },
  description:
    "Full-stack web developer working with Laravel, React, Next.js and MySQL. Explore selected projects, development work and education by Welquim Panogaling.",
  openGraph: {
    title: "Welquim Panogaling — Full-Stack Developer",
    description:
      "Thoughtful interfaces. Solid foundations. Explore my work with Laravel, React, Next.js and MySQL.",
    type: "website",
    locale: "en_PH",
  },
  twitter: { card: "summary_large_image" },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      data-theme="dark"
      suppressHydrationWarning
      className={lato.variable}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('portfolio-theme');document.documentElement.dataset.theme=t==='light'?'light':'dark'}catch{}`,
          }}
        />
      </head>
      <body id="top">
        <a className="skip-link" href="#main-content">
          Skip to content
        </a>
        <Navbar />
        {children}
        <Footer />
        <ContactChat />
      </body>
    </html>
  );
}
