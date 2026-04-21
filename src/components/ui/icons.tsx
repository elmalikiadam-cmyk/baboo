import * as React from "react";

type IconProps = React.SVGProps<SVGSVGElement>;

const svgProps = {
  width: 20,
  height: 20,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export const SearchIcon = (p: IconProps) => (
  <svg {...svgProps} {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </svg>
);

export const MapPinIcon = (p: IconProps) => (
  <svg {...svgProps} {...p}>
    <path d="M12 21s-7-6.5-7-12a7 7 0 1 1 14 0c0 5.5-7 12-7 12Z" />
    <circle cx="12" cy="9" r="2.5" />
  </svg>
);

export const BedIcon = (p: IconProps) => (
  <svg {...svgProps} {...p}>
    <path d="M3 18V7" />
    <path d="M3 13h18v5" />
    <path d="M21 13V9a2 2 0 0 0-2-2h-6v6" />
  </svg>
);

export const BathIcon = (p: IconProps) => (
  <svg {...svgProps} {...p}>
    <path d="M4 12h16v3a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4v-3Z" />
    <path d="M6 12V7a2 2 0 0 1 4 0" />
    <path d="M4 19l-1 2M20 19l1 2" />
  </svg>
);

export const RulerIcon = (p: IconProps) => (
  <svg {...svgProps} {...p}>
    <path d="M3 12 12 3l9 9-9 9-9-9Z" />
    <path d="m7.5 12 1.5 1.5M10.5 9l1.5 1.5M13.5 12l1.5 1.5M16.5 9l1.5 1.5" />
  </svg>
);

export const HeartIcon = (p: IconProps) => (
  <svg {...svgProps} {...p}>
    <path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 10-7 10Z" />
  </svg>
);

export const PhoneIcon = (p: IconProps) => (
  <svg {...svgProps} {...p}>
    <path d="M5 4h3l2 5-2 1a11 11 0 0 0 6 6l1-2 5 2v3a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z" />
  </svg>
);

export const WhatsAppIcon = (p: IconProps) => (
  <svg {...svgProps} {...p}>
    <path d="M3 21l1.6-4.6A8 8 0 1 1 8 20l-5 1Z" />
    <path d="M8.5 10.5c0 3 2 5 5 5 .6 0 .9-.2 1.1-.5l.6-.9c.2-.3.5-.4.8-.3l1.8.6c.3.1.5.4.4.8-.2 1.1-1.3 1.9-2.6 1.9-4 0-7.3-3.3-7.3-7.3 0-1.3.8-2.4 1.9-2.6.4-.1.7.1.8.4l.6 1.8c.1.3 0 .6-.3.8l-.9.6c-.3.2-.5.5-.5 1.1Z" />
  </svg>
);

export const ShareIcon = (p: IconProps) => (
  <svg {...svgProps} {...p}>
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <path d="m8.6 10.5 6.8-4M8.6 13.5l6.8 4" />
  </svg>
);

export const CheckIcon = (p: IconProps) => (
  <svg {...svgProps} {...p}>
    <path d="m5 12 5 5 10-10" />
  </svg>
);

export const PlusIcon = (p: IconProps) => (
  <svg {...svgProps} {...p}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);

export const ChevronRightIcon = (p: IconProps) => (
  <svg {...svgProps} {...p}>
    <path d="m9 6 6 6-6 6" />
  </svg>
);

export const CloseIcon = (p: IconProps) => (
  <svg {...svgProps} {...p}>
    <path d="m6 6 12 12M18 6 6 18" />
  </svg>
);

export const UserIcon = (p: IconProps) => (
  <svg {...svgProps} {...p}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21a8 8 0 0 1 16 0" />
  </svg>
);

export const BuildingIcon = (p: IconProps) => (
  <svg {...svgProps} {...p}>
    <path d="M4 21V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v16" />
    <path d="M4 21h16M9 9h0M9 13h0M9 17h0M15 9h0M15 13h0M15 17h0" />
  </svg>
);

// ─── Baboo logo ─────────────────────────────────────────────────────────
// Wordmark "baboo" en Barlow Condensed 800, avec deux petits points ronds
// au-dessus des deux "o" (oreilles de panda, hommage au nom).
// Hérite de currentColor, scale proprement à toute taille.

export const BabooLogo = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 200 62"
    className={className}
    aria-label="Baboo"
    role="img"
  >
    <g fill="currentColor">
      {/* Oreilles panda au-dessus des "oo" */}
      <circle cx="131" cy="13" r="5.5" />
      <circle cx="166" cy="13" r="5.5" />
      {/* Wordmark */}
      <text
        x="0"
        y="52"
        fontFamily="'Barlow Condensed', 'Bahnschrift', system-ui, sans-serif"
        fontWeight="800"
        fontSize="52"
        fontStretch="condensed"
        letterSpacing="-1.8"
      >
        baboo
      </text>
    </g>
  </svg>
);

export const BabooMark = ({ className }: { className?: string }) => (
  // Icône compacte — les deux "oo" avec oreilles. Pour favicons / avatars.
  <svg viewBox="0 0 96 64" className={className} aria-hidden>
    <g fill="currentColor">
      <circle cx="24" cy="10" r="6" />
      <circle cx="72" cy="10" r="6" />
      <circle cx="24" cy="42" r="20" />
      <circle cx="72" cy="42" r="20" />
      <circle cx="24" cy="42" r="8" fill="hsl(var(--background))" />
      <circle cx="72" cy="42" r="8" fill="hsl(var(--background))" />
    </g>
  </svg>
);
