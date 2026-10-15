import Link from "next/link";
export default function NotFound() {
  return (
    <main id="main-content" className="page-shell subpage empty-page">
      <span className="eyebrow">404 / A SMALL DETOUR</span>
      <h1>This page isn’t here.</h1>
      <p>Let’s get you back to something useful.</p>
      <Link href="/" className="button button-dark">
        Back to portfolio
      </Link>
    </main>
  );
}
