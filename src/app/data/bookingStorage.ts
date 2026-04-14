import { Booking, mockBookings } from './mockData';
import { AuthUser } from '../contexts/UserContext';

export const BOOKINGS_STORAGE_KEY = 'bohol_board_bookings';

const isBrowser = typeof window !== 'undefined';

export function getStoredBookings(): Booking[] {
  if (!isBrowser) {
    return mockBookings;
  }

  const raw = window.localStorage.getItem(BOOKINGS_STORAGE_KEY);

  if (!raw) {
    return mockBookings;
  }

  try {
    const parsed = JSON.parse(raw) as Booking[];
    return Array.isArray(parsed) ? parsed : mockBookings;
  } catch (error) {
    console.error('Failed to parse stored bookings:', error);
    return mockBookings;
  }
}

export function saveStoredBookings(bookings: Booking[]) {
  if (!isBrowser) {
    return;
  }

  window.localStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(bookings));
}

export function ensureSeedBookings() {
  if (!isBrowser) {
    return;
  }

  const existing = window.localStorage.getItem(BOOKINGS_STORAGE_KEY);
  if (!existing) {
    saveStoredBookings(mockBookings);
  }
}

export function getUserBookings(user: AuthUser | null): Booking[] {
  if (!user) {
    return [];
  }

  return getStoredBookings().filter((booking) => booking.guestEmail === user.email);
}

export function hasActiveBooking(user: AuthUser | null) {
  return getUserBookings(user).some(
    (booking) => booking.status === 'pending' || booking.status === 'confirmed',
  );
}
