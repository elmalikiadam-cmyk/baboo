// Favoris — liste + comparateur inline
function ScreenFavorites({ dark = false }) {
  const bg = dark ? 'var(--bb-ink)' : 'var(--bb-paper)';
  const fg = dark ? 'var(--bb-paper)' : 'var(--bb-ink)';
  const line = dark ? 'rgba(242,239,232,0.2)' : 'rgba(10,10,10,0.15)';

  const favs = [
    { id:1, price:'4 200 000', unit:'MAD', title:'RIAD MÉDINA', loc:'Marrakech', rooms:'3 CH', area:'220 M²', ppm:'17 500', status:'DISPO', days:3 },
    { id:2, price:'2 750 000', unit:'MAD', title:'DUPLEX MALABATA', loc:'Tanger', rooms:'3 CH', area:'140 M²', ppm:'19 642', status:'BAISSE', days:7 },
    { id:3, price:'12 800 000', unit:'MAD', title:'VILLA SOUISSI', loc:'Rabat', rooms:'5 CH', area:'480 M²', ppm:'26 666', status:'DISPO', days:12 },
  ];

  return (
    <div className="bb-root" style={{ minHeight:'100%', background:bg, color:fg, paddingTop:54, paddingBottom:90 }}>
      <div style={{ padding:'14px 16px 0', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <BabooLogo height={20} color={fg} />
        <div className="bb-mono" style={{ fontSize:10, opacity:0.6, letterSpacing:'0.1em' }}>FR · MAD</div>
      </div>

      <div style={{ padding:'18px 16px 14px', borderBottom:`2px solid ${fg}` }}>
        <div className="bb-eyebrow" style={{ opacity:0.6 }}>FAVORIS · 12 ANNONCES</div>
        <div className="bb-display" style={{ fontSize:56, fontWeight:900, letterSpacing:'-0.04em', lineHeight:0.9, marginTop:4 }}>
          MA<br/>SHORTLIST.
        </div>
      </div>

      {/* Toolbar */}
      <div style={{ display:'flex', borderBottom:`1.5px solid ${fg}` }}>
        <div style={{ flex:1, padding:'10px 14px', background:fg, color:bg, fontFamily:'var(--bb-font-display)', fontWeight:800, fontSize:12, letterSpacing:'0.08em' }}>LISTE</div>
        <div style={{ flex:1, padding:'10px 14px', fontFamily:'var(--bb-font-display)', fontWeight:800, fontSize:12, letterSpacing:'0.08em', borderLeft:`1px solid ${fg}` }}>COMPARER (3)</div>
      </div>

      {/* Liste */}
      {favs.map((f,i) => (
        <div key={f.id} style={{ padding:'14px 16px', borderBottom:`1px solid ${line}`, display:'flex', gap:12 }}>
          <div className={`bb-photo-placeholder ${dark?'dark':''}`} data-label="" style={{ width:84, height:84, flexShrink:0 }}/>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div className="bb-mono" style={{ fontSize:9, opacity:0.6, letterSpacing:'0.08em' }}>
                AJOUTÉ IL Y A {f.days}J
              </div>
              <div style={{ padding:'2px 6px', background: f.status==='BAISSE'?fg:'transparent', color: f.status==='BAISSE'?bg:fg, border:`1px solid ${fg}`, fontFamily:'var(--bb-font-mono)', fontSize:9, letterSpacing:'0.08em' }}>
                {f.status==='BAISSE' ? '↓ ' : '● '}{f.status}
              </div>
            </div>
            <div className="bb-display" style={{ fontSize:34, fontWeight:900, letterSpacing:'-0.03em', lineHeight:0.9, marginTop:2 }}>
              {f.price}
            </div>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', marginTop:6 }}>
              <div className="bb-display" style={{ fontSize:15, fontWeight:700, letterSpacing:'-0.01em' }}>
                {f.title} <span style={{ opacity:0.5 }}>— {f.loc}</span>
              </div>
            </div>
            <div className="bb-mono" style={{ fontSize:9, opacity:0.6, marginTop:4, letterSpacing:'0.06em' }}>
              {f.rooms} · {f.area} · {f.ppm} /M²
            </div>
          </div>
        </div>
      ))}

      {/* Comparateur footer */}
      <div style={{ padding:'16px', background: dark?'rgba(242,239,232,0.04)':'rgba(10,10,10,0.03)', borderTop:`2px solid ${fg}` }}>
        <div className="bb-eyebrow" style={{ opacity:0.6 }}>COMPARATEUR · 3 BIENS</div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', marginTop:10, border:`1px solid ${fg}` }}>
          {[['PRIX MIN','2.7M'],['ÉCART','10M'],['SURFACE','140-480']].map(([k,v],i) => (
            <div key={k} style={{ padding:'10px 8px', borderRight: i<2?`1px solid ${fg}`:'none', textAlign:'center' }}>
              <div className="bb-mono" style={{ fontSize:8, opacity:0.6, letterSpacing:'0.1em' }}>{k}</div>
              <div className="bb-display" style={{ fontSize:16, fontWeight:800, marginTop:2 }}>{v}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { ScreenFavorites });
