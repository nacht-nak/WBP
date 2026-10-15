"use client";
import Image from "next/image";
import { useState } from "react";
type Photo = { src: string; alt: string };
export function PhotoStack({ photos }: { photos: Photo[] }) {
  const [active, setActive] = useState(0);
  if (!photos.length) return null;
  return (
    <button
      className="photo-stack"
      type="button"
      aria-label="Show next photo"
      onClick={() => setActive((active + 1) % photos.length)}
    >
      {photos.map((photo, index) => (
        <span
          className="stack-photo"
          data-position={(index - active + photos.length) % photos.length}
          key={photo.src}
        >
          <Image
            src={photo.src}
            alt={index === active ? photo.alt : ""}
            fill
            sizes="(max-width: 650px) 180px, 210px"
          />
        </span>
      ))}
      <span className="sr-only" aria-live="polite">
        Photo {active + 1} of {photos.length}
      </span>
    </button>
  );
}
