// Écran Détail annonce — style brutaliste typographique
// Galerie en haut, prix XXL, méta structurée en grille, agent, CTA sticky

function DetailAnnonce({ dark = false }) {
  const bg = dark ? 'var(--bb-ink)' : 'var(--bb-paper)';
  const fg = dark ? 'var(--bb-paper)' : 'var(--bb-ink)';
  const line = dark ? 'rgba(242,239,232,0.2)' : 'rgba(10,10,10,0.15)';
  const [photo, setPhoto] = React.useState(0);
  const photos = ['FAÇADE', 'SALON', 'PATIO', 'CUISINE', 'CHAMBRE'];

  return (
    <div className="bb-root" style={{
      minHeight: '100%', background: bg, color: fg, position: 'relative',
    }}>
      {/* Header overlay */}
      <div style={{
        position: 'absolute', top: 54, left: 0, right: 0, zIndex: 10,
        padding: '10px 16px', display: 'flex',
        justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div style={{
          width: 36, height: 36, background: 'rgba(242,239,232,0.95)',
          color: 'var(--bb-ink)', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--bb-font-display)', fontWeight: 800, fontSize: 20,
        }}>←</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{
            width: 36, height: 36, background: 'rgba(242,239,232,0.95)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}><IconHeart color="var(--bb-ink)" /></div>
          <div style={{
            width: 36, height: 36, background: 'rgba(242,239,232,0.95)',
            color: 'var(--bb-ink)', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--bb-font-display)', fontWeight: 800, fontSize: 18,
          }}>⇱</div>
        </div>
      </div>

      {/* Galerie */}
      <div style={{ position: 'relative' }}>
        <div
          className="bb-photo-placeholder dark"
          data-label={photos[photo]}
          style={{ height: 380, width: '100%' }}
        />
        {/* Indicateurs */}
        <div style={{
          position: 'absolute', top: 100, left: 16, right: 16,
          display: 'flex', gap: 4,
        }}>
          {photos.map((_, i) => (
            <div key={i}
              onClick={() => setPhoto(i)}
              style={{
                flex: 1, height: 2, cursor: 'pointer',
                background: i === photo ? '#fff' : 'rgba(255,255,255,0.35)',
              }} />
          ))}
        </div>
        {/* Compteur */}
        <div style={{
          position: 'absolute', bottom: 14, right: 14,
          padding: '4px 8px', background: 'rgba(10,10,10,0.8)',
          color: '#fff',
          fontFamily: 'var(--bb-font-mono)', fontSize: 10, letterSpacing: '0.1em',
        }}>{photo + 1} / {photos.length}</div>
      </div>

      {/* Corps */}
      <div style={{ padding: '18px 16px 140px' }}>
        {/* Ref + verif */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginBottom: 8,
        }}>
          <div className="bb-mono" style={{ fontSize: 10, opacity: 0.6, letterSpacing: '0.1em' }}>
            BB-4201 · PUBLIÉ IL Y A 3 JOURS
          </div>
          <div style={{
            padding: '2px 6px', border: `1px solid ${fg}`,
            fontFamily: 'var(--bb-font-mono)', fontSize: 9, letterSpacing: '0.1em',
          }}>✓ VÉRIFIÉ</div>
        </div>

        {/* Type + titre */}
        <div className="bb-eyebrow" style={{ opacity: 0.65 }}>VENTE · RIAD</div>
        <div className="bb-display" style={{
          fontSize: 44, fontWeight: 900, letterSpacing: '-0.03em',
          lineHeight: 0.9, marginTop: 4,
        }}>
          RIAD RÉNOVÉ<br/>AU CŒUR DE<br/>LA MÉDINA
        </div>
        <div className="bb-mono" style={{
          fontSize: 11, opacity: 0.7, marginTop: 10, letterSpacing: '0.06em',
        }}>
          ⌖ MARRAKECH — MÉDINA — DERB CHERKAOUI
        </div>

        {/* Prix */}
        <div style={{
          marginTop: 20, paddingTop: 16, paddingBottom: 16,
          borderTop: `2px solid ${fg}`, borderBottom: `2px solid ${fg}`,
          display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
        }}>
          <div>
            <div className="bb-display" style={{
              fontSize: 64, fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 0.9,
            }}>
              4 200 000
            </div>
            <div className="bb-mono" style={{ fontSize: 11, opacity: 0.65, marginTop: 4 }}>
              MAD · 17 500 /M²
            </div>
          </div>
          <div className="bb-mono" style={{
            fontSize: 9, opacity: 0.55, textAlign: 'right', letterSpacing: '0.08em',
          }}>
            PRIX NÉGOCIABLE<br/>FRAIS : ~5%
          </div>
        </div>

        {/* Grid méta */}
        <div style={{
          marginTop: 20,
          display: 'grid', gridTemplateColumns: '1fr 1fr',
          border: `1px solid ${line}`,
        }}>
          {[
            ['SURFACE', '220 M²'],
            ['CHAMBRES', '3'],
            ['SDB', '2'],
            ['ÉTAGES', 'R+2'],
            ['ANNÉE', '1920 / RÉNOVÉ 2023'],
            ['ÉTAT', 'EXCELLENT'],
          ].map(([k, v], i) => (
            <div key={k} style={{
              padding: '12px 14px',
              borderRight: i % 2 === 0 ? `1px solid ${line}` : 'none',
              borderBottom: i < 4 ? `1px solid ${line}` : 'none',
            }}>
              <div className="bb-mono" style={{ fontSize: 9, opacity: 0.6, letterSpacing: '0.1em' }}>{k}</div>
              <div className="bb-display" style={{
                fontSize: 20, fontWeight: 800, letterSpacing: '-0.01em', marginTop: 2,
              }}>{v}</div>
            </div>
          ))}
        </div>

        {/* Équipements */}
        <div style={{ marginTop: 24 }}>
          <div className="bb-display" style={{
            fontSize: 20, fontWeight: 800, letterSpacing: '0.04em', marginBottom: 10,
          }}>ÉQUIPEMENTS / 08</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {['PATIO', 'TERRASSE', 'CHEMINÉE', 'CLIMATISATION',
              'CUISINE ÉQUIPÉE', 'ZELLIGE', 'TADELAKT', 'WIFI'].map(e => (
              <div key={e} style={{
                padding: '5px 10px', border: `1px solid ${line}`,
                fontFamily: 'var(--bb-font-mono)', fontSize: 9,
                letterSpacing: '0.08em',
              }}>{e}</div>
            ))}
          </div>
        </div>

        {/* Description */}
        <div style={{ marginTop: 24 }}>
          <div className="bb-display" style={{
            fontSize: 20, fontWeight: 800, letterSpacing: '0.04em', marginBottom: 10,
          }}>DESCRIPTION</div>
          <div style={{
            fontFamily: 'var(--bb-font-display)', fontWeight: 500,
            fontSize: 17, lineHeight: 1.35, letterSpacing: '-0.005em',
          }}>
            Riad authentique entièrement rénové, préservant ses zelliges
            d'époque et son tadelakt. Trois chambres en suite autour
            d'un patio central avec fontaine. Terrasse panoramique
            sur les toits de la médina et l'Atlas.
          </div>
        </div>

        {/* Agent */}
        <div style={{
          marginTop: 24, padding: 14, border: `1.5px solid ${fg}`,
          display: 'flex', gap: 12, alignItems: 'center',
        }}>
          <div style={{
            width: 48, height: 48, background: fg, color: bg,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--bb-font-display)', fontWeight: 900, fontSize: 22,
          }}>KB</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="bb-display" style={{
              fontSize: 18, fontWeight: 800, letterSpacing: '-0.01em',
            }}>KARIM BENNIS</div>
            <div className="bb-mono" style={{ fontSize: 10, opacity: 0.65, letterSpacing: '0.06em' }}>
              AGENT · 142 ANNONCES · ★ 4.9
            </div>
          </div>
          <div style={{
            padding: '6px 10px', background: fg, color: bg,
            fontFamily: 'var(--bb-font-display)', fontWeight: 800,
            fontSize: 11, letterSpacing: '0.08em',
          }}>PROFIL →</div>
        </div>
      </div>

      {/* CTA sticky bottom */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        background: bg, borderTop: `2px solid ${fg}`,
        padding: '12px 14px 34px',
        display: 'flex', gap: 8, zIndex: 20,
      }}>
        <div style={{
          padding: '14px 16px', border: `2px solid ${fg}`,
          fontFamily: 'var(--bb-font-display)', fontWeight: 800,
          fontSize: 14, letterSpacing: '0.08em',
        }}>☎</div>
        <div style={{
          flex: 1, padding: '14px 16px',
          background: fg, color: bg,
          fontFamily: 'var(--bb-font-display)', fontWeight: 800,
          fontSize: 14, letterSpacing: '0.08em', textAlign: 'center',
        }}>CONTACTER L'AGENT →</div>
      </div>
    </div>
  );
}

Object.assign(window, { DetailAnnonce });
