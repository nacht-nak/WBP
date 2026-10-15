"use client";

import { Mascot } from "page-mascot";

export function ProfileMascot() {
  return (
    <Mascot
      directions="/mascots/welquim-directions.webp"
      reactions="/mascots/welquim-reactions.webp"
      size={160}
      label="Welquim avatar"
      className="profile-mascot"
    />
  );
}
