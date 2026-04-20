// Messagerie — conversation avec agent
function ScreenMessages({ dark = false }) {
  const bg = dark ? 'var(--bb-ink)' : 'var(--bb-paper)';
  const fg = dark ? 'var(--bb-paper)' : 'var(--bb-ink)';
  const line = dark ? 'rgba(242,239,232,0.2)' : 'rgba(10,10,10,0.15)';

  const msgs = [
    { who:'agent', t:'09:42', text:"Bonjour. J'ai bien reçu votre demande sur le riad de la médina." },
    { who:'agent', t:'09:42', text:"Il est toujours disponible, visite possible samedi." },
    { who:'me', t:'09:45', text:"Parfait, quelle heure ?" },
    { who:'agent', t:'09:46', text:"14h ou 16h. J'envoie l'adresse exacte dès votre confirmation." },
    { who:'me', t:'09:47', text:"14h c'est bon." },
    { who:'agent', t:'09:48', text:"Noté. Je vous envoie la localisation." },
  ];

  return (
    <div className="bb-root" style={{ minHeight:'100%', background:bg, color:fg, position:'relative', display:'flex', flexDirection:'column' }}>
      {/* Header */}
      <div style={{ paddingTop:54, padding:'54px 14px 12px', borderBottom:`2px solid ${fg}`, background:bg }}>
        <div style={{ display:'flex', alignItems:'center', gap:12, marginTop:8 }}>
          <div style={{ width:32, height:32, border:`1.5px solid ${fg}`, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'var(--bb-font-display)', fontWeight:800, fontSize:18 }}>←</div>
          <div style={{ width:40, height:40, background:fg, color:bg, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'var(--bb-font-display)', fontWeight:900, fontSize:16 }}>KB</div>
          <div style={{ flex:1, minWidth:0 }}>
            <div className="bb-display" style={{ fontSize:17, fontWeight:800, letterSpacing:'-0.01em' }}>KARIM BENNIS</div>
            <div className="bb-mono" style={{ fontSize:9, opacity:0.65, letterSpacing:'0.08em' }}>● EN LIGNE · AGENT</div>
          </div>
          <div style={{ width:32, height:32, border:`1.5px solid ${fg}`, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'var(--bb-font-display)', fontWeight:800, fontSize:16 }}>☎</div>
        </div>
      </div>

      {/* Contexte annonce */}
      <div style={{ padding:'10px 14px', background: dark?'rgba(242,239,232,0.05)':'rgba(10,10,10,0.04)', borderBottom:`1px solid ${line}`, display:'flex', gap:10, alignItems:'center' }}>
        <div className={`bb-photo-placeholder ${dark?'dark':''}`} data-label="" style={{ width:44, height:44, flexShrink:0 }}/>
        <div style={{ flex:1, minWidth:0 }}>
          <div className="bb-mono" style={{ fontSize:9, opacity:0.6, letterSpacing:'0.08em' }}>CONVERSATION SUR</div>
          <div className="bb-display" style={{ fontSize:15, fontWeight:800, letterSpacing:'-0.01em' }}>
            RIAD MÉDINA — 4 200 000 MAD
          </div>
        </div>
        <div className="bb-mono" style={{ fontSize:9, opacity:0.55, letterSpacing:'0.08em' }}>VOIR →</div>
      </div>

      {/* Date */}
      <div style={{ textAlign:'center', padding:'14px 0' }}>
        <div className="bb-mono" style={{ fontSize:9, opacity:0.5, letterSpacing:'0.14em' }}>
          — AUJOURD'HUI —
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex:1, padding:'0 14px', display:'flex', flexDirection:'column', gap:8 }}>
        {msgs.map((m,i) => (
          <div key={i} style={{ display:'flex', justifyContent: m.who==='me'?'flex-end':'flex-start' }}>
            <div style={{ maxWidth:'78%' }}>
              <div style={{
                padding:'10px 12px',
                background: m.who==='me' ? fg : 'transparent',
                color: m.who==='me' ? bg : fg,
                border: m.who==='me' ? 'none' : `1.5px solid ${fg}`,
                fontFamily:'var(--bb-font-display)',
                fontWeight:600, fontSize:15, letterSpacing:'-0.005em', lineHeight:1.3,
              }}>{m.text}</div>
              <div className="bb-mono" style={{ fontSize:8, opacity:0.5, marginTop:3, letterSpacing:'0.08em', textAlign: m.who==='me'?'right':'left' }}>
                {m.t}{m.who==='me' && ' · LU'}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Réponses rapides */}
      <div style={{ padding:'10px 14px 6px', display:'flex', gap:6, overflowX:'auto' }}>
        {['DISPONIBLE ?', 'PRIX FERME ?', 'PHOTOS SUPP.', 'VISITE ?'].map(q => (
          <div key={q} style={{ flex:'0 0 auto', padding:'5px 10px', border:`1.5px solid ${fg}`, fontFamily:'var(--bb-font-mono)', fontSize:9, letterSpacing:'0.08em' }}>
            {q}
          </div>
        ))}
      </div>

      {/* Input */}
      <div style={{ padding:'8px 14px 34px', borderTop:`2px solid ${fg}`, background:bg, display:'flex', gap:8, alignItems:'center' }}>
        <div style={{ width:36, height:36, border:`1.5px solid ${fg}`, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'var(--bb-font-display)', fontWeight:800, fontSize:18 }}>+</div>
        <div style={{ flex:1, padding:'10px 12px', border:`1.5px solid ${fg}`, fontFamily:'var(--bb-font-display)', fontWeight:500, fontSize:14, color:'var(--bb-muted)' }}>
          Écrire un message…
        </div>
        <div style={{ width:36, height:36, background:fg, color:bg, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'var(--bb-font-display)', fontWeight:800, fontSize:18 }}>↑</div>
      </div>
    </div>
  );
}

Object.assign(window, { ScreenMessages });
