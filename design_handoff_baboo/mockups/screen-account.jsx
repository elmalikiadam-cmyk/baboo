// Profil utilisateur + Onboarding/Auth
function ScreenProfile({ dark = false }) {
  const bg = dark ? 'var(--bb-ink)' : 'var(--bb-paper)';
  const fg = dark ? 'var(--bb-paper)' : 'var(--bb-ink)';
  const line = dark ? 'rgba(242,239,232,0.2)' : 'rgba(10,10,10,0.15)';

  return (
    <div className="bb-root" style={{ minHeight:'100%', background:bg, color:fg, paddingTop:54, paddingBottom:90 }}>
      <div style={{ padding:'14px 16px 0', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <BabooLogo height={20} color={fg} />
        <div style={{ width:28, height:28, border:`1.5px solid ${fg}`, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'var(--bb-font-display)', fontWeight:800, fontSize:14 }}>⚙</div>
      </div>

      <div style={{ padding:'18px 16px 20px', borderBottom:`2px solid ${fg}` }}>
        <div style={{ display:'flex', gap:14, alignItems:'center' }}>
          <div style={{ width:64, height:64, background:fg, color:bg, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'var(--bb-font-display)', fontWeight:900, fontSize:28 }}>YA</div>
          <div>
            <div className="bb-eyebrow" style={{ opacity:0.6 }}>PARTICULIER · DEPUIS 2024</div>
            <div className="bb-display" style={{ fontSize:36, fontWeight:900, letterSpacing:'-0.03em', lineHeight:0.9, marginTop:2 }}>
              YASMINE A.
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', borderBottom:`1.5px solid ${fg}` }}>
        {[['FAVORIS','12'],['RECHERCHES','4'],['CONTACTS','7']].map(([k,v],i) => (
          <div key={k} style={{ padding:'16px 10px', textAlign:'center', borderRight: i<2?`1px solid ${fg}`:'none' }}>
            <div className="bb-display" style={{ fontSize:32, fontWeight:900, letterSpacing:'-0.03em' }}>{v}</div>
            <div className="bb-mono" style={{ fontSize:9, opacity:0.6, letterSpacing:'0.1em', marginTop:2 }}>{k}</div>
          </div>
        ))}
      </div>

      {/* Menu */}
      {[
        ['01','MES ANNONCES','2 publiées'],
        ['02','MES FAVORIS','12 biens'],
        ['03','MES RECHERCHES','4 alertes actives'],
        ['04','MESSAGES','3 non lus'],
        ['05','DOCUMENTS','Passeport · Justif.'],
        ['06','PARAMÈTRES','FR · Notifications'],
        ['07','AIDE & CONTACT',''],
      ].map(([n,label,sub]) => (
        <div key={n} style={{ padding:'16px', borderBottom:`1px solid ${line}`, display:'flex', alignItems:'center', gap:12 }}>
          <div className="bb-mono" style={{ fontSize:10, opacity:0.55, letterSpacing:'0.1em', width:20 }}>{n}</div>
          <div style={{ flex:1 }}>
            <div className="bb-display" style={{ fontSize:18, fontWeight:800, letterSpacing:'-0.01em' }}>{label}</div>
            {sub && <div className="bb-mono" style={{ fontSize:9, opacity:0.6, marginTop:2, letterSpacing:'0.06em' }}>{sub}</div>}
          </div>
          <div className="bb-display" style={{ fontSize:20, fontWeight:800 }}>→</div>
        </div>
      ))}

      <div style={{ padding:'24px 16px' }}>
        <div style={{ padding:'14px', border:`1.5px solid ${fg}`, textAlign:'center', fontFamily:'var(--bb-font-display)', fontWeight:800, fontSize:13, letterSpacing:'0.08em' }}>
          DÉCONNEXION
        </div>
      </div>
    </div>
  );
}

// Splash / Onboarding
function ScreenOnboarding({ dark = false }) {
  const bg = dark ? 'var(--bb-ink)' : 'var(--bb-paper)';
  const fg = dark ? 'var(--bb-paper)' : 'var(--bb-ink)';
  return (
    <div className="bb-root" style={{ minHeight:'100%', background:bg, color:fg, paddingTop:54, position:'relative', display:'flex', flexDirection:'column' }}>
      <div style={{ padding:'30px 20px 20px', display:'flex', justifyContent:'space-between' }}>
        <BabooLogo height={28} color={fg} />
        <div className="bb-mono" style={{ fontSize:10, opacity:0.6, letterSpacing:'0.1em' }}>PASSER →</div>
      </div>

      <div style={{ flex:1, padding:'0 20px', display:'flex', flexDirection:'column', justifyContent:'center' }}>
        <div className="bb-eyebrow" style={{ opacity:0.6 }}>N° 01 · BIENVENUE</div>
        <div className="bb-display" style={{ fontSize:88, fontWeight:900, letterSpacing:'-0.045em', lineHeight:0.85, marginTop:6 }}>
          L'IMMOBILIER<br/>MAROCAIN.<br/>SANS FILTRE.
        </div>
        <div style={{ fontFamily:'var(--bb-font-display)', fontWeight:500, fontSize:17, lineHeight:1.35, marginTop:22, maxWidth:300 }}>
          2 847 annonces vérifiées. Agents notés. Prix au m² transparents. Zéro spam.
        </div>
      </div>

      {/* Indicateurs */}
      <div style={{ padding:'0 20px 14px', display:'flex', gap:4 }}>
        <div style={{ flex:1, height:2, background:fg }}/>
        <div style={{ flex:1, height:2, background:fg, opacity:0.3 }}/>
        <div style={{ flex:1, height:2, background:fg, opacity:0.3 }}/>
      </div>

      <div style={{ padding:'14px 20px 34px', borderTop:`2px solid ${fg}`, display:'flex', gap:8 }}>
        <div style={{ padding:'14px 20px', border:`2px solid ${fg}`, fontFamily:'var(--bb-font-display)', fontWeight:800, fontSize:13, letterSpacing:'0.08em' }}>SE CONNECTER</div>
        <div style={{ flex:1, padding:'14px 16px', background:fg, color:bg, fontFamily:'var(--bb-font-display)', fontWeight:800, fontSize:14, letterSpacing:'0.08em', textAlign:'center' }}>COMMENCER →</div>
      </div>
    </div>
  );
}

// Login
function ScreenLogin({ dark = false }) {
  const bg = dark ? 'var(--bb-ink)' : 'var(--bb-paper)';
  const fg = dark ? 'var(--bb-paper)' : 'var(--bb-ink)';
  const line = dark ? 'rgba(242,239,232,0.2)' : 'rgba(10,10,10,0.15)';
  return (
    <div className="bb-root" style={{ minHeight:'100%', background:bg, color:fg, paddingTop:54, position:'relative' }}>
      <div style={{ padding:'20px 20px 0', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div style={{ width:36, height:36, border:`1.5px solid ${fg}`, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'var(--bb-font-display)', fontWeight:800, fontSize:20 }}>←</div>
        <BabooLogo height={20} color={fg} />
        <div style={{ width:36 }}/>
      </div>

      <div style={{ padding:'30px 20px 20px' }}>
        <div className="bb-eyebrow" style={{ opacity:0.6 }}>CONNEXION</div>
        <div className="bb-display" style={{ fontSize:64, fontWeight:900, letterSpacing:'-0.04em', lineHeight:0.88, marginTop:4 }}>
          BON<br/>RETOUR.
        </div>
      </div>

      <div style={{ padding:'0 20px' }}>
        <FieldLabel fg={fg}>E-MAIL OU TÉLÉPHONE</FieldLabel>
        <div style={{ borderBottom:`2px solid ${fg}`, padding:'10px 0' }}>
          <div className="bb-display" style={{ fontSize:22, fontWeight:700, letterSpacing:'-0.01em' }}>
            yasmine@<span style={{ opacity:0.3 }}>_</span>
          </div>
        </div>

        <div style={{ marginTop:22 }}>
          <FieldLabel fg={fg}>MOT DE PASSE</FieldLabel>
          <div style={{ borderBottom:`2px solid ${fg}`, padding:'10px 0', display:'flex', justifyContent:'space-between' }}>
            <div className="bb-display" style={{ fontSize:22, fontWeight:700, letterSpacing:'0.2em' }}>
              ●●●●●●●●
            </div>
            <div className="bb-mono" style={{ fontSize:10, opacity:0.6, letterSpacing:'0.1em', alignSelf:'center' }}>
              VOIR
            </div>
          </div>
        </div>

        <div className="bb-mono" style={{ fontSize:10, opacity:0.7, letterSpacing:'0.08em', marginTop:14, textDecoration:'underline' }}>
          MOT DE PASSE OUBLIÉ ?
        </div>

        <div style={{ marginTop:30, padding:'16px', background:fg, color:bg, textAlign:'center', fontFamily:'var(--bb-font-display)', fontWeight:800, fontSize:15, letterSpacing:'0.08em' }}>
          SE CONNECTER →
        </div>

        <div style={{ display:'flex', alignItems:'center', gap:10, margin:'26px 0 18px' }}>
          <div style={{ flex:1, height:1, background:line }}/>
          <div className="bb-mono" style={{ fontSize:9, opacity:0.55, letterSpacing:'0.12em' }}>OU</div>
          <div style={{ flex:1, height:1, background:line }}/>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
          {['GOOGLE','APPLE'].map(p => (
            <div key={p} style={{ padding:'12px', border:`1.5px solid ${fg}`, textAlign:'center', fontFamily:'var(--bb-font-display)', fontWeight:800, fontSize:13, letterSpacing:'0.08em' }}>
              {p}
            </div>
          ))}
        </div>

        <div style={{ marginTop:30, textAlign:'center', fontFamily:'var(--bb-font-mono)', fontSize:10, opacity:0.7, letterSpacing:'0.1em' }}>
          PAS DE COMPTE ? <span style={{ textDecoration:'underline' }}>S'INSCRIRE</span>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { ScreenProfile, ScreenOnboarding, ScreenLogin });
