// Variation 1 — Éditorial magazine
// Gros titre de rubrique, 1 héro full-bleed + 2-col grid d'annonces

const data1 = [
  { label: 'HERO · RIAD MÉDINA', price: '4 200 000', unit: 'MAD', type: 'VENTE',
    location: 'Marrakech · Médina', meta: '3 CH · 220 M² · PATIO',
    tag: 'COUP DE CŒUR', tall: true },
  { label: 'APPARTEMENT', price: '9 500', unit: 'MAD/MOIS', type: 'LOCATION',
    location: 'Casablanca · Maârif', meta: '2 CH · 85 M²' },
  { label: 'VILLA · PISCINE', price: '12 800 000', unit: 'MAD', type: 'VENTE',
    location: 'Rabat · Souissi', meta: '5 CH · 480 M² · JARDIN' },
  { label: 'DUPLEX', price: '2 750 000', unit: 'MAD', type: 'VENTE',
    location: 'Tanger · Malabata', meta: '3 CH · 140 M² · VUE MER' },
  { label: 'STUDIO NEUF', price: '6 200', unit: 'MAD/MOIS', type: 'LOCATION',
    location: 'Casablanca · Gauthier', meta: '1 CH · 42 M²' },
];

function FeedEditorial({ dark = false }) {
  const bg = dark ? 'var(--bb-ink)' : 'var(--bb-paper)';
  const fg = dark ? 'var(--bb-paper)' : 'var(--bb-ink)';
  const line = dark ? 'rgba(242,239,232,0.2)' : 'rgba(10,10,10,0.12)';

  return (
    <div className="bb-root" style={{
      minHeight: '100%', background: bg, color: fg,
      paddingTop: 54, paddingBottom: 90,
    }}>
      {/* Header */}
      <div style={{
        padding: '14px 18px 10px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <BabooLogo height={22} color={fg} />
        <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
          <IconBell color={fg} />
          <IconUser color={fg} />
        </div>
      </div>

      {/* Masthead éditorial */}
      <div style={{ padding: '10px 18px 14px', borderBottom: `1px solid ${line}` }}>
        <div className="bb-eyebrow" style={{ color: fg, opacity: 0.6 }}>
          № 04 — AVRIL 2026 · MAROC
        </div>
        <div className="bb-display" style={{
          fontSize: 56, marginTop: 6, letterSpacing: '-0.04em', fontWeight: 900,
          lineHeight: 0.9,
        }}>
          À VENDRE,<br/>À LOUER.
        </div>
        <div className="bb-mono" style={{
          fontSize: 11, marginTop: 10, opacity: 0.7,
        }}>
          2 847 annonces vérifiées aujourd'hui
        </div>
      </div>

      {/* Chips filtres */}
      <div style={{
        display: 'flex', gap: 8, padding: '14px 18px',
        overflowX: 'auto',
      }}>
        {['TOUT', 'VENTE', 'LOCATION', 'NEUF', 'MEUBLÉ', 'PATIO'].map((c, i) => (
          <div key={c} style={{
            padding: '8px 14px',
            border: `1px solid ${i === 0 ? fg : line}`,
            background: i === 0 ? fg : 'transparent',
            color: i === 0 ? bg : fg,
            fontFamily: 'var(--bb-font-display)',
            fontWeight: 700, fontSize: 13, letterSpacing: '0.04em',
            whiteSpace: 'nowrap',
          }}>{c}</div>
        ))}
      </div>

      {/* HERO full-bleed */}
      <HeroCard item={data1[0]} dark={dark} />

      {/* Rubrique — À LA UNE */}
      <div style={{
        padding: '26px 18px 10px',
        borderTop: `1px solid ${line}`,
        marginTop: 8,
        display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
      }}>
        <div className="bb-display" style={{ fontSize: 32, fontWeight: 800 }}>
          SÉLECTION
        </div>
        <div className="bb-mono" style={{ fontSize: 10, opacity: 0.6 }}>VOIR 128 →</div>
      </div>

      {/* Grid 2 col */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1,
        background: line, border: `1px solid ${line}`,
        borderLeft: 0, borderRight: 0,
      }}>
        {data1.slice(1).map((it, i) => (
          <GridCard key={i} item={it} dark={dark} bg={bg} fg={fg} />
        ))}
      </div>

      {/* Footer rubrique */}
      <div style={{
        padding: '22px 18px', display: 'flex',
        justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div className="bb-mono" style={{ fontSize: 10, opacity: 0.6 }}>
          ↓ DÉFILER POUR LA SUITE
        </div>
        <div className="bb-mono" style={{ fontSize: 10, opacity: 0.6 }}>P. 01/12</div>
      </div>
    </div>
  );
}

function HeroCard({ item, dark }) {
  return (
    <div style={{ margin: '4px 0 0', position: 'relative' }}>
      <div
        className={`bb-photo-placeholder ${dark ? 'dark' : ''}`}
        data-label={item.label}
        style={{ height: 360, width: '100%' }}
      >
        <div style={{
          position: 'absolute', top: 12, left: 12,
          padding: '4px 8px',
          background: dark ? 'var(--bb-paper)' : 'var(--bb-ink)',
          color: dark ? 'var(--bb-ink)' : 'var(--bb-paper)',
          fontFamily: 'var(--bb-font-mono)', fontSize: 9,
          letterSpacing: '0.14em',
        }}>◉ {item.tag}</div>
      </div>
      <div style={{ padding: '14px 18px 0' }}>
        <div className="bb-eyebrow" style={{ opacity: 0.6 }}>
          {item.type} · {item.location}
        </div>
        <div className="bb-display" style={{
          fontSize: 52, marginTop: 2, fontWeight: 900, letterSpacing: '-0.035em',
        }}>
          {item.price} <span style={{ fontSize: 18, fontWeight: 600, opacity: 0.6 }}>{item.unit}</span>
        </div>
        <div className="bb-mono" style={{
          fontSize: 11, marginTop: 6, opacity: 0.75,
        }}>
          {item.meta}
        </div>
      </div>
    </div>
  );
}

function GridCard({ item, dark, bg, fg }) {
  return (
    <div style={{ background: bg, padding: 0 }}>
      <div
        className={`bb-photo-placeholder ${dark ? 'dark' : ''}`}
        data-label={item.label}
        style={{ height: 140, width: '100%' }}
      />
      <div style={{ padding: '10px 12px 14px' }}>
        <div className="bb-mono" style={{ fontSize: 9, opacity: 0.6, letterSpacing: '0.1em' }}>
          {item.type}
        </div>
        <div className="bb-display" style={{
          fontSize: 26, fontWeight: 800, letterSpacing: '-0.03em', marginTop: 2,
        }}>
          {item.price}
        </div>
        <div className="bb-mono" style={{ fontSize: 9, opacity: 0.55, marginTop: 2 }}>
          {item.unit}
        </div>
        <div style={{
          marginTop: 8, paddingTop: 8,
          borderTop: `1px solid ${dark ? 'rgba(242,239,232,0.15)' : 'rgba(10,10,10,0.1)'}`,
          fontFamily: 'var(--bb-font-display)',
          fontWeight: 600, fontSize: 13, letterSpacing: '-0.01em',
          lineHeight: 1.15,
        }}>
          {item.location}
        </div>
        <div className="bb-mono" style={{ fontSize: 9, opacity: 0.5, marginTop: 4 }}>
          {item.meta}
        </div>
      </div>
    </div>
  );
}

// Icônes minimales (traits seulement)
function IconBell({ color = '#000' }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6">
      <path d="M6 8a6 6 0 0112 0c0 7 3 9 3 9H3s3-2 3-9z"/>
      <path d="M10 21a2 2 0 004 0"/>
    </svg>
  );
}
function IconUser({ color = '#000' }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6">
      <circle cx="12" cy="8" r="4"/>
      <path d="M4 21c0-4 4-7 8-7s8 3 8 7"/>
    </svg>
  );
}
function IconSearch({ color = '#000' }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6">
      <circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>
    </svg>
  );
}
function IconMap({ color = '#000' }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6">
      <path d="M9 3L3 5v16l6-2 6 2 6-2V3l-6 2-6-2z"/><path d="M9 3v16M15 5v16"/>
    </svg>
  );
}
function IconHeart({ color = '#000' }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6">
      <path d="M12 21s-8-4.5-8-11a5 5 0 018-4 5 5 0 018 4c0 6.5-8 11-8 11z"/>
    </svg>
  );
}
function IconPlus({ color = '#000' }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8">
      <path d="M12 5v14M5 12h14"/>
    </svg>
  );
}

Object.assign(window, {
  FeedEditorial, HeroCard, GridCard,
  IconBell, IconUser, IconSearch, IconMap, IconHeart, IconPlus,
});
