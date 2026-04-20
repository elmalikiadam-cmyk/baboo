// Variation 3 — Hero cinématographique + stories + feed card
// Swipe immersif en haut, carousel horizontal de "quartiers", puis cards pleine largeur

const data3 = [
  { label: 'VILLA SOUISSI', price: '12 800 000', unit: 'MAD', type: 'VENTE',
    loc: 'Rabat · Souissi', rooms: '5 CH', area: '480 M²', extras: 'PISCINE · JARDIN',
    page: 1 },
  { label: 'RIAD MÉDINA', price: '4 200 000', unit: 'MAD', type: 'VENTE',
    loc: 'Marrakech · Médina', rooms: '3 CH', area: '220 M²', extras: 'PATIO · TERRASSE',
    page: 2 },
  { label: 'APPT. MAÂRIF', price: '9 500', unit: 'MAD/MOIS', type: 'LOCATION',
    loc: 'Casablanca · Maârif', rooms: '2 CH', area: '85 M²', extras: 'MEUBLÉ',
    page: 3 },
];

const quartiers = [
  { name: 'CASA', sub: 'CASABLANCA', count: 1240 },
  { name: 'RBT', sub: 'RABAT', count: 612 },
  { name: 'MRK', sub: 'MARRAKECH', count: 487 },
  { name: 'TNG', sub: 'TANGER', count: 298 },
  { name: 'FES', sub: 'FÈS', count: 210 },
];

const feedCards = [
  { label: 'DUPLEX MALABATA', price: '2 750 000', unit: 'MAD', type: 'VENTE',
    loc: 'Tanger · Malabata', rooms: '3 CH', area: '140 M²', extras: 'VUE MER' },
  { label: 'STUDIO GAUTHIER', price: '6 200', unit: 'MAD/MOIS', type: 'LOCATION',
    loc: 'Casablanca · Gauthier', rooms: '1 CH', area: '42 M²', extras: 'NEUF' },
];

