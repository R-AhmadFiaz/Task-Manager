/** Minimal inline icons for the Downloads page — no icon library dependency. */

const sharedProps = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  className: "h-6 w-6",
};

export function BrowserIcon() {
  return (
    <svg {...sharedProps} aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <path d="M12 3c2.5 2.5 4 5.5 4 9s-1.5 6.5-4 9c-2.5-2.5-4-5.5-4-9s1.5-6.5 4-9Z" />
    </svg>
  );
}

export function DesktopIcon() {
  return (
    <svg {...sharedProps} aria-hidden="true">
      <rect x="3" y="4" width="18" height="12" rx="1.5" />
      <path d="M8 20h8" />
      <path d="M12 16v4" />
    </svg>
  );
}

export function AndroidIcon() {
  return (
    <svg {...sharedProps} aria-hidden="true">
      <rect x="6" y="2.5" width="12" height="19" rx="2" />
      <path d="M6 6h12" />
      <path d="M6 17h12" />
      <path d="M11 19.25h2" />
    </svg>
  );
}

export function PuzzleIcon() {
  return (
    <svg {...sharedProps} aria-hidden="true">
      <path d="M9 4h4a1 1 0 0 1 1 1v2.2a1.6 1.6 0 0 0 2.6 1.24 1.6 1.6 0 0 1 2.6 1.26v.1a1.6 1.6 0 0 1-2.6 1.26A1.6 1.6 0 0 0 14 12.2V15a1 1 0 0 1-1 1h-2.8a1.6 1.6 0 0 0-1.24 2.6 1.6 1.6 0 0 1-1.26 2.6h-.1a1.6 1.6 0 0 1-1.26-2.6A1.6 1.6 0 0 0 5.2 16H4a1 1 0 0 1-1-1v-4a1 1 0 0 1 1-1h2.2a1.6 1.6 0 0 0 1.24-2.6A1.6 1.6 0 0 1 8.7 5.14V5a1 1 0 0 1 .3-1Z" />
    </svg>
  );
}
