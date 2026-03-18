export interface Property {
  id: string;
  name: string;
  location: string;
  price: number;
  rating: number;
  image: string;
  ownerId?: string;
  description?: string;
  amenities?: string[];
  bedrooms?: number;
  bathrooms?: number;
  capacity?: number;
}

export interface Booking {
  id: string;
  propertyId: string;
  propertyName: string;
  guestName: string;
  checkIn: string;
  checkOut: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  totalPrice: number;
}

export const mockProperties: Property[] = [
  {
    id: '1',
    name: 'Cozy Beach House',
    location: 'Panglao, Bohol',
    price: 2500,
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800',
    ownerId: 'owner1',
    description: 'Beautiful beachfront property with stunning ocean views',
    amenities: ['WiFi', 'Air Conditioning', 'Kitchen', 'Pool'],
    bedrooms: 3,
    bathrooms: 2,
    capacity: 6,
  },
  {
    id: '2',
    name: 'Modern City Apartment',
    location: 'Tagbilaran City, Bohol',
    price: 1800,
    rating: 4.6,
    image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
    ownerId: 'owner1',
    description: 'Centrally located apartment perfect for city explorers',
    amenities: ['WiFi', 'Air Conditioning', 'Parking'],
    bedrooms: 2,
    bathrooms: 1,
    capacity: 4,
  },
  {
    id: '3',
    name: 'Tropical Garden Villa',
    location: 'Loboc, Bohol',
    price: 3200,
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
    description: 'Luxurious villa surrounded by lush tropical gardens',
    amenities: ['WiFi', 'Air Conditioning', 'Pool', 'Garden', 'BBQ Area'],
    bedrooms: 4,
    bathrooms: 3,
    capacity: 8,
  },
  {
    id: '4',
    name: 'Hillside Retreat',
    location: 'Anda, Bohol',
    price: 2200,
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800',
    description: 'Peaceful retreat with panoramic hill views',
    amenities: ['WiFi', 'Kitchen', 'Terrace'],
    bedrooms: 2,
    bathrooms: 2,
    capacity: 4,
  },
  {
    id: '5',
    name: 'Beachfront Bungalow',
    location: 'Dumaluan Beach, Bohol',
    price: 2800,
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=800',
    ownerId: 'owner1',
    description: 'Charming bungalow steps away from white sand beach',
    amenities: ['WiFi', 'Air Conditioning', 'Beach Access', 'Kayaks'],
    bedrooms: 2,
    bathrooms: 1,
    capacity: 4,
  },
  {
    id: '6',
    name: 'Countryside Cottage',
    location: 'Carmen, Bohol',
    price: 1500,
    rating: 4.5,
    image: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800',
    description: 'Rustic cottage in the peaceful countryside',
    amenities: ['WiFi', 'Kitchen', 'Garden', 'Fireplace'],
    bedrooms: 2,
    bathrooms: 1,
    capacity: 4,
  },
];

export const mockBookings: Booking[] = [
  {
    id: 'b1',
    propertyId: '1',
    propertyName: 'Cozy Beach House',
    guestName: 'Maria Santos',
    checkIn: '2026-03-25',
    checkOut: '2026-03-28',
    status: 'confirmed',
    totalPrice: 7500,
  },
  {
    id: 'b2',
    propertyId: '2',
    propertyName: 'Modern City Apartment',
    guestName: 'John Dela Cruz',
    checkIn: '2026-03-20',
    checkOut: '2026-03-22',
    status: 'confirmed',
    totalPrice: 3600,
  },
  {
    id: 'b3',
    propertyId: '5',
    propertyName: 'Beachfront Bungalow',
    guestName: 'Sarah Johnson',
    checkIn: '2026-03-30',
    checkOut: '2026-04-02',
    status: 'pending',
    totalPrice: 8400,
  },
  {
    id: 'b4',
    propertyId: '1',
    propertyName: 'Cozy Beach House',
    guestName: 'Robert Lee',
    checkIn: '2026-04-05',
    checkOut: '2026-04-10',
    status: 'confirmed',
    totalPrice: 12500,
  },
  {
    id: 'b5',
    propertyId: '2',
    propertyName: 'Modern City Apartment',
    guestName: 'Anna Garcia',
    checkIn: '2026-03-22',
    checkOut: '2026-03-25',
    status: 'confirmed',
    totalPrice: 5400,
  },
];

export const ownerStats = {
  totalEarnings: 45000,
  activeProperties: 3,
  activeBookings: 12,
  totalReviews: 156,
  averageRating: 4.7,
};
