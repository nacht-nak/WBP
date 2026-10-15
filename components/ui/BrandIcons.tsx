import type { SVGProps } from "react";
type IconProps = SVGProps<SVGSVGElement> & {
  size?: number;
  strokeWidth?: number;
};
export function Github({ size = 24, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path
        d="M9 19c-4.3 1.3-4.3-2.2-6-2.7M15 22v-3.9c.04-1.1-.4-1.9-1-2.3 3.4-.4 7-1.7 7-7.6A5.8 5.8 0 0 0 19.4 4c.2-.8.6-2-.2-3.4 0 0-1.3-.4-4.3 1.6a15 15 0 0 0-7.8 0C4.1.2 2.8.6 2.8.6 2 2 2.4 3.2 2.6 4A5.8 5.8 0 0 0 1 8.2c0 5.9 3.6 7.2 7 7.6-.6.4-1 1.2-1 2.3V22"
        transform="translate(1.3 1.5) scale(.88)"
      />
    </svg>
  );
}
export function Linkedin({ size = 24, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M7 10v7m5 0v-7m0 3a3 3 0 0 1 6 0v4" />
      <circle cx="7" cy="7" r=".6" fill="currentColor" />
    </svg>
  );
}
