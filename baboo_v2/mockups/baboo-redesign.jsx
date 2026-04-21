import React, { useState } from 'react';
import { Search, Heart, MessageCircle, Home, User, MapPin, Bed, Maximize2, Phone, Share2, ChevronLeft, SlidersHorizontal, Bookmark, Building2, Trees, Bath, Calendar } from 'lucide-react';

// ============================================================================
// BABOO — Direction "Maison ouverte"
// Chaleureux, confiant, marocain. Tabulaire, photo-first, pensé mobile.
// ============================================================================

// Palette — terre, crème, zellige, accents discrets
const tokens = {
  // Surfaces
  paper: '#FAF6F0',        // crème fond principal
  paperWarm: '#F4EDE1',    // crème +1 (cards soft, separators)
  paperCool: '#EFE9DC',    // crème +2 
  // Encres
  ink: '#1A1815',          // presque noir, très légèrement chaud
  inkSoft: '#4A4641',      // texte secondaire
  inkMuted: '#8A837A',     // métadonnées
  // Accents — terre cuite + olive pour semantic
  terracotta: '#B8442A',   // accent principal, discret
  terracottaSoft: '#F3DCD1',
  olive: '#5B6B3F',        // success / vérifié
  oliveSoft: '#E4E7D5',
  sand: '#D9CBB1',         // bordures chaudes
  sandSoft: '#E8DFC9',
};

// Fonts chargés via Google Fonts dans le head de l'artefact
const fontDisplay = '"Fraunces", "Cormorant Garamond", Georgia, serif';
const fontBody = '"Inter Tight", system-ui, sans-serif';
const fontMono = '"JetBrains Mono", ui-monospace, monospace';

// ============================================================================
// Data mockup
// ============================================================================
const listings = [
  {
    id: '1',
    type: 'Villa',
    transaction: 'vente',
    title: 'Villa avec piscine',
    price: 12800000,
    priceLabel: '12 800 000',
    unit: 'MAD',
    city: 'Rabat',
    district: 'Souissi',
    rooms: 5,
    baths: 4,
    surface: 480,
    land: 800,
    tags: ['Jardin', 'Piscine', 'Garage'],
    publisher: { type: 'pro', name: 'Atlas Immobilier', verified: true },
    date: 'Il y a 2 jours',
    // placeholder gradients — en prod : vraies photos
    gradient: 'linear-gradient(135deg, #C9A67F 0%, #8B6F47 50%, #5C4A30 100%)',
    accent: '#C9A67F',
  },
  {
    id: '2',
    type: 'Appartement',
    transaction: 'location',
    title: 'Appartement lumineux 2 chambres',
    price: 9500,
    priceLabel: '9 500',
    unit: 'MAD/mois',
    city: 'Casablanca',
    district: 'Maârif',
    rooms: 2,
    baths: 1,
    surface: 85,
    tags: ['Meublé', 'Balcon', 'Ascenseur'],
    publisher: { type: 'particulier', name: 'Mohammed A.', verified: false },
    date: 'Aujourd\'hui',
    gradient: 'linear-gradient(135deg, #D4A574 0%, #A67C52 100%)',
    accent: '#D4A574',
  },
  {
    id: '3',
    type: 'Riad',
    transaction: 'vente',
    title: 'Riad dans la Médina',
    price: 4200000,
    priceLabel: '4 200 000',
    unit: 'MAD',
    city: 'Marrakech',
    district: 'Médina',
    rooms: 3,
    baths: 2,
    surface: 220,
    tags: ['Patio', 'Authentique', 'Rénové'],
    publisher: { type: 'pro', name: 'Médina Estates', verified: true },
    date: 'Il y a 5 jours',
    gradient: 'linear-gradient(135deg, #B8442A 0%, #8A3520 60%, #5C2414 100%)',
    accent: '#B8442A',
  },
  {
    id: '4',
    type: 'Duplex',
    transaction: 'vente',
    title: 'Duplex vue mer',
    price: 2750000,
    priceLabel: '2 750 000',
    unit: 'MAD',
    city: 'Tanger',
    district: 'Malabata',
    rooms: 3,
    baths: 2,
    surface: 140,
    tags: ['Vue mer', 'Terrasse'],
    publisher: { type: 'pro', name: 'Nord Immo', verified: true },
    date: 'Il y a 1 semaine',
    gradient: 'linear-gradient(135deg, #5B7A8E 0%, #3D5A6F 100%)',
    accent: '#5B7A8E',
  },
  {
    id: '5',
    type: 'Studio',
    transaction: 'location',
    title: 'Studio neuf centre-ville',
    price: 6200,
    priceLabel: '6 200',
    unit: 'MAD/mois',
    city: 'Casablanca',
    district: 'Gauthier',
    rooms: 1,
    baths: 1,
    surface: 42,
    tags: ['Neuf', 'Équipé'],
    publisher: { type: 'particulier', name: 'Salma B.', verified: false },
    date: 'Il y a 3 jours',
    gradient: 'linear-gradient(135deg, #E0C9A6 0%, #B59872 100%)',
    accent: '#E0C9A6',
  },
];

