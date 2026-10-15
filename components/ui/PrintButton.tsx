"use client";
import { Printer } from "lucide-react";
export function PrintButton() {
  return (
    <button
      className="button button-dark print-button"
      onClick={() => window.print()}
    >
      <Printer size={15} />
      Print / save as PDF
    </button>
  );
}
