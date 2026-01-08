
import { Property } from './types';

export const PROPERTIES: Property[] = [
  {
    id: '1',
    name: 'Azure Horizon Villa',
    description: 'A stunning cliffside villa with panoramic ocean views and a private infinity pool.',
    location: 'Santorini, Grécia',
    pricePerNight: 850,
    rating: 4.9,
    reviews: 128,
    images: ['https://picsum.photos/id/1015/800/600', 'https://picsum.photos/id/1016/800/600'],
    amenities: ['Piscina Infinita', 'Wi-Fi', 'Chef Privado', 'Vista Mar'],
    type: 'Villa',
    coordinates: { lat: 36.3932, lng: 25.4615 }
  },
  {
    id: '2',
    name: 'Metropolitan Loft',
    description: 'Modern and sleek industrial loft in the heart of Manhattan.',
    location: 'Nova York, EUA',
    pricePerNight: 420,
    rating: 4.7,
    reviews: 245,
    images: ['https://picsum.photos/id/1018/800/600', 'https://picsum.photos/id/1019/800/600'],
    amenities: ['Ginásio', 'Concierge 24/7', 'Smart Home', 'Terraço'],
    type: 'Apartment',
    coordinates: { lat: 40.7128, lng: -74.0060 }
  },
  {
    id: '3',
    name: 'Alpine Zen Retreat',
    description: 'Luxury wooden cabin nestled in the Swiss Alps with private spa facilities.',
    location: 'Zermatt, Suíça',
    pricePerNight: 650,
    rating: 4.95,
    reviews: 89,
    images: ['https://picsum.photos/id/1020/800/600', 'https://picsum.photos/id/1021/800/600'],
    amenities: ['Lareira', 'Sauna', 'Ski-in/Ski-out', 'Jacuzzi'],
    type: 'Cabin',
    coordinates: { lat: 46.0207, lng: 7.7491 }
  },
  {
    id: '4',
    name: 'The Royal Palms Resort',
    description: 'Exotic beachfront resort with world-class dining and spa services.',
    location: 'Bora Bora, Polinésia Francesa',
    pricePerNight: 1200,
    rating: 5.0,
    reviews: 56,
    images: ['https://picsum.photos/id/1022/800/600', 'https://picsum.photos/id/1023/800/600'],
    amenities: ['Spa', 'Praia Privada', 'Mergulho', 'Butler'],
    type: 'Hotel',
    coordinates: { lat: -16.5004, lng: -151.7415 }
  },
  {
    id: '5',
    name: 'Kyoto Heritage Inn',
    description: 'Traditional Japanese ryokan with modern luxury touches and serene gardens.',
    location: 'Kyoto, Japão',
    pricePerNight: 550,
    rating: 4.85,
    reviews: 112,
    images: ['https://picsum.photos/id/1024/800/600', 'https://picsum.photos/id/1025/800/600'],
    amenities: ['Onsen', 'Cerimônia do Chá', 'Jardim Zen', 'Yukata'],
    type: 'Hotel',
    coordinates: { lat: 35.0116, lng: 135.7681 }
  },
  {
    id: '6',
    name: 'Desert Mirage Oasis',
    description: 'Modernist villa in the high desert with spectacular sunset views.',
    location: 'Joshua Tree, EUA',
    pricePerNight: 380,
    rating: 4.6,
    reviews: 94,
    images: ['https://picsum.photos/id/1026/800/600', 'https://picsum.photos/id/1027/800/600'],
    amenities: ['Fogueira', 'Telescópio', 'Design Minimalista', 'Solar'],
    type: 'Villa',
    coordinates: { lat: 34.1333, lng: -116.3131 }
  }
];
