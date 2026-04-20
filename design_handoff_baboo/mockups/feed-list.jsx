// Variation 2 — Liste dense typographique (brutaliste)
// Pas d'images en tête de liste, la TYPO est la star. Photo en petit module à droite.

const data2 = [
  { ref: 'BB-4201', type: 'VENTE', price: '4 200 000', unit: 'MAD',
    title: 'RIAD', loc: 'MARRAKECH — MÉDINA', rooms: '3 CH', area: '220 M²',
    extras: ['PATIO', 'TERRASSE'], verif: true },
  { ref: 'BB-0951', type: 'LOCATION', price: '9 500', unit: 'MAD/MOIS',
    title: 'APPT.', loc: 'CASABLANCA — MAÂRIF', rooms: '2 CH', area: '85 M²',
    extras: ['MEUBLÉ', 'ASCENSEUR'], verif: true },
  { ref: 'BB-1280', type: 'VENTE', price: '12 800 000', unit: 'MAD',
    title: 'VILLA', loc: 'RABAT — SOUISSI', rooms: '5 CH', area: '480 M²',
    extras: ['PISCINE', 'JARDIN', 'GARAGE'], verif: true, premium: true },
  { ref: 'BB-2750', type: 'VENTE', price: '2 750 000', unit: 'MAD',
    title: 'DUPLEX', loc: 'TANGER — MALABATA', rooms: '3 CH', area: '140 M²',
    extras: ['VUE MER'], verif: true },
  { ref: 'BB-0620', type: 'LOCATION', price: '6 200', unit: 'MAD/MOIS',
    title: 'STUDIO', loc: 'CASABLANCA — GAUTHIER', rooms: '1 CH', area: '42 M²',
    extras: ['NEUF'], verif: false },
  { ref: 'BB-1850', type: 'VENTE', price: '1 850 000', unit: 'MAD',
    title: 'APPT.', loc: 'FÈS — SAÏSS', rooms: '3 CH', area: '110 M²',
    extras: ['PARKING'], verif: true },
];

function FeedList({ dark = false }) {
  const bg = dark ? 'var(--bb-ink)' : 'var(--bb-paper)';
  const fg = dark ? 'var(--bb-paper)' : 'var(--bb-ink)';
  const line = dark ? 'rgba(242,239,232,0.2)' : 'rgba(10,10,10,0.15)';

  return (
    <div className="bb-root" style={{
      minHeight: '100%', background: bg, color: fg,
      paddingTop: 54, paddingBottom: 90,
    }}>
      {/* Header */}
      <div style={{
        padding: '14px 18px 10px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: `1px solid ${line}`,
      }}>
        <BabooLogo height={22} color={fg} />
        <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
          <div className="bb-mono" style={{ fontSize: 10, opacity: 0.6 }}>FR · MAD</div>
          <IconBell color={fg} />
        </div>
      </div>

      {/* Recherche brutaliste */}
      <div style={{
        padding: '18px 18px 12px',
        borderBottom: `1px solid ${line}`,
      }}>
        <div className="bb-eyebrow" style={{ opacity: 0.55 }}>RECHERCHE / 2847 ANNONCES</div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          marginTop: 10, paddingBottom: 10,
          borderBottom: `2px solid ${fg}`,
        }}>
          <IconSearch color={fg} />
          <div className="bb-display" style={{
            fontSize: 34, fontWeight: 700, letterSpacing: '-0.02em', flex: 1,
          }}>
            Casablanca<span style={{ opacity: 0.3 }}>_</span>
          </div>
          <div className="bb-mono" style={{ fontSize: 10, opacity: 0.55 }}>×</div>
        </div>
        <div style={{
          display: 'flex', gap: 0, marginTop: 12,
          border: `1px solid ${fg}`,
        }}>
          {['VENTE', 'LOCATION', 'TOUT'].map((t, i) => (
            <div key={t} style={{
              flex: 1, textAlign: 'center',
              padding: '10px 0',
              background: i === 2 ? fg : 'transparent',
              color: i === 2 ? bg : fg,
              borderRight: i < 2 ? `1px solid ${fg}` : 'none',
              fontFamily: 'var(--bb-font-display)',
              fontWeight: 800, fontSize: 13, letterSpacing: '0.06em',
            }}>{t}</div>
          ))}
        </div>
      </div>

      {/* En-tête résultats */}
      <div style={{
        padding: '16px 18px 8px',
        display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
      }}>
        <div className="bb-display" style={{
          fontSize: 18, fontWeight: 800, letterSpacing: '0.04em',
        }}>
          RÉSULTATS / 128
        </div>
        <div className="bb-mono" style={{ fontSize: 10, opacity: 0.55 }}>
          TRI : RÉCENT ↓
        </div>
      </div>

      {/* Liste */}
      <div style={{ borderTop: `1px solid ${line}` }}>
        {data2.map((it, i) => (
          <ListRow key={it.ref} item={it} dark={dark} bg={bg} fg={fg} line={line} idx={i + 1} />
        ))}
      </div>
    </div>
  );
}

function ListRow({ item, dark, bg, fg, line, idx }) {
  return (
    <div style={{
      padding: '16px 18px',
      borderBottom: `1px solid ${line}`,
      background: item.premium ? (dark ? 'rgba(242,239,232,0.03)' : 'rgba(10,10,10,0.02)') : 'transparent',
      position: 'relative',
    }}>
      {/* Ligne top : ref + verif */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: 6,
      }}>
        <div className="bb-mono" style={{ fontSize: 10, opacity: 0.55, letterSpacing: '0.06em' }}>
          {String(idx).padStart(2, '0')} · {item.ref}
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          {item.premium && (
            <div style={{
              padding: '2px 6px',
              background: fg, color: bg,
              fontFamily: 'var(--bb-font-mono)', fontSize: 9,
              letterSpacing: '0.1em',
            }}>PREMIUM</div>
          )}
          {item.verif && (
            <div style={{
              padding: '2px 6px',
              border: `1px solid ${fg}`,
              fontFamily: 'var(--bb-font-mono)', fontSize: 9,
              letterSpacing: '0.1em',
            }}>✓ VÉRIFIÉ</div>
          )}
        </div>
      </div>

      {/* Contenu principal */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="bb-eyebrow" style={{ opacity: 0.6 }}>
            {item.type}
          </div>
          <div className="bb-display" style={{
            fontSize: 42, fontWeight: 900, letterSpacing: '-0.03em', marginTop: -2,
            lineHeight: 0.95,
          }}>
            {item.price}
          </div>
          <div className="bb-mono" style={{ fontSize: 10, opacity: 0.6, marginTop: 2 }}>
            {item.unit}
          </div>
          <div className="bb-display" style={{
            fontSize: 20, fontWeight: 700, marginTop: 10, letterSpacing: '0.02em',
          }}>
            {item.title} <span style={{ opacity: 0.5, fontWeight: 500 }}>—</span> {item.loc}
          </div>
        </div>

        <div
          className={`bb-photo-placeholder ${dark ? 'dark' : ''}`}
          data-label={item.title}
          style={{ width: 96, height: 96, flexShrink: 0 }}
        />
      </div>

      {/* Meta chips */}
      <div style={{
        display: 'flex', gap: 6, marginTop: 12, flexWrap: 'wrap',
      }}>
        {[item.rooms, item.area, ...item.extras].map((tag) => (
          <div key={tag} style={{
            padding: '3px 8px',
            border: `1px solid ${line}`,
            fontFamily: 'var(--bb-font-mono)', fontSize: 9,
            letterSpacing: '0.08em',
            opacity: 0.85,
          }}>{tag}</div>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { FeedList, ListRow });
