import axios from 'axios';
import type { Hotel, HotelDetails } from '../types/hotel';
import type { User } from '../types/user';
import type { Booking, BookingPayload, RoomAvailability } from '../types/booking';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

export type HotelSearch = {
  city?: string;
  minStars?: number;
  maxPrice?: number;
};

export async function fetchHotels(search: HotelSearch = {}): Promise<Hotel[]> {
  const response = await api.get('/hotels', {params: search});
  return response.data;
}

export async function fetchHotelById(id: string): Promise<HotelDetails> {
  const response = await api.get(`/hotels/${id}`);
  return response.data;
}

export async function fetchCurrentUser(): Promise<User> {
  const response = await api.get('/auth/me');
  return response.data;
}

export async function logoutRequest(): Promise<void> {
  await api.post('/auth/logout');
}

export async function fetchAvailability(
  hotelId: string,
  checkIn: string,
  checkOut: string
): Promise<RoomAvailability[]> {
  const response = await api.get(`/hotels/${hotelId}/availability`, { params: { checkIn, checkOut } });
  return response.data;
}

export async function createBookingRequest(payload: BookingPayload): Promise<Booking> {
  const response = await api.post('/bookings', payload);
  return response.data;
}

export async function fetchMyBookings(): Promise<Booking[]> {
  const response = await api.get('/bookings/me');
  return response.data;
}

export async function cancelBookingRequest(id: string): Promise<Booking> {
  const response = await api.patch(`/bookings/${id}/cancel`);
  return response.data;
}