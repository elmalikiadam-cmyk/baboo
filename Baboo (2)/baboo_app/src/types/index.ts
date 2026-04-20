export type TransactionType = 'VENTE' | 'LOCATION';
export type PropertyType =
  | 'APPARTEMENT'
  | 'VILLA'
  | 'RIAD'
  | 'STUDIO'
  | 'MAISON'
  | 'TERRAIN'
  | 'COMMERCE';
export type Condition = 'EXCELLENT' | 'BON' | 'À RÉNOVER';
export type Status = 'EN LIGNE' | 'EN ATTENTE' | 'VENDU' | 'LOUÉ';

export interface Agent {
  id: string;
  firstName: string;
  lastName: string;
  initials: string;
  agency?: string;
  city: string;
  verified: boolean;
  listingsCount: number;
  rating: number;
  yearsOfExperience: number;
}

export interface Listing {
  id: string;
  reference: string;
  type: TransactionType;
  propertyType: PropertyType;
  title: string;
  description: string;
  price: number;
  pricePerM2?: number;
  rental?: { period: 'month' | 'day' | 'night' };
  location: {
    city: string;
    neighborhood: string;
    address?: string;
    lat: number;
    lng: number;
  };
  surface: number;
  landSurface?: number;
  rooms: number;
  bathrooms: number;
  floors?: string;
  yearBuilt?: number;
  condition: Condition;
  equipments: string[];
  photos: string[];
  verified: boolean;
  premium?: boolean;
  isNew?: boolean;
  priceDropped?: boolean;
  status: Status;
  createdAt: string;
  agent: Agent;
  views?: number;
  contacts?: number;
  favorites?: number;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  initials: string;
  email: string;
  phone?: string;
  type: 'PARTICULIER' | 'AGENT';
  favorites: string[];
  savedSearches: SavedSearch[];
}

export interface SavedSearch {
  id: string;
  label: string;
  filters: ListingFilters;
  alertsEnabled: boolean;
  createdAt: string;
}

export interface ListingFilters {
  transaction?: TransactionType;
  cities?: string[];
  priceMin?: number;
  priceMax?: number;
  surfaceMin?: number;
  surfaceMax?: number;
  roomsMin?: number;
  propertyTypes?: PropertyType[];
  equipments?: string[];
  condition?: Condition;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  createdAt: string;
  read: boolean;
}

export interface Conversation {
  id: string;
  listingId: string;
  participantId: string;
  participantName: string;
  participantInitials: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
}

export interface Notification {
  id: string;
  type: 'BAISSE' | 'NEW' | 'MSG' | 'VISIT';
  title: string;
  body: string;
  listingId?: string;
  createdAt: string;
  read: boolean;
}
