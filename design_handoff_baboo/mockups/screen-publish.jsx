// Publier une annonce — formulaire multi-étapes brutaliste
function ScreenPublish({ dark = false }) {
  const bg = dark ? 'var(--bb-ink)' : 'var(--bb-paper)';
  const fg = dark ? 'var(--bb-paper)' : 'var(--bb-ink)';
  const line = dark ? 'rgba(242,239,232,0.2)' : 'rgba(10,10,10,0.15)';
  const [step] = React.useState(2);
  const steps = ['TYPE', 'ADRESSE', 'DÉTAILS', 'PHOTOS', 'PRIX'];

  return (
    <div className="bb-root" style={{ minHeight:'100%', background:bg, color:fg, position:'relative' }}>
      <div style={{ paddingTop:54, padding:'54px 16px 14px', borderBottom:`2px solid ${fg}` }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:8 }}>
          <div style={{ width:36, height:36, border:`1.5px solid ${fg}`, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'var(--bb-font-display)', fontWeight:800, fontSize:20 }}>←</div>
          <div className="bb-display" style={{ fontSize:18, fontWeight:800, letterSpacing:'0.08em' }}>PUBLIER</div>
          <div className="bb-mono" style={{ fontSize:10, opacity:0.6, letterSpacing:'0.1em' }}>ÉTAPE {step+1}/5</div>
        </div>
        {/* Progress */}
        <div style={{ display:'flex', gap:4, marginTop:14 }}>
          {steps.map((s,i) => (
            <div key={s} style={{ flex:1 }}>
              <div style={{ height:3, background: i <= step ? fg : line }} />
              <div className="bb-mono" style={{ fontSize:8, opacity: i===step?1:0.4, marginTop:4, letterSpacing:'0.08em' }}>{s}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding:'22px 16px 130px' }}>
        <div className="bb-eyebrow" style={{ opacity:0.6 }}>ÉTAPE 03 — DÉTAILS</div>
        <div className="bb-display" style={{ fontSize:42, fontWeight:900, letterSpacing:'-0.03em', lineHeight:0.9, marginTop:4 }}>
          PARLE-NOUS<br/>DU BIEN.
        </div>

        <div style={{ marginTop:22 }}>
          <FieldLabel fg={fg}>TITRE DE L'ANNONCE</FieldLabel>
          <div style={{ borderBottom:`2px solid ${fg}`, padding:'10px 0' }}>
            <div className="bb-display" style={{ fontSize:24, fontWeight:700, letterSpacing:'-0.01em' }}>
              Riad rénové médina<span style={{ opacity:0.3 }}>_</span>
            </div>
          </div>
          <div className="bb-mono" style={{ fontSize:9, opacity:0.5, marginTop:4, letterSpacing:'0.08em' }}>
            24 / 60 CARACTÈRES
          </div>
        </div>

        <div style={{ marginTop:22, display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
          <MiniField label="SURFACE" value="220 M²" fg={fg} />
          <MiniField label="TERRAIN" value="— M²" fg={fg} />
        </div>

        <div style={{ marginTop:14, display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10 }}>
          <MiniField label="CHAMBRES" value="3" fg={fg} />
          <MiniField label="SDB" value="2" fg={fg} />
          <MiniField label="ÉTAGES" value="R+2" fg={fg} />
        </div>

        <div style={{ marginTop:24 }}>
          <FieldLabel fg={fg}>ÉQUIPEMENTS · 4 SÉLECTIONNÉS</FieldLabel>
          <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
            {[['PATIO',1],['TERRASSE',1],['ZELLIGE',1],['TADELAKT',1],['PISCINE',0],['JARDIN',0],['PARKING',0],['WIFI',0],['CLIM',0]].map(([e,a]) => (
              <div key={e} style={{
                padding:'5px 10px',
                border:`1.5px solid ${fg}`,
                background: a ? fg : 'transparent',
                color: a ? bg : fg,
                fontFamily:'var(--bb-font-mono)', fontSize:9, letterSpacing:'0.08em',
              }}>{a ? '✓ ' : '+ '}{e}</div>
            ))}
          </div>
        </div>

        <div style={{ marginTop:24 }}>
          <FieldLabel fg={fg}>DESCRIPTION</FieldLabel>
          <div style={{ border:`1.5px solid ${fg}`, padding:12, minHeight:100 }}>
            <div style={{ fontFamily:'var(--bb-font-display)', fontWeight:500, fontSize:15, lineHeight:1.4 }}>
              Riad authentique, rénové avec soin<span style={{ opacity:0.3 }}>_</span>
            </div>
          </div>
          <div className="bb-mono" style={{ fontSize:9, opacity:0.5, marginTop:4, letterSpacing:'0.08em' }}>
            32 / 1000 CARACTÈRES
          </div>
        </div>
      </div>

      <div style={{ position:'absolute', bottom:0, left:0, right:0, background:bg, borderTop:`2px solid ${fg}`, padding:'12px 14px 34px', display:'flex', gap:10 }}>
        <div style={{ padding:'14px 16px', border:`2px solid ${fg}`, fontFamily:'var(--bb-font-display)', fontWeight:800, fontSize:13, letterSpacing:'0.08em' }}>← PRÉC.</div>
        <div style={{ flex:1, padding:'14px 16px', background:fg, color:bg, fontFamily:'var(--bb-font-display)', fontWeight:800, fontSize:14, letterSpacing:'0.08em', textAlign:'center' }}>SUIVANT →</div>
      </div>
    </div>
  );
}

function FieldLabel({ children, fg }) {
  return (
    <div className="bb-mono" style={{ fontSize:9, opacity:0.65, letterSpacing:'0.12em', marginBottom:6 }}>
      {children}
    </div>
  );
}

Object.assign(window, { ScreenPublish, FieldLabel });
