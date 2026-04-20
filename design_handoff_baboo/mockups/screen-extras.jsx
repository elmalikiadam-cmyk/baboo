// Notifications + Alertes recherche + Mes annonces + Profil agent
function ScreenNotifications({ dark = false }) {
  const bg = dark ? 'var(--bb-ink)' : 'var(--bb-paper)';
  const fg = dark ? 'var(--bb-paper)' : 'var(--bb-ink)';
  const line = dark ? 'rgba(242,239,232,0.2)' : 'rgba(10,10,10,0.15)';

  const items = [
    { type:'BAISSE', t:'IL Y A 2H', title:'Prix baissé · -200K', sub:'Riad Médina · 4 200 000 → 4 000 000 MAD', unread:true },
    { type:'NEW', t:'IL Y A 5H', title:'3 nouveaux biens', sub:'Casablanca · Vente · 2 CH', unread:true },
    { type:'MSG', t:'IL Y A 1J', title:'Karim Bennis a répondu', sub:'« 14h c\u2019est bon, je vous envoie… »', unread:true },
    { type:'VISIT', t:'IL Y A 2J', title:'Visite confirmée', sub:'Samedi 14h · Marrakech', unread:false },
    { type:'NEW', t:'IL Y A 3J', title:'5 nouveaux biens', sub:'Rabat · Location · 3+ CH', unread:false },
  ];

  return (
    <div className="bb-root" style={{ minHeight:'100%', background:bg, color:fg, paddingTop:54, paddingBottom:90 }}>
      <div style={{ padding:'14px 16px 14px', borderBottom:`2px solid ${fg}` }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
          <BabooLogo height={20} color={fg} />
          <div className="bb-mono" style={{ fontSize:10, opacity:0.6, letterSpacing:'0.1em' }}>TOUT LU</div>
        </div>
        <div className="bb-eyebrow" style={{ opacity:0.6 }}>NOTIFICATIONS · 3 NON LUES</div>
        <div className="bb-display" style={{ fontSize:56, fontWeight:900, letterSpacing:'-0.04em', lineHeight:0.9, marginTop:4 }}>
          ACTIVITÉ.
        </div>
      </div>

      {items.map((n,i) => (
        <div key={i} style={{ padding:'14px 16px', borderBottom:`1px solid ${line}`, display:'flex', gap:12, position:'relative' }}>
          {n.unread && <div style={{ position:'absolute', left:4, top:'50%', width:4, height:4, background:fg, borderRadius:'50%' }}/>}
          <div style={{ width:44, height:44, border:`1.5px solid ${fg}`, background: n.type==='BAISSE'?fg:'transparent', color: n.type==='BAISSE'?bg:fg, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'var(--bb-font-display)', fontWeight:900, fontSize:11, flexShrink:0, letterSpacing:'0.05em' }}>
            {n.type}
          </div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline' }}>
              <div className="bb-display" style={{ fontSize:16, fontWeight:800, letterSpacing:'-0.01em' }}>{n.title}</div>
              <div className="bb-mono" style={{ fontSize:9, opacity:0.55, letterSpacing:'0.06em' }}>{n.t}</div>
            </div>
            <div className="bb-mono" style={{ fontSize:10, opacity:0.7, marginTop:3, letterSpacing:'0.04em' }}>
              {n.sub}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function ScreenAgent({ dark = false }) {
  const bg = dark ? 'var(--bb-ink)' : 'var(--bb-paper)';
  const fg = dark ? 'var(--bb-paper)' : 'var(--bb-ink)';
  const line = dark ? 'rgba(242,239,232,0.2)' : 'rgba(10,10,10,0.15)';
  const ann = [
    { price:'4 200 000', title:'RIAD MÉDINA', loc:'Marrakech' },
    { price:'2 750 000', title:'DUPLEX MALABATA', loc:'Tanger' },
    { price:'9 500', title:'APPT. MAÂRIF', loc:'Casablanca' },
    { price:'12 800 000', title:'VILLA SOUISSI', loc:'Rabat' },
  ];
  return (
    <div className="bb-root" style={{ minHeight:'100%', background:bg, color:fg, paddingTop:54, paddingBottom:110, position:'relative' }}>
      <div style={{ padding:'10px 16px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div style={{ width:36, height:36, border:`1.5px solid ${fg}`, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'var(--bb-font-display)', fontWeight:800, fontSize:20 }}>←</div>
        <div className="bb-mono" style={{ fontSize:10, opacity:0.6, letterSpacing:'0.1em' }}>PROFIL AGENT</div>
        <div style={{ width:36 }}/>
      </div>

      <div style={{ padding:'16px 16px 20px', borderBottom:`2px solid ${fg}` }}>
        <div style={{ display:'flex', gap:14, alignItems:'center' }}>
          <div style={{ width:80, height:80, background:fg, color:bg, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'var(--bb-font-display)', fontWeight:900, fontSize:34 }}>KB</div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ padding:'2px 6px', border:`1px solid ${fg}`, fontFamily:'var(--bb-font-mono)', fontSize:9, letterSpacing:'0.1em', display:'inline-block' }}>✓ AGENT VÉRIFIÉ</div>
            <div className="bb-display" style={{ fontSize:30, fontWeight:900, letterSpacing:'-0.02em', lineHeight:0.9, marginTop:6 }}>
              KARIM BENNIS
            </div>
            <div className="bb-mono" style={{ fontSize:10, opacity:0.65, marginTop:4, letterSpacing:'0.06em' }}>
              CABINET ATLAS · CASABLANCA
            </div>
          </div>
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', borderBottom:`1.5px solid ${fg}` }}>
        {[['142','ANNONCES'],['4.9','NOTE ★'],['8 ANS','EXPÉRIENCE']].map(([v,k],i) => (
          <div key={k} style={{ padding:'14px 8px', textAlign:'center', borderRight: i<2?`1px solid ${fg}`:'none' }}>
            <div className="bb-display" style={{ fontSize:24, fontWeight:900, letterSpacing:'-0.02em' }}>{v}</div>
            <div className="bb-mono" style={{ fontSize:8, opacity:0.6, letterSpacing:'0.1em', marginTop:2 }}>{k}</div>
          </div>
        ))}
      </div>

      <div style={{ padding:'18px 16px 10px', display:'flex', justifyContent:'space-between', alignItems:'baseline' }}>
        <div className="bb-display" style={{ fontSize:22, fontWeight:800, letterSpacing:'0.04em' }}>
          ANNONCES / 142
        </div>
        <div className="bb-mono" style={{ fontSize:10, opacity:0.55, letterSpacing:'0.08em' }}>TOUT VOIR →</div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:1, background:line, borderTop:`1px solid ${line}`, borderBottom:`1px solid ${line}` }}>
        {ann.map((a,i) => (
          <div key={i} style={{ background:bg, padding:0 }}>
            <div className={`bb-photo-placeholder ${dark?'dark':''}`} data-label={a.title} style={{ height:120, width:'100%' }}/>
            <div style={{ padding:'8px 10px 12px' }}>
              <div className="bb-display" style={{ fontSize:20, fontWeight:900, letterSpacing:'-0.02em' }}>
                {a.price}
              </div>
              <div className="bb-mono" style={{ fontSize:9, opacity:0.65, marginTop:4, letterSpacing:'0.04em' }}>
                {a.title} · {a.loc}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ position:'absolute', bottom:0, left:0, right:0, background:bg, borderTop:`2px solid ${fg}`, padding:'12px 14px 34px', display:'flex', gap:8 }}>
        <div style={{ padding:'14px 16px', border:`2px solid ${fg}`, fontFamily:'var(--bb-font-display)', fontWeight:800, fontSize:14, letterSpacing:'0.08em' }}>☎</div>
        <div style={{ flex:1, padding:'14px 16px', background:fg, color:bg, fontFamily:'var(--bb-font-display)', fontWeight:800, fontSize:14, letterSpacing:'0.08em', textAlign:'center' }}>ENVOYER UN MESSAGE →</div>
      </div>
    </div>
  );
}

function ScreenMyListings({ dark = false }) {
  const bg = dark ? 'var(--bb-ink)' : 'var(--bb-paper)';
  const fg = dark ? 'var(--bb-paper)' : 'var(--bb-ink)';
  const line = dark ? 'rgba(242,239,232,0.2)' : 'rgba(10,10,10,0.15)';
  const mine = [
    { price:'4 200 000', unit:'MAD', title:'RIAD RÉNOVÉ', loc:'Marrakech', views:421, contacts:12, status:'EN LIGNE', days:14 },
    { price:'9 500', unit:'MAD/MOIS', title:'APPT. MAÂRIF', loc:'Casablanca', views:198, contacts:5, status:'EN ATTENTE', days:1 },
  ];
  return (
    <div className="bb-root" style={{ minHeight:'100%', background:bg, color:fg, paddingTop:54, paddingBottom:100, position:'relative' }}>
      <div style={{ padding:'14px 16px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div style={{ width:36, height:36, border:`1.5px solid ${fg}`, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'var(--bb-font-display)', fontWeight:800, fontSize:20 }}>←</div>
        <BabooLogo height={18} color={fg} />
        <div style={{ width:36 }}/>
      </div>
      <div style={{ padding:'16px 16px 14px', borderBottom:`2px solid ${fg}` }}>
        <div className="bb-eyebrow" style={{ opacity:0.6 }}>MES ANNONCES · 2 PUBLIÉES</div>
        <div className="bb-display" style={{ fontSize:48, fontWeight:900, letterSpacing:'-0.04em', lineHeight:0.9, marginTop:4 }}>
          MES BIENS.
        </div>
      </div>

      {mine.map((m,i) => (
        <div key={i} style={{ padding:'14px 16px', borderBottom:`1px solid ${line}` }}>
          <div style={{ display:'flex', gap:12 }}>
            <div className={`bb-photo-placeholder ${dark?'dark':''}`} data-label="" style={{ width:84, height:84, flexShrink:0 }}/>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <div style={{ padding:'2px 6px', background: m.status==='EN LIGNE'?fg:'transparent', color: m.status==='EN LIGNE'?bg:fg, border:`1px solid ${fg}`, fontFamily:'var(--bb-font-mono)', fontSize:9, letterSpacing:'0.08em' }}>
                  ● {m.status}
                </div>
                <div className="bb-mono" style={{ fontSize:9, opacity:0.55, letterSpacing:'0.08em' }}>J+{m.days}</div>
              </div>
              <div className="bb-display" style={{ fontSize:30, fontWeight:900, letterSpacing:'-0.03em', lineHeight:0.9, marginTop:4 }}>
                {m.price}
              </div>
              <div className="bb-display" style={{ fontSize:14, fontWeight:700, marginTop:4, letterSpacing:'-0.01em' }}>
                {m.title} <span style={{ opacity:0.5 }}>— {m.loc}</span>
              </div>
            </div>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', marginTop:10, border:`1px solid ${line}` }}>
            {[['VUES',m.views],['CONTACTS',m.contacts],['FAV.', Math.round(m.views*0.08)]].map(([k,v],j) => (
              <div key={k} style={{ padding:'8px', textAlign:'center', borderRight: j<2?`1px solid ${line}`:'none' }}>
                <div className="bb-display" style={{ fontSize:18, fontWeight:900 }}>{v}</div>
                <div className="bb-mono" style={{ fontSize:8, opacity:0.55, letterSpacing:'0.1em' }}>{k}</div>
              </div>
            ))}
          </div>
          <div style={{ display:'flex', gap:8, marginTop:10 }}>
            <div style={{ flex:1, padding:'8px 10px', border:`1.5px solid ${fg}`, textAlign:'center', fontFamily:'var(--bb-font-display)', fontWeight:800, fontSize:12, letterSpacing:'0.06em' }}>MODIFIER</div>
            <div style={{ flex:1, padding:'8px 10px', border:`1.5px solid ${fg}`, textAlign:'center', fontFamily:'var(--bb-font-display)', fontWeight:800, fontSize:12, letterSpacing:'0.06em' }}>STATS ↗</div>
            <div style={{ padding:'8px 12px', border:`1.5px solid ${fg}`, fontFamily:'var(--bb-font-display)', fontWeight:800, fontSize:12 }}>⋯</div>
          </div>
        </div>
      ))}

      <div style={{ position:'absolute', bottom:0, left:0, right:0, padding:'12px 14px 34px', borderTop:`2px solid ${fg}`, background:bg }}>
        <div style={{ padding:'14px 16px', background:fg, color:bg, fontFamily:'var(--bb-font-display)', fontWeight:800, fontSize:14, letterSpacing:'0.08em', textAlign:'center' }}>
          + PUBLIER UNE ANNONCE
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { ScreenNotifications, ScreenAgent, ScreenMyListings });