// ============================================================================
// Logo — ourson minimal + wordmark
// ============================================================================
const BabooLogo = ({ size = 22, color = tokens.ink }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
    <svg width={size * 1.1} height={size} viewBox="0 0 24 22" fill="none">
      {/* oreilles */}
      <circle cx="6" cy="6" r="3.2" fill={color} />
      <circle cx="18" cy="6" r="3.2" fill={color} />
      {/* tête */}
      <circle cx="12" cy="13" r="7.5" fill={color} />
      {/* museau */}
      <circle cx="12" cy="15" r="3" fill={tokens.paper} />
      {/* yeux */}
      <circle cx="9.5" cy="12" r="0.8" fill={tokens.paper} />
      <circle cx="14.5" cy="12" r="0.8" fill={tokens.paper} />
      {/* nez */}
      <circle cx="12" cy="14" r="0.5" fill={color} />
    </svg>
    <span style={{
      fontFamily: fontDisplay,
      fontWeight: 500,
      fontSize: size * 0.95,
      letterSpacing: '-0.02em',
      color,
      fontStyle: 'italic',
    }}>baboo</span>
  </div>
);

// ============================================================================
// iOS Frame
// ============================================================================
const IOSFrame = ({ children, label }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
    <div style={{
      fontFamily: fontMono,
      fontSize: 10,
      letterSpacing: '0.12em',
      textTransform: 'uppercase',
      color: tokens.inkMuted,
    }}>{label}</div>
    <div style={{
      width: 390,
      height: 810,
      background: tokens.ink,
      borderRadius: 52,
      padding: 12,
      boxShadow: '0 30px 80px -20px rgba(26, 24, 21, 0.25), 0 10px 30px -10px rgba(26, 24, 21, 0.15)',
    }}>
      <div style={{
        width: '100%',
        height: '100%',
        background: tokens.paper,
        borderRadius: 40,
        overflow: 'hidden',
        position: 'relative',
      }}>
        {/* Status bar */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 44,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 28px', zIndex: 100,
          fontFamily: fontBody, fontSize: 14, fontWeight: 600,
          color: tokens.ink,
        }}>
          <span>9:41</span>
          <div style={{
            width: 100, height: 30, background: tokens.ink,
            borderRadius: 20, marginTop: 6,
          }} />
          <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
            {/* signal */}
            <svg width="16" height="11" viewBox="0 0 16 11" fill={tokens.ink}>
              <rect x="0" y="8" width="2.5" height="3" rx="0.5" />
              <rect x="4" y="6" width="2.5" height="5" rx="0.5" />
              <rect x="8" y="3" width="2.5" height="8" rx="0.5" />
              <rect x="12" y="0" width="2.5" height="11" rx="0.5" />
            </svg>
            {/* battery */}
            <svg width="25" height="11" viewBox="0 0 25 11" fill="none">
              <rect x="0.5" y="0.5" width="22" height="10" rx="2.5" stroke={tokens.ink} fill="none"/>
              <rect x="2" y="2" width="18" height="7" rx="1" fill={tokens.ink}/>
              <rect x="23" y="3.5" width="1.5" height="4" rx="0.5" fill={tokens.ink}/>
            </svg>
          </div>
        </div>
        {children}
      </div>
    </div>
  </div>
);

// ============================================================================
// Format helpers
// ============================================================================
const formatPrice = (n) => n.toLocaleString('fr-FR').replace(/,/g, ' ');

