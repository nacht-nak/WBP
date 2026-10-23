"use client";

import { Mascot } from "page-mascot";

export function ProfileMascot() {
  return (
    <Mascot
      directions="/mascots/welquim-portrait-directions.webp"
      reactions="/mascots/welquim-portrait-reactions.webp"
      size={160}
      label="Welquim avatar"
      className="profile-mascot"
    />
  );
}
