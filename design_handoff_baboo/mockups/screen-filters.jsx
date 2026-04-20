// Écran Filtres — sliders brutalistes, chips, bouton sticky
function ScreenFilters({ dark = false }) {
  const bg = dark ? 'var(--bb-ink)' : 'var(--bb-paper)';
  const fg = dark ? 'var(--bb-paper)' : 'var(--bb-ink)';
  const line = dark ? 'rgba(242,239,232,0.25)' : 'rgba(10,10,10,0.15)';
  const [type, setType] = React.useState('VENTE');
  const [villes, setVilles] = React.useState(['CASABLANCA', 'RABAT']);
  const [prix, setPrix] = React.useState([500000, 5000000]);
  const [rooms, setRooms] = React.useState('3+');

  const toggleVille = (v) => {
    setVilles(villes.includes(v) ? villes.filter(x => x !== v) : [...villes, v]);
  };

  return (
    <div className="bb-root" style={{
      minHeight: '100%', background: bg, color: fg, position: 'relative',
    }}>
      {/* Header */}
      <div style={{
        paddingTop: 54, paddingLeft: 16, paddingRight: 16, paddingBottom: 14,
        borderBottom: `2px solid ${fg}`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
          <div style={{
            width: 36, height: 36, border: `1.5px solid ${fg}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--bb-font-display)', fontWeight: 800, fontSize: 20,
          }}>×</div>
          <div className="bb-display" style={{
            fontSize: 18, fontWeight: 800, letterSpacing: '0.08em',
          }}>FILTRES</div>
          <div className="bb-mono" style={{ fontSize: 10, opacity: 0.6, letterSpacing: '0.1em' }}>RÉINIT.</div>
        </div>
      </div>

      <div style={{ padding: '0 16px 120px' }}>
        {/* Transaction */}
        <Section title="TRANSACTION" num="01" fg={fg}>
          <div style={{ display: 'flex', border: `1.5px solid ${fg}` }}>
            {['VENTE', 'LOCATION', 'TOUT'].map((t, i) => (
              <div key={t}
                onClick={() => setType(t)}
                style={{
                  flex: 1, textAlign: 'center', padding: '12px 0',
                  background: type === t ? fg : 'transparent',
                  color: type === t ? bg : fg,
                  borderRight: i < 2 ? `1px solid ${fg}` : 'none',
                  fontFamily: 'var(--bb-font-display)',
                  fontWeight: 800, fontSize: 13, letterSpacing: '0.06em',
                  cursor: 'pointer',
                }}>{t}</div>
            ))}
          </div>
        </Section>

        {/* Villes */}
        <Section title="VILLES" num="02" fg={fg} count={`${villes.length} SÉL.`}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {['CASABLANCA', 'RABAT', 'MARRAKECH', 'TANGER', 'FÈS',
              'AGADIR', 'OUJDA', 'TÉTOUAN', 'ESSAOUIRA'].map(v => {
              const actif = villes.includes(v);
              return (
                <div key={v}
                  onClick={() => toggleVille(v)}
                  style={{
                    padding: '6px 12px',
                    border: `1.5px solid ${fg}`,
                    background: actif ? fg : 'transparent',
                    color: actif ? bg : fg,
                    fontFamily: 'var(--bb-font-display)',
                    fontWeight: 700, fontSize: 13, letterSpacing: '0.04em',
                    cursor: 'pointer',
                  }}>{v}</div>
              );
            })}
          </div>
        </Section>

        {/* Prix */}
        <Section title="PRIX" num="03" fg={fg}
          count={`${(prix[0]/1000).toFixed(0)}K — ${(prix[1]/1000000).toFixed(1)}M MAD`}>
          <div style={{
            display: 'flex', gap: 10, marginBottom: 14,
          }}>
            <MiniField label="MIN" value={`${(prix[0]/1000).toFixed(0)} K`} fg={fg} />
            <MiniField label="MAX" value={`${(prix[1]/1000000).toFixed(1)} M`} fg={fg} />
          </div>
          {/* Slider visual */}
          <div style={{
            height: 36, position: 'relative', marginBottom: 6,
          }}>
            <div style={{
              position: 'absolute', left: 0, right: 0, top: 16, height: 2,
              background: line,
            }} />
            <div style={{
              position: 'absolute', left: '5%', right: '35%', top: 16, height: 2,
              background: fg,
            }} />
            <div style={{
              position: 'absolute', left: '5%', top: 10, width: 14, height: 14,
              background: fg, transform: 'translateX(-50%)',
            }} />
            <div style={{
              position: 'absolute', left: '65%', top: 10, width: 14, height: 14,
              background: fg, transform: 'translateX(-50%)',
            }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between',
            fontFamily: 'var(--bb-font-mono)', fontSize: 9, opacity: 0.55,
            letterSpacing: '0.06em' }}>
            <span>0</span><span>10M</span>
          </div>
        </Section>

        {/* Pièces */}
        <Section title="PIÈCES" num="04" fg={fg}>
          <div style={{ display: 'flex', gap: 0, border: `1.5px solid ${fg}` }}>
            {['1', '2', '3+', '4+', '5+'].map((r, i) => (
              <div key={r}
                onClick={() => setRooms(r)}
                style={{
                  flex: 1, padding: '10px 0', textAlign: 'center',
                  background: rooms === r ? fg : 'transparent',
                  color: rooms === r ? bg : fg,
                  borderRight: i < 4 ? `1px solid ${fg}` : 'none',
                  fontFamily: 'var(--bb-font-display)',
                  fontWeight: 800, fontSize: 15,
                  cursor: 'pointer',
                }}>{r}</div>
            ))}
          </div>
        </Section>

        {/* Surface */}
        <Section title="SURFACE" num="05" fg={fg} count="50 — 500 M²">
          <div style={{ display: 'flex', gap: 10 }}>
            <MiniField label="MIN" value="50 M²" fg={fg} />
            <MiniField label="MAX" value="500 M²" fg={fg} />
          </div>
        </Section>

        {/* Équipements */}
        <Section title="ÉQUIPEMENTS" num="06" fg={fg}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {['PISCINE', 'JARDIN', 'TERRASSE', 'PARKING', 'ASCENSEUR',
              'MEUBLÉ', 'NEUF', 'CLIMATISATION', 'PATIO'].map(e => (
              <div key={e} style={{
                padding: '5px 10px', border: `1px solid ${line}`,
                fontFamily: 'var(--bb-font-mono)', fontSize: 9,
                letterSpacing: '0.08em',
              }}>+ {e}</div>
            ))}
          </div>
        </Section>
      </div>

      {/* CTA sticky */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        background: bg, borderTop: `2px solid ${fg}`,
        padding: '12px 14px 34px',
        display: 'flex', gap: 10,
      }}>
        <div style={{
          flex: 1, padding: '14px 16px',
          background: fg, color: bg,
          fontFamily: 'var(--bb-font-display)', fontWeight: 800,
          fontSize: 14, letterSpacing: '0.08em', textAlign: 'center',
        }}>VOIR 128 RÉSULTATS →</div>
      </div>
    </div>
  );
}

function Section({ title, num, count, children, fg }) {
  return (
    <div style={{ paddingTop: 22, paddingBottom: 4 }}>
      <div style={{
        display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
        marginBottom: 10,
      }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'baseline' }}>
          <span className="bb-mono" style={{ fontSize: 9, opacity: 0.55, letterSpacing: '0.1em' }}>
            {num}
          </span>
          <span className="bb-display" style={{
            fontSize: 22, fontWeight: 800, letterSpacing: '0.04em',
          }}>{title}</span>
        </div>
        {count && (
          <span className="bb-mono" style={{ fontSize: 9, opacity: 0.6, letterSpacing: '0.08em' }}>
            {count}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

function MiniField({ label, value, fg }) {
  return (
    <div style={{
      flex: 1, padding: '8px 10px 10px', border: `1.5px solid ${fg}`,
    }}>
      <div className="bb-mono" style={{ fontSize: 8, opacity: 0.55, letterSpacing: '0.1em' }}>
        {label}
      </div>
      <div className="bb-display" style={{
        fontSize: 18, fontWeight: 800, letterSpacing: '-0.01em', marginTop: 2,
      }}>{value}</div>
    </div>
  );
}

Object.assign(window, { ScreenFilters, Section, MiniField });
