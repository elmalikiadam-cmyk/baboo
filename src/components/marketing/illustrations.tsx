// Simple geometric line-art illustrations for marketing cards.
// Thin strokes, single-color (currentColor), no characters, no mascots.
// Sized to sit at the bottom of a card.

type IllusProps = { className?: string };

const svgBase = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.25,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

// Search — magnifier over a small grid of 3x3 squares
export function SearchIllus({ className }: IllusProps) {
  return (
    <svg viewBox="0 0 180 120" className={className} {...svgBase}>
      <g opacity="0.6">
        {[0, 1, 2].map((r) =>
          [0, 1, 2].map((c) => (
            <rect key={`${r}-${c}`} x={14 + c * 30} y={14 + r * 30} width="22" height="22" rx="2" />
          )),
        )}
      </g>
      <circle cx="116" cy="64" r="32" strokeWidth="2" />
      <path d="m141 89 21 21" strokeWidth="2" />
      {/* pin inside the lens */}
      <path d="M116 50a9 9 0 0 1 9 9c0 7-9 15-9 15s-9-8-9-15a9 9 0 0 1 9-9Z" />
      <circle cx="116" cy="59" r="2.5" fill="currentColor" />
    </svg>
  );
}

// Heart — bookmark / saved
export function HeartIllus({ className }: IllusProps) {
  return (
    <svg viewBox="0 0 180 120" className={className} {...svgBase}>
      {/* soft stack of 3 cards */}
      <rect x="22" y="30" width="90" height="60" rx="6" opacity="0.4" />
      <rect x="34" y="22" width="90" height="60" rx="6" opacity="0.6" />
      <rect x="46" y="14" width="90" height="60" rx="6" />
      {/* heart floating */}
      <path
        d="M140 56c0-6 5-11 11-11 4 0 7 2 9 5 2-3 5-5 9-5 6 0 11 5 11 11 0 10-11 17-20 24-9-7-20-14-20-24Z"
        strokeWidth="1.8"
      />
    </svg>
  );
}

// Phone + speech bubble — direct contact
export function ContactIllus({ className }: IllusProps) {
  return (
    <svg viewBox="0 0 180 120" className={className} {...svgBase}>
      {/* phone frame */}
      <rect x="26" y="16" width="56" height="92" rx="10" strokeWidth="1.8" />
      <circle cx="54" cy="98" r="3" fill="currentColor" />
      <path d="M38 28h32" opacity="0.35" />
      <path d="M38 36h32" opacity="0.35" />
      <path d="M38 44h22" opacity="0.35" />
      {/* speech bubble */}
      <path
        d="M96 30h60c4 0 8 4 8 8v28c0 4-4 8-8 8h-36l-14 10v-10h-10c-4 0-8-4-8-8V38c0-4 4-8 8-8Z"
        strokeWidth="1.8"
      />
      <path d="M108 48h36M108 58h28" opacity="0.55" />
    </svg>
  );
}

// Individual — single user outline, handshake implied by simple overlap
export function IndividualIllus({ className }: IllusProps) {
  return (
    <svg viewBox="0 0 180 120" className={className} {...svgBase}>
      {/* house */}
      <path d="M12 68 60 30l48 38v36H12Z" strokeWidth="1.6" />
      <path d="M48 104V76h24v28" />
      {/* tag */}
      <rect x="116" y="34" width="52" height="32" rx="4" strokeWidth="1.6" />
      <circle cx="128" cy="50" r="3" fill="currentColor" />
      <path d="M138 46h22M138 54h18" opacity="0.55" />
      <path d="m116 50-12 8 12 8" opacity="0.5" />
    </svg>
  );
}

// Professional — cluster of 3 buildings + small badge
export function BusinessIllus({ className }: IllusProps) {
  return (
    <svg viewBox="0 0 180 120" className={className} {...svgBase}>
      {/* buildings */}
      <rect x="16" y="34" width="40" height="72" strokeWidth="1.6" />
      <rect x="62" y="18" width="48" height="88" strokeWidth="1.6" />
      <rect x="116" y="46" width="44" height="60" strokeWidth="1.6" />
      {/* windows */}
      {[0, 1, 2].map((r) => (
        <g key={r} opacity="0.5">
          <rect x="22" y={42 + r * 18} width="10" height="8" />
          <rect x="40" y={42 + r * 18} width="10" height="8" />
          <rect x="68" y={28 + r * 22} width="10" height="8" />
          <rect x="86" y={28 + r * 22} width="10" height="8" />
          <rect x="124" y={54 + r * 16} width="10" height="8" />
          <rect x="144" y={54 + r * 16} width="10" height="8" />
        </g>
      ))}
      {/* checkmark badge */}
      <circle cx="150" cy="28" r="14" strokeWidth="1.8" fill="currentColor" opacity="0.1" />
      <circle cx="150" cy="28" r="14" strokeWidth="1.8" />
      <path d="m144 28 4 4 8-8" strokeWidth="2" />
    </svg>
  );
}