function FeedHero({ dark = false }) {
  const bg = dark ? 'var(--bb-ink)' : 'var(--bb-paper)';
  const fg = dark ? 'var(--bb-paper)' : 'var(--bb-ink)';
  const line = dark ? 'rgba(242,239,232,0.2)' : 'rgba(10,10,10,0.15)';
  const [active, setActive] = React.useState(0);

  return (
    <div className="bb-root" style={{
      minHeight: '100%', background: bg, color: fg,
      paddingTop: 54, paddingBottom: 90,
    }}>
      {/* Header overlay */}
      <div style={{
        padding: '14px 18px 10px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'absolute', top: 54, left: 0, right: 0, zIndex: 5,
      }}>
        <BabooLogo height={22} color="#fff" />
        <div style={{
          padding: '5px 10px',
          background: 'rgba(255,255,255,0.95)',
          color: 'var(--bb-ink)',
          fontFamily: 'var(--bb-font-mono)', fontSize: 9,
          letterSpacing: '0.1em',
        }}>◉ LIVE · 2847</div>
      </div>

      {/* HERO plein écran */}
      <div style={{ position: 'relative', marginTop: 0 }}>
        <div
          className="bb-photo-placeholder dark"
          data-label={data3[active].label}
          style={{ height: 540, width: '100%' }}
        />
        {/* Gradient overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to top, rgba(10,10,10,0.85) 0%, rgba(10,10,10,0) 55%)',
          pointerEvents: 'none',
        }} />

        {/* Indicateurs page en haut */}
        <div style={{
          position: 'absolute', top: 100, left: 18, right: 18,
          display: 'flex', gap: 4,
        }}>
          {data3.map((_, i) => (
            <div key={i} style={{
              flex: 1, height: 2,
              background: i === active ? '#fff' : 'rgba(255,255,255,0.35)',
            }} />
          ))}
        </div>

        {/* Contenu en bas du hero */}
        <div style={{
          position: 'absolute', bottom: 22, left: 18, right: 18, color: '#fff',
        }}>
          <div className="bb-eyebrow" style={{ opacity: 0.7 }}>
            {data3[active].type} · {data3[active].loc}
          </div>
          <div className="bb-display" style={{
            fontSize: 48, fontWeight: 900, letterSpacing: '-0.04em',
            lineHeight: 0.95, marginTop: 4, whiteSpace: 'nowrap',
          }}>
            {data3[active].price}
            <span style={{
              fontSize: 16, fontWeight: 600, letterSpacing: 0,
              opacity: 0.7, marginLeft: 8,
            }}>{data3[active].unit}</span>
          </div>
          <div className="bb-mono" style={{
            fontSize: 11, opacity: 0.85, marginTop: 10,
            letterSpacing: '0.08em',
          }}>
            {data3[active].rooms} · {data3[active].area} · {data3[active].extras}
          </div>
          <div style={{
            display: 'flex', gap: 8, marginTop: 18,
          }}>
            <div style={{
              padding: '12px 18px', background: '#fff', color: 'var(--bb-ink)',
              fontFamily: 'var(--bb-font-display)', fontWeight: 800, fontSize: 14,
              letterSpacing: '0.08em',
            }}>VOIR L'ANNONCE →</div>
            <div style={{
              width: 44, height: 44,
              border: '1px solid rgba(255,255,255,0.6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <IconHeart color="#fff" />
            </div>
          </div>
        </div>

        {/* Navigation swipe */}
        <div style={{
          position: 'absolute', top: '50%', left: 0, right: 0, display: 'flex',
          justifyContent: 'space-between', padding: '0 10px', pointerEvents: 'none',
        }}>
          <div
            onClick={() => setActive((active - 1 + data3.length) % data3.length)}
            style={{ pointerEvents: 'auto', padding: 16, color: 'rgba(255,255,255,0.7)',
                     fontFamily: 'var(--bb-font-display)', fontWeight: 800, fontSize: 28 }}
          >←</div>
          <div
            onClick={() => setActive((active + 1) % data3.length)}
            style={{ pointerEvents: 'auto', padding: 16, color: 'rgba(255,255,255,0.7)',
                     fontFamily: 'var(--bb-font-display)', fontWeight: 800, fontSize: 28 }}
          >→</div>
        </div>
      </div>

      {/* Rubrique QUARTIERS */}
      <div style={{ padding: '28px 0 16px' }}>
        <div style={{
          padding: '0 18px 18px',
          display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
        }}>
          <div className="bb-display" style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.02em' }}>
            EXPLORER LES VILLES
          </div>
          <div className="bb-mono" style={{ fontSize: 10, opacity: 0.55 }}>5 / 28</div>
        </div>
        <div style={{
          display: 'flex', gap: 8, overflowX: 'auto', padding: '0 18px',
        }}>
          {quartiers.map((q, i) => (
            <div key={q.name} style={{
              flex: '0 0 auto', width: 100, aspectRatio: '3/4',
              border: `1px solid ${fg}`,
              background: i === 0 ? fg : 'transparent',
              color: i === 0 ? bg : fg,
              padding: 10, position: 'relative',
              display: 'flex', flexDirection: 'column',
              justifyContent: 'space-between',
            }}>
              <div className="bb-mono" style={{ fontSize: 9, letterSpacing: '0.1em' }}>
                {String(i + 1).padStart(2, '0')}
              </div>
              <div>
                <div className="bb-display" style={{
                  fontSize: 34, fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 0.85,
                }}>{q.name}</div>
                <div className="bb-mono" style={{ fontSize: 8, opacity: 0.7, marginTop: 4,
                  letterSpacing: '0.08em' }}>
                  {q.count} ANN.
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Feed cards pleine largeur */}
      <div style={{
        padding: '18px 0 0',
        borderTop: `1px solid ${line}`,
        marginTop: 14,
      }}>
        <div style={{
          padding: '0 18px 14px',
          display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
        }}>
          <div className="bb-display" style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em' }}>
            NOUVEAUTÉS
          </div>
          <div className="bb-mono" style={{ fontSize: 10, opacity: 0.55 }}>↓ 24 NOUVELLES</div>
        </div>
        {feedCards.map((c, i) => (
          <WideCard key={i} item={c} dark={dark} bg={bg} fg={fg} line={line} />
        ))}
      </div>
    </div>
  );
}

function WideCard({ item, dark, bg, fg, line }) {
  return (
    <div style={{ borderTop: `1px solid ${line}` }}>
      <div
        className={`bb-photo-placeholder ${dark ? 'dark' : ''}`}
        data-label={item.label}
        style={{ height: 220, width: '100%' }}
      />
      <div style={{ padding: '14px 18px 20px' }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
        }}>
          <div className="bb-eyebrow" style={{ opacity: 0.6 }}>
            {item.type} · {item.loc}
          </div>
          <IconHeart color={fg} />
        </div>
        <div className="bb-display" style={{
          fontSize: 40, fontWeight: 900, letterSpacing: '-0.03em',
          lineHeight: 1, marginTop: 4,
        }}>
          {item.price} <span style={{ fontSize: 15, fontWeight: 600, opacity: 0.6 }}>{item.unit}</span>
        </div>
        <div className="bb-mono" style={{ fontSize: 10, opacity: 0.7, marginTop: 8, letterSpacing: '0.06em' }}>
          {item.rooms} · {item.area} · {item.extras}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { FeedHero, WideCard });
