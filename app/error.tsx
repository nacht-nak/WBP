"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main id="main-content" className="page-shell subpage empty-page">
      <h1>Something went wrong.</h1>
      <p>The page couldn’t load. Give it another try.</p>
      <button className="button button-dark" onClick={reset}>
        Try again
      </button>
    </main>
  );
}