// ============================================================================
// Listing Card — composant central, photo-first
// ============================================================================
const ListingCard = ({ item, featured = false }) => (
  <div style={{
    background: tokens.paper,
    borderRadius: 20,
    overflow: 'hidden',
    border: `1px solid ${tokens.sandSoft}`,
    cursor: 'pointer',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  }}
  onMouseEnter={(e) => {
    e.currentTarget.style.transform = 'translateY(-2px)';
    e.currentTarget.style.boxShadow = '0 12px 30px -10px rgba(26, 24, 21, 0.15)';
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.transform = 'translateY(0)';
    e.currentTarget.style.boxShadow = 'none';
  }}>
    {/* Photo */}
    <div style={{
      position: 'relative',
      aspectRatio: featured ? '4/3' : '5/4',
      background: item.gradient,
      overflow: 'hidden',
    }}>
      {/* overlay motif subtil — évoque du zellige/moucharabieh */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.08) 1px, transparent 0)`,
        backgroundSize: '16px 16px',
      }} />
      {/* Badge pro/particulier */}
      <div style={{
        position: 'absolute', top: 12, left: 12,
        display: 'flex', gap: 6,
      }}>
        <div style={{
          padding: '5px 10px',
          background: item.publisher.type === 'pro' ? tokens.ink : 'rgba(255,255,255,0.95)',
          color: item.publisher.type === 'pro' ? tokens.paper : tokens.ink,
          borderRadius: 999,
          fontSize: 10,
          fontFamily: fontBody,
          fontWeight: 600,
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          display: 'flex', alignItems: 'center', gap: 4,
        }}>
          {item.publisher.verified && (
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M1.5 5L4 7.5L8.5 2.5" stroke={item.publisher.type === 'pro' ? tokens.paper : tokens.olive} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
          {item.publisher.type === 'pro' ? 'Pro' : 'Particulier'}
        </div>
      </div>
      {/* bouton like */}
      <button style={{
        position: 'absolute', top: 12, right: 12,
        width: 36, height: 36, borderRadius: 999,
        background: 'rgba(255,255,255,0.95)',
        border: 'none', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        backdropFilter: 'blur(8px)',
      }}>
        <Heart size={16} color={tokens.ink} strokeWidth={1.8} />
      </button>
      {/* Transaction tag — en bas à gauche, comme une étiquette cousue */}
      <div style={{
        position: 'absolute', bottom: 12, left: 12,
        padding: '4px 10px',
        background: 'rgba(255,255,255,0.95)',
        color: tokens.ink,
        borderRadius: 4,
        fontSize: 10,
        fontFamily: fontBody,
        fontWeight: 600,
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
      }}>
        {item.transaction === 'vente' ? 'À vendre' : 'À louer'}
      </div>
    </div>

    {/* Contenu */}
    <div style={{ padding: 16 }}>
      {/* Prix — typographie serif, le cœur de la carte */}
      <div style={{
        fontFamily: fontDisplay,
        fontSize: 26,
        fontWeight: 400,
        color: tokens.ink,
        letterSpacing: '-0.02em',
        lineHeight: 1,
        display: 'flex', alignItems: 'baseline', gap: 6,
      }}>
        <span>{item.priceLabel}</span>
        <span style={{
          fontSize: 12,
          fontFamily: fontBody,
          fontWeight: 500,
          color: tokens.inkMuted,
          letterSpacing: '0.02em',
        }}>{item.unit}</span>
      </div>

      {/* Localisation */}
      <div style={{
        marginTop: 8,
        display: 'flex', alignItems: 'center', gap: 4,
        color: tokens.inkSoft,
        fontFamily: fontBody,
        fontSize: 13,
      }}>
        <MapPin size={12} strokeWidth={1.8} />
        <span style={{ fontWeight: 500 }}>{item.district}</span>
        <span style={{ color: tokens.inkMuted }}>·</span>
        <span>{item.city}</span>
      </div>

      {/* Facts — icons discrets */}
      <div style={{
        marginTop: 12, paddingTop: 12,
        borderTop: `1px solid ${tokens.sandSoft}`,
        display: 'flex', gap: 16,
        fontFamily: fontBody,
        fontSize: 12,
        color: tokens.inkSoft,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <Bed size={13} strokeWidth={1.6} />
          <span><strong style={{ color: tokens.ink, fontWeight: 600 }}>{item.rooms}</strong> ch.</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <Bath size={13} strokeWidth={1.6} />
          <span><strong style={{ color: tokens.ink, fontWeight: 600 }}>{item.baths}</strong> sdb</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <Maximize2 size={12} strokeWidth={1.6} />
          <span><strong style={{ color: tokens.ink, fontWeight: 600 }}>{item.surface}</strong> m²</span>
        </div>
      </div>
    </div>
  </div>
);

// ============================================================================
// Bottom Nav — iOS feel
// ============================================================================
const BottomNav = ({ active = 'home' }) => (
  <div style={{
    position: 'absolute', bottom: 0, left: 0, right: 0,
    height: 84,
    background: 'rgba(250, 246, 240, 0.85)',
    backdropFilter: 'blur(20px)',
    borderTop: `1px solid ${tokens.sandSoft}`,
    display: 'flex', justifyContent: 'space-around', alignItems: 'flex-start',
    paddingTop: 10,
    zIndex: 50,
  }}>
    {[
      { id: 'home', icon: Home, label: 'Accueil' },
      { id: 'search', icon: Search, label: 'Rechercher' },
      { id: 'saved', icon: Bookmark, label: 'Favoris' },
      { id: 'messages', icon: MessageCircle, label: 'Messages' },
      { id: 'profile', icon: User, label: 'Profil' },
    ].map((tab) => {
      const Icon = tab.icon;
      const isActive = tab.id === active;
      return (
        <div key={tab.id} style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
          color: isActive ? tokens.ink : tokens.inkMuted,
          cursor: 'pointer',
        }}>
          <Icon size={22} strokeWidth={isActive ? 2 : 1.6} fill={isActive ? tokens.ink : 'none'} fillOpacity={isActive ? 0.08 : 0} />
          <span style={{
            fontFamily: fontBody,
            fontSize: 10,
            fontWeight: isActive ? 600 : 500,
            letterSpacing: '0.01em',
          }}>{tab.label}</span>
        </div>
      );
    })}
  </div>
);

// ============================================================================
// SCREEN 1 — ACCUEIL
// ============================================================================
const ScreenHome = () => (
  <div style={{
    height: '100%',
    overflowY: 'auto',
    paddingTop: 50,
    paddingBottom: 100,
    fontFamily: fontBody,
  }}>
    {/* Header */}
    <div style={{
      padding: '12px 20px 16px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    }}>
      <BabooLogo size={22} />
      <div style={{
        width: 38, height: 38, borderRadius: 999,
        background: tokens.paperWarm,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 13, fontWeight: 600, color: tokens.ink,
        border: `1px solid ${tokens.sandSoft}`,
      }}>SA</div>
    </div>

    {/* Greeting — chaleureux, pas éditorial */}
    <div style={{ padding: '8px 20px 20px' }}>
      <div style={{
        fontFamily: fontDisplay,
        fontSize: 32,
        fontWeight: 400,
        letterSpacing: '-0.025em',
        lineHeight: 1.05,
        color: tokens.ink,
      }}>
        Bonjour Salma.<br/>
        <span style={{ fontStyle: 'italic', color: tokens.inkSoft }}>Où cherchez-vous ?</span>
      </div>
    </div>

    {/* Search bar — invite, friendly */}
    <div style={{ padding: '0 20px 16px' }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        height: 52,
        background: tokens.paper,
        border: `1.5px solid ${tokens.ink}`,
        borderRadius: 999,
        padding: '0 8px 0 20px',
      }}>
        <Search size={18} strokeWidth={1.8} color={tokens.ink} />
        <input
          placeholder="Ville, quartier, type de bien…"
          style={{
            flex: 1, border: 'none', outline: 'none', background: 'transparent',
            fontFamily: fontBody, fontSize: 14, color: tokens.ink,
          }}
        />
        <button style={{
          height: 36, width: 36, borderRadius: 999,
          background: tokens.ink, border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <SlidersHorizontal size={15} color={tokens.paper} strokeWidth={2} />
        </button>
      </div>
    </div>

    {/* Toggle Acheter / Louer — comme deux options cousues ensemble */}
    <div style={{ padding: '0 20px 20px' }}>
      <div style={{
        display: 'flex',
        background: tokens.paperWarm,
        borderRadius: 999,
        padding: 4,
        gap: 4,
      }}>
        {['Acheter', 'Louer'].map((t, i) => (
          <button key={t} style={{
            flex: 1, height: 38, borderRadius: 999, border: 'none', cursor: 'pointer',
            background: i === 0 ? tokens.ink : 'transparent',
            color: i === 0 ? tokens.paper : tokens.inkSoft,
            fontFamily: fontBody, fontSize: 13, fontWeight: 600,
          }}>{t}</button>
        ))}
      </div>
    </div>

    {/* Villes — rubans horizontaux, photo-first */}
    <div style={{ padding: '8px 0 20px' }}>
      <div style={{
        padding: '0 20px 12px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
      }}>
        <div style={{
          fontFamily: fontDisplay,
          fontSize: 18,
          fontWeight: 500,
          color: tokens.ink,
          letterSpacing: '-0.01em',
        }}>Explorer par ville</div>
        <div style={{
          fontFamily: fontBody, fontSize: 12, fontWeight: 500,
          color: tokens.terracotta, textDecoration: 'underline', textUnderlineOffset: 3,
        }}>Voir tout</div>
      </div>
      <div style={{
        display: 'flex', gap: 10, overflowX: 'auto',
        padding: '0 20px',
        scrollbarWidth: 'none',
      }}>
        {[
          { name: 'Casablanca', count: 1284, gradient: 'linear-gradient(135deg, #D4A574 0%, #8B6F47 100%)' },
          { name: 'Rabat', count: 642, gradient: 'linear-gradient(135deg, #5B7A8E 0%, #3D5A6F 100%)' },
          { name: 'Marrakech', count: 891, gradient: 'linear-gradient(135deg, #B8442A 0%, #8A3520 100%)' },
          { name: 'Tanger', count: 423, gradient: 'linear-gradient(135deg, #7A8FA3 0%, #4E6275 100%)' },
          { name: 'Agadir', count: 287, gradient: 'linear-gradient(135deg, #E0C9A6 0%, #A88C5F 100%)' },
        ].map((city) => (
          <div key={city.name} style={{
            flexShrink: 0, width: 140, height: 170,
            borderRadius: 16, overflow: 'hidden',
            background: city.gradient,
            position: 'relative',
            cursor: 'pointer',
          }}>
            <div style={{
              position: 'absolute', inset: 0,
              backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.08) 1px, transparent 0)`,
              backgroundSize: '12px 12px',
            }} />
            <div style={{
              position: 'absolute', bottom: 12, left: 12, right: 12,
              color: tokens.paper,
            }}>
              <div style={{
                fontFamily: fontDisplay, fontSize: 20, fontWeight: 500,
                letterSpacing: '-0.02em', lineHeight: 1,
              }}>{city.name}</div>
              <div style={{
                fontFamily: fontBody, fontSize: 11,
                opacity: 0.85, marginTop: 4,
              }}>{city.count} annonces</div>
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Section — Nouveautés */}
    <div style={{ padding: '12px 20px 0' }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
        marginBottom: 14,
      }}>
        <div>
          <div style={{
            fontFamily: fontMono, fontSize: 10, fontWeight: 500,
            textTransform: 'uppercase', letterSpacing: '0.14em',
            color: tokens.terracotta, marginBottom: 4,
          }}>Nouveau cette semaine</div>
          <div style={{
            fontFamily: fontDisplay, fontSize: 22, fontWeight: 500,
            color: tokens.ink, letterSpacing: '-0.015em', lineHeight: 1,
          }}>Ajoutées récemment</div>
        </div>
      </div>

      {/* Featured card — large */}
      <div style={{ marginBottom: 14 }}>
        <ListingCard item={listings[0]} featured />
      </div>

      {/* Grid 2-col */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 10,
      }}>
        {listings.slice(1, 5).map((item) => (
          <ListingCard key={item.id} item={item} />
        ))}
      </div>

      {/* Banner "Publier une annonce" — discret, chaleureux */}
      <div style={{
        marginTop: 20,
        padding: 20,
        background: tokens.oliveSoft,
        borderRadius: 20,
        border: `1px solid ${tokens.olive}30`,
        display: 'flex', alignItems: 'center', gap: 14,
      }}>
        <div style={{
          width: 44, height: 44, borderRadius: 12,
          background: tokens.olive,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <Home size={20} color={tokens.paper} strokeWidth={1.8} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontFamily: fontDisplay, fontSize: 16, fontWeight: 500,
            color: tokens.ink, letterSpacing: '-0.01em', lineHeight: 1.15,
          }}>Vous avez un bien ?</div>
          <div style={{
            fontFamily: fontBody, fontSize: 12, color: tokens.inkSoft,
            marginTop: 3,
          }}>Publiez gratuitement en 3 minutes.</div>
        </div>
        <button style={{
          width: 32, height: 32, borderRadius: 999,
          background: tokens.ink, border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M3 6h6M6 3l3 3-3 3" stroke={tokens.paper} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </div>

    <BottomNav active="home" />
  </div>
);

// ============================================================================
// SCREEN 2 — RECHERCHE (liste de résultats)
// ============================================================================
const ScreenSearch = () => (
  <div style={{
    height: '100%', overflowY: 'auto',
    paddingTop: 50, paddingBottom: 100,
    fontFamily: fontBody,
  }}>
    {/* Header with back */}
    <div style={{
      padding: '12px 16px 12px',
      display: 'flex', alignItems: 'center', gap: 12,
      borderBottom: `1px solid ${tokens.sandSoft}`,
    }}>
      <button style={{
        width: 38, height: 38, borderRadius: 999,
        background: tokens.paperWarm, border: 'none', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <ChevronLeft size={20} color={tokens.ink} strokeWidth={1.8} />
      </button>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontFamily: fontBody, fontSize: 11, color: tokens.inkMuted,
          fontWeight: 500, letterSpacing: '0.02em',
        }}>Recherche</div>
        <div style={{
          fontFamily: fontDisplay, fontSize: 17, fontWeight: 500,
          color: tokens.ink, letterSpacing: '-0.015em',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>Appartement · Casablanca</div>
      </div>
      <button style={{
        height: 38, padding: '0 14px', borderRadius: 999,
        background: tokens.ink, color: tokens.paper, border: 'none', cursor: 'pointer',
        display: 'flex', alignItems: 'center', gap: 6,
        fontFamily: fontBody, fontSize: 12, fontWeight: 600,
      }}>
        <SlidersHorizontal size={13} strokeWidth={2} />
        Filtres
        <span style={{
          width: 16, height: 16, borderRadius: 999,
          background: tokens.terracotta, color: tokens.paper,
          fontSize: 10, fontWeight: 700,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>3</span>
      </button>
    </div>

    {/* Applied chips */}
    <div style={{
      display: 'flex', gap: 8, overflowX: 'auto',
      padding: '14px 16px', scrollbarWidth: 'none',
    }}>
      {['À louer', 'Maârif', '2+ chambres', '5k - 12k MAD'].map((chip, i) => (
        <div key={i} style={{
          flexShrink: 0,
          padding: '7px 12px 7px 14px',
          background: tokens.paperWarm,
          borderRadius: 999,
          display: 'flex', alignItems: 'center', gap: 6,
          fontFamily: fontBody, fontSize: 12, fontWeight: 500,
          color: tokens.ink,
          border: `1px solid ${tokens.sandSoft}`,
        }}>
          {chip}
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M2 2l6 6M8 2l-6 6" stroke={tokens.inkSoft} strokeWidth="1.4" strokeLinecap="round"/>
          </svg>
        </div>
      ))}
    </div>

    {/* Toolbar */}
    <div style={{
      padding: '0 20px 14px',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    }}>
      <div style={{
        fontFamily: fontBody, fontSize: 13, color: tokens.inkSoft,
      }}>
        <strong style={{ color: tokens.ink, fontWeight: 600 }}>247</strong> annonces trouvées
      </div>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6,
        fontFamily: fontBody, fontSize: 12, fontWeight: 500, color: tokens.ink,
      }}>
        Trier :
        <span style={{
          fontWeight: 600,
          borderBottom: `1.5px solid ${tokens.terracotta}`,
          paddingBottom: 1,
        }}>Plus récent</span>
      </div>
    </div>

    {/* Results — 1 col, format "liste" généreuse */}
    <div style={{
      padding: '0 20px',
      display: 'flex', flexDirection: 'column', gap: 14,
    }}>
      {listings.slice(1, 5).map((item) => (
        <ListingCard key={item.id} item={item} />
      ))}
    </div>

    {/* Pagination */}
    <div style={{
      padding: '24px 20px 20px',
      display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8,
    }}>
      <button style={{
        height: 38, padding: '0 14px', borderRadius: 999,
        background: 'transparent', color: tokens.inkSoft,
        border: `1px solid ${tokens.sandSoft}`, cursor: 'pointer',
        fontFamily: fontBody, fontSize: 12, fontWeight: 500,
      }}>Précédent</button>
      {[1, 2, 3].map((n) => (
        <button key={n} style={{
          width: 38, height: 38, borderRadius: 999,
          background: n === 1 ? tokens.ink : 'transparent',
          color: n === 1 ? tokens.paper : tokens.ink,
          border: n === 1 ? 'none' : `1px solid ${tokens.sandSoft}`,
          cursor: 'pointer',
          fontFamily: fontBody, fontSize: 13, fontWeight: 600,
        }}>{n}</button>
      ))}
      <span style={{ color: tokens.inkMuted, padding: '0 4px' }}>…</span>
      <button style={{
        height: 38, padding: '0 14px', borderRadius: 999,
        background: tokens.ink, color: tokens.paper,
        border: 'none', cursor: 'pointer',
        fontFamily: fontBody, fontSize: 12, fontWeight: 600,
      }}>Suivant</button>
    </div>

    <BottomNav active="search" />
  </div>
);

// ============================================================================
// SCREEN 3 — FICHE DÉTAIL
// ============================================================================
const ScreenDetail = () => {
  const item = listings[2]; // Riad Marrakech
  return (
    <div style={{
      height: '100%', overflowY: 'auto',
      paddingBottom: 100,
      fontFamily: fontBody, position: 'relative',
    }}>
      {/* Photo hero — full bleed, status bar overlaps */}
      <div style={{
        height: 420, position: 'relative',
        background: item.gradient,
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.08) 1px, transparent 0)`,
          backgroundSize: '16px 16px',
        }} />
        {/* Top nav buttons — floating */}
        <div style={{
          position: 'absolute', top: 54, left: 16, right: 16,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          zIndex: 10,
        }}>
          <button style={{
            width: 40, height: 40, borderRadius: 999,
            background: 'rgba(255,255,255,0.95)', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backdropFilter: 'blur(12px)',
          }}>
            <ChevronLeft size={20} color={tokens.ink} strokeWidth={1.8} />
          </button>
          <div style={{ display: 'flex', gap: 8 }}>
            <button style={{
              width: 40, height: 40, borderRadius: 999,
              background: 'rgba(255,255,255,0.95)', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              backdropFilter: 'blur(12px)',
            }}>
              <Share2 size={16} color={tokens.ink} strokeWidth={1.8} />
            </button>
            <button style={{
              width: 40, height: 40, borderRadius: 999,
              background: 'rgba(255,255,255,0.95)', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              backdropFilter: 'blur(12px)',
            }}>
              <Heart size={16} color={tokens.ink} strokeWidth={1.8} />
            </button>
          </div>
        </div>
        {/* Compteur photos */}
        <div style={{
          position: 'absolute', bottom: 16, right: 16,
          padding: '6px 12px',
          background: 'rgba(26, 24, 21, 0.7)',
          color: tokens.paper,
          borderRadius: 999,
          fontFamily: fontBody, fontSize: 12, fontWeight: 600,
          backdropFilter: 'blur(8px)',
        }}>1 / 12</div>
        {/* Transaction badge */}
        <div style={{
          position: 'absolute', bottom: 16, left: 16,
          padding: '6px 12px',
          background: 'rgba(255,255,255,0.95)',
          color: tokens.ink,
          borderRadius: 4,
          fontSize: 11,
          fontFamily: fontBody,
          fontWeight: 600,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
        }}>À vendre · Riad</div>
      </div>

      {/* Content card — overlaps photo */}
      <div style={{
        marginTop: -20,
        background: tokens.paper,
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        padding: '24px 20px 20px',
        position: 'relative',
      }}>
        {/* Location */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 4,
          color: tokens.inkSoft,
          fontFamily: fontBody, fontSize: 13,
          marginBottom: 6,
        }}>
          <MapPin size={13} strokeWidth={1.8} />
          <span style={{ fontWeight: 500, color: tokens.ink }}>Médina</span>
          <span style={{ color: tokens.inkMuted }}>·</span>
          <span>Marrakech</span>
          <span style={{ color: tokens.inkMuted, marginLeft: 'auto' }}>{item.date}</span>
        </div>

        {/* Title */}
        <div style={{
          fontFamily: fontDisplay,
          fontSize: 28,
          fontWeight: 400,
          letterSpacing: '-0.025em',
          lineHeight: 1.08,
          color: tokens.ink,
          marginBottom: 14,
        }}>{item.title}</div>

        {/* Prix — mis en valeur avec un bloc */}
        <div style={{
          padding: '16px 18px',
          background: tokens.paperWarm,
          borderRadius: 16,
          border: `1px solid ${tokens.sandSoft}`,
          marginBottom: 20,
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
        }}>
          <div>
            <div style={{
              fontFamily: fontMono, fontSize: 10, fontWeight: 500,
              textTransform: 'uppercase', letterSpacing: '0.12em',
              color: tokens.inkMuted, marginBottom: 4,
            }}>Prix</div>
            <div style={{
              fontFamily: fontDisplay,
              fontSize: 34, fontWeight: 400,
              letterSpacing: '-0.025em', lineHeight: 1,
              color: tokens.ink,
            }}>
              {item.priceLabel}
              <span style={{
                fontFamily: fontBody, fontSize: 13, fontWeight: 500,
                color: tokens.inkMuted, marginLeft: 6, letterSpacing: '0.02em',
              }}>{item.unit}</span>
            </div>
          </div>
          <div style={{
            fontFamily: fontBody, fontSize: 11, color: tokens.inkMuted,
            textAlign: 'right',
          }}>
            {Math.round(item.price / item.surface).toLocaleString('fr-FR').replace(/,/g, ' ')}
            <br/>
            <span style={{ fontSize: 10 }}>MAD / m²</span>
          </div>
        </div>

        {/* Facts grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 0,
          border: `1px solid ${tokens.sandSoft}`,
          borderRadius: 16,
          overflow: 'hidden',
          marginBottom: 24,
        }}>
          {[
            { icon: Maximize2, label: 'Surface', value: `${item.surface} m²` },
            { icon: Bed, label: 'Chambres', value: item.rooms },
            { icon: Bath, label: 'Salles de bain', value: item.baths },
            { icon: Calendar, label: 'Construit', value: '1920' },
          ].map((f, i) => {
            const Icon = f.icon;
            return (
              <div key={i} style={{
                padding: '14px 16px',
                borderRight: i % 2 === 0 ? `1px solid ${tokens.sandSoft}` : 'none',
                borderBottom: i < 2 ? `1px solid ${tokens.sandSoft}` : 'none',
                display: 'flex', alignItems: 'center', gap: 10,
              }}>
                <div style={{
                  width: 34, height: 34, borderRadius: 10,
                  background: tokens.paperWarm,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <Icon size={15} color={tokens.ink} strokeWidth={1.8} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{
                    fontFamily: fontBody, fontSize: 10, fontWeight: 500,
                    color: tokens.inkMuted,
                    textTransform: 'uppercase', letterSpacing: '0.06em',
                  }}>{f.label}</div>
                  <div style={{
                    fontFamily: fontDisplay, fontSize: 17, fontWeight: 500,
                    color: tokens.ink, letterSpacing: '-0.01em', marginTop: 1,
                  }}>{f.value}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Description */}
        <div style={{ marginBottom: 24 }}>
          <div style={{
            fontFamily: fontDisplay, fontSize: 18, fontWeight: 500,
            letterSpacing: '-0.01em', color: tokens.ink, marginBottom: 8,
          }}>Description</div>
          <div style={{
            fontFamily: fontBody, fontSize: 14, lineHeight: 1.55,
            color: tokens.inkSoft,
          }}>
            Riad authentique rénové au cœur de la Médina, à 5 minutes à pied de la place Jemaa el-Fna.
            Patio central avec fontaine traditionnelle, zelliges d'origine, terrasse avec vue sur la Koutoubia.
            Trois chambres spacieuses dont une suite parentale.
            <span style={{
              color: tokens.terracotta, fontWeight: 500, cursor: 'pointer',
              textDecoration: 'underline', textUnderlineOffset: 3,
            }}> Lire plus</span>
          </div>
        </div>

        {/* Publisher card */}
        <div style={{
          padding: 16,
          background: tokens.paper,
          border: `1px solid ${tokens.sandSoft}`,
          borderRadius: 16,
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <div style={{
            width: 48, height: 48, borderRadius: 999,
            background: tokens.terracotta,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: tokens.paper, fontFamily: fontDisplay,
            fontSize: 17, fontWeight: 500, letterSpacing: '-0.01em',
            flexShrink: 0,
          }}>ME</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontFamily: fontDisplay, fontSize: 15, fontWeight: 500,
              color: tokens.ink, letterSpacing: '-0.01em',
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              Médina Estates
              <svg width="14" height="14" viewBox="0 0 14 14" fill={tokens.olive}>
                <circle cx="7" cy="7" r="7"/>
                <path d="M4 7l2 2 4-4" stroke={tokens.paper} strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div style={{
              fontFamily: fontBody, fontSize: 11, color: tokens.inkMuted,
              marginTop: 2,
            }}>Agence vérifiée · 47 annonces</div>
          </div>
          <button style={{
            padding: '8px 14px', borderRadius: 999,
            background: 'transparent', color: tokens.ink,
            border: `1px solid ${tokens.ink}`, cursor: 'pointer',
            fontFamily: fontBody, fontSize: 12, fontWeight: 600,
          }}>Profil</button>
        </div>
      </div>

      {/* Sticky CTA */}
      <div style={{
        position: 'absolute', bottom: 84, left: 0, right: 0,
        padding: '12px 16px',
        background: 'rgba(250, 246, 240, 0.95)',
        backdropFilter: 'blur(20px)',
        borderTop: `1px solid ${tokens.sandSoft}`,
        display: 'flex', gap: 8,
      }}>
        <button style={{
          width: 52, height: 52, borderRadius: 999,
          background: tokens.paperWarm,
          border: `1px solid ${tokens.sandSoft}`,
          cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <Phone size={18} color={tokens.ink} strokeWidth={1.8} />
        </button>
        <button style={{
          flex: 1, height: 52, borderRadius: 999,
          background: tokens.ink, color: tokens.paper,
          border: 'none', cursor: 'pointer',
          fontFamily: fontBody, fontSize: 14, fontWeight: 600,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}>
          <MessageCircle size={16} strokeWidth={2} />
          Contacter l'agence
        </button>
      </div>

      <BottomNav active="home" />
    </div>
  );
};

// ============================================================================
// APP — Canvas comparatif
// ============================================================================
export default function BabooRedesign() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#EDE6D6',
      backgroundImage: `radial-gradient(circle at 1px 1px, rgba(26, 24, 21, 0.06) 1px, transparent 0)`,
      backgroundSize: '24px 24px',
      padding: '48px 32px',
      fontFamily: fontBody,
    }}>
      {/* Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;1,9..144,400;1,9..144,500&family=Inter+Tight:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
        
        * { box-sizing: border-box; }
        input::placeholder { color: ${tokens.inkMuted}; }
        button:active { transform: scale(0.97); }
        
        /* Scrollbar hiding for mobile feel */
        div::-webkit-scrollbar { display: none; }
      `}</style>

      {/* Header */}
      <div style={{ maxWidth: 1400, margin: '0 auto 40px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap' }}>
          <div>
            <div style={{
              fontFamily: fontMono, fontSize: 11, fontWeight: 500,
              letterSpacing: '0.14em', textTransform: 'uppercase',
              color: tokens.terracotta, marginBottom: 8,
            }}>Direction alternative · Maison ouverte</div>
            <div style={{
              fontFamily: fontDisplay,
              fontSize: 44, fontWeight: 400, fontStyle: 'italic',
              letterSpacing: '-0.03em', lineHeight: 1,
              color: tokens.ink,
              maxWidth: 700,
            }}>
              Baboo, <span style={{ fontStyle: 'normal' }}>repensé pour les gens qui cherchent un chez-soi.</span>
            </div>
          </div>
          <div style={{
            fontFamily: fontBody, fontSize: 13, color: tokens.inkSoft,
            maxWidth: 380, lineHeight: 1.5,
          }}>
            On remplace le ton magazine brutaliste par quelque chose de <strong style={{ color: tokens.ink }}>chaleureux, photo-first, marocain sans folklore</strong>. La typo reste distinctive (Fraunces serif italique) mais s'incline devant le bien qui compte : l'annonce elle-même.
          </div>
        </div>
      </div>

      {/* Frames */}
      <div style={{
        display: 'flex', gap: 32, justifyContent: 'center',
        flexWrap: 'wrap', maxWidth: 1400, margin: '0 auto',
      }}>
        <IOSFrame label="01 · Accueil">
          <ScreenHome />
        </IOSFrame>
        <IOSFrame label="02 · Recherche">
          <ScreenSearch />
        </IOSFrame>
        <IOSFrame label="03 · Fiche détail">
          <ScreenDetail />
        </IOSFrame>
      </div>

      {/* Notes */}
      <div style={{
        maxWidth: 1400, margin: '64px auto 0',
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24,
      }}>
        {[
          {
            label: 'Palette',
            title: 'Terre & crème',
            body: 'Crème #FAF6F0 en fond (chaud vs le blanc cassé froid d\'origine), terracotta discret #B8442A pour l\'accent, olive pour le positif/vérifié. Zéro jaune criard.',
          },
          {
            label: 'Typographie',
            title: 'Fraunces + Inter Tight',
            body: 'Fraunces en serif chaleureux avec italiques expressives pour les titres et les prix (signature émotionnelle), Inter Tight pour l\'UI. Abandon du display condensed agressif.',
          },
          {
            label: 'Carte d\'annonce',
            title: 'La photo est reine',
            body: 'Ratio 4:3 ou 5:4, coins 20px, photo avec léger motif de points façon zellige, badge Pro/Particulier discret en haut-gauche, prix en serif 26px qui ne crie pas.',
          },
          {
            label: 'Bottom nav',
            title: '5 onglets iOS',
            body: 'Accueil, Recherche, Favoris, Messages, Profil. Blur translucide, icônes Lucide 22px, labels 10px. Convention mobile qu\'on ne cherche pas à révolutionner.',
          },
        ].map((note, i) => (
          <div key={i} style={{
            padding: 20,
            background: tokens.paper,
            border: `1px solid ${tokens.sandSoft}`,
            borderRadius: 16,
          }}>
            <div style={{
              fontFamily: fontMono, fontSize: 10, fontWeight: 500,
              letterSpacing: '0.14em', textTransform: 'uppercase',
              color: tokens.terracotta, marginBottom: 8,
            }}>{note.label}</div>
            <div style={{
              fontFamily: fontDisplay, fontSize: 20, fontWeight: 500,
              letterSpacing: '-0.015em', color: tokens.ink, marginBottom: 8,
              lineHeight: 1.15,
            }}>{note.title}</div>
            <div style={{
              fontFamily: fontBody, fontSize: 13, lineHeight: 1.5,
              color: tokens.inkSoft,
            }}>{note.body}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
