// Écran Carte — pins prix custom + bottom sheet liste
function ScreenMap({ dark = false }) {
  const bg = dark ? 'var(--bb-ink)' : 'var(--bb-paper)';
  const fg = dark ? 'var(--bb-paper)' : 'var(--bb-ink)';
  const line = dark ? 'rgba(242,239,232,0.2)' : 'rgba(10,10,10,0.15)';
  const [selected, setSelected] = React.useState(2);

  // Pins avec position % et prix
  const pins = [
    { id: 1, x: 22, y: 22, price: '4.2M' },
    { id: 2, x: 48, y: 30, price: '2.7M' },
    { id: 3, x: 68, y: 18, price: '9.5K', loc: true },
    { id: 4, x: 34, y: 48, price: '12.8M' },
    { id: 5, x: 72, y: 52, price: '6.2K', loc: true },
    { id: 6, x: 18, y: 62, price: '1.8M' },
    { id: 7, x: 56, y: 70, price: '3.4M' },
  ];

  const listings = [
    { id: 2, price: '2 750 000', unit: 'MAD', title: 'DUPLEX', loc: 'Tanger · Malabata',
      meta: '3 CH · 140 M²', type: 'VENTE' },
    { id: 4, price: '12 800 000', unit: 'MAD', title: 'VILLA', loc: 'Rabat · Souissi',
      meta: '5 CH · 480 M²', type: 'VENTE' },
    { id: 1, price: '4 200 000', unit: 'MAD', title: 'RIAD', loc: 'Marrakech · Médina',
      meta: '3 CH · 220 M²', type: 'VENTE' },
  ];

  return (
    <div className="bb-root" style={{
      minHeight: '100%', height: '100%', background: bg, color: fg,
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Map background — grille monochrome */}
      <div style={{
        position: 'absolute', inset: 0,
        background: dark ? 'var(--bb-ink)' : '#ebe8e0',
        backgroundImage: dark
          ? 'linear-gradient(rgba(242,239,232,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(242,239,232,0.05) 1px, transparent 1px)'
          : 'linear-gradient(rgba(10,10,10,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(10,10,10,0.06) 1px, transparent 1px)',
        backgroundSize: '32px 32px',
      }} />
      {/* "Routes" */}
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
           viewBox="0 0 400 870" preserveAspectRatio="none">
        <path d="M0 120 Q200 140 400 100" stroke={dark ? 'rgba(242,239,232,0.1)' : 'rgba(10,10,10,0.1)'}
              strokeWidth="3" fill="none"/>
        <path d="M80 0 Q120 400 60 870" stroke={dark ? 'rgba(242,239,232,0.08)' : 'rgba(10,10,10,0.08)'}
              strokeWidth="2" fill="none"/>
        <path d="M0 450 Q200 480 400 430" stroke={dark ? 'rgba(242,239,232,0.08)' : 'rgba(10,10,10,0.08)'}
              strokeWidth="2" fill="none"/>
        <path d="M280 0 Q340 400 300 870" stroke={dark ? 'rgba(242,239,232,0.08)' : 'rgba(10,10,10,0.08)'}
              strokeWidth="2" fill="none"/>
      </svg>

      {/* Header flottant */}
      <div style={{
        position: 'absolute', top: 54, left: 0, right: 0, zIndex: 15,
        padding: '8px 16px',
      }}>
        <div style={{
          background: bg, border: `1.5px solid ${fg}`,
          padding: '8px 10px',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <IconSearch color={fg} />
          <div className="bb-display" style={{
            flex: 1, fontSize: 15, fontWeight: 700, letterSpacing: '-0.01em',
          }}>Casablanca + 40 km</div>
          <div style={{
            padding: '3px 8px', background: fg, color: bg,
            fontFamily: 'var(--bb-font-mono)', fontSize: 9, letterSpacing: '0.1em',
          }}>128</div>
        </div>
      </div>

      {/* Pins */}
      {pins.map(p => (
        <div key={p.id}
          onClick={() => setSelected(p.id)}
          style={{
            position: 'absolute',
            left: `${p.x}%`, top: `${p.y}%`,
            transform: 'translate(-50%, -100%)',
            zIndex: selected === p.id ? 12 : 10,
            cursor: 'pointer',
          }}>
          <div style={{
            padding: '5px 9px',
            background: selected === p.id ? fg : bg,
            color: selected === p.id ? bg : fg,
            border: `1.5px solid ${fg}`,
            fontFamily: 'var(--bb-font-display)',
            fontWeight: 800, fontSize: 13, letterSpacing: '-0.01em',
            whiteSpace: 'nowrap',
            boxShadow: selected === p.id ? '0 4px 10px rgba(0,0,0,0.3)' : '0 2px 4px rgba(0,0,0,0.15)',
          }}>
            {p.price}
          </div>
          <div style={{
            width: 8, height: 8,
            background: selected === p.id ? fg : bg,
            border: `1.5px solid ${fg}`,
            margin: '0 auto', marginTop: -4,
            transform: 'rotate(45deg)',
          }} />
        </div>
      ))}

      {/* Ctrls carte */}
      <div style={{
        position: 'absolute', right: 16, top: 120, zIndex: 15,
        display: 'flex', flexDirection: 'column', gap: 0,
        border: `1.5px solid ${fg}`, background: bg,
      }}>
        {['+', '−', '⌖'].map((s, i) => (
          <div key={i} style={{
            width: 36, height: 36,
            borderBottom: i < 2 ? `1px solid ${fg}` : 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--bb-font-display)', fontWeight: 800, fontSize: 18,
          }}>{s}</div>
        ))}
      </div>

      {/* Toggle liste/carte */}
      <div style={{
        position: 'absolute', top: 120, left: 16, zIndex: 15,
        border: `1.5px solid ${fg}`, background: bg,
        display: 'flex',
      }}>
        <div style={{
          padding: '8px 12px', background: fg, color: bg,
          fontFamily: 'var(--bb-font-display)', fontWeight: 800,
          fontSize: 11, letterSpacing: '0.08em',
        }}>CARTE</div>
        <div style={{
          padding: '8px 12px',
          fontFamily: 'var(--bb-font-display)', fontWeight: 800,
          fontSize: 11, letterSpacing: '0.08em',
        }}>LISTE</div>
      </div>

      {/* Bottom sheet */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        background: bg, borderTop: `2px solid ${fg}`,
        paddingBottom: 30, zIndex: 20,
      }}>
        {/* Handle */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '6px 0' }}>
          <div style={{ width: 40, height: 3, background: fg, opacity: 0.4 }} />
        </div>
        {/* Titre */}
        <div style={{
          padding: '6px 16px 12px',
          display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
          borderBottom: `1px solid ${line}`,
        }}>
          <div className="bb-display" style={{
            fontSize: 22, fontWeight: 900, letterSpacing: '-0.02em',
          }}>128 ANNONCES</div>
          <div className="bb-mono" style={{ fontSize: 9, opacity: 0.55, letterSpacing: '0.08em' }}>
            TRI : PRIX ↓
          </div>
        </div>
        {/* Carousel horizontal */}
        <div style={{
          display: 'flex', gap: 0, overflowX: 'auto',
          padding: '12px 16px 10px',
        }}>
          {listings.map(l => (
            <div key={l.id} style={{
              flex: '0 0 220px',
              marginRight: 10,
              border: `1.5px solid ${fg}`,
              padding: 10,
              background: selected === l.id ? (dark ? 'rgba(242,239,232,0.05)' : 'rgba(10,10,10,0.03)') : 'transparent',
            }}>
              <div style={{ display: 'flex', gap: 10 }}>
                <div className={`bb-photo-placeholder ${dark ? 'dark' : ''}`}
                  data-label=""
                  style={{ width: 54, height: 54, flexShrink: 0 }}/>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div className="bb-mono" style={{ fontSize: 8, opacity: 0.55, letterSpacing: '0.08em' }}>
                    {l.type}
                  </div>
                  <div className="bb-display" style={{
                    fontSize: 22, fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 0.9, marginTop: 2,
                  }}>{l.price}</div>
                  <div className="bb-mono" style={{ fontSize: 8, opacity: 0.55, marginTop: 2 }}>
                    {l.unit}
                  </div>
                </div>
              </div>
              <div style={{
                marginTop: 8, paddingTop: 8, borderTop: `1px solid ${line}`,
                fontFamily: 'var(--bb-font-display)', fontWeight: 700, fontSize: 13,
                letterSpacing: '-0.01em',
              }}>
                {l.title} — {l.loc}
              </div>
              <div className="bb-mono" style={{ fontSize: 8, opacity: 0.55, marginTop: 4, letterSpacing: '0.06em' }}>
                {l.meta}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { ScreenMap });
