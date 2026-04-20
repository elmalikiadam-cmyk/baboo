// Baboo logo — recreated as SVG from brief
// B + a + b + o + o, with the two o's topped by panda-ear dots.
// Single color — inherits currentColor.

function BabooLogo({ height = 28, color = 'currentColor', style = {} }) {
  return (
    <svg
      viewBox="0 0 500 220"
      height={height}
      style={{ display: 'block', color, ...style }}
      fill="currentColor"
    >
      {/* B */}
      <path d="M20 30 h56 a54 54 0 0 1 40 90 a54 54 0 0 1 -40 90 h-56 z
               M56 66 v38 h20 a19 19 0 0 0 0 -38 z
               M56 140 v38 h20 a19 19 0 0 0 0 -38 z" fillRule="evenodd"/>
      {/* a */}
      <circle cx="180" cy="156" r="54" />
      <circle cx="180" cy="156" r="22" fill="#fff" className="logo-hole-a" />
      <rect x="216" y="108" width="18" height="102" />
      {/* b */}
      <rect x="252" y="10" width="36" height="200" />
      <circle cx="306" cy="156" r="54" />
      <circle cx="306" cy="156" r="22" fill="#fff" className="logo-hole-b" />
      {/* o with ear (left) */}
      <circle cx="380" cy="156" r="54" />
      <circle cx="380" cy="156" r="22" fill="#fff" className="logo-hole-o1" />
      <path d="M343 108 a22 22 0 0 1 30 -18 l-14 30 z" />
      {/* o with ear (right) */}
      <circle cx="454" cy="156" r="54" />
      <circle cx="454" cy="156" r="22" fill="#fff" className="logo-hole-o2" />
      <path d="M491 108 a22 22 0 0 0 -30 -18 l14 30 z" />
    </svg>
  );
}

// Version miniature (icône app) — juste les deux "oo" avec oreilles
function BabooMark({ size = 40, color = 'currentColor', style = {} }) {
  return (
    <svg viewBox="0 0 160 100" width={size} style={{ display: 'block', color, ...style }} fill="currentColor">
      <circle cx="44" cy="60" r="36" />
      <circle cx="44" cy="60" r="14" fill="#fff" />
      <path d="M20 30 a14 14 0 0 1 18 -10 l-8 18 z" />
      <circle cx="116" cy="60" r="36" />
      <circle cx="116" cy="60" r="14" fill="#fff" />
      <path d="M140 30 a14 14 0 0 0 -18 -10 l8 18 z" />
    </svg>
  );
}

Object.assign(window, { BabooLogo, BabooMark });
