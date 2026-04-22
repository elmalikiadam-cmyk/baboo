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

export const ChevronLeftIcon = (p: IconProps) => (
  <svg {...svgProps} {...p}>
    <path d="m15 6-6 6 6 6" />
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

// ─── V2 "Maison ouverte" : icônes supplémentaires ───────────────────────

export const HomeIcon = (p: IconProps) => (
  <svg {...svgProps} {...p}>
    <path d="M3 11 12 4l9 7v10H3z" />
    <path d="M9 21v-7h6v7" />
  </svg>
);

export const BookmarkIcon = (p: IconProps) => (
  <svg {...svgProps} {...p}>
    <path d="M6 4h12v17l-6-4-6 4V4z" />
  </svg>
);

export const MessageCircleIcon = (p: IconProps) => (
  <svg {...svgProps} {...p}>
    <path d="M21 12a8 8 0 0 1-11.6 7.15L3 21l1.85-6.4A8 8 0 1 1 21 12Z" />
  </svg>
);

export const SlidersIcon = (p: IconProps) => (
  <svg {...svgProps} {...p}>
    <path d="M3 6h10" />
    <path d="M17 6h4" />
    <path d="M3 18h4" />
    <path d="M11 18h10" />
    <path d="M3 12h6" />
    <path d="M13 12h8" />
    <circle cx="15" cy="6" r="2" />
    <circle cx="9" cy="18" r="2" />
    <circle cx="11" cy="12" r="2" />
  </svg>
);

export const Maximize2Icon = (p: IconProps) => (
  <svg {...svgProps} {...p}>
    <path d="m3 21 7-7M14 10l7-7M21 14v7h-7M10 3H3v7" />
  </svg>
);

export const CalendarIcon = (p: IconProps) => (
  <svg {...svgProps} {...p}>
    <rect x="3" y="5" width="18" height="16" rx="2" />
    <path d="M3 10h18M8 3v4M16 3v4" />
  </svg>
);

export const ShieldCheckIcon = (p: IconProps) => (
  <svg {...svgProps} {...p}>
    <path d="M12 3 4 6v6c0 4.5 3.3 8.6 8 10 4.7-1.4 8-5.5 8-10V6l-8-3z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

export const ArrowRightIcon = (p: IconProps) => (
  <svg {...svgProps} {...p}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

// Alias V2 (noms "lucide-like", sans suffixe "Icon") pour les composants
// portés depuis baboo_v2/. Permet d'écrire `import { Search } from ...`.
export {
  SearchIcon as Search,
  MapPinIcon as MapPin,
  BedIcon as Bed,
  BathIcon as Bath,
  Maximize2Icon as Maximize2,
  HeartIcon as Heart,
  PhoneIcon as Phone,
  ShareIcon as Share2,
  CheckIcon as Check,
  PlusIcon as Plus,
  ChevronRightIcon as ChevronRight,
  ChevronLeftIcon as ChevronLeft,
  CloseIcon as X,
  UserIcon as User,
  BuildingIcon as Building2,
  HomeIcon as Home,
  BookmarkIcon as Bookmark,
  MessageCircleIcon as MessageCircle,
  SlidersIcon as SlidersHorizontal,
  CalendarIcon as Calendar,
  ShieldCheckIcon as ShieldCheck,
  ArrowRightIcon as ArrowRight,
};
