
export interface AgeTier {
  id: string;
  label: string;
  minAge: number;
  maxAge: number | null; // null for "plus"
  price: number;
}

export interface BookingDetail {
  id: string;
  name: string;
  cpf: string;
  phone: string;
  email: string;
  birthDate: string;
  totalGuests: number;
  guestBreakdown: Record<string, number>; // Stores count per AgeTier ID
  timestamp: string;
  date: string; // Adicionado para rastrear o dia da reserva no histórico
  paid?: boolean; // Novo campo para controle de pagamento
}

export interface DayConfig {
  isBlocked: boolean;
  limit: number;
  currentBookings: number;
  bookings?: BookingDetail[];
}

export interface SiteConfig {
  ageTiers: AgeTier[];
  globalLimitPerDay: number;
  days: Record<string, DayConfig>; // key format: "YYYY-MM-DD"
}

export interface Property {
  id: string;
  name: string;
  description: string;
  location: string;
  pricePerNight: number;
  rating: number;
  reviews: number;
  images: string[];
  amenities: string[];
  type: 'Villa' | 'Apartment' | 'Hotel' | 'Cabin';
  coordinates: { lat: number; lng: number };
}

export interface Booking {
  id: string;
  propertyId: string;
  startDate: string;
  endDate: string;
  guests: number;
  totalPrice: number;
  status: 'confirmed' | 'pending' | 'cancelled';
}

export interface User {
  name: string;
  email: string;
  bookings: Booking[];
}
