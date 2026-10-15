"use client";

import { useEffect, useState } from "react";

// Share the request across mounts, including React's development effect replay.
let visitRequest: Promise<number> | undefined;
function recordVisit() {
  visitRequest ??= fetch("/api/visits", {
    method: "POST",
    credentials: "same-origin",
    cache: "no-store",
    signal: AbortSignal.timeout(8000),
  }).then(async (response) => {
    if (!response.ok) throw new Error("Visit count unavailable");
    const { count } = await response.json();
    if (!Number.isSafeInteger(count) || count < 0)
      throw new Error("Invalid count");
    return count as number;
  });
  return visitRequest;
}

export function VisitorCount() {
  const [count, setCount] = useState<number | null>(null);
  const [unavailable, setUnavailable] = useState(false);
  useEffect(() => {
    let active = true;
    recordVisit().then(
      (value) => {
        if (active) setCount(value);
      },
      () => {
        if (active) setUnavailable(true);
      },
    );
    return () => {
      active = false;
    };
  }, []);
  return (
    <span
      className="footer-visits"
      role="status"
      title="Visits are counted once per browser every 24 hours."
    >
      {count !== null
        ? `Visited ${count.toLocaleString("en-US")} ${count === 1 ? "time" : "times"}`
        : unavailable
          ? "Visits unavailable"
          : "Counting visits…"}
    </span>
  );
}
