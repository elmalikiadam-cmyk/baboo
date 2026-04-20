// Baboo — barre de navigation bas (iOS style, mais brutaliste)
function BabooBottomBar({ dark = false, active = 'home' }) {
  const bg = dark ? 'var(--bb-ink)' : 'var(--bb-paper)';
  const fg = dark ? 'var(--bb-paper)' : 'var(--bb-ink)';
  const line = dark ? 'rgba(242,239,232,0.25)' : 'rgba(10,10,10,0.2)';

  const items = [
    { id: 'home', label: 'ACCUEIL', icon: <IconHomeSq color={fg} /> },
    { id: 'search', label: 'RECHERCHE', icon: <IconSearch color={fg} /> },
    { id: 'publish', label: 'PUBLIER', icon: <IconPlus color={fg} /> },
    { id: 'fav', label: 'FAVORIS', icon: <IconHeart color={fg} /> },
    { id: 'me', label: 'COMPTE', icon: <IconUser color={fg} /> },
  ];

  return (
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0,
      background: bg, borderTop: `1px solid ${line}`,
      paddingBottom: 28, paddingTop: 10, paddingLeft: 4, paddingRight: 4,
      display: 'flex', zIndex: 40,
    }}>
      {items.map((it) => (
        <div key={it.id} style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          alignItems: 'center', gap: 4,
          opacity: it.id === active ? 1 : 0.5,
          position: 'relative',
        }}>
          {it.id === active && (
            <div style={{
              position: 'absolute', top: -11, left: '50%',
              transform: 'translateX(-50%)',
              width: 24, height: 2, background: fg,
            }} />
          )}
          {it.icon}
          <div style={{
            fontFamily: 'var(--bb-font-mono)', fontSize: 8,
            letterSpacing: '0.1em', color: fg, fontWeight: 500,
          }}>{it.label}</div>
        </div>
      ))}
    </div>
  );
}

function IconHomeSq({ color = '#000' }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6">
      <path d="M3 11l9-7 9 7v10H3z"/>
      <path d="M9 21v-7h6v7"/>
    </svg>
  );
}

Object.assign(window, { BabooBottomBar, IconHomeSq });
